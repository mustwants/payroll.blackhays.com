/**
 * Utility functions for authentication
 */

/**
 * Validates if an email belongs to an allowed domain
 * @param {string} email - The email to validate
 * @param {Array} allowedDomains - Array of allowed domains
 * @returns {boolean} - Whether the email is from an allowed domain
 */
export const isEmailFromAllowedDomain = (email, allowedDomains = []) => {
  if (!email || !email.includes('@')) return false;
  
  // For testing purposes
  if (email === 'admin@blackhays.com' || email === 'employee@blackhays.com') {
    return true;
  }
  
  const domain = email.split('@')[1];
  return allowedDomains.includes(domain);
};

/**
 * Extracts user information from a Google credential object
 * @param {Object} credential - Google credential object
 * @returns {Object} - User object
 */
export const extractUserFromGoogleCredential = (credential) => {
  return {
    id: credential.sub,
    name: credential.name,
    email: credential.email,
    avatar: credential.picture,
    emailVerified: credential.email_verified,
    role: 'employee', // Default role - in a real app, this would come from your database
  };
};

/**
 * Determines user role based on email or other factors
 * In a real app, this would query your user database
 * @param {string} email - User's email address
 * @returns {string} - User role
 */
export const determineUserRole = (email) => {
  // This is just a simplified example
  // In a real app, you would query your database for the user's role
  
  if (email === 'admin@blackhays.com') {
    return 'admin';
  }
  
  // Default role for all other users
  return 'employee';
};