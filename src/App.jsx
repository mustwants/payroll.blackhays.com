import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import PageNotFound from './pages/PageNotFound';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {/* Your app content */}
    </GoogleOAuthProvider>
  );
}

// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const TeamMemberDetail = lazy(() => import('./pages/TeamMemberDetail'));
const TaskAssignment = lazy(() => import('./pages/TaskAssignment'));
const CompanyInfo = lazy(() => import('./pages/CompanyInfo'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const TimeTracking = lazy(() => import('./pages/TimeTracking'));
const CrmContacts = lazy(() => import('./pages/CrmContacts'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Error boundary component
const ErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    console.error('Application Error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Something went wrong</h1>
        <p className="mb-4">We're sorry, but an error occurred. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
        >
          Refresh Page
        </button>
      </div>
    );
  }
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:employeeId" element={<TeamMemberDetail />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/:clientId" element={<ClientDetail />} />
              <Route path="task-assignment" element={<TaskAssignment />} />
              <Route path="company-info" element={<CompanyInfo />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="crm-contacts" element={<CrmContacts />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;