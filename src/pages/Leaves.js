import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendar, FaUser, FaPlus, FaHistory, FaInfoCircle, FaSync, FaEye } from 'react-icons/fa';

export default function Leaves() {
  const [activeTab, setActiveTab] = useState('balance');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [newLeave, setNewLeave] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isHalfDay: false,
    reason: '',
    leaveType: 'Casual'
  });

  useEffect(() => {
    fetchEmployeesWithLeaves();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      if (activeTab === 'balance') {
        fetchLeaveBalance();
      } else if (activeTab === 'history') {
        fetchLeaveHistory();
      }
    }
  }, [selectedEmployee, activeTab, year]);

  const fetchEmployeesWithLeaves = async () => {
    try {
      setEmployeeLoading(true);
      // Use the specific endpoint for employees who can have leaves
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/employees/employeeshaveleaves`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees with leaves:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/leaves/balance/${selectedEmployee.id}/${year}`
      );
      setLeaveBalance(response.data);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveHistory = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/leaves/history/${selectedEmployee.id}`
      );
      setLeaveHistory(response.data);
    } catch (error) {
      console.error('Error fetching leave history:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyForLeave = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const leaveRequest = {
        ...newLeave,
        employeID: selectedEmployee.id
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/leaves/apply`,
        leaveRequest
      );

      alert('Leave applied successfully!');
      setNewLeave({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        isHalfDay: false,
        reason: '',
        leaveType: 'Casual'
      });
      
      // Refresh data
      fetchLeaveBalance();
      fetchLeaveHistory();
    } catch (error) {
      alert(`Error applying for leave: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkLeaveAvailability = async () => {
    if (!selectedEmployee) return;

    try {
      const leaveRequest = {
        ...newLeave,
        employeID: selectedEmployee.id
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/leaves/check`,
        leaveRequest
      );

      if (response.data) {
        alert('✓ Leave can be approved. Sufficient balance available.');
      } else {
        alert('✗ Insufficient leave balance for this request.');
      }
    } catch (error) {
      alert(`Error checking leave availability: ${error.response?.data || error.message}`);
    }
  };

  const calculateLeaveDays = () => {
    if (!newLeave.startDate || !newLeave.endDate) return 0;

    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    let days = 0;
    let current = new Date(start);

    while (current <= end) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        days += newLeave.isHalfDay ? 0.5 : 1;
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getEmployeeName = (employee) => {
    return employee.fullName || `Employee ${employee.id}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getYearsSinceJoin = () => {
    if (!selectedEmployee?.joinedDate) return 0;
    const joinDate = new Date(selectedEmployee.joinedDate);
    const currentYear = new Date().getFullYear();
    return currentYear - joinDate.getFullYear();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-600 mt-2">Manage employee leaves and balances</p>
        </div>

        {/* Employee Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Employee</h2>
          {employeeLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading employees...</span>
            </div>
          ) : (
            <>
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const selected = employees.find(emp => emp.id === parseInt(e.target.value));
                  setSelectedEmployee(selected);
                }}
                className="w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {getEmployeeName(employee)} {employee.employeeNumber && `(${employee.employeeNumber})`}
                  </option>
                ))}
              </select>
              
              {selectedEmployee && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-blue-800">Employee Details</h3>
                  <p className="text-sm text-blue-600">
                    Name: {getEmployeeName(selectedEmployee)} | 
                    Joined: {selectedEmployee.joinedDate ? formatDate(selectedEmployee.joinedDate) : 'N/A'} | 
                    Years of Service: {getYearsSinceJoin()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {selectedEmployee && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-3 px-6 font-medium ${activeTab === 'balance' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('balance')}
              >
                <FaInfoCircle className="inline mr-2" /> Leave Balance
              </button>
              <button
                className={`py-3 px-6 font-medium ${activeTab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('history')}
              >
                <FaHistory className="inline mr-2" /> Leave History
              </button>
              <button
                className={`py-3 px-6 font-medium ${activeTab === 'apply' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('apply')}
              >
                <FaPlus className="inline mr-2" /> Apply for Leave
              </button>
            </div>

            {/* Year Selection */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                onClick={activeTab === 'balance' ? fetchLeaveBalance : fetchLeaveHistory}
                className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <FaSync /> Refresh
              </button>
            </div>

            {/* Leave Balance Tab */}
            {activeTab === 'balance' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Leave Balance for {getEmployeeName(selectedEmployee)} - {year}</h2>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : leaveBalance ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800">Annual Leaves Allocated</h3>
                      <p className="text-2xl font-bold text-blue-600">{leaveBalance.annualLeavesAllocated}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800">Annual Leaves Used</h3>
                      <p className="text-2xl font-bold text-blue-600">{leaveBalance.annualLeavesUsed}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800">Casual Leaves Allocated</h3>
                      <p className="text-2xl font-bold text-blue-600">{leaveBalance.casualLeavesAllocated}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800">Casual Leaves Used</h3>
                      <p className="text-2xl font-bold text-blue-600">{leaveBalance.casualLeavesUsed}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg col-span-2">
                      <h3 className="text-sm font-medium text-blue-800">Annual Leaves Remaining</h3>
                      <p className="text-2xl font-bold text-blue-600">{leaveBalance.annualLeavesRemaining}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg col-span-2">
                      <h3 className="text-sm font-medium text-blue-800">Casual Leaves Remaining</h3>
                      <p className="text-2xl font-bold text-blue-600">{leaveBalance.casualLeavesRemaining}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg col-span-4">
                      <h3 className="text-sm font-medium text-blue-800">Total Leaves Remaining</h3>
                      <p className="text-2xl font-bold text-blue-700">{leaveBalance.totalLeavesRemaining}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No leave balance data found.</p>
                )}
              </div>
            )}

            {/* Leave History Tab */}
            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Leave History for {getEmployeeName(selectedEmployee)}</h2>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : leaveHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Allocated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annual Used</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Casual Allocated</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Casual Used</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Remaining</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leaveHistory.map(record => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.year}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{record.annualLeavesAllocated}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{record.annualLeavesUsed}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{record.casualLeavesAllocated}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{record.casualLeavesUsed}</td>
                            <td className="px-6 py-4 text-sm font-medium text-green-600">{record.totalLeavesRemaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No leave history found.</p>
                )}
              </div>
            )}

            {/* Apply for Leave Tab */}
            {activeTab === 'apply' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Apply for Leave - {getEmployeeName(selectedEmployee)}</h2>
                <form onSubmit={applyForLeave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={newLeave.startDate}
                        onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={newLeave.endDate}
                        onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                      <select
                        value={newLeave.leaveType}
                        onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Casual">Casual Leave</option>
                        <option value="Annual">Annual Leave</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={!newLeave.isHalfDay}
                            onChange={() => setNewLeave({...newLeave, isHalfDay: false})}
                            className="mr-2"
                          />
                          Full Day
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={newLeave.isHalfDay}
                            onChange={() => setNewLeave({...newLeave, isHalfDay: true})}
                            className="mr-2"
                          />
                          Half Day
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={newLeave.reason}
                      onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                      placeholder="Enter reason for leave"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm font-medium">
                      Leave Days Required: <span className="font-bold">{calculateLeaveDays()} days</span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Weekends (Saturday/Sunday) are automatically excluded from calculations.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={checkLeaveAvailability}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Check Availability
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Applying...' : 'Apply for Leave'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewLeave({
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0],
                        isHalfDay: false,
                        reason: '',
                        leaveType: 'Casual'
                      })}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {!selectedEmployee && !employeeLoading && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Please select an employee to view leave information</h3>
            <p className="text-sm text-gray-500 mt-2">
              Only employees who are not day-salary based are eligible for leaves
            </p>
          </div>
        )}
      </div>
    </div>
  );
}