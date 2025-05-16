import { createContext, useState, useEffect, useContext } from 'react';
import { authenticateWithGoogleScript } from '../services/googleScriptService';
import { AuthContext } from './AuthContext';

export const GoogleScriptContext = createContext();

export const GoogleScriptProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check connection status when user changes
    const checkConnection = async () => {
      if (!currentUser) {
        setIsConnected(false);
        return;
      }

      try {
        setIsLoading(true);
        setScriptError(null);
        
        // Try to authenticate with Google Apps Script
        const result = await authenticateWithGoogleScript({
          userId: currentUser.id,
          userEmail: currentUser.email
        });
        
        setIsConnected(result && result.success);
      } catch (error) {
        console.error('Google Script connection error:', error);
        setScriptError(error.message || 'Failed to connect to Google Apps Script');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run the connection check if there's a valid Google Script URL
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (googleScriptUrl && googleScriptUrl !== 'https://script.google.com/macros/s/your-script-id/exec') {
      checkConnection();
    } else {
      setScriptError('Google Script URL not properly configured. Please update your .env file.');
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [currentUser]);

  // Connect to Google Apps Script
  const connectToGoogleScript = async () => {
    if (!currentUser) {
      setScriptError('You must be logged in to connect to Google Apps Script');
      return false;
    }

    // Check if Google Script URL is properly configured
    const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
    if (!googleScriptUrl || googleScriptUrl === 'https://script.google.com/macros/s/your-script-id/exec') {
      setScriptError('Google Script URL not properly configured. Please update your .env file.');
      setIsConnected(false);
      return false;
    }

    try {
      setIsLoading(true);
      setScriptError(null);
      
      // Authenticate with Google Apps Script
      const result = await authenticateWithGoogleScript({
        userId: currentUser.id,
        userEmail: currentUser.email
      });
      
      setIsConnected(result && result.success);
      return result && result.success;
    } catch (error) {
      console.error('Google Script connection error:', error);
      setScriptError(error.message || 'Failed to connect to Google Apps Script');
      setIsConnected(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    isConnected,
    scriptError,
    isLoading,
    connectToGoogleScript
  };

  return (
    <GoogleScriptContext.Provider value={contextValue}>
      {children}
    </GoogleScriptContext.Provider>
  );
};

export default GoogleScriptProvider;