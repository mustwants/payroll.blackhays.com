/**
 * Google Apps Script Integration Service
 * 
 * This service handles all communication with Google Apps Script web applications
 * following the guidelines at https://developers.google.com/apps-script/guides/web
 */

const BASE_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';

/**
 * Makes a request to a Google Apps Script web app
 * 
 * @param {Object} options - Request options
 * @param {string} options.action - The action to perform
 * @param {Object} options.payload - The data to send
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @returns {Promise} - Promise resolving to the response data
 */
export const callGoogleScript = async ({ action, payload = {}, method = 'POST' }) => {
  if (!BASE_URL || BASE_URL === 'https://script.google.com/macros/s/your-script-id/exec') {
    console.error('Google Script URL not configured');
    throw new Error('Google Script URL not configured');
  }

  const url = new URL(BASE_URL);
  
  // For GET requests, add parameters to URL
  if (method === 'GET' && payload) {
    Object.keys(payload).forEach(key => {
      url.searchParams.append(key, payload[key]);
    });
  }

  // Always include the action as a query parameter
  if (action) {
    url.searchParams.append('action', action);
  }

  try {
    const options = {
      method,
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add payload for non-GET requests
    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url.toString(), options);

    // Google Apps Script can return different content types
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error communicating with Google Script');
    }

    // Parse response based on content type
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Google Script API Error:', error);
    throw error;
  }
};

/**
 * Handles authentication with Google Apps Script
 * Uses OAuth2 for authorization
 * 
 * @param {Object} authParams - Auth parameters
 * @returns {Promise} - Promise resolving to auth result
 */
export const authenticateWithGoogleScript = async (authParams) => {
  return callGoogleScript({
    action: 'authenticate',
    payload: authParams
  });
};

/**
 * Fetches data from a Google Sheet through Google Apps Script
 * 
 * @param {Object} params - Sheet parameters
 * @param {string} params.sheetName - Name of the sheet
 * @param {string} params.range - Cell range to fetch
 * @returns {Promise} - Promise resolving to sheet data
 */
export const fetchSheetData = async ({ sheetName, range }) => {
  return callGoogleScript({
    action: 'getSheetData',
    payload: { 
      sheetName,
      range
    },
    method: 'GET'
  });
};

/**
 * Updates data in a Google Sheet through Google Apps Script
 * 
 * @param {Object} params - Update parameters
 * @param {string} params.sheetName - Name of the sheet
 * @param {string} params.range - Cell range to update
 * @param {Array} params.values - Values to write
 * @returns {Promise} - Promise resolving to update result
 */
export const updateSheetData = async ({ sheetName, range, values }) => {
  return callGoogleScript({
    action: 'updateSheetData',
    payload: {
      sheetName,
      range,
      values
    }
  });
};

export default {
  callGoogleScript,
  authenticateWithGoogleScript,
  fetchSheetData,
  updateSheetData
};