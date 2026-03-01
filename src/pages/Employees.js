import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaEye, FaFilter, FaSearch, FaUndo } from "react-icons/fa";

export default function Employees() {
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [employeeToTerminate, setEmployeeToTerminate] = useState(null);
  const [terminationDate, setTerminationDate] = useState('');
  const [terminationReason, setTerminationReason] = useState('');

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewDeleted, setIsViewDeleted] = useState(false);
  const [editEmployee, setEditEmployee] = useState({});
  const [departments, setDepartments] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [filteredJobRoles, setFilteredJobRoles] = useState([]);
  const [employeeCategories, setEmployeeCategories] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    employeeNumber: "",
    email: "",
    address: "",
    fullName: "",
    nic: "",
    joinedDate: "",
    terminationDate: "",
    phoneNumber: "",
    departmentID: "",
    jobRoleId: "",
    employeeCategoriesID: "",
    basicSalary: "",
    daySalary: "",
    bra1: "",
    totalCompensation: "",
    bra2: "",
    isActive: true,
    bankAccountNumber: "",
    bankName: "",
    bankBranch: "",
    taxIdentificationNumber: "",
    hasTaxExemption: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchEmployeeCategories();
  }, [isViewDeleted]);

const fetchDepartments = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/departments`);
    setDepartments(res.data);
  } catch (err) {
    console.error("Error fetching departments", err);
  }
};

const fetchEmployeeCategories = async () => {
  try {
    const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/empcategories`);
    setEmployeeCategories(res.data);
  } catch (err) {
    console.error("Error fetching employee categories", err);
  }
};

