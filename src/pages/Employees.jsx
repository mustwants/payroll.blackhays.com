import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiUserPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone } from 'react-icons/fi';
import Button from '../components/ui/Button';

const Employees = () => {
  const { userRole } = useContext(AuthContext);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the employees page.
        </p>
      </div>
    );
  }
  
  // Mock employee data
  const [employees, setEmployees] = useState([
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@blackhays.com',
      phone: '(555) 123-4567',
      department: 'Engineering',
      position: 'Senior Developer',
      status: 'active',
      hireDate: '2020-05-15',
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
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    employee => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Employees</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search employees..."
            />
          </div>
          
          <Button
            variant="primary"
            className="inline-flex items-center px-4 py-2"
          >
            <FiUserPlus className="mr-2" /> Add Employee
          </Button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-800 font-medium">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FiMail className="mr-1" /> {employee.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <FiPhone className="mr-1" /> {employee.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(employee.hireDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      <FiEdit2 />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;