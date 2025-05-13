import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiUser, FiDollarSign, FiClock, FiCalendar, FiBriefcase, FiUsers } from 'react-icons/fi';
import Card from '../components/ui/Card';
import { format } from 'date-fns';

const Dashboard = () => {
  const { currentUser, userRole } = useContext(AuthContext);
  const [timeEntries, setTimeEntries] = useState([]);
  const [clientSummary, setClientSummary] = useState([]);
  const [employeeSummary, setEmployeeSummary] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  
  // Load time entries and calculate summaries
  useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    // Load from localStorage based on user role
    if (userRole === 'admin') {
      // Admins see all entries
      const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
      const currentMonthEntries = allEntries.filter(entry => 
        entry.date && entry.date.startsWith(currentMonth)
      );
      
      setTimeEntries(currentMonthEntries);
      
      // Calculate total hours
      const hours = currentMonthEntries.reduce((sum, entry) => 
        sum + (parseFloat(entry.hours) || 0), 0
      );
      setTotalHours(hours);
      
      // Generate client summary
      const clients = {};
      currentMonthEntries.forEach(entry => {
        if (entry.clientId && entry.clientName && entry.hours) {
          if (!clients[entry.clientId]) {
            clients[entry.clientId] = {
              id: entry.clientId,
              name: entry.clientName,
              hours: 0,
            };
          }
          clients[entry.clientId].hours += parseFloat(entry.hours) || 0;
        }
      });
      setClientSummary(Object.values(clients).sort((a, b) => b.hours - a.hours));
      
      // Generate employee summary
      const employees = {};
      currentMonthEntries.forEach(entry => {
        if (entry.userId && entry.userName && entry.hours) {
          if (!employees[entry.userId]) {
            employees[entry.userId] = {
              id: entry.userId,
              name: entry.userName,
              hours: 0,
            };
          }
          employees[entry.userId].hours += parseFloat(entry.hours) || 0;
        }
      });
      setEmployeeSummary(Object.values(employees).sort((a, b) => b.hours - a.hours));
      
    } else {
      // Employees only see their own entries
      const userEntries = JSON.parse(localStorage.getItem(`timeEntries-${currentUser.id}-${currentMonth}`) || '[]');
      setTimeEntries(userEntries);
      
      // Calculate total hours
      const hours = userEntries.reduce((sum, entry) => 
        sum + (parseFloat(entry.hours) || 0), 0
      );
      setTotalHours(hours);
      
      // Generate client summary for this employee
      const clients = {};
      userEntries.forEach(entry => {
        if (entry.clientId && entry.hours) {
          const clientName = entry.clientName || 
            (entry.clientId === '1' ? 'Acme Corporation' :
            entry.clientId === '2' ? 'Globex Industries' :
            entry.clientId === '3' ? 'Wayne Enterprises' :
            entry.clientId === '4' ? 'Stark Industries' :
            entry.clientId === '5' ? 'Umbrella Corporation' : 'Unknown');
            
          if (!clients[entry.clientId]) {
            clients[entry.clientId] = {
              id: entry.clientId,
              name: clientName,
              hours: 0,
            };
          }
          clients[entry.clientId].hours += parseFloat(entry.hours) || 0;
        }
      });
      setClientSummary(Object.values(clients).sort((a, b) => b.hours - a.hours));
    }
  }, [currentUser, userRole]);
  
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
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Hours This Month</p>
              <p className="text-lg font-semibold">{totalHours.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FiBriefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Active Clients</p>
              <p className="text-lg font-semibold">{clientSummary.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <FiCalendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase">Current Month</p>
              <p className="text-lg font-semibold">{format(new Date(), 'MMMM yyyy')}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content based on user role */}
      {userRole === 'admin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Dashboard */}
          <Card title="Hours by Client" className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-3">
              {clientSummary.length > 0 ? (
                clientSummary.map((client) => (
                  <div key={client.id} className="flex justify-between pb-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                    </div>
                    <div>
                      <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded">
                        {client.hours.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No time entries recorded this month.</p>
              )}
            </div>
          </Card>
          
          <Card title="Hours by Employee" className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-3">
              {employeeSummary.length > 0 ? (
                employeeSummary.map((employee) => (
                  <div key={employee.id} className="flex justify-between pb-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{employee.name}</p>
                    </div>
                    <div>
                      <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded">
                        {employee.hours.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No time entries recorded this month.</p>
              )}
            </div>
          </Card>
          
          <Card title="Recent Time Entries" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntries.slice(0, 5).map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.userName || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.clientName || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{parseFloat(entry.hours).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">{entry.notes || '-'}</td>
                    </tr>
                  ))}
                  {timeEntries.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No time entries found for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Dashboard */}
          <Card title="Your Time by Client" className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-3">
              {clientSummary.length > 0 ? (
                clientSummary.map((client) => (
                  <div key={client.id} className="flex justify-between pb-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                    </div>
                    <div>
                      <span className="bg-primary-100 text-primary-800 text-xs font-semibold px-2 py-1 rounded">
                        {client.hours.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">You haven't recorded any time this month.</p>
              )}
            </div>
          </Card>
          
          <Card title="Recent Time Entries" className="bg-white p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntries.slice(0, 5).map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{entry.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {entry.clientName || 
                          (entry.clientId === '1' ? 'Acme Corporation' :
                          entry.clientId === '2' ? 'Globex Industries' :
                          entry.clientId === '3' ? 'Wayne Enterprises' :
                          entry.clientId === '4' ? 'Stark Industries' :
                          entry.clientId === '5' ? 'Umbrella Corporation' : 'Unknown')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{parseFloat(entry.hours).toFixed(2)}</td>
                    </tr>
                  ))}
                  {timeEntries.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                        You haven't recorded any time this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;