import { useState, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiHome, FiUsers, FiDollarSign, FiBarChart2, FiSettings, FiMenu, FiX, FiLogOut, FiClock, FiAddressBook } from 'react-icons/fi';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Admin navigation items
  const adminNavItems = [
    { path: '/', label: 'Dashboard', icon: <FiHome size={20} /> },
    { path: '/employees', label: 'Employees', icon: <FiUsers size={20} /> },
    { path: '/payroll', label: 'Payroll', icon: <FiDollarSign size={20} /> },
    { path: '/reports', label: 'Reports', icon: <FiBarChart2 size={20} /> },
    { path: '/settings', label: 'Settings', icon: <FiSettings size={20} /> },
  ];

  // Employee navigation items
  const employeeNavItems = [
    { path: '/', label: 'Dashboard', icon: <FiHome size={20} /> },
    { path: '/time-tracking', label: 'Time Tracking', icon: <FiClock size={20} /> },
    { path: '/crm-contacts', label: 'CRM Contacts', icon: <FiAddressBook size={20} /> },
  ];

  // Select navigation items based on user role
  const navItems = userRole === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar overlay for mobile */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={toggleSidebar}></div>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary-800 text-white transform transition duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-6">
          <div className="font-bold text-xl">Black Hays</div>
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={toggleSidebar}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="px-2 py-1">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 rounded-lg transition ${
                      isActive 
                        ? 'bg-primary-700 text-white' 
                        : 'text-gray-300 hover:bg-primary-700 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section at bottom of sidebar */}
        <div className="absolute bottom-0 w-full px-4 py-4 border-t border-primary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{currentUser?.name}</p>
              <p className="text-sm text-gray-300">{currentUser?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full text-white hover:bg-primary-700 transition"
              aria-label="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="bg-white shadow z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <button 
              className="md:hidden text-gray-600 focus:outline-none" 
              onClick={toggleSidebar}
            >
              <FiMenu size={24} />
            </button>
            <div className="md:hidden font-bold">Black Hays</div>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600 hidden md:block">
                Welcome, {currentUser?.name}
              </span>
              {currentUser?.avatar && (
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full" 
                />
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white py-3 px-4 shadow-inner">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Black Hays Payroll Management System
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;