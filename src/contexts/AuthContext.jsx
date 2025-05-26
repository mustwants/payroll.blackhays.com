import { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

// Create the Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Allowed email domains from environment variable - Only blackhaysgroup.com is allowed
  const allowedDomains = ['blackhaysgroup.com'];

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setUserRole(user.role);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate. Please try logging in again.');
        // Clear any potentially corrupted auth data
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

// Check if the user's email is from an allowed domain
const isEmailDomainAllowed = (email) => {
  if (!email) return false;

  // Allow test login in dev/test environments
  if (email === 'admin@blackhays.com') {
    return true;
  }

  // Check domain match
  return allowedDomains.some(domain => email.endsWith(`@${domain}`));
};


  // Login function - also support direct login for admin testing
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sanitize inputs to prevent XSS
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Validate email domain
      if (!isEmailDomainAllowed(sanitizedEmail)) {
        throw new Error('Login is restricted to BlackHays Group email accounts only');
      }

     // For testing in bolt.new, allow admin@blackhays.com with password admin123
      if (sanitizedEmail === 'admin@blackhays.com' && password === 'admin123') {
        const user = {
          id: uuidv4(),
          name: 'Admin User',
          email: sanitizedEmail,
          role: 'admin',
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        setUserRole('admin');
        return true;
      } else {
        // For production, direct login is disabled
        throw new Error('Direct login is disabled. Please use Google Sign-in with your blackhaysgroup.com account.');
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const googleLogin = async (response) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the credential from Google response
      const { credential } = response;
      
      // Decode the JWT to get user information
      const decoded = jwtDecode(credential);
      
      // Validate email domain
      if (!isEmailDomainAllowed(decoded.email)) {
        throw new Error('Login is restricted to BlackHays Group email accounts (@blackhaysgroup.com) only');
      }
      
      // In a real app, you would verify the Google token on your backend
      // and create/fetch the user account
      const user = {
        id: uuidv4(), // Generate a UUID instead of using Google's sub
        google_id: decoded.sub, // Store Google's sub as a separate property
        name: decoded.name || 'Google User',
        email: decoded.email || 'unknown@example.com', 
        role: 'employee', // Default role for Google auth users - in a real app, this should come from your user database
        avatar: decoded.picture, // Google provides profile picture URL
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      setUserRole('employee'); // In a real app, this role should be fetched from your database
      return true;
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to login with Google. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setUserRole(null);
  };

  // Context value
  const value = {
    currentUser,
    userRole,
    loading,
    error,
    login,
    googleLogin,
    logout,
    isEmailDomainAllowed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};