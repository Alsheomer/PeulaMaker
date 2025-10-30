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

export async function exportPeulaToGoogleDocs(peula: Peula): Promise<string> {
  try {
    const docs = await getUncachableGoogleDocsClient();
    const content = peula.content as PeulaContent;

    // Create a new document
    const createResponse = await docs.documents.create({
      requestBody: {
        title: peula.title
      }
    });

    const documentId = createResponse.data.documentId;
    if (!documentId) {
      throw new Error("Failed to create document");
    }

    // Prepare the content for the document
    const requests: any[] = [];
    
    // Add title and metadata
    let currentIndex = 1;
    
    // Title
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `${peula.title}\n\n`
      }
    });
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
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `Educational Goals:\n${peula.goals}\n\n`
      }
    });
    currentIndex += 18 + peula.goals.length + 2;

    // Table header
    requests.push({
      insertText: {
        location: { index: currentIndex },
        text: `Peula Components:\n\n`
      }
    });
    currentIndex += 19;

    // Create table structure - 3 columns
    const tableRows = content.components.length + 1; // +1 for header row
    requests.push({
      insertTable: {
        location: { index: currentIndex },
        rows: tableRows,
        columns: 3
      }
    });

    // After table is created, we need to populate it
    // This requires a second batch of requests after the table exists
    const updateResponse = await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests }
    });

    // Now populate the table cells
    const populateRequests: any[] = [];
    
    // Header row (approximate indices - these will be calculated based on table structure)
    // Row 1: Headers
    let rowStartIndex = currentIndex + 3; // Account for table structure
    
    // We'll use a simpler approach: insert all text first, then format
    // This is more reliable than trying to calculate exact table cell indices
    
    // Style the title
    populateRequests.push({
      updateParagraphStyle: {
        range: {
          startIndex: 1,
          endIndex: peula.title.length + 1
        },
        paragraphStyle: {
          namedStyleType: 'HEADING_1'
        },
        fields: 'namedStyleType'
      }
    });

    // Bold the title text
    populateRequests.push({
      updateTextStyle: {
        range: {
          startIndex: 1,
          endIndex: peula.title.length + 1
        },
        textStyle: {
          bold: true,
          fontSize: {
            magnitude: 18,
            unit: 'PT'
          }
        },
        fields: 'bold,fontSize'
      }
    });

    if (populateRequests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests: populateRequests }
      });
    }

    // Create the document URL
    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
    
    // For now, we'll create a simpler document with formatted text instead of complex table
    // This ensures reliability while still providing good formatting
    const simpleContentRequests: any[] = [];
    let textIndex = currentIndex;

    // Add table header text
    const headerText = "Peula Component | Description & Guidelines | Tzofim Best Practices & Time\n" + "-".repeat(80) + "\n\n";
    simpleContentRequests.push({
      insertText: {
        location: { index: textIndex },
        text: headerText
      }
    });
    textIndex += headerText.length;

    // Add each component
    content.components.forEach((comp, idx) => {
      const componentText = `${comp.component}\n\nDescription & Guidelines:\n${comp.description}\n\nTzofim Best Practices:\n${comp.bestPractices}\n\nTime Structure:\n${comp.timeStructure}\n\n${"-".repeat(80)}\n\n`;
      simpleContentRequests.push({
        insertText: {
          location: { index: textIndex },
          text: componentText
        }
      });
      textIndex += componentText.length;
    });

    // Update with simpler content
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests: simpleContentRequests }
    });

    return documentUrl;
  } catch (error) {
    console.error("Error exporting to Google Docs:", error);
    throw new Error("Failed to export peula to Google Docs");
  }
}
