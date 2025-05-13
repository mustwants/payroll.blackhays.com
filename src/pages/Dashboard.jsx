import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiUser, FiDollarSign, FiClock, FiCalendar } from 'react-icons/fi';

const Dashboard = () => {
  const { currentUser, userRole } = useContext(AuthContext);
  
  // Render different dashboards based on user role
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome, {currentUser?.name}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Dashboard Cards */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <FiUser size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Profile</p>
              <p className="text-lg font-semibold">{userRole === 'admin' ? 'Administrator' : 'Employee'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FiDollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Pay Period</p>
              <p className="text-lg font-semibold">Current</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Hours This Month</p>
              <p className="text-lg font-semibold">168</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FiCalendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Next Payroll</p>
              <p className="text-lg font-semibold">
                {new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content based on user role */}
      {userRole === 'admin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                { user: 'John Smith', action: 'Submitted time card', time: '2 hours ago' },
                { user: 'Lisa Johnson', action: 'Requested time off', time: '4 hours ago' },
                { user: 'Michael Brown', action: 'Updated contact information', time: '1 day ago' },
                { user: 'Sarah Wilson', action: 'Changed tax withholding', time: '2 days ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mr-3"></div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-bold text-lg mb-4">Upcoming Payroll</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { name: 'John Smith', hours: 160, status: 'Approved' },
                  { name: 'Lisa Johnson', hours: 168, status: 'Pending' },
                  { name: 'Michael Brown', hours: 152, status: 'Approved' },
                  { name: 'Sarah Wilson', hours: 176, status: 'Approved' },
                ].map((employee, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{employee.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{employee.hours}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        employee.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-bold text-lg mb-4">Recent Time Entries</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { date: '2025-01-15', client: 'Acme Corporation', hours: 8 },
                  { date: '2025-01-14', client: 'Globex Industries', hours: 7.5 },
                  { date: '2025-01-13', client: 'Wayne Enterprises', hours: 8 },
                  { date: '2025-01-12', client: 'Stark Industries', hours: 8 },
                ].map((entry, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.client}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">{entry.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-bold text-lg mb-4">Upcoming Schedule</h2>
            <div className="space-y-3">
              {[
                { client: 'Acme Corporation', date: 'Monday, Jan 20', hours: 8 },
                { client: 'Globex Industries', date: 'Tuesday, Jan 21', hours: 8 },
                { client: 'Wayne Enterprises', date: 'Wednesday, Jan 22', hours: 6 },
                { client: 'Stark Industries', date: 'Thursday, Jan 23', hours: 8 },
                { client: 'Umbrella Corporation', date: 'Friday, Jan 24', hours: 8 },
              ].map((schedule, index) => (
                <div key={index} className="flex justify-between pb-3 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">{schedule.client}</p>
                    <p className="text-xs text-gray-500">{schedule.date}</p>
                  </div>
                  <div>
                    <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded">
                      {schedule.hours} hours
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;