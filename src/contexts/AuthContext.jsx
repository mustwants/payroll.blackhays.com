import { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-toastify';

// Create the Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Allowed email domains from environment variable
  const allowedDomains = (import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS || 'blackhaysgroup.com,blackhays.com')
    .split(',')
    .map(domain => domain.trim());

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

  // Check if email domain is allowed
  const isEmailDomainAllowed = (email) => {
    if (!email) return false;
    
    // For demo purposes, allow test accounts
    if (email === 'admin@blackhays.com' || email === 'employee@blackhays.com') {
      return true;
    }
    
    for (const domain of allowedDomains) {
      if (email.endsWith(`@${domain}`)) {
        return true;
      }
    }
    
    return false;
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real application, this would be an API call
      // For demo purposes, we'll simulate a successful login with admin role
      // SECURITY NOTE: In production, use proper authentication with JWT or OAuth
      
      // Sanitize inputs to prevent XSS
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Validate email domain
      if (!isEmailDomainAllowed(sanitizedEmail)) {
        throw new Error('Login is restricted to Black Hays Group email accounts only');
      }
      
      // Simulate API call
      if (sanitizedEmail === 'admin@blackhays.com' && password === 'admin123') {
        const user = {
          id: '1',
          name: 'Admin User',
          email: sanitizedEmail,
          role: 'admin',
        };
        
        // Store user info in localStorage (in production, store JWT instead)
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        setUserRole('admin');
        return true;
      } else if (sanitizedEmail === 'employee@blackhays.com' && password === 'employee123') {
        const user = {
          id: '2',
          name: 'Test Employee',
          email: sanitizedEmail,
          role: 'employee',
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        
        setCurrentUser(user);
        setUserRole('employee');
        return true;
      } else {
        throw new Error('Invalid email or password');
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
        throw new Error('Login is restricted to Black Hays Group email accounts only');
      }
      
      // In a real app, you would verify the Google token on your backend
      // and create/fetch the user account
      const user = {
        id: decoded.sub || 'google-user', // Use the subject identifier from Google
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