const fetchJobRolesByDepartment = async (departmentId) => {
  if (!departmentId) {
    setFilteredJobRoles([]);
    return;
  }
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/jobroles/department/${departmentId}`
    );
    setFilteredJobRoles(res.data);
  } catch (err) {
    console.error("Error fetching job roles", err);
    setFilteredJobRoles([]);
  }
};

  useEffect(() => {
    fetchEmployees();
  }, [isViewDeleted]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const endpoint = isViewDeleted 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/employees/getAllDeletedEmployees?pageSize=1000`
        : `${process.env.REACT_APP_API_BASE_URL}/api/employees?pageSize=1000`;
      
      const res = await axios.get(endpoint);
      setEmployees(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employees", err);
      showMessage("Failed to load employees", "error");
      setLoading(false);
    }
  };

  const fetchEmployeeById = async (id) => {
    try {
      const endpoint = isViewDeleted 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/employees/getDeletedEmployeeById/${id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/employees/${id}`;
      const res = await axios.get(endpoint);
      
      // Fetch all job roles to display the employee's job role name
      if (res.data.jobRoleId) {
        try {
          const jobRoleRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/jobroles/${res.data.jobRoleId}`);
          res.data.jobRoleName = jobRoleRes.data.roleName;
        } catch (err) {
          console.error("Error fetching job role", err);
          res.data.jobRoleName = 'N/A';
        }
      } else {
        res.data.jobRoleName = 'N/A';
      }
      
      setSelectedEmployee(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching employee details", err);
      showMessage("Failed to load employee details", "error");
    }
  };

  const filterEmployees = () => {
    if (!searchTerm) {
      setFilteredEmployees(employees);
      return;
    }

    const result = employees.filter(employee => 
      employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.nic?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredEmployees(result);
  };

  const openEditModal = (employee) => {
    // Convert number fields from backend to strings for input compatibility
    const employeeForEdit = {
      ...employee,
      departmentID: employee.departmentID ? employee.departmentID.toString() : "",
      jobRoleId: employee.jobRoleId ? employee.jobRoleId.toString() : "",
      employeeCategoriesID: employee.employeeCategoriesID ? employee.employeeCategoriesID.toString() : ""
    };
    setEditEmployee(employeeForEdit);
    // Fetch job roles for the selected department
    if (employee.departmentID) {
      fetchJobRolesByDepartment(employee.departmentID);
    }
    setIsEditModalOpen(true);
  };

  const handleEditChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle department change - fetch job roles
    if (name === 'departmentID') {
      setEditEmployee(prev => ({
        ...prev,
        departmentID: value,
        jobRoleId: '' // Clear job role when department changes
      }));
      fetchJobRolesByDepartment(value);
      return;
    }
    
    setEditEmployee(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  const handleNewEmployeeChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle department change - fetch job roles
    if (name === 'departmentID') {
      setNewEmployee(prev => ({
        ...prev,
        departmentID: value,
        jobRoleId: '' // Clear job role when department changes
      }));
      fetchJobRolesByDepartment(value);
      return;
    }
    
    // Handle employee category change - clear salary fields
    if (name === 'employeeCategoriesID') {
      const selectedCategory = employeeCategories.find(cat => cat.id === parseInt(value));
      const categoryName = selectedCategory?.categoryName?.toLowerCase() || '';
      
      setNewEmployee(prev => ({
        ...prev,
        employeeCategoriesID: value,
        // Clear staff salary fields if switching to Casual
        ...(categoryName === 'casual' && {
          basicSalary: '',
          bra1: '',
          bra2: ''
        }),
        // Clear casual salary field if switching to Staff
        ...(categoryName === 'staff' && {
          daySalary: ''
        })
      }));
      return;
    }
    
    if (type === 'number') {
    setNewEmployee(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
    return;
  }
  if (type === 'checkbox') {
    setNewEmployee(prev => ({
      ...prev,
      [name]: checked
    }));
    return;
  }
  
  // Handle all other inputs
  setNewEmployee(prev => ({
    ...prev,
    [name]: value
  }));
  }, [employeeCategories]);

  // Determine the selected employee category type (Staff or Casual)
  const selectedCategoryType = useMemo(() => {
    if (!newEmployee.employeeCategoriesID) return null;
    const selectedCategory = employeeCategories.find(
      cat => cat.id === parseInt(newEmployee.employeeCategoriesID)
    );
    return selectedCategory?.categoryName?.toLowerCase() || null;
  }, [newEmployee.employeeCategoriesID, employeeCategories]);

  // Determine the edit employee category type (Staff or Casual)
  const editCategoryType = useMemo(() => {
    if (!editEmployee.employeeCategoriesID) return null;
    const selectedCategory = employeeCategories.find(
      cat => cat.id === parseInt(editEmployee.employeeCategoriesID)
    );
    return selectedCategory?.categoryName?.toLowerCase() || null;
  }, [editEmployee.employeeCategoriesID, employeeCategories]);

  const updateEmployee = async () => {
    try {
      // Convert string IDs back to numbers for the API
      const employeeToUpdate = {
        ...editEmployee,
        departmentID: editEmployee.departmentID ? parseInt(editEmployee.departmentID) : null,
        jobRoleId: editEmployee.jobRoleId ? parseInt(editEmployee.jobRoleId) : null,
        employeeCategoriesID: editEmployee.employeeCategoriesID ? parseInt(editEmployee.employeeCategoriesID) : null
      };
      
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/employees/${editEmployee.id}`,
        employeeToUpdate
      );
      setEmployees(prev => prev.map(emp => emp.id === editEmployee.id ? employeeToUpdate : emp));
      setIsEditModalOpen(false);
      showMessage("Employee updated successfully!", "success");
    } catch (err) {
      console.error("Error updating employee", err);
      if (err.response && err.response.data) {
        // Check if server returned a message property
        if (err.response.data.message) {
          showMessage(err.response.data.message, "error");
        }
        // Check for validation errors
        else if (err.response.data.errors) {
          const validationErrors = err.response.data.errors;
          let errorMessage = "Validation errors: ";
          
          Object.keys(validationErrors).forEach(field => {
            errorMessage += `${field}: ${validationErrors[field].join(', ')}. `;
          });
          
          showMessage(errorMessage, "error");
        }
        // Fallback for other error formats
        else {
          showMessage("Failed to update employee. Please check your input.", "error");
        }
      } else if (err.message) {
        showMessage(err.message, "error");
      } else {
        showMessage("Failed to update employee", "error");
      }
    }
  };

  const createEmployee = async (e) => {
  e.preventDefault();
  try {
    // Determine category type for conditional salary fields
    const categoryType = selectedCategoryType;
    
    const employeeToCreate = {
      employeeNumber: newEmployee.employeeNumber || null,
      email: newEmployee.email || null,
      address: newEmployee.address || null,
      fullName: newEmployee.fullName || null,
      nic: newEmployee.nic || null,
      joinedDate: newEmployee.joinedDate || null,
      terminationDate: newEmployee.terminationDate || null,
      phoneNumber: newEmployee.phoneNumber || null,
      departmentID: newEmployee.departmentID ? parseInt(newEmployee.departmentID) : null,
      jobRoleId: newEmployee.jobRoleId ? parseInt(newEmployee.jobRoleId) : null,
      employeeCategoriesID: newEmployee.employeeCategoriesID ? parseInt(newEmployee.employeeCategoriesID) : null,
      // Only include staff salary fields if category is Staff
      basicSalary: categoryType === 'staff' ? (newEmployee.basicSalary ? parseInt(newEmployee.basicSalary) : null) : null,
      bra1: categoryType === 'staff' ? (newEmployee.bra1 ? parseInt(newEmployee.bra1) : null) : null,
      bra2: categoryType === 'staff' ? (newEmployee.bra2 ? parseInt(newEmployee.bra2) : null) : null,
      // Only include casual salary field if category is Casual
      daySalary: categoryType === 'casual' ? (newEmployee.daySalary ? parseInt(newEmployee.daySalary) : null) : null,
      totalCompensation: newEmployee.totalCompensation ? parseInt(newEmployee.totalCompensation) : null,
      isActive: true,
      bankAccountNumber: newEmployee.bankAccountNumber || null,
      bankName: newEmployee.bankName || null,
      bankBranch: newEmployee.bankBranch || null,
      taxIdentificationNumber: newEmployee.taxIdentificationNumber || null,
      hasTaxExemption: newEmployee.hasTaxExemption || false
    };
    
    console.log("Creating employee with data:", employeeToCreate);
    
    const res = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/api/employees`,
      employeeToCreate
    );
    
    console.log("Employee created successfully:", res.data);
    console.log("Employee IsActive:", res.data.isActive);
    
    // Close modal first
    setIsCreateModalOpen(false);
    
    // Reset form
    setNewEmployee({
      employeeNumber: "",
      email: "",
      address: "",
      fullName: "",
      nic: "",
      joinedDate: "",
      terminationDate: "",
      phoneNumber: "",
      departmentID: "",
      jobRoleId: "",
      employeeCategoriesID: "",
      basicSalary: "",
      daySalary: "",
      totalCompensation: "",
      bra1: "",
      bra2: "",
      isActive: true,
      bankAccountNumber: "",
      bankName: "",
      bankBranch: "",
      taxIdentificationNumber: "",
      hasTaxExemption: false
    });
    setFilteredJobRoles([]);
    
    showMessage("Employee created successfully!", "success");
    
    // Refresh the employee list after a short delay
    setTimeout(async () => {
      console.log("Refreshing employee list...");
      await fetchEmployees();
      console.log("Employee list refreshed. Total employees:", employees.length);
    }, 500);
    
  } catch (err) {
    console.error("Error creating employee:", err);
    console.error("Error response:", err.response);
    
    if (err.response && err.response.data) {
      // Check if server returned a message property
      if (err.response.data.message) {
        showMessage(err.response.data.message, "error");
      }
      // Check for validation errors
      else if (err.response.data.errors) {
        const validationErrors = err.response.data.errors;
        let errorMessage = "Validation errors: ";
        
        Object.keys(validationErrors).forEach(field => {
          errorMessage += `${field}: ${validationErrors[field].join(', ')}. `;
        });
        
        showMessage(errorMessage, "error");
      }
      // Fallback for other error formats
      else {
        showMessage("Failed to create employee. Please check your input.", "error");
      }
    } else if (err.message) {
      showMessage(err.message, "error");
    } else {
      showMessage("Failed to create employee", "error");
    }
  }
};

  // const deleteEmployee = async (id) => {
  //   if (!window.confirm("Are you sure you want to delete this employee?")) return;
  //   try {
  //     await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/employe/${id}`);
  //     setEmployees(prev => prev.filter(emp => emp.id !== id));
  //     showMessage("Employee deleted successfully!", "success");
  //   } catch (err) {
  //     console.error("Error deleting employee", err);
  //     showMessage("Failed to delete employee", "error");
  //   }
  // };
  const openTerminateModal = (employee) => {
  setEmployeeToTerminate(employee);
  setTerminationDate(new Date().toISOString().split('T')[0]); // Set today as default
  setTerminationReason('');
  setIsTerminateModalOpen(true);
};

