import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone, FiSave, FiX, FiUpload, FiBriefcase, FiLink, FiDollarSign, FiClock } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from 'react-toastify';

const Clients = () => {
  const { userRole } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the clients page.
        </p>
      </div>
    );
  }
  
  // Client data state
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('clients');
    const initialValue = saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Acme Corporation',
        contactName: 'John Doe',
        email: 'contact@acmecorp.com',
        phone: '(555) 123-4567',
        address: '123 Main St, New York, NY 10001',
        website: 'https://acmecorp.com',
        logo: '',
        status: 'active',
        startDate: '2023-01-15',
        endDate: '2023-12-31',
        totalHours: 1200,
        usedHours: 450,
        monthlyHours: 100,
        rate: 75.00,
        notes: 'Key client for engineering services'
      },
      {
        id: '2',
        name: 'Globex Industries',
        contactName: 'Lisa Miller',
        email: 'lisa@globexindustries.com',
        phone: '(555) 234-5678',
        address: '456 Tech Blvd, San Francisco, CA 94107',
        website: 'https://globexindustries.com',
        logo: '',
        status: 'active',
        startDate: '2023-03-01',
        endDate: '2024-02-28',
        totalHours: 800,
        usedHours: 320,
        monthlyHours: 80,
        rate: 85.00,
        notes: 'Technology consulting project'
      },
      {
        id: '3',
        name: 'Wayne Enterprises',
        contactName: 'Bruce Wayne',
        email: 'bruce@wayneenterprises.com',
        phone: '(555) 345-6789',
        address: '789 Gotham Ave, Gotham City, NJ 07001',
        website: 'https://wayneenterprises.com',
        logo: '',
        status: 'inactive',
        startDate: '2022-09-15',
        endDate: '2023-09-14',
        totalHours: 600,
        usedHours: 600,
        monthlyHours: 50,
        rate: 90.00,
        notes: 'Contract completed'
      },
      {
        id: '4',
        name: 'Stark Industries',
        contactName: 'Tony Stark',
        email: 'tony@starkindustries.com',
        phone: '(555) 456-7890',
        address: '1 Stark Tower, Manhattan, NY 10010',
        website: 'https://starkindustries.com',
        logo: '',
        status: 'active',
        startDate: '2023-05-01',
        endDate: '2024-04-30',
        totalHours: 2400,
        usedHours: 800,
        monthlyHours: 200,
        rate: 95.00,
        notes: 'High priority client'
      },
      {
        id: '5',
        name: 'Umbrella Corporation',
        contactName: 'Albert Wesker',
        email: 'wesker@umbrellacorp.com',
        phone: '(555) 567-8901',
        address: '100 Raccoon St, Raccoon City, MO 65201',
        website: 'https://umbrellacorp.com',
        logo: '',
        status: 'active',
        startDate: '2023-02-15',
        endDate: '2024-02-14',
        totalHours: 960,
        usedHours: 640,
        monthlyHours: 80,
        rate: 80.00,
        notes: 'Research and development project'
      },
    ];
    return initialValue;
  });

  // Save clients to localStorage when they change
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  
  // Initial empty client template
  const emptyClient = {
    id: '',
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logo: '',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    totalHours: 0,
    usedHours: 0,
    monthlyHours: 0,
    rate: 0,
    notes: ''
  };
  
  // Filter clients based on search term
  const filteredClients = clients.filter(
    client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle opening the modal for adding a new client
  const handleAddClient = () => {
    setCurrentClient({ ...emptyClient, id: Date.now().toString() });
    setEditMode(false);
    setIsModalOpen(true);
  };
  
  // Handle opening the modal for editing an existing client
  const handleEditClient = (client) => {
    setCurrentClient({ ...client });
    setEditMode(true);
    setIsModalOpen(true);
  };
  
  // Handle saving the client data
  const handleSaveClient = () => {
    // Validate form
    if (!currentClient.name || !currentClient.email) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    if (editMode) {
      // Update existing client
      setClients(clients.map(c => c.id === currentClient.id ? currentClient : c));
      toast.success('Client updated successfully');
    } else {
      // Add new client
      setClients([...clients, currentClient]);
      toast.success('Client added successfully');
    }
    
    setIsModalOpen(false);
  };
  
  // Handle deleting a client
  const handleDeleteClient = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(c => c.id !== id));
      toast.success('Client deleted successfully');
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentClient({ ...currentClient, [name]: value });
  };
  
  // Handle numeric input changes
  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentClient({ ...currentClient, [name]: parseFloat(value) || 0 });
  };
  
  // Handle file upload for logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentClient({ ...currentClient, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Clients</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search clients..."
            />
          </div>
          
          <Button
            variant="primary"
            className="inline-flex items-center px-4 py-2"
            onClick={handleAddClient}
          >
            <FiPlus className="mr-2" /> Add Client
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contract
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hours
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {client.logo ? (
                          <img className="h-10 w-10 rounded object-cover" src={client.logo} alt={client.name} />
                        ) : (
                          <div className="h-10 w-10 rounded bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="text-primary-800 dark:text-primary-200 font-medium">
                              {client.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                        {client.website && (
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center">
                            <FiLink className="mr-1" size={12} /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{client.contactName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FiMail className="mr-1" /> {client.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FiPhone className="mr-1" /> {client.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(client.startDate).toLocaleDateString()} to {new Date(client.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white flex items-center mt-1">
                      <FiDollarSign className="mr-1" /> {client.rate.toFixed(2)}/hr
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center">
                      <FiClock className="mr-1" /> {client.usedHours} / {client.totalHours} hrs total
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (client.usedHours / client.totalHours) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {client.monthlyHours} hrs/month
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3"
                      onClick={() => handleEditClient(client)}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      {editMode ? 'Edit Client' : 'Add New Client'}
                    </h3>
                    <div className="mt-4 grid grid-cols-6 gap-6">
                      {/* Logo upload */}
                      <div className="col-span-6 sm:col-span-6 flex justify-center">
                        <div className="relative">
                          {currentClient.logo ? (
                            <img 
                              src={currentClient.logo} 
                              alt="Client Logo" 
                              className="w-24 h-24 rounded object-cover border-2 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                              <FiBriefcase className="h-12 w-12 text-primary-600 dark:text-primary-300" />
                            </div>
                          )}
                          <button
                            type="button"
                            className="absolute bottom-0 right-0 bg-primary-600 p-1 rounded-full text-white shadow-sm"
                            onClick={triggerFileInput}
                          >
                            <FiUpload className="h-4 w-4" />
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Client Information */}
                      <div className="col-span-6">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Client Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={currentClient.name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contact Person
                        </label>
                        <input
                          type="text"
                          name="contactName"
                          id="contactName"
                          value={currentClient.contactName}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={currentClient.email}
                          onChange={handleInputChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={currentClient.phone}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Website
                        </label>
                        <input
                          type="url"
                          name="website"
                          id="website"
                          value={currentClient.website}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={currentClient.address}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Contract Information */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          id="startDate"
                          value={currentClient.startDate}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          id="endDate"
                          value={currentClient.endDate}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={currentClient.status}
                          onChange={handleInputChange}
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          name="rate"
                          id="rate"
                          value={currentClient.rate}
                          onChange={handleNumericInputChange}
                          min="0"
                          step="0.01"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <label htmlFor="totalHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Contract Hours
                        </label>
                        <input
                          type="number"
                          name="totalHours"
                          id="totalHours"
                          value={currentClient.totalHours}
                          onChange={handleNumericInputChange}
                          min="0"
                          step="1"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <label htmlFor="usedHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Used Hours
                        </label>
                        <input
                          type="number"
                          name="usedHours"
                          id="usedHours"
                          value={currentClient.usedHours}
                          onChange={handleNumericInputChange}
                          min="0"
                          step="1"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-2">
                        <label htmlFor="monthlyHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Monthly Hours
                        </label>
                        <input
                          type="number"
                          name="monthlyHours"
                          id="monthlyHours"
                          value={currentClient.monthlyHours}
                          onChange={handleNumericInputChange}
                          min="0"
                          step="1"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          id="notes"
                          rows="3"
                          value={currentClient.notes}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSaveClient}
                >
                  <FiSave className="mr-2" /> {editMode ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  <FiX className="mr-2" /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;