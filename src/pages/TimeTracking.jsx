import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';
import { FiSave, FiClock, FiPlus, FiTrash2, FiFilter } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const TimeTracking = () => {
  const { currentUser } = useContext(AuthContext);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  
  // Client list
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
          
          <Button
            variant="primary"
            onClick={saveTimeEntries}
            className="flex items-center justify-center"
          >
            <FiSave className="mr-2" />
            Save Entries
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-3">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <FiClock className="mr-2" /> 
                Time Entries for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
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
                  <FiPlus className="mr-1" /> Add Entry
                </Button>
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="bg-gray-50 text-center py-8 rounded">
                <p className="text-gray-500">
                  {timeEntries.length === 0 
                    ? "No time entries for this month. Click 'Add Entry' to get started."
                    : "No entries match your filter. Try selecting a different client."}
                </p>
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
                    {filteredEntries.map((entry) => (
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
        </Card>

        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Summary</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Month</p>
                <p className="text-xl font-semibold">
                  {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Client Filter</p>
                <p className="text-xl font-semibold">
                  {selectedClient ? clients.find(c => c.id === selectedClient)?.name : 'All Clients'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Entries</p>
                <p className="text-xl font-semibold">{filteredEntries.length}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-xl font-semibold">{totalHours.toFixed(2)}</p>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Client Breakdown</p>
                {clients.map(client => {
                  const clientHours = filteredEntries
                    .filter(entry => entry.clientId === client.id)
                    .reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
                  
                  if (clientHours === 0) return null;
                  
                  return (
                    <div key={client.id} className="flex justify-between items-center py-1">
                      <span className="text-sm">{client.name}</span>
                      <span className="font-medium">{clientHours.toFixed(2)} hrs</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TimeTracking;