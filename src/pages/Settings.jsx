import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiSave, FiLock, FiUserCheck, FiBell } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';

const Settings = () => {
  const { currentUser, userRole } = useContext(AuthContext);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the settings page.
        </p>
      </div>
    );
  }
  
  const [activeTab, setActiveTab] = useState('general');
  
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Black Hays',
    address: '123 Main Street, New York, NY 10001',
    phone: '(555) 123-4567',
    email: 'contact@blackhays.com',
    taxId: '12-3456789',
  });
  
  const [payrollSettings, setPayrollSettings] = useState({
    payPeriod: 'bi-weekly',
    payDay: 'friday',
    directDeposit: true,
    taxWithholding: true,
    overtimeRate: 1.5,
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    payrollReminders: true,
    timeSheetReminders: true,
    systemUpdates: true,
  });
  
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePayrollChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayrollSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const saveSettings = () => {
    // In a real app, this would save to a database
    toast.success('Settings saved successfully!');
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">System Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Tabs */}
          <div className="sm:w-64 border-b sm:border-b-0 sm:border-r border-gray-200">
            <nav className="flex sm:flex-col">
              <button
                className={`px-4 py-3 text-left text-sm font-medium ${
                  activeTab === 'general'
                    ? 'border-b-2 sm:border-b-0 sm:border-l-2 border-primary-500 text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } w-full`}
                onClick={() => setActiveTab('general')}
              >
                General
              </button>
              <button
                className={`px-4 py-3 text-left text-sm font-medium ${
                  activeTab === 'payroll'
                    ? 'border-b-2 sm:border-b-0 sm:border-l-2 border-primary-500 text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } w-full`}
                onClick={() => setActiveTab('payroll')}
              >
                Payroll
              </button>
              <button
                className={`px-4 py-3 text-left text-sm font-medium ${
                  activeTab === 'security'
                    ? 'border-b-2 sm:border-b-0 sm:border-l-2 border-primary-500 text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } w-full`}
                onClick={() => setActiveTab('security')}
              >
                Security
              </button>
              <button
                className={`px-4 py-3 text-left text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'border-b-2 sm:border-b-0 sm:border-l-2 border-primary-500 text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } w-full`}
                onClick={() => setActiveTab('notifications')}
              >
                Notifications
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            {activeTab === 'general' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      value={generalSettings.companyName}
                      onChange={handleGeneralChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      rows="2"
                      value={generalSettings.address}
                      onChange={handleGeneralChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    ></textarea>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={generalSettings.phone}
                        onChange={handleGeneralChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={generalSettings.email}
                        onChange={handleGeneralChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                      Tax ID / EIN
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      id="taxId"
                      value={generalSettings.taxId}
                      onChange={handleGeneralChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'payroll' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payroll Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="payPeriod" className="block text-sm font-medium text-gray-700">
                      Pay Period
                    </label>
                    <select
                      name="payPeriod"
                      id="payPeriod"
                      value={payrollSettings.payPeriod}
                      onChange={handlePayrollChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-Weekly</option>
                      <option value="semi-monthly">Semi-Monthly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="payDay" className="block text-sm font-medium text-gray-700">
                      Pay Day
                    </label>
                    <select
                      name="payDay"
                      id="payDay"
                      value={payrollSettings.payDay}
                      onChange={handlePayrollChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="overtimeRate" className="block text-sm font-medium text-gray-700">
                      Overtime Rate (x regular pay)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="3"
                      name="overtimeRate"
                      id="overtimeRate"
                      value={payrollSettings.overtimeRate}
                      onChange={handlePayrollChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="directDeposit"
                        id="directDeposit"
                        checked={payrollSettings.directDeposit}
                        onChange={handlePayrollChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="directDeposit" className="ml-2 block text-sm text-gray-700">
                        Enable Direct Deposit
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="taxWithholding"
                        id="taxWithholding"
                        checked={payrollSettings.taxWithholding}
                        onChange={handlePayrollChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="taxWithholding" className="ml-2 block text-sm text-gray-700">
                        Automatic Tax Withholding
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div>
                <div className="flex items-center mb-4">
                  <FiLock className="mr-2 text-primary-600" />
                  <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiUserCheck className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Security settings can only be changed by system administrators. Please contact your IT department for assistance.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Password Policy</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Minimum 8 characters</li>
                        <li>• At least one uppercase letter</li>
                        <li>• At least one number</li>
                        <li>• At least one special character</li>
                        <li>• Password expires every 90 days</li>
                        <li>• Cannot reuse previous 5 passwords</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Login Security</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">Two-factor authentication is required for all administrator accounts.</p>
                      <p className="text-sm text-gray-600">Account is locked after 5 failed login attempts.</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Data Security</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-600 mb-2">All data is encrypted at rest and in transit.</p>
                      <p className="text-sm text-gray-600">Regular security audits are performed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center mb-4">
                  <FiBell className="mr-2 text-primary-600" />
                  <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive important system notifications via email</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications} 
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Payroll Reminders</h3>
                      <p className="text-sm text-gray-500">Receive reminders about upcoming payroll processing</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="payrollReminders"
                          checked={notificationSettings.payrollReminders} 
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Time Sheet Reminders</h3>
                      <p className="text-sm text-gray-500">Remind employees to submit their time sheets</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="timeSheetReminders"
                          checked={notificationSettings.timeSheetReminders} 
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">System Updates</h3>
                      <p className="text-sm text-gray-500">Get notified about system updates and maintenance</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="systemUpdates"
                          checked={notificationSettings.systemUpdates} 
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={saveSettings}
                className="inline-flex items-center"
              >
                <FiSave className="mr-2" /> Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;