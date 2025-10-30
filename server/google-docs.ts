import { google } from 'googleapis';
import type { Peula, PeulaContent } from "@shared/schema";

// Reference: blueprint:google-docs
let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-docs',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Docs not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
async function getUncachableGoogleDocsClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.docs({ version: 'v1', auth: oauth2Client });
}

async function getUncachableGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

async function findTemplateDocument(): Promise<string | null> {
  try {
    const drive = await getUncachableGoogleDriveClient();
    
    const response = await drive.files.list({
      q: "name contains 'copy of peula format' and mimeType = 'application/vnd.google-apps.document'",
      spaces: 'drive',
      fields: 'files(id, name)',
      pageSize: 10
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      console.log(`Found template: ${files[0].name} (${files[0].id})`);
      return files[0].id || null;
    }
    
    return null;
  } catch (error) {
    console.error("Error searching for template:", error);
    return null;
  }
}

async function readTemplateStructure(documentId: string): Promise<any> {
  try {
    const docs = await getUncachableGoogleDocsClient();
    
    const response = await docs.documents.get({
      documentId: documentId
    });
    
    return response.data;
  } catch (error) {
    console.error("Error reading template:", error);
    return null;
  }
}

export async function exportPeulaToGoogleDocs(peula: Peula): Promise<string> {
  try {
    const docs = await getUncachableGoogleDocsClient();
    const drive = await getUncachableGoogleDriveClient();
    const content = peula.content as PeulaContent;

    // Try to find the template document
    const templateId = await findTemplateDocument();
    
    let documentId: string;
    
    if (templateId) {
      // Copy the template
      console.log("Using template document");
      const copyResponse = await drive.files.copy({
        fileId: templateId,
        requestBody: {
          name: peula.title
        }
      });
      
      documentId = copyResponse.data.id!;
      
      // Read the template structure to understand placeholders
      const templateData = await readTemplateStructure(documentId);
      
      // We'll replace content in the copied template
      // For now, let's clear it and add our content with the same formatting style
      const clearRequests: any[] = [{
        deleteContentRange: {
          range: {
            startIndex: 1,
            endIndex: (templateData?.body?.content?.[templateData.body.content.length - 1]?.endIndex || 2) - 1
          }
        }
      }];
      
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: clearRequests }
      });
    } else {
      // No template found, create a new document
      console.log("Template not found, creating new document");
      const createResponse = await docs.documents.create({
        requestBody: {
          title: peula.title
        }
      });

      documentId = createResponse.data.documentId!;
    }
    
    if (!documentId) {
      throw new Error("Failed to create document");
    }

    // Build the content as formatted text sections with clear headers
    const requests: any[] = [];
    let currentIndex = 1;
    
    // Title
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `${peula.title}\n\n`
      }
    });
    const titleEndIndex = currentIndex + peula.title.length;
    currentIndex += peula.title.length + 2;

    // Metadata
    const metadata = `Age Group: ${peula.ageGroup} | Duration: ${peula.duration} min | Group Size: ${peula.groupSize}\n\n`;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: metadata
      }
    });
    currentIndex += metadata.length;

    // Educational Goals
    const goalsText = `Educational Goals:\n${peula.goals}\n\n`;
    const goalsStartIndex = currentIndex;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: goalsText
      }
    });
    currentIndex += goalsText.length;

    // Section Header
    const sectionHeader = `Peula Components\n\n`;
    const sectionHeaderStartIndex = currentIndex;
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: sectionHeader
      }
    });
    currentIndex += sectionHeader.length;

    // Add each component as a formatted section
    const componentSections: { startIndex: number, titleEndIndex: number, text: string }[] = [];
    
    content.components.forEach((comp) => {
      const componentStartIndex = currentIndex;
      
      const componentTitle = `${comp.component}\n`;
      const description = `\nDescription & Guidelines:\n${comp.description}\n`;
      const practices = `\nTzofim Best Practices:\n${comp.bestPractices}\n`;
      const timeStructure = `\nTime Structure:\n${comp.timeStructure}\n\n`;
      
      const fullText = componentTitle + description + practices + timeStructure;
      
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: fullText
        }
      });
      
      componentSections.push({
        startIndex: componentStartIndex,
        titleEndIndex: componentStartIndex + componentTitle.length - 1,
        text: fullText
      });
      
      currentIndex += fullText.length;
    });

    // Insert all text first
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests }
    });

    // Now apply formatting
    const formatRequests: any[] = [];
    
    // Format main title
    formatRequests.push({
      updateTextStyle: {
        range: {
          startIndex: 1,
          endIndex: titleEndIndex + 1
        },
        textStyle: {
          bold: true,
          fontSize: {
            magnitude: 20,
            unit: 'PT'
          }
        },
        fields: 'bold,fontSize'
      }
    });

    // Format "Educational Goals:" as bold
    formatRequests.push({
      updateTextStyle: {
        range: {
          startIndex: goalsStartIndex,
          endIndex: goalsStartIndex + 18
        },
        textStyle: {
          bold: true,
          fontSize: {
            magnitude: 12,
            unit: 'PT'
          }
        },
        fields: 'bold,fontSize'
      }
    });

    // Format "Peula Components" header
    formatRequests.push({
      updateTextStyle: {
        range: {
          startIndex: sectionHeaderStartIndex,
          endIndex: sectionHeaderStartIndex + 17
        },
        textStyle: {
          bold: true,
          fontSize: {
            magnitude: 16,
            unit: 'PT'
          }
        },
        fields: 'bold,fontSize'
      }
    });

    // Format each component's title and section headers
    componentSections.forEach((section) => {
      // Bold the component title
      formatRequests.push({
        updateTextStyle: {
          range: {
            startIndex: section.startIndex,
            endIndex: section.titleEndIndex
          },
          textStyle: {
            bold: true,
            fontSize: {
              magnitude: 14,
              unit: 'PT'
            }
          },
          fields: 'bold,fontSize'
        }
      });
      
      // Find and bold section headers within the component
      const sectionHeaders = ['Description & Guidelines:', 'Tzofim Best Practices:', 'Time Structure:'];
      sectionHeaders.forEach(header => {
        const headerIndex = section.text.indexOf(header);
        if (headerIndex !== -1) {
          formatRequests.push({
            updateTextStyle: {
              range: {
                startIndex: section.startIndex + headerIndex,
                endIndex: section.startIndex + headerIndex + header.length
              },
              textStyle: {
                bold: true
              },
              fields: 'bold'
            }
          });
        }
      });
    });

    // Apply all formatting
    if (formatRequests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: formatRequests }
      });
    }

    // Create the document URL
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    
    return documentUrl;
  } catch (error) {
    console.error("Error exporting to Google Docs:", error);
    throw new Error("Failed to export peula to Google Docs");
  }
}
