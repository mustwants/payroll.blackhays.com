/**
 * This file contains the code that should be deployed as a Google Apps Script
 * Follow these steps to set up the backend:
 * 
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Copy and paste this code into the script editor
 * 4. Click Deploy > New deployment
 * 5. Select "Web app" as the deployment type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Click "Deploy"
 * 9. Copy the Web app URL and set it as VITE_GOOGLE_SCRIPT_URL in your .env file
 */

// NOTE: This is not a file to be imported in the React app
// This is the code to be deployed as a Google Apps Script

// Google Apps Script Code
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Enable CORS
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE"
  };
  
  // Handle preflight OPTIONS request
  if (e.method === "OPTIONS") {
    return output.setContent(JSON.stringify({ status: "ok" })).setHeaders(headers);
  }
  
  try {
    // Get the action parameter
    const action = e.parameter.action;
    let result;
    
    // Determine which action to perform
    switch(action) {
      case "authenticate":
        result = handleAuthentication(e);
        break;
      case "getSheetData":
        result = getSheetData(e);
        break;
      case "updateSheetData":
        result = updateSheetData(e);
        break;
      default:
        result = { error: "Invalid action" };
    }
    
    // Return the result
    return output.setContent(JSON.stringify(result)).setHeaders(headers);
  } catch (error) {
    // Handle any errors
    return output.setContent(JSON.stringify({ 
      error: error.toString(),
      stack: error.stack
    })).setHeaders(headers);
  }
}

/**
 * Handles authentication requests
 */
function handleAuthentication(e) {
  // In a real app, you would validate the user against your user database
  // For this example, we'll just return success
  let payload;
  
  if (e.postData && e.postData.contents) {
    payload = JSON.parse(e.postData.contents);
  } else {
    payload = e.parameter;
  }
  
  // Check if user credentials are provided
  if (!payload.userId || !payload.userEmail) {
    return {
      success: false,
      error: "Missing user credentials"
    };
  }
  
  // In a real app, validate the user here
  // For this example, we'll just return success
  
  return {
    success: true,
    message: "Authentication successful",
    userId: payload.userId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Gets data from a Google Sheet
 */
function getSheetData(e) {
  const params = e.parameter;
  
  if (!params.sheetName) {
    return {
      success: false,
      error: "Missing sheetName parameter"
    };
  }
  
  try {
    // Open the spreadsheet - in a real app, you'd use the ID of your specific sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(params.sheetName);
    
    if (!sheet) {
      return {
        success: false,
        error: "Sheet not found"
      };
    }
    
    // Get the data range
    let dataRange;
    if (params.range) {
      dataRange = sheet.getRange(params.range);
    } else {
      dataRange = sheet.getDataRange();
    }
    
    const values = dataRange.getValues();
    const headers = values[0];
    const rows = values.slice(1);
    
    // Convert to objects with headers as keys
    const data = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return {
      success: true,
      values: data,
      headers: headers
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Updates data in a Google Sheet
 */
function updateSheetData(e) {
  let payload;
  
  if (e.postData && e.postData.contents) {
    payload = JSON.parse(e.postData.contents);
  } else {
    return {
      success: false,
      error: "No data provided"
    };
  }
  
  if (!payload.sheetName || !payload.values) {
    return {
      success: false,
      error: "Missing required parameters"
    };
  }
  
  try {
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(payload.sheetName);
    
    if (!sheet) {
      return {
        success: false,
        error: "Sheet not found"
      };
    }
    
    // Determine the range to update
    let range;
    if (payload.range) {
      range = sheet.getRange(payload.range);
    } else {
      // If no range is specified, start at A1 and use the size of the values array
      const numRows = payload.values.length;
      const numCols = payload.values[0].length;
      range = sheet.getRange(1, 1, numRows, numCols);
    }
    
    // Update the values
    range.setValues(payload.values);
    
    return {
      success: true,
      message: "Data updated successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}