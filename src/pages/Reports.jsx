import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiDownload, FiBarChart2, FiPieChart, FiTrendingUp, FiFilter, FiCalendar, FiUsers, FiBriefcase } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  PointElement, 
  LineElement
);

const Reports = () => {
  const { userRole } = useContext(AuthContext);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the reports page.
        </p>
      </div>
    );
  }
  
  const [reportType, setReportType] = useState('timeTracking');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);
  
  // Employee list
  const [employees, setEmployees] = useState([
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Lisa Johnson' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Sarah Wilson' },
    { id: '5', name: 'David Lee' },
  ]);
  
  // Client list
  const [clients, setClients] = useState([
    { id: '1', name: 'Acme Corporation' },
    { id: '2', name: 'Globex Industries' },
    { id: '3', name: 'Wayne Enterprises' },
    { id: '4', name: 'Stark Industries' },
    { id: '5', name: 'Umbrella Corporation' },
  ]);
  
  // Load time entries from localStorage
  useEffect(() => {
    const allEntries = JSON.parse(localStorage.getItem('allTimeEntries') || '[]');
    setTimeEntries(allEntries);
  }, []);
  
  // Filter entries by month, client, and employee
  const filteredEntries = timeEntries.filter(entry => {
    const matchesMonth = entry.date && entry.date.startsWith(selectedMonth);
    const matchesClient = !selectedClient || entry.clientId === selectedClient;
    const matchesEmployee = !selectedEmployee || entry.userId === selectedEmployee;
    
    return matchesMonth && matchesClient && matchesEmployee;
  });
  
  // Prepare data for client distribution chart
  const prepareClientData = () => {
    const clientHours = {};
    const clientColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
    ];
    
    clients.forEach(client => {
      clientHours[client.id] = 0;
    });
    
    filteredEntries.forEach(entry => {
      if (entry.clientId && entry.hours) {
        clientHours[entry.clientId] = (clientHours[entry.clientId] || 0) + parseFloat(entry.hours);
      }
    });
    
    return {
      labels: clients.map(client => client.name),
      datasets: [
        {
          label: 'Hours by Client',
          data: clients.map(client => clientHours[client.id] || 0),
          backgroundColor: clientColors,
          borderColor: clientColors.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare data for employee distribution chart
  const prepareEmployeeData = () => {
    const employeeHours = {};
    const employeeColors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(153, 102, 255, 0.6)',
    ];
    
    employees.forEach(employee => {
      employeeHours[employee.id] = 0;
    });
    
    filteredEntries.forEach(entry => {
      if (entry.userId && entry.hours) {
        employeeHours[entry.userId] = (employeeHours[entry.userId] || 0) + parseFloat(entry.hours);
      }
    });
    
    return {
      labels: employees.map(employee => employee.name),
      datasets: [
        {
          label: 'Hours by Employee',
          data: employees.map(employee => employeeHours[employee.id] || 0),
          backgroundColor: employeeColors,
          borderColor: employeeColors.map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Generate detailed client summary
  const generateClientSummary = () => {
    const clientSummary = clients.map(client => {
      const clientEntries = filteredEntries.filter(entry => entry.clientId === client.id);
      const totalHours = clientEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
      
      // Calculate hours by employee for this client
      const employeeHours = {};
      clientEntries.forEach(entry => {
        if (entry.userId && entry.hours) {
          employeeHours[entry.userId] = (employeeHours[entry.userId] || 0) + parseFloat(entry.hours);
        }
      });
      
      return {
        ...client,
        totalHours,
        employeeHours,
      };
    }).filter(client => client.totalHours > 0);
    
    return clientSummary;
  };
  
  // Generate detailed employee summary
  const generateEmployeeSummary = () => {
    const employeeSummary = employees.map(employee => {
      const employeeEntries = filteredEntries.filter(entry => entry.userId === employee.id);
      const totalHours = employeeEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
      
      // Calculate hours by client for this employee
      const clientHours = {};
      employeeEntries.forEach(entry => {
        if (entry.clientId && entry.hours) {
          clientHours[entry.clientId] = (clientHours[entry.clientId] || 0) + parseFloat(entry.hours);
        }
      });
      
      return {
        ...employee,
        totalHours,
        clientHours,
      };
    }).filter(employee => employee.totalHours > 0);
    
    return employeeSummary;
  };
  
  // Export report to PDF
  const exportToPdf = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Time Tracking Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Period: ${format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}`, 14, 30);
    
    if (selectedClient) {
      const client = clients.find(c => c.id === selectedClient);
      doc.text(`Client: ${client ? client.name : 'Unknown'}`, 14, 38);
    }
    
    if (selectedEmployee) {
      const employee = employees.find(e => e.id === selectedEmployee);
      doc.text(`Employee: ${employee ? employee.name : 'Unknown'}`, 14, selectedClient ? 46 : 38);
    }
    
    // Create table for time entries
    const tableData = filteredEntries.map(entry => [
      entry.date,
      entry.userName || 'Unknown',
      entry.clientName || 'Unknown',
      parseFloat(entry.hours).toFixed(2),
      entry.notes || ''
    ]);
    
    if (tableData.length > 0) {
      doc.autoTable({
        startY: selectedClient || selectedEmployee ? 54 : 38,
        head: [['Date', 'Employee', 'Client', 'Hours', 'Notes']],
        body: tableData,
      });
    } else {
      doc.text('No time entries found for the selected filters.', 14, 54);
    }
    
    // Save the PDF
    doc.save(`time-report-${selectedMonth}.pdf`);
  };
  
  // Prepare data for client and employee charts
  const clientData = prepareClientData();
  const employeeData = prepareEmployeeData();
  
  // Summary totals
  const totalHours = filteredEntries.reduce((sum, entry) => sum + (parseFloat(entry.hours) || 0), 0);
  const totalEntries = filteredEntries.length;
  const uniqueClients = [...new Set(filteredEntries.map(entry => entry.clientId))].filter(Boolean).length;
  const uniqueEmployees = [...new Set(filteredEntries.map(entry => entry.userId))].filter(Boolean).length;
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Time Tracking Reports</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={exportToPdf}
            className="inline-flex items-center"
          >
            <FiDownload className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
              <FiCalendar className="inline mr-1" /> Month
            </label>
            <select
              id="month"
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
          
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
              <FiBriefcase className="inline mr-1" /> Client
            </label>
            <select
              id="client"
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
          
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-1">
              <FiUsers className="inline mr-1" /> Employee
            </label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="">All Employees</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Total Hours</h3>
            <p className="text-3xl font-bold text-primary-600">{totalHours.toFixed(2)}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Time Entries</h3>
            <p className="text-3xl font-bold text-primary-600">{totalEntries}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Active Clients</h3>
            <p className="text-3xl font-bold text-primary-600">{uniqueClients}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-1">Active Employees</h3>
            <p className="text-3xl font-bold text-primary-600">{uniqueEmployees}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiPieChart className="mr-2 text-primary-600" /> Hours by Client
            </h2>
            <div className="h-80">
              <Pie data={clientData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiPieChart className="mr-2 text-primary-600" /> Hours by Employee
            </h2>
            <div className="h-80">
              <Pie data={employeeData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiBriefcase className="mr-2 text-primary-600" /> Client Summary
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Breakdown
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generateClientSummary().map((client) => (
                    <tr key={client.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {client.totalHours.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {Object.entries(client.employeeHours).map(([empId, hours]) => {
                            const employee = employees.find(e => e.id === empId);
                            return (
                              <div key={empId} className="flex justify-between items-center py-1">
                                <span>{employee ? employee.name : 'Unknown'}</span>
                                <span>{parseFloat(hours).toFixed(2)} hrs</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiUsers className="mr-2 text-primary-600" /> Employee Summary
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client Breakdown
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generateEmployeeSummary().map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {employee.totalHours.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {Object.entries(employee.clientHours).map(([clientId, hours]) => {
                            const client = clients.find(c => c.id === clientId);
                            return (
                              <div key={clientId} className="flex justify-between items-center py-1">
                                <span>{client ? client.name : 'Unknown'}</span>
                                <span>{parseFloat(hours).toFixed(2)} hrs</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;