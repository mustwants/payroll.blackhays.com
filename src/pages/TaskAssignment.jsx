import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiPlus, FiSave, FiCheck, FiUsers, FiBriefcase, FiClock, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const TaskAssignment = () => {
  const { userRole } = useContext(AuthContext);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the task assignment page.
        </p>
      </div>
    );
  }
  
  // Load employees and clients
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState(() => {
    const saved = localStorage.getItem('taskAssignments');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Current form state
  const [currentTask, setCurrentTask] = useState({
    id: '',
    employeeId: '',
    clientId: '',
    hours: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
    description: '',
    status: 'pending'
  });
  
  // Load employee and client data
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
    
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  }, []);
  
  // Save assignments when they change
  useEffect(() => {
    localStorage.setItem('taskAssignments', JSON.stringify(assignments));
  }, [assignments]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask({ ...currentTask, [name]: value });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!currentTask.employeeId || !currentTask.clientId || !currentTask.hours || isNaN(parseFloat(currentTask.hours))) {
      toast.error('Please fill out all required fields with valid values');
      return;
    }
    
    // Create new task assignment with generated ID
    const newTask = {
      ...currentTask,
      id: Date.now().toString(),
      status: 'pending',
      assignedDate: new Date().toISOString()
    };
    
    // Add to assignments
    setAssignments([...assignments, newTask]);
    
    // Reset form
    setCurrentTask({
      id: '',
      employeeId: '',
      clientId: '',
      hours: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd'),
      description: '',
      status: 'pending'
    });
    
    toast.success('Task assignment created successfully');
  };
  
  // Mark task as completed
  const handleCompleteTask = (taskId) => {
    setAssignments(assignments.map(task => {
      if (task.id === taskId) {
        return { ...task, status: 'completed' };
      }
      return task;
    }));
    toast.success('Task marked as completed');
  };
  
  // Calculate hours by employee and client
  const getEmployeeUsedHours = (employeeId) => {
    return assignments
      .filter(task => task.employeeId === employeeId && task.status !== 'cancelled')
      .reduce((sum, task) => sum + parseFloat(task.hours || 0), 0);
  };
  
  const getClientUsedHours = (clientId) => {
    return assignments
      .filter(task => task.clientId === clientId && task.status !== 'cancelled')
      .reduce((sum, task) => sum + parseFloat(task.hours || 0), 0);
  };
  
  // Get employee and client by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };
  
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };
  
  // Filter active assignments (not cancelled)
  const activeAssignments = assignments.filter(task => task.status !== 'cancelled');
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">Task Assignment</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card title="Assign Hours" className="h-full">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="employeeId"
                    name="employeeId"
                    value={currentTask.employeeId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Select an employee</option>
                    {employees
                      .filter(emp => emp.status === 'active')
                      .map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.hoursUsed}/{employee.hoursAllocated} hrs used
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="clientId"
                    name="clientId"
                    value={currentTask.clientId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">Select a client</option>
                    {clients
                      .filter(client => client.status === 'active')
                      .map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.usedHours}/{client.totalHours} hrs used
                        </option>
                      ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="hours"
                    id="hours"
                    value={currentTask.hours}
                    onChange={handleInputChange}
                    min="0.5"
                    step="0.5"
                    required
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      id="startDate"
                      value={currentTask.startDate}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      id="endDate"
                      value={currentTask.endDate}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Task Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={currentTask.description}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Describe what needs to be done..."
                  ></textarea>
                </div>
                
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full flex items-center justify-center"
                  >
                    <FiPlus className="mr-2" /> Create Assignment
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card title="Current Assignments" subtitle="Manage employee task assignments">
            {activeAssignments.length > 0 ? (
              <div className="space-y-4">
                {activeAssignments.map(task => (
                  <div key={task.id} className={`border-l-4 p-4 rounded-md shadow-sm ${
                    task.status === 'completed' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <FiUsers className="mr-2 text-gray-600 dark:text-gray-400" />
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">
                            {getEmployeeName(task.employeeId)}
                          </h3>
                        </div>
                        <div className="flex items-center mb-2">
                          <FiBriefcase className="mr-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {getClientName(task.clientId)}
                          </p>
                        </div>
                        <div className="flex items-center mb-2">
                          <FiClock className="mr-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {task.hours} hours
                          </p>
                        </div>
                        <div className="flex items-center mb-2">
                          <FiCalendar className="mr-2 text-gray-600 dark:text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(task.startDate).toLocaleDateString()} to {new Date(task.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        {task.description && (
                          <div className="flex items-start mt-2">
                            <FiMessageSquare className="mr-2 mt-1 text-gray-600 dark:text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {task.description}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 md:mt-0">
                        {task.status === 'pending' ? (
                          <Button
                            variant="outline"
                            className="inline-flex items-center"
                            onClick={() => handleCompleteTask(task.id)}
                          >
                            <FiCheck className="mr-2" /> Mark Complete
                          </Button>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 dark:text-gray-400">No task assignments found. Create new assignments using the form.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Employee Hours Status" subtitle="Allocated vs. Used Hours">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Allocated
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Used
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {employees
                  .filter(emp => emp.status === 'active')
                  .map(employee => {
                    const usedHours = employee.hoursUsed + getEmployeeUsedHours(employee.id);
                    const percentage = Math.min(100, (usedHours / employee.hoursAllocated) * 100);
                    
                    return (
                      <tr key={employee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {employee.hoursAllocated} hrs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {usedHours.toFixed(1)} hrs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                percentage > 90 ? 'bg-red-600' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
        
        <Card title="Client Hours Status" subtitle="Contract Hours Usage">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Used
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {clients
                  .filter(client => client.status === 'active')
                  .map(client => {
                    const usedHours = client.usedHours + getClientUsedHours(client.id);
                    const percentage = Math.min(100, (usedHours / client.totalHours) * 100);
                    
                    return (
                      <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {client.totalHours} hrs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {usedHours.toFixed(1)} hrs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                percentage > 90 ? 'bg-red-600' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TaskAssignment;