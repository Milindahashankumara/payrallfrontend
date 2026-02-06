import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBill, FaCalendar, FaList, FaPlus, FaEdit, FaTrash, FaEye, FaSync, FaDollarSign, FaUser, FaCreditCard } from 'react-icons/fa';

export default function Loan() {
  const [activeTab, setActiveTab] = useState('loans');
  const [loans, setLoans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showRepaymentForm, setShowRepaymentForm] = useState(false);
  const [newLoan, setNewLoan] = useState({
    employeID: '',
    principalAmount: '',
    termMonths: '',
    startDate: new Date().toISOString().split('T')[0]
  });
  const [newRepayment, setNewRepayment] = useState({
    installmentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    if (activeTab === 'loans') {
      fetchLoans();
      fetchEmployees();
    } else if (activeTab === 'repayments' && selectedLoan) {
      fetchRepayments(selectedLoan.id);
    }
  }, [activeTab, selectedLoan]);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loan`);
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setEmployeeLoading(true);
      // Try different API endpoints that might return employees
      const endpoints = [
        `${process.env.REACT_APP_API_BASE_URL}/api/employees`
      ];
      
      let employeesData = [];
      let errorCount = 0;
      
      // Try each endpoint until we get a successful response
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint);
          if (response.data && Array.isArray(response.data)) {
            employeesData = response.data;
            break;
          }
        } catch (err) {
          errorCount++;
          console.log(`Tried endpoint ${endpoint}, failed`);
        }
      }
      
      // If all endpoints failed, try a different approach
      if (errorCount === endpoints.length) {
        console.log("All employee endpoints failed, trying a different approach");
        // You might need to adjust this based on your actual API
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/user`);
          if (response.data && Array.isArray(response.data)) {
            employeesData = response.data;
          }
        } catch (finalErr) {
          console.error('All attempts to fetch employees failed:', finalErr);
        }
      }
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const fetchRepayments = async (loanId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loanrepayment/${loanId}/repayments`);
      setRepayments(response.data);
    } catch (error) {
      console.error('Error fetching repayments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLoan = async (e) => {
    e.preventDefault();
    try {
      const loanData = {
        ...newLoan,
        principalAmount: parseFloat(newLoan.principalAmount),
        termMonths: parseInt(newLoan.termMonths),
        monthlyInstallment: parseFloat(newLoan.principalAmount) / parseInt(newLoan.termMonths),
        remainingBalance: parseFloat(newLoan.principalAmount)
      };

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/loan`, loanData);
      setLoans([...loans, response.data]);
      setShowLoanForm(false);
      setNewLoan({
        employeID: '',
        principalAmount: '',
        termMonths: '',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  const addRepayment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/loanrepayment/${selectedLoan.id}/repayments`,
        {
          ...newRepayment,
          installmentAmount: parseFloat(newRepayment.installmentAmount)
        }
      );

      setRepayments([...repayments, response.data]);

      const updatedRemaining = selectedLoan.remainingBalance - parseFloat(newRepayment.installmentAmount);
        setSelectedLoan({
        ...selectedLoan,
        remainingBalance: updatedRemaining
    });

      setShowRepaymentForm(false);
      setNewRepayment({
        installmentAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        description: ''
      });

      // Refresh the loan to update remaining balance
      fetchLoans();
    } catch (error) {
      console.error('Error adding repayment:', error);
    }
  };

  const deleteLoan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/loan/${id}`);
      setLoans(loans.filter(loan => loan.id !== id));
    } catch (error) {
      console.error('Error deleting loan:', error);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      // Try different property names that might contain the employee name
      return employee.fullName || 
             `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 
             employee.name || 
             employee.username || 
             'Unknown Employee';
    }
    return 'Unknown Employee';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Loan Management</h1>
          <p className="text-gray-600 mt-2">Manage employee loans and repayments</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-3 px-6 font-medium ${activeTab === 'loans' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('loans')}
          >
            <FaMoneyBill className="inline mr-2" /> Loans
          </button>
          <button
            className={`py-3 px-6 font-medium ${activeTab === 'repayments' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('repayments')}
            disabled={!selectedLoan}
          >
            <FaList className="inline mr-2" /> Repayments
          </button>
        </div>

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">All Loans</h2>
              <div className="flex gap-3">
                {/* <button
                  onClick={fetchLoans}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <FaSync /> Refresh
                </button> */}
                <button
                  onClick={() => setShowLoanForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <FaPlus /> New Loan
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term (Months)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Installment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loans.length > 0 ? (
                        loans.map(loan => (
                          <tr key={loan.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getEmployeeName(loan.employeID)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(loan.principalAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {loan.termMonths}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(loan.monthlyInstallment)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(loan.remainingBalance)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(loan.startDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.remainingBalance > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {loan.remainingBalance > 0 ? 'Active' : 'Settled'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedLoan(loan);
                                    setActiveTab('repayments');
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <FaCreditCard />
                                </button>
                                <button
                                  onClick={() => deleteLoan(loan.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                            No loans found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Repayments Tab */}
        {activeTab === 'repayments' && selectedLoan && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Repayments for {getEmployeeName(selectedLoan.employeID)}</h2>
                <p className="text-gray-600">
                  Principal : {formatCurrency(selectedLoan.principalAmount)} | 
                  Remaining : {formatCurrency(selectedLoan.remainingBalance)} |
                  Installment : {formatCurrency(selectedLoan.monthlyInstallment)}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('loans')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Back to Loans
                </button>
                <button
                  onClick={() => setShowRepaymentForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <FaPlus /> Add Repayment
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month No</th> */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {repayments.length > 0 ? (
                        repayments.map(repayment => (
                          <tr key={repayment.id} className="hover:bg-gray-50">
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {repayment.monthNo}
                            </td> */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(repayment.paymentDate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(repayment.installmentAmount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(repayment.remainingBalance)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {repayment.description}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                            No repayments found for this loan
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Loan Modal */}
        {showLoanForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Loan</h2>
              <form onSubmit={createLoan}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  {employeeLoading ? (
                    <div className="flex items-center justify-center h-10 border border-gray-300 rounded-md">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-500">Loading employees...</span>
                    </div>
                  ) : employees.length > 0 ? (
                    <select
                      required
                      value={newLoan.employeID}
                      onChange={(e) => setNewLoan({...newLoan, employeID: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {getEmployeeName(employee.id)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-red-500 text-sm">
                      Could not load employees. Please check your API endpoint.
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={newLoan.principalAmount}
                    onChange={(e) => setNewLoan({...newLoan, principalAmount: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term (Months)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newLoan.termMonths}
                    onChange={(e) => setNewLoan({...newLoan, termMonths: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLoan.startDate}
                    onChange={(e) => setNewLoan({...newLoan, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLoanForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={employees.length === 0}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Create Loan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Repayment Modal */}
        {showRepaymentForm && selectedLoan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Repayment</h2>
              <p className="text-gray-600 mb-4">Loan for {getEmployeeName(selectedLoan.employeID)} - Remaining: {formatCurrency(selectedLoan.remainingBalance)}</p>
              <form onSubmit={addRepayment}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    max={selectedLoan.remainingBalance}
                    value={newRepayment.installmentAmount}
                    onChange={(e) => setNewRepayment({...newRepayment, installmentAmount: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={newRepayment.paymentDate}
                    onChange={(e) => setNewRepayment({...newRepayment, paymentDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newRepayment.description}
                    onChange={(e) => setNewRepayment({...newRepayment, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRepaymentForm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Add Repayment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}