const terminateEmployee = async () => {
  if (!employeeToTerminate || !terminationDate) return;
  
  try {
    const response = await axios.delete(
      `${process.env.REACT_APP_API_BASE_URL}/api/employees/${employeeToTerminate.id}`,
      {
        data: {
          terminationDate: new Date(terminationDate).toISOString(),
          reason: terminationReason
        }
      }
    );
    
    if (response.status === 200) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeToTerminate.id));
      showMessage("Employee terminated successfully!", "success");
      setIsTerminateModalOpen(false);
      setEmployeeToTerminate(null);
    }
  } catch (err) {
    console.error("Error terminating employee", err);
    if (err.response) {
      showMessage(`Termination failed: ${JSON.stringify(err.response.data)}`, "error");
    } else {
      showMessage("Failed to terminate employee", "error");
    }
  }
};
const deleteEmployee = async (id) => {
  if (!window.confirm("Are you sure you want to permanently delete this employee?")) return;
  try {
    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/employees/${id}`);
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    showMessage("Employee permanently deleted!", "success");
  } catch (err) {
    console.error("Error deleting employee", err);
    showMessage("Failed to delete employee", "error");
  }
};

  const recoverEmployee = async (id) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/employees/recoverDeletedEmployee/${id}`);
      setEmployees(prev => prev.filter(emp => emp.id !== id));
      showMessage("Employee recovered successfully!", "success");
    } catch (err) {
      console.error("Error recovering employee", err);
      showMessage("Failed to recover employee", "error");
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Memoized Edit Modal to prevent re-rendering issues
  const EditEmployeeModal = useMemo(() => {
    if (!isEditModalOpen) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
          <form className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                 Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={editEmployee.fullName || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number *</label>
                  <input
                    type="text"
                    name="employeeNumber"
                    value={editEmployee.employeeNumber || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC *</label>
                  <input
                    type="text"
                    name="nic"
                    value={editEmployee.nic || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={editEmployee.email || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editEmployee.phoneNumber || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editEmployee.address || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Compensation</label>
                  <input
                    type="text"
                    name="totalCompensation"
                    value={editEmployee.totalCompensation || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
            </div>

            {/* Employment Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                 Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="departmentID"
                    value={editEmployee.departmentID || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.departmentName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                  <select
                    name="jobRoleId"
                    value={editEmployee.jobRoleId || ""}
                    onChange={handleEditChange}
                    disabled={!editEmployee.departmentID}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      !editEmployee.departmentID ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="">
                      {editEmployee.departmentID ? 'Select Job Role' : 'Select Department First'}
                    </option>
                    {filteredJobRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department ID</label>
                  <input
                    type="text"
                    name="departmentID"
                    value={editEmployee.departmentID || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Category ID</label>
                  <input
                    type="text"
                    name="employeeCategoriesID"
                    value={editEmployee.employeeCategoriesID || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                  <input
                    type="date"
                    name="joinedDate"
                    value={editEmployee.joinedDate ? new Date(editEmployee.joinedDate).toISOString().split('T')[0] : ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Termination Date</label>
                  <input
                    type="date"
                    name="terminationDate"
                    value={editEmployee.terminationDate ? new Date(editEmployee.terminationDate).toISOString().split('T')[0] : ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}
              </div>
            </div>

            {/* Salary Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                 Salary Information
              </h3>
              
              {/* Employee Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Category *</label>
                <select
                  name="employeeCategoriesID"
                  value={editEmployee.employeeCategoriesID || ""}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {employeeCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Salary Fields */}
              {editCategoryType === 'staff' && (
                <div className="animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Basic Salary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="basicSalary"
                        value={editEmployee.basicSalary || ""}
                        onChange={handleEditChange}
                        autoComplete="off"
                        placeholder="Enter basic salary"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">BRA 1</label>
                      <input
                        type="number"
                        name="bra1"
                        value={editEmployee.bra1 || ""}
                        onChange={handleEditChange}
                        autoComplete="off"
                        placeholder="Enter BRA 1"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">BRA 2</label>
                      <input
                        type="number"
                        name="bra2"
                        value={editEmployee.bra2 || ""}
                        onChange={handleEditChange}
                        autoComplete="off"
                        placeholder="Enter BRA 2"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Casual Salary Fields */}
              {editCategoryType === 'casual' && (
                <div className="animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day Salary <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="daySalary"
                        value={editEmployee.daySalary || ""}
                        onChange={handleEditChange}
                        autoComplete="off"
                        placeholder="Enter day salary"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Info message when no category selected */}
              {!editCategoryType && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <p className="text-gray-500 text-sm">
                    ℹ️ Please select an <strong>Employee Category</strong> to view salary fields
                  </p>
                </div>
              )}
            </div>

            {/* Bank & Tax Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                 Bank & Tax Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={editEmployee.bankAccountNumber || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={editEmployee.bankName || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Branch</label>
                  <input
                    type="text"
                    name="bankBranch"
                    value={editEmployee.bankBranch || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Identification Number</label>
                  <input
                    type="text"
                    name="taxIdentificationNumber"
                    value={editEmployee.taxIdentificationNumber || ""}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}
                {/* <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    name="hasTaxExemption"
                    checked={editEmployee.hasTaxExemption || false}
                    onChange={handleEditChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Has Tax Exemption</label>
                </div> */}
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={editEmployee.isActive || false}
                    onChange={handleEditChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Employee</label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={updateEmployee}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [isEditModalOpen, editEmployee, handleEditChange, updateEmployee]);

  // Memoized Create Modal to prevent re-rendering issues
  const CreateEmployeeModal = useMemo(() => {
    if (!isCreateModalOpen) return null;
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
          <form onSubmit={createEmployee} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                 Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={newEmployee.fullName}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number *</label>
                  <input
                    type="text"
                    name="employeeNumber"
                    value={newEmployee.employeeNumber}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC *</label>
                  <input
                    type="text"
                    name="nic"
                    value={newEmployee.nic}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={newEmployee.phoneNumber}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={newEmployee.address}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Compensation</label>
                  <input
                    type="text"
                    name="totalCompensation"
                    value={newEmployee.totalCompensation}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    
                  />
                </div>
              </div>
            </div>

            {/* Employment Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                 Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department ID</label>
                  <input
                    type="text"
                    name="departmentID"
                    value={newEmployee.departmentID || ""}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}

                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      name="departmentID"
                      value={editEmployee.departmentID || ""}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Category</label>
                    <select
                      name="employeeCategoriesID"
                      value={editEmployee.employeeCategoriesID || ""}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Category</option>
                      {employeeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                    <select
                      name="departmentID"
                      value={newEmployee.departmentID || ""}
                      onChange={handleNewEmployeeChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Role *</label>
                    <select
                      name="jobRoleId"
                      value={newEmployee.jobRoleId || ""}
                      onChange={handleNewEmployeeChange}
                      disabled={!newEmployee.departmentID}
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        !newEmployee.departmentID ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                    >
                      <option value="">
                        {newEmployee.departmentID ? 'Select Job Role' : 'Select Department First'}
                      </option>
                      {filteredJobRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Category</label>
                    <select
                      name="employeeCategoriesID"
                      value={newEmployee.employeeCategoriesID || ""}
                      onChange={handleNewEmployeeChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Category</option>
                      {employeeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Category ID</label>
                  <input
                    type="text"
                    name="employeeCategoriesID"
                    value={newEmployee.employeeCategoriesID || ""}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                  <input
                    type="date"
                    name="joinedDate"
                    value={newEmployee.joinedDate}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Termination Date</label>
                  <input
                    type="date"
                    name="terminationDate"
                    value={newEmployee.terminationDate}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}
              </div>
            </div>

            {/* Salary Information Section - Conditional rendering based on Employee Category */}
            {selectedCategoryType === 'staff' && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                  Staff Salary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basic Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={newEmployee.basicSalary}
                      onChange={handleNewEmployeeChange}
                      autoComplete="off"
                      placeholder="Enter basic salary"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BRA 1</label>
                    <input
                      type="number"
                      name="bra1"
                      value={newEmployee.bra1}
                      onChange={handleNewEmployeeChange}
                      autoComplete="off"
                      placeholder="Enter BRA 1"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BRA 2</label>
                    <input
                      type="number"
                      name="bra2"
                      value={newEmployee.bra2}
                      onChange={handleNewEmployeeChange}
                      autoComplete="off"
                      placeholder="Enter BRA 2"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {selectedCategoryType === 'casual' && (
              <div className="animate-fadeIn">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                  Casual Salary Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Day Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="daySalary"
                      value={newEmployee.daySalary}
                      onChange={handleNewEmployeeChange}
                      autoComplete="off"
                      placeholder="Enter day salary"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {!selectedCategoryType && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                <p className="text-gray-500 text-sm">
                  ℹ️ Please select an <strong>Employee Category</strong> to view salary fields
                </p>
              </div>
            )}

            {/* Bank & Tax Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center gap-2">
                 Bank & Tax Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    value={newEmployee.bankAccountNumber}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={newEmployee.bankName}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Branch</label>
                  <input
                    type="text"
                    name="bankBranch"
                    value={newEmployee.bankBranch}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Identification Number</label>
                  <input
                    type="text"
                    name="taxIdentificationNumber"
                    value={newEmployee.taxIdentificationNumber}
                    onChange={handleNewEmployeeChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div> */}
                {/* <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    name="hasTaxExemption"
                    checked={newEmployee.hasTaxExemption}
                    onChange={handleNewEmployeeChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Has Tax Exemption</label>
                </div> */}
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={newEmployee.isActive}
                    onChange={handleNewEmployeeChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active Employee</label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                Create Employee
              </button>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }, [isCreateModalOpen, newEmployee, handleNewEmployeeChange, createEmployee]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isViewDeleted ? "Viewing deleted employees" : "Manage employee records"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsViewDeleted(!isViewDeleted)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              {isViewDeleted ? (
                <>
                  <FaEye /> View Active
                </>
              ) : (
                <>
                  <FaFilter /> View Deleted
                </>
              )}
            </button>
            {!isViewDeleted && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                <FaPlus /> Add New
              </button>
            )}
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search employees by name, ID, email, or NIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Employees Table */}
        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">Loading employees...</p>
          </div>
        ) : (
          <>
            {/* Table for medium+ screens */}
            <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th> */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">#{employee.id}</td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">{employee.fullName}</div>
                            <div className="text-xs text-gray-500">{employee.employeeNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-800">{employee.email}</div>
                            <div className="text-xs text-gray-500">{employee.phoneNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {departments.find(dept => dept.id === employee.departmentID)?.departmentName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(employee.joinedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                            <div className="inline-flex items-center gap-2">
                              <button
                                aria-label={`view-${employee.id}`}
                                onClick={() => fetchEmployeeById(employee.id)}
                                className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                              >
                                <FaEye />
                              </button>
                              {!isViewDeleted ? (
                                <>
                                  <button
                                    aria-label={`edit-${employee.id}`}
                                    onClick={() => openEditModal(employee)}
                                    className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    aria-label={`delete-${employee.id}`}
                                    // onClick={() => deleteEmployee(employee.id)}
                                    onClick={() => openTerminateModal(employee)}

                                    className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                                  >
                                    <FaTrash />
                                  </button>
                                </>
                              ) : (
                                <button
                                  aria-label={`recover-${employee.id}`}
                                  onClick={() => recoverEmployee(employee.id)}
                                  className="p-2 rounded-md text-green-600 hover:bg-green-50 transition"
                                >
                                  <FaUndo />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                          No employees found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card list for small screens */}
            <div className="sm:hidden space-y-4">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="bg-white shadow-sm rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{employee.fullName}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {employee.employeeNumber}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={`view-${employee.id}`}
                          onClick={() => fetchEmployeeById(employee.id)}
                          className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                        >
                          <FaEye />
                        </button>
                        {!isViewDeleted ? (
                          <>
                            <button
                              aria-label={`edit-${employee.id}`}
                              onClick={() => openEditModal(employee)}
                              className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                            >
                              <FaEdit />
                            </button>
                            <button
                              aria-label={`delete-${employee.id}`}
                              onClick={() => openTerminateModal(employee)}
                              className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : (
                          <button
                            aria-label={`recover-${employee.id}`}
                            onClick={() => recoverEmployee(employee.id)}
                            className="p-2 rounded-md text-green-600 hover:bg-green-50 transition"
                          >
                            <FaUndo />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Email:</span> {employee.email}
                      </div>
                      {/* <div>
                        <span className="font-medium">Phone:</span> {employee.phoneNumber}
                      </div> */}
                      <div>
                        <span className="font-medium">Department:</span> {departments.find(dept => dept.id === employee.departmentID)?.departmentName || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Joined:</span> {formatDate(employee.joinedDate)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">
                  No employees found
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Termination Modal */}
{isTerminateModalOpen && employeeToTerminate && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-4 text-red-600">Terminate Employee</h2>
      
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="font-medium text-red-800">You are about to terminate:</p>
        <p className="text-lg font-semibold">{employeeToTerminate.fullName}</p>
        <p className="text-sm text-gray-600">{employeeToTerminate.employeeNumber}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Termination Date *
          </label>
          <input
            type="date"
            value={terminationDate}
            onChange={(e) => setTerminationDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be recorded as the employee's last working day
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Termination (Optional)
          </label>
          <textarea
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            rows="3"
            placeholder="Enter reason for termination..."
          />
        </div>

        {employeeToTerminate.joinedDate && new Date(terminationDate) < new Date(employeeToTerminate.joinedDate) && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Warning: Termination date is before join date ({formatDate(employeeToTerminate.joinedDate)})
            </p>
          </div>
        )}

        {new Date(terminationDate) > new Date() && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Future termination date selected. Employee will remain active until {formatDate(terminationDate)}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={terminateEmployee}
          disabled={!terminationDate}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          Confirm Termination
        </button>
        <button
          onClick={() => {
            setIsTerminateModalOpen(false);
            setEmployeeToTerminate(null);
          }}
          className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* View Modal */}
      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Employee Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Personal Information</h3>
                <div className="space-y-2">
                  {/* <p><span className="font-medium">ID:</span> #{selectedEmployee.id}</p> */}
                  <p><span className="font-medium">Name:</span> {selectedEmployee.fullName}</p>
                  <p><span className="font-medium">Employee Number:</span> {selectedEmployee.employeeNumber}</p>
                  <p><span className="font-medium">NIC:</span> {selectedEmployee.nic}</p>
                  <p><span className="font-medium">Joined Date:</span> {formatDate(selectedEmployee.joinedDate)}</p>
                  {selectedEmployee && !selectedEmployee.isActive && (
                    <p>
                      <span className="font-medium">Termination Date:</span>{" "}
                      {formatDate(selectedEmployee.terminationDate)}
                    </p>
                  )}
                  <p><span className="font-medium">Employee Category:</span> {
                    employeeCategories.find(cat => cat.id === selectedEmployee.employeeCategoriesID)?.categoryName || 'N/A'
                  }</p>
                  <p><span className="font-medium">Department:</span> {
                    departments.find(dept => dept.id === selectedEmployee.departmentID)?.departmentName || 'N/A'
                  }</p>
                  <p><span className="font-medium">Job Role:</span> {selectedEmployee.jobRoleName || 'N/A'}</p>
                  <p><span className="font-medium">Total Compensation:</span> {
                    selectedEmployee.totalCompensation || 'N/A'
                  }</p>
                  {/* <p><span className="font-medium">Termination Date:</span> {formatDate(selectedEmployee.terminationDate)}</p> */}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Contact Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {selectedEmployee.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedEmployee.phoneNumber}</p>
                  <p><span className="font-medium">Address:</span> {selectedEmployee.address}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Salary Information</h3>
                <div className="space-y-2">
                  {selectedEmployee.employeeCategoriesID === 5 && (
                    <>
                      <p><span className="font-medium">Basic Salary:</span> {formatCurrency(selectedEmployee.basicSalary)}</p>
                      <p><span className="font-medium">KPI Allowance:</span> {formatCurrency(selectedEmployee.kpiAmount)}</p>
                      <p><span className="font-medium">BRA1:</span> {formatCurrency(selectedEmployee.bra1)}</p>
                      <p><span className="font-medium">BRA2:</span> {formatCurrency(selectedEmployee.bra2)}</p>
                    </>
                  )}
                  {selectedEmployee.employeeCategoriesID === 4 && (
                    <>
                      <p><span className="font-medium">Day Salary:</span> {formatCurrency(selectedEmployee.daySalary)}</p>
                  <p><span className="font-medium">KPI Rate:</span> {selectedEmployee.kpiRate}</p>
                    </>
                  )}
                  
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Bank & Tax Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Bank Account:</span> {selectedEmployee.bankAccountNumber}</p>
                  <p><span className="font-medium">Bank Name:</span> {selectedEmployee.bankName}</p>
                  <p><span className="font-medium">Bank Branch:</span> {selectedEmployee.bankBranch}</p>
                  {/* <p><span className="font-medium">Tax ID:</span> {selectedEmployee.taxIdentificationNumber}</p>
                  <p><span className="font-medium">Tax Exemption:</span> {selectedEmployee.hasTaxExemption ? "Yes" : "No"}</p> */}
                  <p><span className="font-medium">Status:</span> {selectedEmployee.isActive ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {EditEmployeeModal}

      {/* Create Modal */}
      {CreateEmployeeModal}
    </div>
  );
}












