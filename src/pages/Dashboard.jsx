import { supabase } from '../contexts/SupabaseContext'; // adjust path if needed
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiUser, FiDollarSign, FiClock, FiCalendar, FiBriefcase, FiUsers, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { format, addMonths, subMonths, parse, isValid } from 'date-fns';

const Dashboard = () => {
  const { currentUser, userRole } = useContext(AuthContext);
  const [timeEntries, setTimeEntries] = useState([]);
  const [clientSummary, setClientSummary] = useState([]);
  const [teamMemberSummary, setTeamMemberSummary] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [activeTeamMembers, setActiveTeamMembers] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  
  // State for month navigation
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [currentMonthDisplay, setCurrentMonthDisplay] = useState(format(new Date(), 'MMMM yyyy'));

  const fetchTimeEntries = async () => {
  try {
    const res = await fetch('https://script.google.com/a/macros/blackhaysgroup.com/s/AKfycbxqN07fYcTqgPT3dPTtEMWbbJS6T87sHTLhQ3M638TfaF4pN0OzQzlg1ZDZyhd-qh2C/exec');
    if (!res.ok) throw new Error("GAS fetch failed");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Falling back to Supabase", err);
    const { data, error } = await supabase.from("time_entries").select("*");
    if (error) throw error;
    return data;
  }
};

  // Load data and calculate summaries
  useEffect(() => {
    const loadTimeEntries = () => {
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
        
        // Generate team member summary
        const teamMembers = {};
        currentMonthEntries.forEach(entry => {
          if (entry.userId && entry.userName && entry.hours) {
            if (!teamMembers[entry.userId]) {
              teamMembers[entry.userId] = {
                id: entry.userId,
                name: entry.userName,
                hours: 0,
              };
            }
            teamMembers[entry.userId].hours += parseFloat(entry.hours) || 0;
          }
        });
        setTeamMemberSummary(Object.values(teamMembers).sort((a, b) => b.hours - a.hours));
        
        // Load active team members count
        const allTeamMembers = JSON.parse(localStorage.getItem('employees') || '[]');
        setActiveTeamMembers(allTeamMembers.filter(member => member.status === 'active').length);
        
        // Load active clients count
        const allClients = JSON.parse(localStorage.getItem('clients') || '[]');
        setActiveClients(allClients.filter(client => client.status === 'active').length);
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
    };
    
    loadTimeEntries();
  }, [currentUser, userRole, currentMonth]);
  
  // Navigate to the previous month
  const goToPrevMonth = () => {
    try {
      const currentDate = parse(currentMonth, 'yyyy-MM', new Date());
      if (isValid(currentDate)) {
        const prevMonth = subMonths(currentDate, 1);
        setCurrentMonth(format(prevMonth, 'yyyy-MM'));
        setCurrentMonthDisplay(format(prevMonth, 'MMMM yyyy'));
      }
    } catch (err) {
      console.error("Error navigating to previous month:", err);
    }
  };
  
  // Navigate to the next month
  const goToNextMonth = () => {
    try {
      const currentDate = parse(currentMonth, 'yyyy-MM', new Date());
      if (isValid(currentDate)) {
        const nextMonth = addMonths(currentDate, 1);
        setCurrentMonth(format(nextMonth, 'yyyy-MM'));
        setCurrentMonthDisplay(format(nextMonth, 'MMMM yyyy'));
      }
    } catch (err) {
      console.error("Error navigating to next month:", err);
    }
  };
  
  // Render different dashboards based on user role
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Welcome, {currentUser?.name}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Dashboard Cards */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-primary-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mr-4">
              <FiUser size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Profile Role</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{userRole === 'admin' ? 'Administrator' : 'Team Member'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Hours This Month</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{totalHours.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
              <FiBriefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Active Clients</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {userRole === 'admin' ? activeClients : clientSummary.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
                <FiCalendar size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">Current Month</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{currentMonthDisplay}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPrevMonth}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Previous month"
              >
                <FiChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={goToNextMonth}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Next month"
              >
                <FiChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {userRole === 'admin' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
              <FiUsers size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Team Members</h2>
          </div>
          <div className="flex flex-wrap -mx-2">
            {teamMemberSummary.length > 0 ? (
              teamMemberSummary.slice(0, 5).map((member) => (
                <div key={member.id} className="px-2 w-full md:w-1/3 lg:w-1/5 mb-4">
                  <div className="border dark:border-gray-700 rounded-lg p-3">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.hours.toFixed(2)} hrs</p>
                      <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 text-xs font-semibold px-2 py-1 rounded">
                        {((member.hours / totalHours) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 w-full px-2">No team member data for this month.</p>
            )}
          </div>
        </div>
      )}
      
      {/* Content based on user role */}
      {userRole === 'admin' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin Dashboard */}
          <Card title="Hours by Client" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="space-y-3">
              {clientSummary.length > 0 ? (
                clientSummary.map((client) => (
                  <div key={client.id} className="flex justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                    </div>
                    <div>
                      <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 text-xs font-semibold px-2 py-1 rounded">
                        {client.hours.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No time entries recorded this month.</p>
              )}
            </div>
          </Card>
          
          <Card title="Hours by Team Member" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="space-y-3">
              {teamMemberSummary.length > 0 ? (
                teamMemberSummary.map((member) => (
                  <div key={member.id} className="flex justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                    </div>
                    <div>
                      <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 text-xs font-semibold px-2 py-1 rounded">
                        {member.hours.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No time entries recorded this month.</p>
              )}
            </div>
          </Card>
          
          <Card title="Recent Time Entries" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {timeEntries.slice(0, 7).map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.userName || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.clientName || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{parseFloat(entry.hours).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{entry.notes || '-'}</td>
                    </tr>
                  ))}
                  {timeEntries.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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
          {/* Team Member Dashboard */}
          <Card title="Your Time by Client" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="space-y-3">
              {clientSummary.length > 0 ? (
                clientSummary.map((client) => (
                  <div key={client.id} className="flex justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</p>
                    </div>
                    <div>
                      <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-300 text-xs font-semibold px-2 py-1 rounded">
                        {client.hours.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">You haven't recorded any time this month.</p>
              )}
            </div>
          </Card>
          
          <Card title="Recent Time Entries" className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {timeEntries.slice(0, 5).map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {entry.clientName || 
                          (entry.clientId === '1' ? 'Acme Corporation' :
                          entry.clientId === '2' ? 'Globex Industries' :
                          entry.clientId === '3' ? 'Wayne Enterprises' :
                          entry.clientId === '4' ? 'Stark Industries' :
                          entry.clientId === '5' ? 'Umbrella Corporation' : 'Unknown')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{parseFloat(entry.hours).toFixed(2)}</td>
                    </tr>
                  ))}
                  {timeEntries.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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