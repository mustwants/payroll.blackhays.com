import { useState, useCallback, useContext } from 'react';
import { fetchSheetData, updateSheetData } from '../services/googleScriptService';
import { GoogleScriptContext } from '../contexts/GoogleScriptContext';

/**
 * Custom hook for interacting with Google Sheets via Google Apps Script
 * 
 * @param {Object} options - Hook options
 * @param {string} options.sheetName - Default sheet name
 * @returns {Object} - Sheet interaction methods and state
 */
const useGoogleSheet = ({ sheetName }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isConnected } = useContext(GoogleScriptContext);

  // Fetch data from the sheet
  const fetchData = useCallback(async (range, customSheetName) => {
    if (!isConnected) {
      setError('Not connected to Google Apps Script');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const responseData = await fetchSheetData({
        sheetName: customSheetName || sheetName,
        range
      });
      
      setData(responseData.values || []);
      return responseData.values;
    } catch (err) {
      setError(err.message || 'Failed to fetch data from Google Sheet');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sheetName, isConnected]);

  // Update data in the sheet
  const updateData = useCallback(async (range, values, customSheetName) => {
    if (!isConnected) {
      setError('Not connected to Google Apps Script');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await updateSheetData({
        sheetName: customSheetName || sheetName,
        range,
        values
      });
      
      return result.success;
    } catch (err) {
      setError(err.message || 'Failed to update data in Google Sheet');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [sheetName, isConnected]);

  return {
    data,
    isLoading,
    error,
    fetchData,
    updateData
  };
};

export default useGoogleSheet;