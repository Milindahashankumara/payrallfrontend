import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUser, 
  FaPlus, 
  FaHistory, 
  FaInfoCircle, 
  FaSync, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaClock,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSearch
} from 'react-icons/fa';

export default function OTusage() {
  const [activeTab, setActiveTab] = useState('records');
  const [employees, setEmployees] = useState([]);
  const [otTypes, setOtTypes] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [otRecords, setOtRecords] = useState([]);
  const [otSummary, setOtSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'dateWorked',
    sortOrder: 'desc'
  });
  const [newOtRecord, setNewOtRecord] = useState({
    otId: '',
    dateWorked: new Date().toISOString().split('T')[0],
    hoursWorked: 1,
    remarks: ''
  });
  const [viewRecord, setViewRecord] = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchOtTypes();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      if (activeTab === 'records') {
        fetchOtRecords();
      } else if (activeTab === 'summary') {
        fetchOtSummary();
      }
    }
  }, [selectedEmployee, activeTab, year, month]);

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/employees/employeeshaveleaves`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchOtTypes = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/OT`);
      setOtTypes(response.data);
    } catch (error) {
      console.error('Error fetching OT types:', error);
    }
  };

  const fetchOtRecords = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime/employee/${selectedEmployee.id}`,
        {
          params: {
            year,
            month,
            ...filters
          }
        }
      );
      setOtRecords(response.data);
    } catch (error) {
      console.error('Error fetching OT records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtSummary = async () => {
    if (!selectedEmployee) return;
    
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime/summary/${selectedEmployee.id}/${year}/${month}`
      );
      setOtSummary(response.data);
    } catch (error) {
      console.error('Error fetching OT summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOtRecord = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      setLoading(true);
      const otRequest = {
        ...newOtRecord,
        employeId: selectedEmployee.id,
        hoursWorked: parseInt(newOtRecord.hoursWorked)
      };

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime`,
        otRequest
      );

      alert('OT record created successfully!');
      setNewOtRecord({
        otId: '',
        dateWorked: new Date().toISOString().split('T')[0],
        hoursWorked: 1,
        remarks: ''
      });
      
      // Refresh data
      fetchOtRecords();
      fetchOtSummary();
    } catch (error) {
      alert(`Error creating OT record: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateOtRecord = async (e) => {
    e.preventDefault();
    if (!editRecord) return;

    try {
      setLoading(true);
      const otRequest = {
        ...editRecord,
        hoursWorked: parseInt(editRecord.hoursWorked)
      };

      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime/${editRecord.id}`,
        otRequest
      );

      alert('OT record updated successfully!');
      setEditRecord(null);
      
      // Refresh data
      fetchOtRecords();
      fetchOtSummary();
    } catch (error) {
      alert(`Error updating OT record: ${error.response?.data || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteOtRecord = async (id) => {
    if (window.confirm('Are you sure you want to delete this OT record?')) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_BASE_URL}/api/EmpOvertime/${id}`
        );

        alert('OT record deleted successfully!');
        
        // Refresh data
        fetchOtRecords();
        fetchOtSummary();
      } catch (error) {
        alert(`Error deleting OT record: ${error.response?.data || error.message}`);
      }
    }
  };

  const calculateOtAmount = (record) => {
    if (!record.otType || !record.rate || !record.hoursWorked) return 0;
    return record.hoursWorked * record.rate;
  };

  const getEmployeeName = (employee) => {
    return employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || `Employee ${employee.id}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const getFilteredRecords = () => {
    return otRecords.filter(record =>
      record.otType?.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.remarks?.toLowerCase().includes(filters.search.toLowerCase()) ||
      record.dateWorked?.includes(filters.search)
    ).sort((a, b) => {
      const modifier = filters.sortOrder === 'desc' ? -1 : 1;
      
      switch (filters.sortBy) {
        case 'dateWorked':
          return modifier * (new Date(a.dateWorked) - new Date(b.dateWorked));
        case 'hoursWorked':
          return modifier * (a.hoursWorked - b.hoursWorked);
        case 'amount':
          return modifier * (calculateOtAmount(a) - calculateOtAmount(b));
        case 'otType':
          return modifier * (a.otType?.localeCompare(b.otType));
        default:
          return 0;
      }
    });
  };

  const getOtTypeName = (otId) => {
    const otType = otTypes.find(ot => ot.id === otId);
    return otType ? otType.otType : 'Unknown';
  };

  const getOtTypeRate = (otId) => {
    const otType = otTypes.find(ot => ot.id === otId);
    return otType ? otType.rate : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Overtime Management</h1>
          <p className="text-gray-600 mt-2">Manage employee overtime records and calculations</p>
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
                  <h3 className="font-medium text-800">Employee Details</h3>
                  <p className="text-sm text-blue-600">
                    Name: {getEmployeeName(selectedEmployee)} | 
                    Employee ID: {selectedEmployee.employeeNumber || 'N/A'}
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
                className={`py-3 px-6 font-medium ${activeTab === 'records' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('records')}
              >
                <FaHistory className="inline mr-2" /> OT Records
              </button>
              {/* <button
                className={`py-3 px-6 font-medium ${activeTab === 'summary' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('summary')}
              >
                <FaInfoCircle className="inline mr-2" /> OT Summary
              </button> */}
              <button
                className={`py-3 px-6 font-medium ${activeTab === 'create' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('create')}
              >
                <FaPlus className="inline mr-2" /> Add OT Record
              </button>
            </div>

            {/* Date Selection */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
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
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[
                    { value: 1, label: 'January' },
                    { value: 2, label: 'February' },
                    { value: 3, label: 'March' },
                    { value: 4, label: 'April' },
                    { value: 5, label: 'May' },
                    { value: 6, label: 'June' },
                    { value: 7, label: 'July' },
                    { value: 8, label: 'August' },
                    { value: 9, label: 'September' },
                    { value: 10, label: 'October' },
                    { value: 11, label: 'November' },
                    { value: 12, label: 'December' }
                  ].map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={activeTab === 'records' ? fetchOtRecords : fetchOtSummary}
                className="flex items-center gap-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <FaSync /> Refresh
              </button>
            </div>

            {/* OT Records Tab */}
            {activeTab === 'records' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    OT Records for {getEmployeeName(selectedEmployee)} - {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h2>
                  
                  {/* Search and Sort */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="pl-10 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="dateWorked">Date</option>
                      <option value="hoursWorked">Hours</option>
                      <option value="amount">Amount</option>
                      <option value="otType">OT Type</option>
                    </select>
                    <button
                      onClick={() => setFilters({...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'})}
                      className="px-2 py-1 bg-gray-200 rounded-md"
                    >
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : getFilteredRecords().length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OT Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredRecords().map(record => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatDate(record.dateWorked)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {record.otType || getOtTypeName(record.otId)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {record.hoursWorked}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {getOtTypeRate(record.otId)}
                            </td>
                            
                            <td className="px-6 py-4 text-sm">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setViewRecord(record)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEye />
                                </button>
                                <button
                                  onClick={() => setEditRecord(record)}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => deleteOtRecord(record.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No OT records found for this period.</p>
                )}
              </div>
            )}

            {/* OT Summary Tab */}
            {activeTab === 'summary' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  OT Summary for {getEmployeeName(selectedEmployee)} - {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : otSummary ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800">Total Hours</h3>
                      <p className="text-2xl font-bold text-blue-600">{otSummary.totalHours || 0}</p>
                    </div>
                    
                    
                    
                    {/* OT Type Breakdown */}
                    {otSummary.breakdown && Object.keys(otSummary.breakdown).length > 0 && (
                      <div className="col-span-4 mt-4">
                        <h4 className="text-lg font-semibold mb-3">Breakdown by OT Type</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(otSummary.breakdown).map(([otType, data]) => (
                            <div key={otType} className="bg-gray-50 p-3 rounded-lg">
                              <h5 className="font-medium text-gray-800">{otType}</h5>
                              <p className="text-sm text-gray-600">
                                Hours: {data.hours} | Amount: {formatCurrency(data.amount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                Records: {data.count}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No OT summary data found.</p>
                )}
              </div>
            )}

            {/* Create OT Record Tab */}
            {activeTab === 'create' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Add OT Record - {getEmployeeName(selectedEmployee)}</h2>
                <form onSubmit={createOtRecord} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OT Type</label>
                      <select
                        required
                        value={newOtRecord.otId}
                        onChange={(e) => setNewOtRecord({...newOtRecord, otId: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select OT Type</option>
                        {otTypes.map(ot => (
                          <option key={ot.id} value={ot.id}>
                            {ot.otType} {(ot.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Worked</label>
                      <input
                        type="date"
                        required
                        value={newOtRecord.dateWorked}
                        onChange={(e) => setNewOtRecord({...newOtRecord, dateWorked: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                      <input
                        type="number"
                        required
                        min="0.5"
                        max="24"
                        step="0.5"
                        value={newOtRecord.hoursWorked}
                        onChange={(e) => setNewOtRecord({...newOtRecord, hoursWorked: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                    <textarea
                      value={newOtRecord.remarks}
                      onChange={(e) => setNewOtRecord({...newOtRecord, remarks: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                      placeholder="Enter remarks (optional)"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Creating...' : 'Create OT Record'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewOtRecord({
                        otId: '',
                        dateWorked: new Date().toISOString().split('T')[0],
                        hoursWorked: 1,
                        remarks: ''
                      })}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* View Record Modal */}
            {viewRecord && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">OT Record Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(viewRecord.dateWorked)}
                    </div>
                    <div>
                      <span className="font-medium">OT Type:</span> {viewRecord.otType || getOtTypeName(viewRecord.otId)}
                    </div>
                    <div>
                      <span className="font-medium">Hours:</span> {viewRecord.hoursWorked}
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span> {(getOtTypeRate(viewRecord.otId))}
                    </div>
                    <div>
                      <span className="font-medium">Remarks:</span> {viewRecord.remarks || '-'}
                    </div>
                  </div>
                  <button
                    onClick={() => setViewRecord(null)}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Edit Record Modal */}
            {editRecord && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Edit OT Record</h3>
                  <form onSubmit={updateOtRecord} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">OT Type</label>
                      <select
                        required
                        value={editRecord.otId}
                        onChange={(e) => setEditRecord({...editRecord, otId: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {otTypes.map(ot => (
                          <option key={ot.id} value={ot.id}>
                            {ot.otType} {(ot.name)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Worked</label>
                      <input
                        type="date"
                        required
                        value={editRecord.dateWorked ? editRecord.dateWorked.split('T')[0] : ''}
                        onChange={(e) => setEditRecord({...editRecord, dateWorked: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                      <input
                        type="number"
                        required
                        min="0.5"
                        max="24"
                        step="0.5"
                        value={editRecord.hoursWorked}
                        onChange={(e) => setEditRecord({...editRecord, hoursWorked: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <textarea
                        value={editRecord.remarks || ''}
                        onChange={(e) => setEditRecord({...editRecord, remarks: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditRecord(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}

        {!selectedEmployee && !employeeLoading && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">Please select an employee to view OT records</h3>
          </div>
        )}
      </div>
    </div>
  );
}