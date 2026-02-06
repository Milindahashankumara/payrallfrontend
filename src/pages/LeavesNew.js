import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaPlus, 
  FaHistory, 
  FaEye, 
  FaSearch, 
  FaSort, 
  FaSortUp, 
  FaSortDown,
  FaBan,
  FaSignOutAlt
} from 'react-icons/fa';
import { BsGraphUp } from "react-icons/bs";

// Helper hook for sorting tables
const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortDirection = (key) => {
      if (!sortConfig || sortConfig.key !== key) return null;
      return sortConfig.direction;
  }

  return { items: sortedItems, requestSort, getSortDirection };
};

export default function LeavesNew() {
  // Core Data States
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [leaveSummary, setLeaveSummary] = useState(null);

  // UI/Control States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewModalData, setViewModalData] = useState(null);
  
  // Form States
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showNoPayForm, setShowNoPayForm] = useState(false);
  
  const [leaveForm, setLeaveForm] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    isFirstHalfDay: null,
    leaveType: 'Casual',
    reason: ''
  });
  
  const [noPayForm, setNoPayForm] = useState({
    employeeId: '',
    noPayDate: '',
    reason: ''
  });

  // Table Filter States
  const [historySearch, setHistorySearch] = useState('');
  const [noPaySearch, setNoPaySearch] = useState('');

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/employees/employeeshaveleaves`);
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        setMessage('Error: Could not load employees.');
      }
    };
    fetchEmployees();
  }, []);

  // Fetch leave summary when employee or year changes
  useEffect(() => {
    if (selectedEmployee) {
      const fetchLeaveSummary = async () => {
        setLoading(true);
        setMessage('');
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/leaves2/employee/${selectedEmployee}/summary/${selectedYear}`);
          setLeaveSummary(response.data.data);
        } catch (error) {
          console.error('Error fetching leave summary:', error);
          setLeaveSummary(null);
          setMessage('Error: Could not load leave summary.');
        } finally {
          setLoading(false);
        }
      };
      fetchLeaveSummary();
    } else {
        setLeaveSummary(null);
    }
  }, [selectedEmployee, selectedYear]);

  // Auto-fill employee ID in forms when employee is selected
  useEffect(() => {
    if (selectedEmployee) {
      setLeaveForm(prev => ({ ...prev, employeeId: selectedEmployee }));
      setNoPayForm(prev => ({ ...prev, employeeId: selectedEmployee }));
    }
  }, [selectedEmployee]);

  // Handlers for form submissions
  const handleCreateLeave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    if (new Date(leaveForm.endDate) < new Date(leaveForm.startDate)) {
        setMessage("Error: End date cannot be before start date.");
        setLoading(false);
        return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/leaves2/create-leave`, {
        ...leaveForm,
        employeeId: parseInt(leaveForm.employeeId),
        isFirstHalfDay: leaveForm.isHalfDay ? JSON.parse(leaveForm.isFirstHalfDay) : null,
      });
      
      if (response.data.success) {
        setMessage('Leave created successfully!');
        setLeaveForm({
          employeeId: selectedEmployee,
          startDate: '',
          endDate: '',
          isHalfDay: false,
          isFirstHalfDay: null,
          leaveType: 'Casual',
          reason: ''
        });
        setShowLeaveForm(false);
        
        // Refresh summary
        if (selectedEmployee) {
          const summaryRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/leaves2/employee/${selectedEmployee}/summary/${selectedYear}`);
          setLeaveSummary(summaryRes.data.data);
        }
      } else {
        setMessage(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating leave:', error);
      setMessage(error.response?.data?.message || 'Error: Could not create leave.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNoPay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/leaves2/create-nopay`, {
        ...noPayForm,
        employeeId: parseInt(noPayForm.employeeId)
      });
      
      if (response.data.success) {
        setMessage('No-pay day created successfully!');
        setNoPayForm({ 
          employeeId: selectedEmployee,
          noPayDate: '', 
          reason: '' 
        });
        setShowNoPayForm(false);
        
        // Refresh summary
        if (selectedEmployee) {
          const summaryRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/leaves2/employee/${selectedEmployee}/summary/${selectedYear}`);
          setLeaveSummary(summaryRes.data.data);
        }
      } else {
        setMessage(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating no-pay day:', error);
      setMessage(error.response?.data?.message || 'Error: Could not create no-pay day.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handlers for form input changes
  const handleLeaveFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setLeaveForm(prev => {
        const newState = {...prev, [name]: val};
        if (name === 'isHalfDay' && val === true) {
            newState.endDate = newState.startDate;
        }
        if (name === 'startDate' && newState.isHalfDay) {
            newState.endDate = val;
        }
        return newState;
    });
  };

  const handleNoPayFormChange = (e) => {
    const { name, value } = e.target;
    setNoPayForm(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to calculate leave duration for display
  const calculateNumberOfDays = () => {
    if (leaveForm.isHalfDay) return 0.5;
    if (!leaveForm.startDate || !leaveForm.endDate) return 0;
    
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    
    if (end < start) return 0;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };
  
  // Memoized filtered data for tables
  const filteredLeaveHistory = useMemo(() => {
    if (!leaveSummary?.leaves) return [];
    return leaveSummary.leaves.filter(leave => 
        leave.leaveType.toLowerCase().includes(historySearch.toLowerCase()) ||
        leave.status.toLowerCase().includes(historySearch.toLowerCase()) ||
        (leave.reason && leave.reason.toLowerCase().includes(historySearch.toLowerCase()))
    );
  }, [leaveSummary?.leaves, historySearch]);

  const filteredNoPayDays = useMemo(() => {
    if (!leaveSummary?.noPayDays) return [];
    return leaveSummary.noPayDays.filter(day =>
        (day.reason && day.reason.toLowerCase().includes(noPaySearch.toLowerCase()))
    );
  }, [leaveSummary?.noPayDays, noPaySearch]);
  
  // Use the sorting hook
  const { items: sortedLeaveHistory, requestSort: requestLeaveSort, getSortDirection: getLeaveSortDirection } = useSortableData(filteredLeaveHistory);
  const { items: sortedNoPayDays, requestSort: requestNoPaySort, getSortDirection: getNoPaySortDirection } = useSortableData(filteredNoPayDays);

  const SortableTableHeader = ({ name, label, requestSort, getSortDirection }) => {
    const direction = getSortDirection(name);
    return (
        <th 
            onClick={() => requestSort(name)}
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
        >
            <div className="flex items-center">
                {label}
                {direction === 'ascending' ? <FaSortUp className="ml-1" /> : direction === 'descending' ? <FaSortDown className="ml-1" /> : <FaSort className="ml-1 text-gray-300" />}
            </div>
        </th>
    );
  };
  
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-CA');

  const getStatusBadge = (status) => {
    switch (status) {
        case 'Approved': return 'bg-green-100 text-green-800';
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedEmployeeDetails = useMemo(() => {
      return employees.find(emp => emp.id === parseInt(selectedEmployee));
  }, [selectedEmployee, employees]);

  const resetForms = () => {
    setLeaveForm({
      employeeId: selectedEmployee,
      startDate: '',
      endDate: '',
      isHalfDay: false,
      isFirstHalfDay: null,
      leaveType: 'Casual',
      reason: ''
    });
    setNoPayForm({
      employeeId: selectedEmployee,
      noPayDate: '',
      reason: ''
    });
    setShowLeaveForm(false);
    setShowNoPayForm(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-600 mt-2">Manage employee leaves, balances, and no-pay days.</p>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${message.toLowerCase().includes('error') 
              ? 'bg-red-50 border border-red-200 text-red-700' 
              : 'bg-green-50 border border-green-200 text-green-700'}`}
          >
            {message}
          </div>
        )}

        {/* Employee & Year Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <select 
                value={selectedEmployee} 
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  resetForms();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Select an Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeNumber} - {emp.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          {selectedEmployeeDetails && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                      Viewing data for <strong>{selectedEmployeeDetails.fullName}</strong> ({selectedEmployeeDetails.employeeNumber}) for the year <strong>{selectedYear}</strong>.
                  </p>
              </div>
          )}
        </div>

        {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex space-x-1">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BsGraphUp /> Overview
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'history' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaHistory /> Leave History
                </button>
                <button 
                  onClick={() => setActiveTab('nopay')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'nopay' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaBan /> No-Pay Days
                </button>
              </div>
            </div>

        {/* Main Content Area */}
        {selectedEmployee ? (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && leaveSummary && (
              
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Leave Balance Overview</h3>
                  {/* <div className="flex gap-3">
                    <button 
                      onClick={() => setShowLeaveForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus /> Create Leave
                    </button>
                    <button 
                      onClick={() => setShowNoPayForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaBan /> Add No-Pay Day
                    </button>
                  </div> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {leaveSummary.leaveBalances.map(balance => (
                    <div key={balance.leaveType} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{balance.leaveType} Leaves</h4>
                          <p className="text-sm text-gray-600">Entitled: {balance.entitledDays} days</p>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{balance.balanceDays}</div>
                      </div>
                      <div className="mt-4">
                         <div className="flex justify-between text-sm text-gray-600 mb-1">
                           <span>Used: {balance.usedDays} days</span>
                           <span>{Math.round((balance.usedDays / balance.entitledDays) * 100) || 0}%</span>
                         </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(balance.usedDays / balance.entitledDays) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats for {selectedYear}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{leaveSummary.leaves.length}</div>
                    <div className="text-sm text-gray-600">Total Leaves</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{leaveSummary.leaves.filter(l => l.status === 'Approved').length}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{leaveSummary.totalHalfDays}</div>
                    <div className="text-sm text-gray-600">Half Days Taken</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{leaveSummary.noPayDays.length}</div>
                    <div className="text-sm text-gray-600">No-Pay Days</div>
                  </div>
                </div> */}
              </div>
            )}

            {/* Leave History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Leave History for {selectedYear}</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowLeaveForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaPlus /> Create Leave
                    </button>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={historySearch} 
                        onChange={(e) => setHistorySearch(e.target.value)} 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <SortableTableHeader name="startDate" label="Start Date" requestSort={requestLeaveSort} getSortDirection={getLeaveSortDirection} />
                        <SortableTableHeader name="endDate" label="End Date" requestSort={requestLeaveSort} getSortDirection={getLeaveSortDirection} />
                        <SortableTableHeader name="leaveType" label="Type" requestSort={requestLeaveSort} getSortDirection={getLeaveSortDirection} />
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Half Day</th>
                        <SortableTableHeader name="status" label="Status" requestSort={requestLeaveSort} getSortDirection={getLeaveSortDirection} />
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedLeaveHistory.length > 0 ? sortedLeaveHistory.map(leave => (
                      <tr key={leave.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(leave.startDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(leave.endDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.leaveType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{leave.numberOfDays}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{leave.isHalfDay ? (leave.isFirstHalfDay ? 'First Half' : 'Second Half') : 'No'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(leave.status)}`}>
                            {leave.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => setViewModalData({ type: 'Leave', data: leave })} 
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="text-center py-6 text-gray-500">
                            No leaves found for this period.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No-Pay Days Tab */}
            {activeTab === 'nopay' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">No-Pay Days for {selectedYear}</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowNoPayForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <FaPlus /> Add No-Pay Day
                    </button>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={noPaySearch} 
                        onChange={(e) => setNoPaySearch(e.target.value)} 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <SortableTableHeader name="noPayDate" label="Date" requestSort={requestNoPaySort} getSortDirection={getNoPaySortDirection} />
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedNoPayDays.length > 0 ? sortedNoPayDays.map(day => (
                        <tr key={day.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(day.noPayDate)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-sm">{day.reason || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button 
                              onClick={() => setViewModalData({ type: 'No-Pay', data: day })} 
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="text-center py-6 text-gray-500">
                            No no-pay days found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex space-x-1">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BsGraphUp /> Overview
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'history' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaHistory /> Leave History
                </button>
                <button 
                  onClick={() => setActiveTab('nopay')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'nopay' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaBan /> No-Pay Days
                </button>
              </div>
            </div> */}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Please select an employee to begin.</h3>
          </div>
        )}

        {/* Create Leave Form Modal */}
        {showLeaveForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Create New Leave</h3>
                <button 
                  onClick={() => setShowLeaveForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaSignOutAlt />
                </button>
              </div>

              <form onSubmit={handleCreateLeave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                    <select 
                      name="leaveType" 
                      value={leaveForm.leaveType} 
                      onChange={handleLeaveFormChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Annual">Annual Leave</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="isHalfDay" 
                      name="isHalfDay" 
                      checked={leaveForm.isHalfDay} 
                      onChange={handleLeaveFormChange} 
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isHalfDay" className="ml-2 text-sm text-gray-700">This is a Half-Day Leave</label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={leaveForm.startDate} 
                      onChange={handleLeaveFormChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={leaveForm.endDate} 
                      onChange={handleLeaveFormChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required 
                      disabled={leaveForm.isHalfDay}
                    />
                  </div>
                </div>

                {leaveForm.isHalfDay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Half Day Type</label>
                    <select 
                      name="isFirstHalfDay" 
                      value={leaveForm.isFirstHalfDay || ''} 
                      onChange={handleLeaveFormChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select half</option>
                      <option value="true">First Half</option>
                      <option value="false">Second Half</option>
                    </select>
                  </div>
                )}

                {(leaveForm.startDate && leaveForm.endDate && !leaveForm.isHalfDay) || (leaveForm.startDate && leaveForm.isHalfDay) ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-sm font-medium text-blue-800">Total Duration: {calculateNumberOfDays()} Day(s)</span>
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea 
                    name="reason" 
                    value={leaveForm.reason} 
                    onChange={handleLeaveFormChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3" 
                    placeholder="Enter reason for leave (optional)"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Leave'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowLeaveForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create No-Pay Form Modal */}
        {showNoPayForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Add No-Pay Day</h3>
                <button 
                  onClick={() => setShowNoPayForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaSignOutAlt />
                </button>
              </div>

              <form onSubmit={handleCreateNoPay} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    name="noPayDate" 
                    value={noPayForm.noPayDate} 
                    onChange={handleNoPayFormChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <textarea 
                    name="reason" 
                    value={noPayForm.reason} 
                    onChange={handleNoPayFormChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3" 
                    placeholder="Enter reason (optional)"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? 'Adding...' : 'Add No-Pay Day'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowNoPayForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {viewModalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">{viewModalData.type} Details</h3>
              <div className="space-y-3 text-sm">
                {viewModalData.type === 'Leave' && (
                  <>
                    <p><strong>Status:</strong> <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(viewModalData.data.status)}`}>{viewModalData.data.status}</span></p>
                    <p><strong>Type:</strong> {viewModalData.data.leaveType}</p>
                    <p><strong>Period:</strong> {formatDate(viewModalData.data.startDate)} to {formatDate(viewModalData.data.endDate)}</p>
                    <p><strong>Duration:</strong> {viewModalData.data.numberOfDays} days</p>
                    <p><strong>Half Day:</strong> {viewModalData.data.isHalfDay ? (viewModalData.data.isFirstHalfDay ? 'First Half' : 'Second Half') : 'N/A'}</p>
                    <p><strong>Reason:</strong> {viewModalData.data.reason || 'No reason provided.'}</p>
                  </>
                )}
                {viewModalData.type === 'No-Pay' && (
                  <>
                    <p><strong>Date:</strong> {formatDate(viewModalData.data.noPayDate)}</p>
                    <p><strong>Reason:</strong> {viewModalData.data.reason || 'No reason provided.'}</p>
                  </>
                )}
              </div>
              <button 
                onClick={() => setViewModalData(null)} 
                className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}