import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FiSave, FiClock, FiPlus, FiTrash2 } from 'react-icons/fi';

const TimeTracking = () => {
  const { currentUser } = useContext(AuthContext);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [timeEntries, setTimeEntries] = useState([]);
  const [clients, setClients] = useState([
    { id: '1', name: 'Acme Corporation' },
    { id: '2', name: 'Globex Industries' },
    { id: '3', name: 'Wayne Enterprises' },
    { id: '4', name: 'Stark Industries' },
    { id: '5', name: 'Umbrella Corporation' },
  ]);

  // Load saved entries from localStorage when component mounts
  useEffect(() => {
    const savedEntries = localStorage.getItem(`timeEntries-${currentUser.id}-${selectedMonth}`);
    if (savedEntries) {
      setTimeEntries(JSON.parse(savedEntries));
    } else {
      setTimeEntries([]);
    }
  }, [currentUser.id, selectedMonth]);

  // Add a new time entry
  const addTimeEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      clientId: '',
      hours: '',
      notes: '',
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  // Remove a time entry
  const removeTimeEntry = (id) => {
    setTimeEntries(timeEntries.filter(entry => entry.id !== id));
  };

  // Update a time entry field
  const updateTimeEntry = (id, field, value) => {
    setTimeEntries(timeEntries.map(entry => {
      if (entry.id === id) {
        return { ...entry, [field]: value };
      }
      return entry;
    }));
  };

  // Save all time entries
  const saveTimeEntries = () => {
    // Validate entries
    const hasInvalidEntries = timeEntries.some(entry => 
      !entry.clientId || !entry.hours || isNaN(parseFloat(entry.hours))
    );
    
    if (hasInvalidEntries) {
      toast.error('Please fill in all required fields and ensure hours are valid numbers');
      return;
    }
    
    // In a real app, this would be an API call
    // For the demo, we'll save to localStorage
    localStorage.setItem(
      `timeEntries-${currentUser.id}-${selectedMonth}`, 
      JSON.stringify(timeEntries)
    );
    
    toast.success('Time entries saved successfully!');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Time Tracking</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(new Date().getFullYear(), i, 1);
                return (
                  <option 
                    key={i} 
                    value={format(date, 'yyyy-MM')}
                  >
                    {format(date, 'MMMM yyyy')}
                  </option>
                );
              })}
            </select>
          </div>
          
          <button
            onClick={saveTimeEntries}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiSave className="mr-2" />
            Save Entries
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FiClock className="mr-2" /> 
              Time Entries for {format(new Date(selectedMonth), 'MMMM yyyy')}
            </h2>
            <button
              onClick={addTimeEntry}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FiPlus className="mr-1" /> Add Entry
            </button>
          </div>

          {timeEntries.length === 0 ? (
            <div className="bg-gray-50 text-center py-8 rounded">
              <p className="text-gray-500">No time entries for this month. Click "Add Entry" to get started.</p>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={entry.date}
                          onChange={(e) => updateTimeEntry(entry.id, 'date', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={entry.clientId}
                          onChange={(e) => updateTimeEntry(entry.id, 'clientId', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="">Select a client</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={entry.hours}
                          onChange={(e) => updateTimeEntry(entry.id, 'hours', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Hours"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          value={entry.notes}
                          onChange={(e) => updateTimeEntry(entry.id, 'notes', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Add notes here..."
                          rows="1"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => removeTimeEntry(entry.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;