import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';

const GoogleLoginButton = ({ onSuccess, onError, disabled }) => {
  const login = useGoogleLogin({
    onSuccess,
    onError,
    flow: 'auth-code',
  });

  return (
    <button
      onClick={() => login()}
      disabled={disabled}
      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
    >
      <FcGoogle className="h-5 w-5 mr-2" />
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
