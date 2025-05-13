import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { FiDownload, FiPrinter, FiFilter, FiCalendar } from 'react-icons/fi';
import Button from '../components/ui/Button';

const Payroll = () => {
  const { userRole } = useContext(AuthContext);
  
  // Only administrators should access this page
  if (userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Access Denied</h1>
        <p className="mb-4">
          You don't have permission to access the payroll page.
        </p>
      </div>
    );
  }
  
  // Mock payroll data for demo
  const [payrollData, setPayrollData] = useState([
    {
      id: '1',
      employeeName: 'John Smith',
      employeeId: 'EMP001',
      payPeriod: 'Jan 1 - Jan 15, 2025',
      regularHours: 80,
      overtimeHours: 5,
      grossPay: 3250.00,
      taxes: 812.50,
      netPay: 2437.50,
      status: 'Paid',
      paymentDate: '2025-01-15',
    },
    {
      id: '2',
      employeeName: 'Lisa Johnson',
      employeeId: 'EMP002',
      payPeriod: 'Jan 1 - Jan 15, 2025',
      regularHours: 80,
      overtimeHours: 0,
      grossPay: 2800.00,
      taxes: 700.00,
      netPay: 2100.00,
      status: 'Paid',
      paymentDate: '2025-01-15',
    },
    {
      id: '3',
      employeeName: 'Michael Brown',
      employeeId: 'EMP003',
      payPeriod: 'Jan 1 - Jan 15, 2025',
      regularHours: 76,
      overtimeHours: 0,
      grossPay: 2660.00,
      taxes: 665.00,
      netPay: 1995.00,
      status: 'Paid',
      paymentDate: '2025-01-15',
    },
    {
      id: '4',
      employeeName: 'Sarah Wilson',
      employeeId: 'EMP004',
      payPeriod: 'Jan 1 - Jan 15, 2025',
      regularHours: 80,
      overtimeHours: 8,
      grossPay: 3080.00,
      taxes: 770.00,
      netPay: 2310.00,
      status: 'Paid',
      paymentDate: '2025-01-15',
    },
    {
      id: '5',
      employeeName: 'John Smith',
      employeeId: 'EMP001',
      payPeriod: 'Jan 16 - Jan 31, 2025',
      regularHours: 80,
      overtimeHours: 0,
      grossPay: 3000.00,
      taxes: 750.00,
      netPay: 2250.00,
      status: 'Pending',
      paymentDate: '2025-01-31',
    },
    {
      id: '6',
      employeeName: 'Lisa Johnson',
      employeeId: 'EMP002',
      payPeriod: 'Jan 16 - Jan 31, 2025',
      regularHours: 80,
      overtimeHours: 4,
      grossPay: 2940.00,
      taxes: 735.00,
      netPay: 2205.00,
      status: 'Pending',
      paymentDate: '2025-01-31',
    },
  ]);

  const [filter, setFilter] = useState('all');
  const [payPeriod, setPayPeriod] = useState('Jan 16 - Jan 31, 2025');
  
  // Filter payroll data
  const filteredPayroll = filter === 'all' 
    ? payrollData 
    : payrollData.filter(item => item.status.toLowerCase() === filter);
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Payroll Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            className="inline-flex items-center"
          >
            <FiPrinter className="mr-2" /> Print
          </Button>
          <Button 
            variant="primary"
            className="inline-flex items-center"
          >
            <FiDownload className="mr-2" /> Export
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <FiFilter className="mr-2 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="all">All Payrolls</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <FiCalendar className="mr-2 text-gray-500" />
          <select
            value={payPeriod}
            onChange={(e) => setPayPeriod(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="Jan 16 - Jan 31, 2025">Jan 16 - Jan 31, 2025</option>
            <option value="Jan 1 - Jan 15, 2025">Jan 1 - Jan 15, 2025</option>
            <option value="Dec 16 - Dec 31, 2024">Dec 16 - Dec 31, 2024</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pay Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Pay
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxes
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Pay
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayroll.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.employeeName}</div>
                    <div className="text-sm text-gray-500">{item.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.payPeriod}</div>
                    <div className="text-sm text-gray-500">Payment: {new Date(item.paymentDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Regular: {item.regularHours}h</div>
                    {item.overtimeHours > 0 && (
                      <div className="text-sm text-gray-500">Overtime: {item.overtimeHours}h</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${item.grossPay.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${item.taxes.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    ${item.netPay.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'Paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payroll Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(filteredPayroll.map(item => item.employeeId)).size}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Hours</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredPayroll.reduce((acc, item) => acc + item.regularHours + item.overtimeHours, 0)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Gross Pay</p>
            <p className="text-2xl font-bold text-gray-900">
              ${filteredPayroll.reduce((acc, item) => acc + item.grossPay, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Net Pay</p>
            <p className="text-2xl font-bold text-gray-900">
              ${filteredPayroll.reduce((acc, item) => acc + item.netPay, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payroll;