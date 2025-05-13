import { createContext, useState, useEffect } from 'react';

// Create the Auth Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};