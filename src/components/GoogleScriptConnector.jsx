import React, { useContext, useState } from 'react';
import { GoogleScriptContext } from '../contexts/GoogleScriptContext';
import Button from './ui/Button';
import { FiCloud, FiCheck, FiAlertCircle } from 'react-icons/fi';

const GoogleScriptConnector = () => {
  const { isConnected, scriptError, isLoading, connectToGoogleScript } = useContext(GoogleScriptContext);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConnect = async () => {
    const success = await connectToGoogleScript();
    if (success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center text-sm">
        <FiCheck className="text-green-500 mr-2" />
        <span className="text-green-700 dark:text-green-400">
          Connected to Google Apps Script
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
      <Button
        variant="outline"
        onClick={handleConnect}
        disabled={isLoading}
        className="flex items-center"
      >
        <FiCloud className="mr-2" />
        {isLoading ? 'Connecting...' : 'Connect to Google Apps Script'}
      </Button>
      
      {scriptError && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
          <FiAlertCircle className="mr-1" /> {scriptError}
        </div>
      )}
      
      {showSuccess && (
        <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
          <FiCheck className="mr-1" /> Successfully connected!
        </div>
      )}
    </div>
  );
};

export default GoogleScriptConnector;