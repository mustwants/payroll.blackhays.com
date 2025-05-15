import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiSave, FiEdit2, FiUpload, FiUsers, FiMail, FiPhone, FiMapPin, FiLink, FiFileText } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from 'react-toastify';

const CompanyInfo = () => {
  const { userRole } = useContext(AuthContext);
  const logoFileInputRef = useRef(null);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the company information page.
        </p>
      </div>
    );
  }
  
  const [companyInfo, setCompanyInfo] = useState(() => {
    const saved = localStorage.getItem('companyInfo');
    const initialValue = saved ? JSON.parse(saved) : {
      name: 'BlackHays Group',
      tagline: 'Professional Payroll Management Solutions',
      address: '123 Corporate Drive, Suite 500, New York, NY 10001',
      phone: '(555) 987-6543',
      email: 'info@blackhays.com',
      website: 'https://blackhays.com',
      logo: '',
      description: 'BlackHays Group is a leading provider of payroll management solutions for businesses of all sizes. We leverage advanced technology to simplify payroll processing, time tracking, and employee management.',
      taxId: '12-3456789',
      yearFounded: '2010',
      leadership: [
        {
          id: '1',
          name: 'Jane Smith',
          title: 'CEO',
          email: 'jane.smith@blackhays.com',
          phone: '(555) 123-4567'
        },
        {
          id: '2',
          name: 'Mike Johnson',
          title: 'CFO',
          email: 'mike.johnson@blackhays.com',
          phone: '(555) 234-5678'
        },
        {
          id: '3',
          name: 'Sarah Williams',
          title: 'CTO',
          email: 'sarah.williams@blackhays.com',
          phone: '(555) 345-6789'
        }
      ],
      accounting: {
        contactName: 'Robert Chen',
        email: 'accounting@blackhays.com',
        phone: '(555) 456-7890'
      },
      socialMedia: {
        linkedin: 'https://linkedin.com/company/blackhays',
        twitter: 'https://twitter.com/blackhays',
        facebook: 'https://facebook.com/blackhays'
      }
    };
    return initialValue;
  });
  
  const [isEditingLeadership, setIsEditingLeadership] = useState(false);
  const [currentLeader, setCurrentLeader] = useState(null);
  
  // Save company info to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
  }, [companyInfo]);
  
  // Handle general input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({ ...companyInfo, [name]: value });
  };
  
  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyInfo({ ...companyInfo, logo: reader.result });
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const triggerLogoFileInput = () => {
    logoFileInputRef.current.click();
  };
  
  // Handle accounting info changes
  const handleAccountingChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({
      ...companyInfo,
      accounting: {
        ...companyInfo.accounting,
        [name]: value
      }
    });
  };
  
  // Handle social media changes
  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo({
      ...companyInfo,
      socialMedia: {
        ...companyInfo.socialMedia,
        [name]: value
      }
    });
  };
  
  // Add/edit leadership
  const handleEditLeader = (leader = null) => {
    if (leader) {
      setCurrentLeader({ ...leader });
    } else {
      setCurrentLeader({
        id: Date.now().toString(),
        name: '',
        title: '',
        email: '',
        phone: ''
      });
    }
    setIsEditingLeadership(true);
  };
  
  // Handle leadership input changes
  const handleLeaderInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentLeader({ ...currentLeader, [name]: value });
  };
  
  // Save leadership changes
  const handleSaveLeader = () => {
    if (!currentLeader.name || !currentLeader.title) {
      toast.error('Name and title are required');
      return;
    }
    
    let newLeadership;
    const existingLeader = companyInfo.leadership.find(leader => leader.id === currentLeader.id);
    
    if (existingLeader) {
      // Update existing leader
      newLeadership = companyInfo.leadership.map(leader => 
        leader.id === currentLeader.id ? currentLeader : leader
      );
    } else {
      // Add new leader
      newLeadership = [...companyInfo.leadership, currentLeader];
    }
    
    setCompanyInfo({ ...companyInfo, leadership: newLeadership });
    setIsEditingLeadership(false);
    setCurrentLeader(null);
    toast.success(existingLeader ? 'Leadership updated successfully' : 'Leadership added successfully');
  };
  
  // Delete leader
  const handleDeleteLeader = (leaderId) => {
    if (window.confirm('Are you sure you want to remove this person from leadership?')) {
      const newLeadership = companyInfo.leadership.filter(leader => leader.id !== leaderId);
      setCompanyInfo({ ...companyInfo, leadership: newLeadership });
      toast.success('Leadership member removed');
    }
  };
  
  // Save all company info
  const handleSaveInfo = () => {
    toast.success('Company information saved successfully');
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Company Information</h1>
        
        <Button
          variant="primary"
          onClick={handleSaveInfo}
          className="inline-flex items-center px-4 py-2"
        >
          <FiSave className="mr-2" /> Save All Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card title="Company Logo">
            <div className="flex flex-col items-center justify-center p-6">
              <div className="relative mb-4">
                {companyInfo.logo ? (
                  <img 
                    src={companyInfo.logo} 
                    alt="Company Logo" 
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
                Upload your company logo. Recommended size: 400x200px.
              </p>
            </div>
          </Card>
          
          <Card title="Accounting Contact" className="mt-6">
            <div className="space-y-4 p-4">
              <div>
                <label htmlFor="accounting-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Name
                </label>
                <input
                  type="text"
                  id="accounting-name"
                  name="contactName"
                  value={companyInfo.accounting.contactName}
                  onChange={handleAccountingChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="accounting-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="accounting-email"
                  name="email"
                  value={companyInfo.accounting.email}
                  onChange={handleAccountingChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="accounting-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="tel"
                  id="accounting-phone"
                  name="phone"
                  value={companyInfo.accounting.phone}
                  onChange={handleAccountingChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <div className="md:col-span-2">
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company-name"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  name="tagline"
                  value={companyInfo.tagline}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    <FiPhone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    id="company-phone"
                    name="phone"
                    value={companyInfo.phone}
                    onChange={handleInputChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    <FiMail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="company-email"
                    name="email"
                    value={companyInfo.email}
                    onChange={handleInputChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company-website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    <FiLink className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    id="company-website"
                    name="website"
                    value={companyInfo.website}
                    onChange={handleInputChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="tax-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax ID / EIN
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    <FiFileText className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="tax-id"
                    name="taxId"
                    value={companyInfo.taxId}
                    onChange={handleInputChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    <FiMapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    id="company-address"
                    name="address"
                    value={companyInfo.address}
                    onChange={handleInputChange}
                    className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="company-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Description
                </label>
                <textarea
                  id="company-description"
                  name="description"
                  rows="4"
                  value={companyInfo.description}
                  onChange={handleInputChange}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                ></textarea>
              </div>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card title="Leadership Team">
              <div className="p-4">
                <div className="space-y-4">
                  {companyInfo.leadership.map(leader => (
                    <div key={leader.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900 dark:text-white">{leader.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{leader.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{leader.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{leader.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                            onClick={() => handleEditLeader(leader)}
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleEditLeader()}
                  >
                    <FiUsers className="mr-2" /> Add Leadership Member
                  </Button>
                </div>
                
                {/* Leadership Edit Modal */}
                {isEditingLeadership && currentLeader && (
                  <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                      {/* Background overlay */}
                      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsEditingLeadership(false)}></div>
                      
                      {/* Modal panel */}
                      <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                            {currentLeader.id ? 'Edit Leadership Member' : 'Add Leadership Member'}
                          </h3>
                          <div className="mt-4 space-y-4">
                            <div>
                              <label htmlFor="leader-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Full Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="leader-name"
                                name="name"
                                value={currentLeader.name}
                                onChange={handleLeaderInputChange}
                                required
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="leader-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                id="leader-title"
                                name="title"
                                value={currentLeader.title}
                                onChange={handleLeaderInputChange}
                                required
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="leader-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                              </label>
                              <input
                                type="email"
                                id="leader-email"
                                name="email"
                                value={currentLeader.email}
                                onChange={handleLeaderInputChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="leader-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Phone
                              </label>
                              <input
                                type="tel"
                                id="leader-phone"
                                name="phone"
                                value={currentLeader.phone}
                                onChange={handleLeaderInputChange}
                                className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                          <Button
                            variant="primary"
                            className="w-full sm:w-auto sm:ml-3"
                            onClick={handleSaveLeader}
                          >
                            {currentLeader.id ? 'Update' : 'Add'}
                          </Button>
                          <Button
                            variant="outline"
                            className="mt-3 w-full sm:mt-0 sm:w-auto"
                            onClick={() => setIsEditingLeadership(false)}
                          >
                            Cancel
                          </Button>
                          {currentLeader.id && (
                            <Button
                              variant="danger"
                              className="mt-3 w-full sm:mt-0 sm:w-auto sm:mr-auto"
                              onClick={() => {
                                handleDeleteLeader(currentLeader.id);
                                setIsEditingLeadership(false);
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            <Card title="Social Media Links">
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={companyInfo.socialMedia.linkedin}
                    onChange={handleSocialMediaChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                
                <div>
                  <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Twitter
                  </label>
                  <input
                    type="url"
                    id="twitter"
                    name="twitter"
                    value={companyInfo.socialMedia.twitter}
                    onChange={handleSocialMediaChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                
                <div>
                  <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook"
                    name="facebook"
                    value={companyInfo.socialMedia.facebook}
                    onChange={handleSocialMediaChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;