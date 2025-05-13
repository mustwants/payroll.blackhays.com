import { useState, useContext, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiSave, FiEdit2, FiUpload, FiUsers, FiMail, FiPhone, FiMapPin, FiLink, FiDollarSign, FiClock, FiFileText, FiArrowLeft } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from 'react-toastify';

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useContext(AuthContext);
  const logoFileInputRef = useRef(null);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the client details page.
        </p>
      </div>
    );
  }
  
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  
  // Fetch client data
  useEffect(() => {
    const fetchClientData = () => {
      setLoading(true);
      try {
        // Load clients from localStorage
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const client = clients.find(c => c.id === clientId);
        
        if (client) {
          // Initialize contacts if not present
          if (!client.contacts) {
            client.contacts = [];
          }
          
          // Initialize projects if not present
          if (!client.projects) {
            client.projects = [];
          }
          
          // Initialize notes if not present
          if (!client.notes) {
            client.notes = '';
          }
          
          setClientInfo(client);
        } else {
          toast.error('Client not found');
          navigate('/clients');
        }
      } catch (error) {
        console.error('Error loading client:', error);
        toast.error('Error loading client data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId, navigate]);
  
  // Save client data
  const saveClientData = (updatedClient) => {
    try {
      // Get all clients
      const clients = JSON.parse(localStorage.getItem('clients') || '[]');
      
      // Update the client in the array
      const updatedClients = clients.map(c => 
        c.id === clientId ? updatedClient : c
      );
      
      // Save back to localStorage
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      
      // Update local state
      setClientInfo(updatedClient);
      
      toast.success('Client information saved successfully');
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Error saving client data');
    }
  };
  
  // Handle general input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: value });
  };
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedClient = { ...clientInfo, logo: reader.result };
        setClientInfo(updatedClient);
        saveClientData(updatedClient);
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const triggerLogoFileInput = () => {
    logoFileInputRef.current.click();
  };
  
  // Handle adding/editing contact
  const handleEditContact = (contact = null) => {
    if (contact) {
      setCurrentContact({ ...contact });
    } else {
      setCurrentContact({
        id: Date.now().toString(),
        name: '',
        title: '',
        email: '',
        phone: '',
        isPrimary: clientInfo.contacts.length === 0
      });
    }
    setIsEditingContact(true);
  };
  
  // Handle contact input changes
  const handleContactInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentContact({ 
      ...currentContact, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };
  
  // Save contact
  const handleSaveContact = () => {
    if (!currentContact.name || !currentContact.email) {
      toast.error('Name and email are required');
      return;
    }
    
    let newContacts;
    const existingContact = clientInfo.contacts.find(c => c.id === currentContact.id);
    
    if (existingContact) {
      // Update existing contact
      newContacts = clientInfo.contacts.map(contact => 
        contact.id === currentContact.id ? currentContact : contact
      );
    } else {
      // Add new contact
      newContacts = [...clientInfo.contacts, currentContact];
    }
    
    // If this is set as primary, remove primary from other contacts
    if (currentContact.isPrimary) {
      newContacts = newContacts.map(contact => 
        contact.id !== currentContact.id ? { ...contact, isPrimary: false } : contact
      );
    }
    
    // Ensure at least one contact is primary
    if (newContacts.length > 0 && !newContacts.some(c => c.isPrimary)) {
      newContacts[0].isPrimary = true;
    }
    
    const updatedClient = { ...clientInfo, contacts: newContacts };
    saveClientData(updatedClient);
    
    setIsEditingContact(false);
    setCurrentContact(null);
  };
  
  // Delete contact
  const handleDeleteContact = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      let newContacts = clientInfo.contacts.filter(c => c.id !== contactId);
      
      // Ensure at least one contact is primary if there are any contacts
      if (newContacts.length > 0 && !newContacts.some(c => c.isPrimary)) {
        newContacts[0].isPrimary = true;
      }
      
      const updatedClient = { ...clientInfo, contacts: newContacts };
      saveClientData(updatedClient);
      toast.success('Contact deleted successfully');
    }
  };
  
  // Handle numeric input changes
  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    setClientInfo({ ...clientInfo, [name]: parseFloat(value) || 0 });
  };
  
  // Add a project
  const handleAddProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: 'New Project',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      budget: 0,
      hoursAllocated: 0,
      hoursUsed: 0
    };
    
    const updatedProjects = [...clientInfo.projects, newProject];
    const updatedClient = { ...clientInfo, projects: updatedProjects };
    saveClientData(updatedClient);
    toast.success('Project added successfully');
  };
  
  // Update project
  const handleUpdateProject = (projectId, field, value) => {
    const updatedProjects = clientInfo.projects.map(project => {
      if (project.id === projectId) {
        return { ...project, [field]: value };
      }
      return project;
    });
    
    setClientInfo({ ...clientInfo, projects: updatedProjects });
  };
  
  // Save projects
  const handleSaveProjects = () => {
    saveClientData(clientInfo);
  };
  
  // Delete project
  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = clientInfo.projects.filter(project => project.id !== projectId);
      const updatedClient = { ...clientInfo, projects: updatedProjects };
      saveClientData(updatedClient);
      toast.success('Project deleted successfully');
    }
  };
  
  // Save all client info
  const handleSaveClientInfo = () => {
    saveClientData(clientInfo);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!clientInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Client Not Found</h1>
        <p className="mb-4">
          The requested client could not be found.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/clients')}
          className="flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Clients
        </Button>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/clients')}
            className="mr-4 flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {clientInfo.name}
          </h1>
        </div>
        
        <Button
          variant="primary"
          onClick={handleSaveClientInfo}
          className="inline-flex items-center mt-4 md:mt-0"
        >
          <FiSave className="mr-2" /> Save Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card title="Client Logo">
            <div className="flex flex-col items-center justify-center p-6">
              <div className="relative mb-4">
                {clientInfo.logo ? (
                  <img 
                    src={clientInfo.logo} 
                    alt="Client Logo" 
                    className="w-48 h-auto object-contain border-2 border-gray-300 dark:border-gray-700 rounded"
                  />
                ) : (
                  <div className="w-48 h-32 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">LOGO</span>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-primary-600 p-2 rounded-full text-white shadow-sm"
                  onClick={triggerLogoFileInput}
                >
                  <FiUpload className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Upload client logo. Recommended size: 400x200px.
              </p>
            </div>
          </Card>
          
          <Card title="Status" className="mt-6">
            <div className="p-4">
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={clientInfo.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contract Period
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <label htmlFor="startDate" className="block text-xs text-gray-500 dark:text-gray-400">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        id="startDate"
                        value={clientInfo.startDate}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-xs text-gray-500 dark:text-gray-400">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        id="endDate"
                        value={clientInfo.endDate}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    name="rate"
                    id="rate"
                    value={clientInfo.rate}
                    onChange={handleNumericInputChange}
                    min="0"
                    step="0.01"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contract Hours
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <label htmlFor="totalHours" className="block text-xs text-gray-500 dark:text-gray-400">
                        Total Hours
                      </label>
                      <input
                        type="number"
                        name="totalHours"
                        id="totalHours"
                        value={clientInfo.totalHours}
                        onChange={handleNumericInputChange}
                        min="0"
                        step="1"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="monthlyHours" className="block text-xs text-gray-500 dark:text-gray-400">
                        Monthly Hours
                      </label>
                      <input
                        type="number"
                        name="monthlyHours"
                        id="monthlyHours"
                        value={clientInfo.monthlyHours}
                        onChange={handleNumericInputChange}
                        min="0"
                        step="1"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="usedHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hours Used
                  </label>
                  <input
                    type="number"
                    name="usedHours"
                    id="usedHours"
                    value={clientInfo.usedHours}
                    onChange={handleNumericInputChange}
                    min="0"
                    step="1"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (clientInfo.usedHours / clientInfo.totalHours) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.min(100, ((clientInfo.usedHours / clientInfo.totalHours) * 100).toFixed(1))}% of total hours used
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card title="Basic Information">
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={clientInfo.name}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    id="contactName"
                    value={clientInfo.contactName}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                      <FiMail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={clientInfo.email}
                      onChange={handleInputChange}
                      className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                      <FiPhone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={clientInfo.phone}
                      onChange={handleInputChange}
                      className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                      <FiLink className="h-4 w-4" />
                    </span>
                    <input
                      type="url"
                      name="website"
                      id="website"
                      value={clientInfo.website}
                      onChange={handleInputChange}
                      className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    <FiMapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={clientInfo.address}
                    onChange={handleInputChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={clientInfo.notes}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
            </div>
          </Card>
          
          <Card title="Contact Persons" className="mt-6">
            <div className="p-4">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Client Contacts
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditContact()}
                >
                  Add Contact
                </Button>
              </div>
              
              <div className="space-y-4">
                {clientInfo.contacts && clientInfo.contacts.length > 0 ? (
                  clientInfo.contacts.map(contact => (
                    <div key={contact.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-md font-medium text-gray-900 dark:text-white">{contact.name}</h4>
                            {contact.isPrimary && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{contact.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contact.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{contact.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            onClick={() => handleEditContact(contact)}
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No contacts added yet. Click "Add Contact" to add a contact person.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Card title="Projects" subtitle="Client projects and assignments">
        <div className="p-4">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Projects
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddProject}
              >
                Add Project
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveProjects}
              >
                <FiSave className="mr-2" /> Save Projects
              </Button>
            </div>
          </div>
          
          {clientInfo.projects && clientInfo.projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {clientInfo.projects.map((project, index) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) => handleUpdateProject(project.id, 'name', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <textarea
                          value={project.description}
                          onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          rows="2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={project.startDate}
                          onChange={(e) => handleUpdateProject(project.id, 'startDate', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={project.status}
                          onChange={(e) => handleUpdateProject(project.id, 'status', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="Allocated"
                            value={project.hoursAllocated}
                            onChange={(e) => handleUpdateProject(project.id, 'hoursAllocated', parseFloat(e.target.value) || 0)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          />
                          <input
                            type="number"
                            placeholder="Used"
                            value={project.hoursUsed}
                            onChange={(e) => handleUpdateProject(project.id, 'hoursUsed', parseFloat(e.target.value) || 0)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-primary-600 h-1.5 rounded-full" 
                            style={{ width: `${
                              project.hoursAllocated > 0 
                                ? Math.min(100, (project.hoursUsed / project.hoursAllocated) * 100)
                                : 0
                            }%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <FiTrash2 className="inline h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No projects added yet. Click "Add Project" to create a project.
            </p>
          )}
        </div>
      </Card>
      
      {/* Contact Edit Modal */}
      {isEditingContact && currentContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsEditingContact(false)}></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  {currentContact.id ? 'Edit Contact' : 'Add New Contact'}
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={currentContact.name}
                      onChange={handleContactInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Job Title
                    </label>
                    <input
                      type="text"
                      id="contact-title"
                      name="title"
                      value={currentContact.title}
                      onChange={handleContactInputChange}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={currentContact.email}
                      onChange={handleContactInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={currentContact.phone}
                      onChange={handleContactInputChange}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="is-primary"
                      name="isPrimary"
                      type="checkbox"
                      checked={currentContact.isPrimary}
                      onChange={handleContactInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is-primary" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Primary contact person
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto sm:ml-3"
                  onClick={handleSaveContact}
                >
                  {currentContact.id ? 'Update' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                  onClick={() => setIsEditingContact(false)}
                >
                  Cancel
                </Button>
                {currentContact.id && (
                  <Button
                    variant="danger"
                    className="mt-3 w-full sm:mt-0 sm:w-auto sm:mr-auto"
                    onClick={() => {
                      handleDeleteContact(currentContact.id);
                      setIsEditingContact(false);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;