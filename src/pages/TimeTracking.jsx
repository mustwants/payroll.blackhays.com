import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { FiSave, FiClock, FiPlus, FiTrash2, FiFilter, FiCheck, FiBriefcase, FiCoffee, FiCalendar } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TimeTracking = () => {
  const { currentUser } = useContext(AuthContext);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  // Quick entry form state
  const [quickEntry, setQuickEntry] = useState({
    clientId: '',
    hours: '',
    notes: ''
  });
  
  // Client list
  const [clients, setClients] = useState([]);

  // Load clients
  useEffect(() => {
    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    setClients(savedClients.filter(client => client.status === 'active'));
  }, []);

  // Load saved entries from localStorage when component mounts
  useEffect(() => {
    const savedEntries = localStorage.getItem(`timeEntries-${currentUser.id}-${selectedMonth}`);
    if (savedEntries) {
      setTimeEntries(JSON.parse(savedEntries));
    } else {
      setTimeEntries([]);
    }
  }, [currentUser.id, selectedMonth]);

  // Handle quick entry form changes
  const handleQuickEntryChange = (e) => {
    const { name, value } = e.target;
    setQuickEntry({ ...quickEntry, [name]: value });
  };

  // Submit quick entry
  const handleQuickSubmit = () => {
    if (!quickEntry.clientId || !quickEntry.hours || isNaN(parseFloat(quickEntry.hours))) {
      toast.error('Please select a client and enter valid hours');
      return;
    }

    const selectedClientObj = clients.find(client => client.id === quickEntry.clientId);
    const clientName = selectedClientObj ? selectedClientObj.name : 'Unknown Client';

    const newEntry = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      clientId: quickEntry.clientId,
      clientName: clientName,
      hours: quickEntry.hours,
      notes: quickEntry.notes || '',
      userId: currentUser.id,
      userName: currentUser.name,
    };

    const updatedEntries = [...timeEntries, newEntry];
    setTimeEntries(updatedEntries);
    
    // Save to localStorage
    localStorage.setItem(
      `timeEntries-${currentUser.id}-${selectedMonth}`, 
      JSON.stringify(updatedEntries)
    );
    
    // Update global entries for admin reporting
    const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
    localStorage.setItem('allTimeEntries', JSON.stringify([...allEntries, newEntry]));

    // Reset quick entry form
    setQuickEntry({
      clientId: '',
      hours: '',
      notes: ''
    });

    toast.success('Time entry added successfully!');
  };

  // Add a new time entry
  const addTimeEntry = () => {
    const newEntry = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      clientId: '',
      clientName: '',
      hours: '',
      notes: '',
      userId: currentUser.id,
      userName: currentUser.name,
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
        // If updating clientId, also update clientName
        if (field === 'clientId' && value) {
          const selectedClient = clients.find(client => client.id === value);
          return { 
            ...entry, 
            [field]: value,
            clientName: selectedClient ? selectedClient.name : ''
          };
        }
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
    
    // Also save to a global storage for admin reporting
    const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
    
    // Remove entries from this user and month before adding new ones
    const filteredEntries = allEntries.filter(entry => 
      !(entry.userId === currentUser.id && entry.date.startsWith(selectedMonth))
    );
    
    // Add the new entries
    const updatedAllEntries = [...filteredEntries, ...timeEntries];
    localStorage.setItem('allTimeEntries', JSON.stringify(updatedAllEntries));
    
    toast.success('Time entries saved successfully!');
  };

  // Filter entries by client
  const filteredEntries = selectedClient 
    ? timeEntries.filter(entry => entry.clientId === selectedClient)
    : timeEntries;

  // Calculate total hours
  const totalHours = filteredEntries.reduce((sum, entry) => {
    const hours = parseFloat(entry.hours) || 0;
    return sum + hours;
  }, 0);

  // Calculate hours by client for the current month
  const clientHours = {};
  filteredEntries.forEach(entry => {
    if (entry.clientId && entry.hours) {
      clientHours[entry.clientId] = (clientHours[entry.clientId] || 0) + parseFloat(entry.hours);
    }
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Time Tracking</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex items-center">
            <FiCalendar className="absolute left-3 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          
          <Button
            variant="primary"
            onClick={saveTimeEntries}
            className="flex items-center justify-center"
          >
            <FiSave className="mr-2" />
            Save All Entries
          </Button>
        </div>
      </div>

      {/* Quick Entry Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/30 dark:to-gray-800 border-l-4 border-primary-500">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
            <FiCoffee className="mr-2 text-primary-600 dark:text-primary-400" /> 
            Quick Time Entry for Today
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="quickClient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="quickClient"
                name="clientId"
                value={quickEntry.clientId}
                onChange={handleQuickEntryChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="quickHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hours <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quickHours"
                name="hours"
                value={quickEntry.hours}
                onChange={handleQuickEntryChange}
                min="0.25"
                step="0.25"
                placeholder="Enter hours"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="quickNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                id="quickNotes"
                name="notes"
                value={quickEntry.notes}
                onChange={handleQuickEntryChange}
                placeholder="Brief description"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={handleQuickSubmit}
            className="flex items-center justify-center mt-4"
            size="lg"
          >
            <FiCheck className="mr-2" /> Submit Time Entry
          </Button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Today's date: {format(new Date(), 'MMMM dd, yyyy')} • Entry will be added to current month's report
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-3">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <FiClock className="mr-2" /> 
                Time Entries for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex items-center">
                  <FiFilter className="absolute left-3 text-gray-400" />
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Clients</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  variant="secondary"
                  onClick={addTimeEntry}
                  className="inline-flex items-center"
                >
                  <FiPlus className="mr-2" /> Add Entry
                </Button>
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700/50 text-center py-8 rounded">
                <p className="text-gray-500 dark:text-gray-400">
                  {timeEntries.length === 0 
                    ? "No time entries for this month. Use the quick entry form above to get started."
                    : "No entries match your filter. Try selecting a different client."}
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Hours
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateTimeEntry(entry.id, 'date', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={entry.clientId}
                            onChange={(e) => updateTimeEntry(entry.id, 'clientId', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Hours"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={entry.notes}
                            onChange={(e) => updateTimeEntry(entry.id, 'notes', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Add notes here..."
                            rows="1"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => removeTimeEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
        </Card>

        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Month</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client Filter</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedClient ? clients.find(c => c.id === selectedClient)?.name : 'All Clients'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entries</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{filteredEntries.length}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalHours.toFixed(2)}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Client Breakdown</p>
                {Object.entries(clientHours).length > 0 ? (
                  Object.entries(clientHours).map(([clientId, hours]) => {
                    const client = clients.find(c => c.id === clientId);
                    if (!client) return null;
                    
                    return (
                      <div key={clientId} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{client.name}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{hours.toFixed(2)} hrs</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hours recorded</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TimeTracking;