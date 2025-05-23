import { useState, useContext, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FiSave, FiEdit2, FiUpload, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiArrowLeft, FiClock, FiDollarSign, FiCalendar, FiInfo, FiGrid } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import AdvisorProfile from '../components/AdvisorProfile';

  const TeamMemberDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useContext(AuthContext);
  const avatarFileInputRef = useRef(null);

  const isAdmin = currentUser?.email === 'accounting@blackhaysgroup.com';
  const advisorEmail = decodeURIComponent(employeeId);

  const [activeTab, setActiveTab] = useState('local');
  const [teamMemberInfo, setTeamMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeEntries, setTimeEntries] = useState([]);
  const [clientSummary, setClientSummary] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [isEditingSkill, setIsEditingSkill] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  
  // Fetch team member data
  useEffect(() => {
    const fetchTeamMemberData = () => {
      setLoading(true);
      try {
        // Load team members from localStorage
      const fetchFromGoogleSheet = async () => {
        const res = await fetch(`${import.meta.env.VITE_ADVISOR_TIME_API}?email=${advisorEmail}`);
const entries = await res.json();
const memberEntries = entries;

      };
      await fetchFromGoogleSheet();

        if (teamMember) {
          // Initialize skills if not present
          if (!teamMember.skills) {
            teamMember.skills = [];
          }
          
          setTeamMemberInfo(teamMember);
          
          // Load time entries for this team member
          // const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
          const memberEntries = allEntries.filter(entry => entry.userId === employeeId);
          
          // Get current month entries
          const currentMonth = format(new Date(), 'yyyy-MM');
          const currentMonthEntries = memberEntries.filter(entry => 
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
          memberEntries.forEach(entry => {
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
        } else {
          toast.error('Team member not found');
          navigate('/employees');
        }
      } catch (error) {
        console.error('Error loading team member:', error);
        toast.error('Error loading team member data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamMemberData();
  }, [employeeId, navigate]);
  
  // Save team member data
  const saveTeamMemberData = async (updatedMember) => {
  try {
    await fetch(import.meta.env.VITE_ADVISOR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMember),
    });
    setTeamMemberInfo(updatedMember);
    toast.success('Team member info saved to Google Sheet');
  } catch (error) {
    console.error('Error saving to Google Sheet:', error);
    toast.error('Failed to save team member data');
  }
};
     
      // Save back to localStorage
      localStorage.setItem('employees', JSON.stringify(updatedTeamMembers));
      
      // Update local state
      setTeamMemberInfo(updatedMember);
      
      toast.success('Team member information saved successfully');
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Error saving team member data');
    }
  };
  
  // Handle general input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamMemberInfo({ ...teamMemberInfo, [name]: value });
  };
  
  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedMember = { ...teamMemberInfo, avatar: reader.result };
        setTeamMemberInfo(updatedMember);
        saveTeamMemberData(updatedMember);
        toast.success('Avatar uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const triggerAvatarFileInput = () => {
    avatarFileInputRef.current.click();
  };
  
  // Handle adding/editing skill
  const handleEditSkill = (skill = null) => {
    if (skill) {
      setCurrentSkill({ ...skill });
    } else {
      setCurrentSkill({
        id: Date.now().toString(),
        name: '',
        level: 'Intermediate'
      });
    }
    setIsEditingSkill(true);
  };
  
  // Handle skill input changes
  const handleSkillInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentSkill({ ...currentSkill, [name]: value });
  };
  
  // Save skill
  const handleSaveSkill = () => {
    if (!currentSkill.name) {
      toast.error('Skill name is required');
      return;
    }
    
    let newSkills;
    const existingSkill = teamMemberInfo.skills.find(s => s.id === currentSkill.id);
    
    if (existingSkill) {
      // Update existing skill
      newSkills = teamMemberInfo.skills.map(skill => 
        skill.id === currentSkill.id ? currentSkill : skill
      );
    } else {
      // Add new skill
      newSkills = [...teamMemberInfo.skills, currentSkill];
    }
    
    const updatedMember = { ...teamMemberInfo, skills: newSkills };
    saveTeamMemberData(updatedMember);
    
    setIsEditingSkill(false);
    setCurrentSkill(null);
  };
  
  // Delete skill
  const handleDeleteSkill = (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      const newSkills = teamMemberInfo.skills.filter(s => s.id !== skillId);
      const updatedMember = { ...teamMemberInfo, skills: newSkills };
      saveTeamMemberData(updatedMember);
      toast.success('Skill deleted successfully');
    }
  };
  
  // Handle numeric input changes
  const handleNumericInputChange = (e) => {
    const { name, value } = e.target;
    setTeamMemberInfo({ ...teamMemberInfo, [name]: parseFloat(value) || 0 });
  };
  
  // Save all team member info
  const handleSaveTeamMemberInfo = () => {
    saveTeamMemberData(teamMemberInfo);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!teamMemberInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Team Member Not Found</h1>
        <p className="mb-4">
          The requested team member could not be found.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/employees')}
          className="flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Team Members
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
            onClick={() => navigate('/employees')}
            className="mr-4 flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {teamMemberInfo.name}
          </h1>
        </div>
        
        <Button
          variant="primary"
          onClick={handleSaveTeamMemberInfo}
          className="inline-flex items-center mt-4 md:mt-0"
        >
          <FiSave className="mr-2" /> Save Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center justify-center p-6">
              <div className="relative mb-4">
                {teamMemberInfo.avatar ? (
                  <img 
                    src={teamMemberInfo.avatar} 
                    alt="Team Member Avatar" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-primary-100 dark:bg-primary-700 flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary-600 dark:text-primary-300">
                      {teamMemberInfo.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-primary-600 p-2 rounded-full text-white shadow-sm"
                  onClick={triggerAvatarFileInput}
                >
                  <FiUpload className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={avatarFileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{teamMemberInfo.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{teamMemberInfo.position}</p>
              <p className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {teamMemberInfo.status.charAt(0).toUpperCase() + teamMemberInfo.status.slice(1)}
              </p>
            </div>
          </Card>
          
          <Card title="Status & Hours" className="mt-6">
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <select
                  id="status"
                  name="status"
                  value={teamMemberInfo.status}
                  onChange={handleInputChange}
                  className="block w-1/2 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Contract Type</span>
                <select
                  id="contractType"
                  name="contractType"
                  value={teamMemberInfo.contractType}
                  onChange={handleInputChange}
                  className="block w-1/2 py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                >
                  <option value="1099 Contractor">1099 Contractor</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Hourly Rate</span>
                <div className="relative rounded-md w-1/2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="payRate"
                    id="payRate"
                    value={teamMemberInfo.payRate}
                    onChange={handleNumericInputChange}
                    min="0"
                    step="0.01"
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-3 py-2 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="pt-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hours Allocation
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hoursAllocated" className="block text-xs text-gray-500 dark:text-gray-400">
                      Monthly Allocation
                    </label>
                    <input
                      type="number"
                      name="hoursAllocated"
                      id="hoursAllocated"
                      value={teamMemberInfo.hoursAllocated}
                      onChange={handleNumericInputChange}
                      min="0"
                      step="1"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="hoursUsed" className="block text-xs text-gray-500 dark:text-gray-400">
                      Hours Used
                    </label>
                    <input
                      type="number"
                      name="hoursUsed"
                      id="hoursUsed"
                      value={teamMemberInfo.hoursUsed}
                      onChange={handleNumericInputChange}
                      min="0"
                      step="1"
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (teamMemberInfo.hoursUsed / teamMemberInfo.hoursAllocated) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.min(100, ((teamMemberInfo.hoursUsed / teamMemberInfo.hoursAllocated) * 100).toFixed(1))}% of allocated hours used
                </p>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Month Hours: {totalHours.toFixed(2)}
                </label>
                {clientSummary.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {clientSummary.slice(0, 3).map(client => (
                      <div key={client.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 truncate w-3/5">{client.name}</span>
                        <span className="font-medium">{client.hours.toFixed(2)} hrs</span>
                      </div>
                    ))}
                    {clientSummary.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        +{clientSummary.length - 3} more clients
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No time entries for current month
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card title="Basic Information">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={teamMemberInfo.name}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
    
                <Card title="Google Workspace Advisor Info" className="mt-6">
  <div className="p-4">
    <AdvisorProfile 
      userEmail={teamMemberInfo.email}
      isAdmin={currentUser?.email === 'accounting@blackhaysgroup.com'}
    />
  </div>
</Card>
  
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
                      value={teamMemberInfo.email}
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
                      value={teamMemberInfo.phone}
                      onChange={handleInputChange}
                      className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="ein" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    EIN / Tax ID
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                      <FiFileText className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      name="ein"
                      id="ein"
                      value={teamMemberInfo.ein}
                      onChange={handleInputChange}
                      className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    id="department"
                    value={teamMemberInfo.department}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    id="position"
                    value={teamMemberInfo.position}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hire Date
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                      <FiCalendar className="h-4 w-4" />
                    </span>
                    <input
                      type="date"
                      name="hireDate"
                      id="hireDate"
                      value={teamMemberInfo.hireDate}
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
                    value={teamMemberInfo.address}
                    onChange={handleInputChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  id="emergencyContact"
                  value={teamMemberInfo.emergencyContact}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </Card>
          
          <Card title="About / Bio" className="mt-6">
            <div className="p-4">
              <textarea
                name="bio"
                id="bio"
                rows="4"
                value={teamMemberInfo.bio}
                onChange={handleInputChange}
                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Provide information about this team member's background, expertise, and experience."
              ></textarea>
            </div>
          </Card>
          
          <Card title="Skills & Expertise" className="mt-6">
            <div className="p-4">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Professional Skills
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditSkill()}
                >
                  Add Skill
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {teamMemberInfo.skills && teamMemberInfo.skills.length > 0 ? (
                  teamMemberInfo.skills.map(skill => (
                    <div 
                      key={skill.id} 
                      className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{skill.name}</span>
                      <span className="text-xs ml-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-1 rounded">
                        {skill.level}
                      </span>
                      <button 
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => handleEditSkill(skill)}
                      >
                        <FiEdit2 size={12} />
                      </button>
                      <button 
                        className="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                        onClick={() => handleDeleteSkill(skill.id)}
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No skills added yet. Click "Add Skill" to add skills and expertise.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <Card title="Recent Activity" subtitle="Time entries for this team member">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <FiClock className="text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Time Entries
            </h3>
          </div>
          
          {timeEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {timeEntries.map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.clientName || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{parseFloat(entry.hours).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{entry.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No recent time entries found for this team member.</p>
          )}
        </div>
      </Card>
      
      {/* Skill Edit Modal */}
      {isEditingSkill && currentSkill && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsEditingSkill(false)}></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  {currentSkill.id ? 'Edit Skill' : 'Add New Skill'}
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="skill-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Skill Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="skill-name"
                      name="name"
                      value={currentSkill.name}
                      onChange={handleSkillInputChange}
                      required
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., JavaScript, Project Management, Graphic Design"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="skill-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Proficiency Level
                    </label>
                    <select
                      id="skill-level"
                      name="level"
                      value={currentSkill.level}
                      onChange={handleSkillInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto sm:ml-3"
                  onClick={handleSaveSkill}
                >
                  {currentSkill.id ? 'Update' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                  onClick={() => setIsEditingSkill(false)}
                >
                  Cancel
                </Button>
                {currentSkill.id && (
                  <Button
                    variant="danger"
                    className="mt-3 w-full sm:mt-0 sm:w-auto sm:mr-auto"
                    onClick={() => {
                      handleDeleteSkill(currentSkill.id);
                      setIsEditingSkill(false);
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

export default TeamMemberDetail;
