import { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiUserPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone, FiSave, FiX, FiUpload, FiUsers, FiEye } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from 'react-toastify';

const Employees = () => {
  const { userRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the team members page.
        </p>
      </div>
    );
  }
  
  // Team member data state
  const [teamMembers, setTeamMembers] = useState(() => {
    const saved = localStorage.getItem('employees');
    const initialValue = saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@blackhays.com',
        phone: '(555) 123-4567',
        department: 'Engineering',
        position: 'Senior Developer',
        status: 'active',
        hireDate: '2020-05-15',
        avatar: '',
        hoursAllocated: 160,
        hoursUsed: 120,
        address: '123 Main St, New York, NY',
        emergencyContact: 'Jane Smith - (555) 987-6543',
        payRate: 45.00,
        contractType: 'Full-time',
        ein: '12-3456789',
        bio: 'John is a senior developer with over 10 years of experience in web development. He specializes in React and Node.js.'
      },
      {
        id: '2',
        name: 'Lisa Johnson',
        email: 'lisa.johnson@blackhays.com',
        phone: '(555) 234-5678',
        department: 'Design',
        position: 'UI/UX Designer',
        status: 'active',
        hireDate: '2021-02-10',
        avatar: '',
        hoursAllocated: 120,
        hoursUsed: 85,
        address: '456 Park Ave, Boston, MA',
        emergencyContact: 'Mike Johnson - (555) 876-5432',
        payRate: 40.00,
        contractType: '1099 Contractor',
        ein: '98-7654321',
        bio: 'Lisa is a UI/UX designer with expertise in creating intuitive and visually appealing interfaces. She has worked with multiple Fortune 500 companies.'
      },
      {
        id: '3',
        name: 'Michael Brown',
        email: 'michael.brown@blackhays.com',
        phone: '(555) 345-6789',
        department: 'Marketing',
        position: 'Marketing Manager',
        status: 'active',
        hireDate: '2019-11-05',
        avatar: '',
        hoursAllocated: 140,
        hoursUsed: 135,
        address: '789 Broadway, Chicago, IL',
        emergencyContact: 'Sarah Brown - (555) 765-4321',
        payRate: 42.50,
        contractType: '1099 Contractor',
        ein: '45-6789123',
        bio: 'Michael is a strategic marketing manager who excels at developing and implementing comprehensive marketing campaigns.'
      },
      {
        id: '4',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@blackhays.com',
        phone: '(555) 456-7890',
        department: 'Finance',
        position: 'Financial Analyst',
        status: 'active',
        hireDate: '2022-01-20',
        avatar: '',
        hoursAllocated: 160,
        hoursUsed: 110,
        address: '321 Pine St, San Francisco, CA',
        emergencyContact: 'Tom Wilson - (555) 654-3210',
        payRate: 38.75,
        contractType: '1099 Contractor',
        ein: '78-9123456',
        bio: 'Sarah is a detail-oriented financial analyst with a background in accounting and financial modeling.'
      },
      {
        id: '5',
        name: 'David Lee',
        email: 'david.lee@blackhays.com',
        phone: '(555) 567-8901',
        department: 'Sales',
        position: 'Sales Representative',
        status: 'inactive',
        hireDate: '2018-07-12',
        avatar: '',
        hoursAllocated: 80,
        hoursUsed: 45,
        address: '654 Oak Dr, Austin, TX',
        emergencyContact: 'Amy Lee - (555) 543-2109',
        payRate: 35.00,
        contractType: '1099 Contractor',
        ein: '32-1456789',
        bio: 'David is a results-driven sales professional with a proven track record of exceeding targets and building strong client relationships.'
      },
    ];
    return initialValue;
  });

  // Save team members to localStorage when they change
  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTeamMember, setCurrentTeamMember] = useState(null);
  
  // Initial empty team member template
  const emptyTeamMember = {
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    status: 'active',
    hireDate: new Date().toISOString().split('T')[0],
    avatar: '',
    hoursAllocated: 160,
    hoursUsed: 0,
    address: '',
    emergencyContact: '',
    payRate: 0,
    contractType: '1099 Contractor',
    ein: '',
    bio: ''
  };
  
  // Filter team members based on search term
  const filteredTeamMembers = teamMembers.filter(
    member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle opening the modal for adding a new team member
  const handleAddTeamMember = () => {
    setCurrentTeamMember({ ...emptyTeamMember, id: Date.now().toString() });
    setEditMode(false);
    setIsModalOpen(true);
  };
  
  // Handle opening the modal for editing an existing team member
  const handleEditTeamMember = (member) => {
    setCurrentTeamMember({ ...member });
    setEditMode(true);
    setIsModalOpen(true);
  };
  
  // Navigate to the team member detail page
  const handleViewTeamMember = (memberId) => {
    navigate(`/employees/${memberId}`);
  };
  
  // Handle saving the team member data
  const handleSaveTeamMember = () => {
    // Validate form
    if (!currentTeamMember.name || !currentTeamMember.email || !currentTeamMember.department || !currentTeamMember.position) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    if (editMode) {
      // Update existing team member
      setTeamMembers(teamMembers.map(member => member.id === currentTeamMember.id ? currentTeamMember : member));
      toast.success('Team member updated successfully');
    } else {
      // Add new team member
      setTeamMembers([...teamMembers, currentTeamMember]);
      toast.success('Team member added successfully');
    }
    
    setIsModalOpen(false);
  };
  
  // Handle deleting a team member
  const handleDeleteTeamMember = (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
      toast.success('Team member deleted successfully');
    }
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTeamMember({ ...currentTeamMember, [name]: value });
  };
  
  // Handle file upload for avatar
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentTeamMember({ ...currentTeamMember, avatar: reader.result });
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Team Members</h1>
        
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
              placeholder="Search team members..."
            />
          </div>
          
          <Button
            variant="primary"
            className="inline-flex items-center px-4 py-2"
            onClick={handleAddTeamMember}
          >
            <FiUserPlus className="mr-2" /> Add Team Member
          </Button>
        </div>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Team Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hours
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Contract Type
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTeamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {member.avatar ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={member.avatar} alt={member.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                            <span className="text-primary-800 dark:text-primary-200 font-medium">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white flex items-center">
                      <FiMail className="mr-1" /> {member.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <FiPhone className="mr-1" /> {member.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{member.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{member.hoursUsed} / {member.hoursAllocated}</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (member.hoursUsed / member.hoursAllocated) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {member.contractType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3"
                      onClick={() => handleViewTeamMember(member.id)}
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button 
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-3"
                      onClick={() => handleEditTeamMember(member)}
                      title="Edit"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      onClick={() => handleDeleteTeamMember(member.id)}
                      title="Delete"
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

      {/* Team Member Modal */}
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
                      {editMode ? 'Edit Team Member' : 'Add New Team Member'}
                    </h3>
                    <div className="mt-4 grid grid-cols-6 gap-6">
                      {/* Avatar upload */}
                      <div className="col-span-6 sm:col-span-6 flex justify-center">
                        <div className="relative">
                          {currentTeamMember.avatar ? (
                            <img 
                              src={currentTeamMember.avatar} 
                              alt="Team Member Avatar" 
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                              <FiUsers className="h-12 w-12 text-primary-600 dark:text-primary-300" />
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
                            onChange={handleAvatarUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={currentTeamMember.name}
                          onChange={handleInputChange}
                          required
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
                          value={currentTeamMember.email}
                          onChange={handleInputChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={currentTeamMember.phone}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="ein" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          EIN / Tax ID 
                        </label>
                        <input
                          type="text"
                          name="ein"
                          id="ein"
                          value={currentTeamMember.ein}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          placeholder="XX-XXXXXXX"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Hire Date
                        </label>
                        <input
                          type="date"
                          name="hireDate"
                          id="hireDate"
                          value={currentTeamMember.hireDate}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          id="department"
                          value={currentTeamMember.department}
                          onChange={handleInputChange}
                          required
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Position <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="position"
                          id="position"
                          value={currentTeamMember.position}
                          onChange={handleInputChange}
                          required
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
                          value={currentTeamMember.status}
                          onChange={handleInputChange}
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="on-leave">On Leave</option>
                          <option value="terminated">Terminated</option>
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contract Type
                        </label>
                        <select
                          id="contractType"
                          name="contractType"
                          value={currentTeamMember.contractType}
                          onChange={handleInputChange}
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                        >
                          <option value="1099 Contractor">1099 Contractor</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Temporary">Temporary</option>
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="hoursAllocated" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Hours Allocated (Monthly)
                        </label>
                        <input
                          type="number"
                          name="hoursAllocated"
                          id="hoursAllocated"
                          value={currentTeamMember.hoursAllocated}
                          onChange={handleInputChange}
                          min="0"
                          step="1"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="hoursUsed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Hours Used
                        </label>
                        <input
                          type="number"
                          name="hoursUsed"
                          id="hoursUsed"
                          value={currentTeamMember.hoursUsed}
                          onChange={handleInputChange}
                          min="0"
                          step="1"
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
                          value={currentTeamMember.address}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Emergency Contact
                        </label>
                        <input
                          type="text"
                          name="emergencyContact"
                          id="emergencyContact"
                          value={currentTeamMember.emergencyContact}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="payRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Pay Rate ($/hour)
                        </label>
                        <input
                          type="number"
                          name="payRate"
                          id="payRate"
                          value={currentTeamMember.payRate}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div className="col-span-6">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          About / Bio
                        </label>
                        <textarea
                          name="bio"
                          id="bio"
                          rows="3"
                          value={currentTeamMember.bio}
                          onChange={handleInputChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          placeholder="Brief bio or notes about this team member"
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
                  onClick={handleSaveTeamMember}
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

export default Employees;