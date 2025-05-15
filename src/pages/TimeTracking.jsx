import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SupabaseContext } from '../contexts/SupabaseContext';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { FiSave, FiClock, FiPlus, FiTrash2, FiFilter, FiCheck, FiBriefcase, FiCoffee, FiCalendar, FiDatabase } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TimeTracking = () => {
  const { currentUser } = useContext(AuthContext);
  const { 
    getTimeEntries, 
    addTimeEntry, 
    updateTimeEntry, 
    deleteTimeEntry, 
    saveTimeEntries, 
    getClients,
    isUsingSupabase,
    loading: dbLoading, 
    error: dbError 
  } = useContext(SupabaseContext);
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
    const fetchClients = async () => {
      try {
        const fetchedClients = await getClients();
        setClients(fetchedClients.filter(client => client.status === 'active'));
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      }
    };
    
    fetchClients();
  }, [getClients]);

  // Load saved entries when component mounts or month changes
  useEffect(() => {
    const fetchTimeEntries = async () => {
      if (!currentUser?.id) return;
      
      setIsLoading(true);
      try {
        const entries = await getTimeEntries(currentUser.id, selectedMonth);
        setTimeEntries(entries);
      } catch (error) {
        console.error('Error loading time entries:', error);
        toast.error('Failed to load time entries');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTimeEntries();
  }, [currentUser, selectedMonth, getTimeEntries]);

  // Handle quick entry form changes
  const handleQuickEntryChange = (e) => {
    const { name, value } = e.target;
    setQuickEntry({ ...quickEntry, [name]: value });
  };

  // Submit quick entry
  const handleQuickSubmit = async () => {
    if (!quickEntry.clientId || !quickEntry.hours || isNaN(parseFloat(quickEntry.hours))) {
      toast.error('Please select a client and enter valid hours');
      return;
    }

    const selectedClientObj = clients.find(client => client.id === quickEntry.clientId);
    const clientName = selectedClientObj ? selectedClientObj.name : 'Unknown Client';

    const newEntry = {
      date: format(new Date(), 'yyyy-MM-dd'),
      clientId: quickEntry.clientId,
      clientName: clientName,
      hours: quickEntry.hours,
      notes: quickEntry.notes || '',
      userId: currentUser.id,
      userName: currentUser.name,
    };

    try {
      setIsLoading(true);
      const addedEntry = await addTimeEntry(newEntry);
      
      if (addedEntry) {
        // Update the local state
        setTimeEntries(prev => [...prev, addedEntry]);
        
        // Reset quick entry form
        setQuickEntry({
          clientId: '',
          hours: '',
          notes: ''
        });
        
        toast.success('Time entry added successfully!');
      } else {
        toast.error('Failed to add time entry');
      }
    } catch (error) {
      console.error('Error adding time entry:', error);
      toast.error('Error adding time entry');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new time entry (to the form, not saved yet)
  const addTimeEntryToForm = () => {
    const newEntry = {
      tempId: `temp-${Date.now()}`, // Temporary ID for UI purposes
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
  const removeTimeEntryFromForm = async (entry) => {
    // If the entry has an ID (it's already saved in the database)
    if (entry.id) {
      try {
        setIsLoading(true);
        const success = await deleteTimeEntry(entry.id);
        
        if (success) {
          setTimeEntries(timeEntries.filter(e => e.id !== entry.id));
          toast.success('Entry deleted');
        } else {
          toast.error('Failed to delete entry');
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        toast.error('Error deleting entry');
      } finally {
        setIsLoading(false);
      }
    } else {
      // If it's just a temporary entry in the form
      setTimeEntries(timeEntries.filter(e => e.tempId !== entry.tempId));
    }
  };

  // Update a time entry field (in the form, not saved yet)
  const updateTimeEntryInForm = (entryId, field, value) => {
    setTimeEntries(timeEntries.map(entry => {
      if ((entry.id && entry.id === entryId) || (entry.tempId && entry.tempId === entryId)) {
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
  const handleSaveEntries = async () => {
    // Validate entries
    const hasInvalidEntries = timeEntries.some(entry => 
      !entry.clientId || !entry.hours || isNaN(parseFloat(entry.hours))
    );
    
    if (hasInvalidEntries) {
      toast.error('Please fill in all required fields and ensure hours are valid numbers');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For each new entry (with tempId), add it properly
      const entriesNeedingAdd = timeEntries.filter(entry => entry.tempId);
      const entriesToUpdate = timeEntries.filter(entry => entry.id);
      
      // Process new entries
      if (entriesNeedingAdd.length > 0) {
        for (const entry of entriesNeedingAdd) {
          const { tempId, ...entryData } = entry;
          await addTimeEntry(entryData);
        }
      }
      
      // Process updates to existing entries
      if (entriesToUpdate.length > 0) {
        for (const entry of entriesToUpdate) {
          await updateTimeEntry(entry.id, entry);
        }
      }
      
      // Reload entries to get fresh data
      const refreshedEntries = await getTimeEntries(currentUser.id, selectedMonth);
      setTimeEntries(refreshedEntries);
      
      toast.success('All time entries saved successfully!');
    } catch (error) {
      console.error('Error saving time entries:', error);
      toast.error('Error saving time entries');
    } finally {
      setIsLoading(false);
    }
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
      {dbError && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiDatabase className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                {dbError} Your data will be stored locally.
              </p>
            </div>
          </div>
        </div>
      )}
      
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
            onClick={handleSaveEntries}
            disabled={isLoading}
            className="flex items-center justify-center"
          >
            <FiSave className="mr-2" />
            {isLoading ? 'Saving...' : 'Save All Entries'}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
                placeholder="Brief description"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={handleQuickSubmit}
            disabled={isLoading}
            className="flex items-center justify-center mt-4"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" /> Submit Time Entry
              </>
            )}
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
                  onClick={addTimeEntryToForm}
                  disabled={isLoading}
                  className="inline-flex items-center"
                >
                  <FiPlus className="mr-2" /> Add Entry
                </Button>
              </div>
            </div>

            {isLoading && !timeEntries.length ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredEntries.length === 0 ? (
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
                      <tr key={entry.id || entry.tempId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) => updateTimeEntryInForm(entry.id || entry.tempId, 'date', e.target.value)}
                            disabled={isLoading}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={entry.clientId}
                            onChange={(e) => updateTimeEntryInForm(entry.id || entry.tempId, 'clientId', e.target.value)}
                            disabled={isLoading}
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
                            onChange={(e) => updateTimeEntryInForm(entry.id || entry.tempId, 'hours', e.target.value)}
                            disabled={isLoading}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Hours"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={entry.notes}
                            onChange={(e) => updateTimeEntryInForm(entry.id || entry.tempId, 'notes', e.target.value)}
                            disabled={isLoading}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Add notes here..."
                            rows="1"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => removeTimeEntryFromForm(entry)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
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
              
              <div className="pt-2 text-center">
                {isUsingSupabase() ? (
                  <div className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                    <FiDatabase className="mr-1" /> Connected to database
                  </div>
                ) : (
                  <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <FiDatabase className="mr-1" /> Using local storage
                  </div>
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