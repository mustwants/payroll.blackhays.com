import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiDownload, FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import Button from '../components/ui/Button';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

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
  
  const [reportType, setReportType] = useState('payroll');
  
  // Department distribution chart data
  const departmentData = {
    labels: ['Engineering', 'Marketing', 'Sales', 'Design', 'Finance', 'HR'],
    datasets: [
      {
        label: 'Employees by Department',
        data: [12, 7, 9, 5, 4, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Payroll monthly chart data
  const payrollData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Payroll ($)',
        data: [142000, 135000, 138000, 150000, 148000, 152000, 155000, 158000, 162000, 160000, 165000, 170000],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Hours worked chart data
  const hoursData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
    datasets: [
      {
        label: 'Regular Hours',
        data: [1520, 1540, 1570, 1560, 1580, 1550, 1590, 1600],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
      {
        label: 'Overtime Hours',
        data: [120, 115, 145, 110, 135, 95, 125, 150],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        tension: 0.4,
      },
    ],
  };
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Reports & Analytics</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="payroll">Payroll Reports</option>
            <option value="departments">Department Reports</option>
            <option value="hours">Hours Reports</option>
          </select>
          
          <Button 
            variant="primary"
            className="inline-flex items-center"
          >
            <FiDownload className="mr-2" /> Export Report
          </Button>
        </div>
      </div>
      
      {reportType === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiPieChart className="mr-2 text-primary-600" /> Department Distribution
            </h2>
            <div className="h-80">
              <Pie data={departmentData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Department Statistics</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Salary</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Engineering</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">12</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$85,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$1,020,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Marketing</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">7</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$75,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$525,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sales</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">9</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$78,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$702,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Design</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$72,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$360,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Finance</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">4</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$80,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$320,000</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">HR</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">3</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$70,000</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">$210,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {reportType === 'payroll' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiBarChart2 className="mr-2 text-primary-600" /> Monthly Payroll Overview
            </h2>
            <div className="h-80">
              <Bar 
                data={payrollData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    }
                  },
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm font-medium text-gray-500 mb-1">Annual Payroll</p>
              <p className="text-3xl font-bold text-gray-900">$1,835,000</p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <FiTrendingUp className="mr-1" /> 7.2% increase from last year
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm font-medium text-gray-500 mb-1">Average Salary</p>
              <p className="text-3xl font-bold text-gray-900">$76,458</p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <FiTrendingUp className="mr-1" /> 5.1% increase from last year
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm font-medium text-gray-500 mb-1">Overtime Costs</p>
              <p className="text-3xl font-bold text-gray-900">$127,500</p>
              <p className="text-sm text-green-600 mt-2 flex items-center">
                <FiTrendingUp className="mr-1" /> 2.3% decrease from last year
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payroll Breakdown</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Payroll</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Taxes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Benefits</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Payroll</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollData.labels.slice(0, 6).map((month, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{month} 2025</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${payrollData.datasets[0].data[index].toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${Math.round(payrollData.datasets[0].data[index] * 0.25).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${Math.round(payrollData.datasets[0].data[index] * 0.15).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      ${Math.round(payrollData.datasets[0].data[index] * 0.6).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      
      {reportType === 'hours' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FiTrendingUp className="mr-2 text-primary-600" /> Hours Worked Trends
            </h2>
            <div className="h-80">
              <Line 
                data={hoursData} 
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  },
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Hours Summary</h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Regular Hours</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime Hours</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Engineering</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">3,840</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">245</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">4,085</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Marketing</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">2,240</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">120</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">2,360</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sales</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">2,880</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">210</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">3,090</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Design</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">1,600</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">95</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">1,695</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Finance</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">1,280</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">30</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">1,310</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">HR</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">960</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">970</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Overtime Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Overtime Hours</p>
                  <p className="text-3xl font-bold text-gray-900">710</p>
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <FiTrendingUp className="mr-1" /> 12% increase from last month
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Overtime Cost</p>
                  <p className="text-3xl font-bold text-gray-900">$25,324</p>
                  <p className="text-sm text-red-600 mt-2 flex items-center">
                    <FiTrendingUp className="mr-1" /> 14.5% increase from last month
                  </p>
                </div>
              </div>
              
              <h3 className="text-md font-medium text-gray-800 mb-2">Top Overtime Employees</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">OT Hours</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">John Smith</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">24</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Sarah Wilson</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Sales</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">18</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Michael Brown</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">16</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Lisa Johnson</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Marketing</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">12</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;