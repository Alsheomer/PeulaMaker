import { google } from 'googleapis';
import type { Peula, PeulaContent } from "@shared/schema";

// Reference: blueprint:google-docs and blueprint:google-drive
let docsConnectionSettings: any;
let driveConnectionSettings: any;

async function getDocsAccessToken() {
  if (docsConnectionSettings && docsConnectionSettings.settings.expires_at && new Date(docsConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return docsConnectionSettings.settings.access_token;
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

  docsConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-docs',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = docsConnectionSettings?.settings?.access_token || docsConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!docsConnectionSettings || !accessToken) {
    throw new Error('Google Docs not connected');
  }
  return accessToken;
}

async function getDriveAccessToken() {
  if (driveConnectionSettings && driveConnectionSettings.settings.expires_at && new Date(driveConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return driveConnectionSettings.settings.access_token;
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

  driveConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = driveConnectionSettings?.settings?.access_token || driveConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!driveConnectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
async function getUncachableGoogleDocsClient() {
  const accessToken = await getDocsAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.docs({ version: 'v1', auth: oauth2Client });
}

async function getUncachableGoogleDriveClient() {
  const accessToken = await getDriveAccessToken();

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
    
    if (!templateId) {
      throw new Error("Template document 'copy of peula format!!!!' not found in Google Drive");
    }

    // Copy the template
    console.log("Using template document");
    const copyResponse = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: peula.title
      }
    });
    
    const documentId = copyResponse.data.id!;
    
    // Read the template structure to find the table
    const templateData = await readTemplateStructure(documentId);
    
    // Find the table in the document
    let tableStartIndex = -1;
    let existingRows = 0;
    
    if (templateData?.body?.content) {
      for (const element of templateData.body.content) {
        if (element.table) {
          tableStartIndex = element.startIndex!;
          existingRows = element.table.rows || 0;
          break;
        }
      }
    }
    
    if (tableStartIndex === -1) {
      throw new Error("Table not found in template");
    }
    
    console.log(`Found table at index ${tableStartIndex} with ${existingRows} rows`);
    
    // Calculate how many rows we need
    const componentsCount = content.components.length;
    const neededRows = componentsCount + 1; // +1 for header
    const rowsToAdd = Math.max(0, neededRows - existingRows);
    
    const requests: any[] = [];
    
    // Add rows if needed
    if (rowsToAdd > 0) {
      console.log(`Adding ${rowsToAdd} rows to table`);
      requests.push({
        insertTableRow: {
          tableCellLocation: {
            tableStartLocation: { index: tableStartIndex },
            rowIndex: existingRows - 1,
            columnIndex: 0
          },
          insertBelow: true,
          number: rowsToAdd
        }
      });
      
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests }
      });
    }
    
    // Re-read the document to get updated table structure
    const updatedDoc = await docs.documents.get({ documentId });
    
    // Find table cells and populate them
    let table: any = null;
    if (updatedDoc.data.body?.content) {
      for (const element of updatedDoc.data.body.content) {
        if (element.table) {
          table = element.table;
          break;
        }
      }
    }
    
    if (!table) {
      throw new Error("Could not find table after update");
    }
    
    // Build requests to populate table cells
    const populateRequests: any[] = [];
    
    // Populate each component (starting from row 1, row 0 is header)
    content.components.forEach((comp, idx) => {
      const rowIndex = idx + 1; // Skip header row
      const row = table.tableRows[rowIndex];
      
      if (!row || !row.tableCells) {
        console.error(`Row ${rowIndex} not found or has no cells`);
        return;
      }
      
      const cells = row.tableCells;
      
      // Column 0: Time Type (component category/name)
      if (cells[0]?.content?.[0]?.startIndex !== undefined) {
        populateRequests.push({
          insertText: {
            location: { index: cells[0].content[0].startIndex },
            text: comp.component
          }
        });
      }
      
      // Column 1: Name (component number for reference)
      if (cells[1]?.content?.[0]?.startIndex !== undefined) {
        populateRequests.push({
          insertText: {
            location: { index: cells[1].content[0].startIndex },
            text: `${idx + 1}`
          }
        });
      }
      
      // Column 2: Explanation/Content (description + best practices)
      if (cells[2]?.content?.[0]?.startIndex !== undefined) {
        const contentText = `${comp.description}\n\nBest Practices:\n${comp.bestPractices}`;
        populateRequests.push({
          insertText: {
            location: { index: cells[2].content[0].startIndex },
            text: contentText
          }
        });
      }
      
      // Column 3: Time
      if (cells[3]?.content?.[0]?.startIndex !== undefined) {
        populateRequests.push({
          insertText: {
            location: { index: cells[3].content[0].startIndex },
            text: comp.timeStructure
          }
        });
      }
      
      // Column 4: Equipment and Notes (materials from peula)
      if (cells[4]?.content?.[0]?.startIndex !== undefined) {
        const equipmentText = peula.availableMaterials && peula.availableMaterials.length > 0 
          ? peula.availableMaterials.join(', ')
          : 'N/A';
        populateRequests.push({
          insertText: {
            location: { index: cells[4].content[0].startIndex },
            text: equipmentText
          }
        });
      }
    });
    
    // Apply all text insertions
    if (populateRequests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: populateRequests }
      });
    }
    
    // Add title and metadata before the table
    const headerRequests: any[] = [];
    
    const headerText = `${peula.title}\n\nAge Group: ${peula.ageGroup} | Duration: ${peula.duration} | Group Size: ${peula.groupSize}\n\nGoals: ${peula.goals}\n\n`;
    
    headerRequests.push({
      insertText: {
        location: { index: 1 },
        text: headerText
      }
    });
    
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests: headerRequests }
    });

    // Create the document URL
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    
    return documentUrl;
  } catch (error) {
    console.error("Error exporting to Google Docs:", error);
    throw new Error("Failed to export peula to Google Docs");
  }
}
