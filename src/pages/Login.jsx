import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { FiSun, FiMoon, FiAlertCircle } from "react-icons/fi";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, googleLogin, error } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  
  // Redirect if already logged in
  if (currentUser) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  // Handle Google login success
  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const success = await googleLogin(credentialResponse);
      if (success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        toast.success('Google login successful');
      }
    } catch (err) {
      toast.error('Google login failed: ' + (err.message || 'Unknown error'));
      console.error('Google login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleLoginError = () => {
    toast.error('Google sign-in was unsuccessful. Please try again.');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            {darkMode ? (
              <FiSun className="h-5 w-5 text-yellow-400" />
            ) : (
              <FiMoon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
        
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">BlackHays Group</h1>
          <h2 className="mt-3 text-center text-xl font-bold text-gray-700 dark:text-gray-200">
            Payroll Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please sign in with your BlackHays Group account
          </p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Access is restricted to BlackHays Group email accounts (@blackhaysgroup.com) only.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Google Sign-In Button */}
          <div className="mb-6">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginError}
                size="large"
                width="280px"
                text="signin_with"
                shape="rectangular"
                logo_alignment="center"
                useOneTap={false}
              />
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;