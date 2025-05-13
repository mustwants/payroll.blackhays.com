import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

/**
 * ProtectedRoute component that checks if the user is authenticated
 * and has the required role before rendering the children
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { currentUser, userRole, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading state if authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are required, check if user has one of the required roles
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access this page. Please contact your administrator.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Return the protected content
  return children;
};

export default ProtectedRoute;