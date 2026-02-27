import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaEye, FaSync } from 'react-icons/fa';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDept, setEditDept] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDept, setNewDept] = useState({
    departmentName: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/departments`
      );
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments', err);
    } finally {
      setLoading(false);
    }
  };



  const fetchDepartmentById = async (id) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/departments/${id}`
      );
      setSelectedDept(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching department details', err);
    }
  };

  const openEditModal = (dept) => {
    setEditDept({ ...dept });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDept((prev) => ({ ...prev, [name]: value }));
  };

  const updateDepartment = async () => {
    try {
      const payload = {
        ...editDept
      };
      
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/departments/${editDept.id}`,
        payload
      );
      
      // Update the local state with the new data
      setDepartments((prev) =>
        prev.map((d) => d.id === editDept.id ? editDept : d)
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating department', err);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?'))
      return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/departments/${id}`
      );
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Error deleting department', err);
    }
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewDept((prev) => ({ ...prev, [name]: value }));
  };

  const createDepartment = async () => {
    try {
      const payload = {
        ...newDept
      };
      
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/departments`,
        payload
      );
      
      // Add the new department to the state
      setDepartments((prev) => [...prev, res.data]);
      
      setIsCreateModalOpen(false);
      setNewDept({ departmentName: '', description: '', isActive: true });
    } catch (err) {
      console.error('Error creating department', err);
    }
  };



  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your company's departments — view, edit, or remove them.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button
              type="button"
              onClick={fetchDepartments}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm transition"
            >
              <FaSync /> Refresh
            </button> */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              <FaPlus /> Create New
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading departments...</span>
            </div>
          </div>
        )}

        {/* Table for medium+ screens */}
        {!loading && (
          <>
            <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {departments.length > 0 ? (
                      departments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800">{dept.departmentName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{dept.description}</td>
                          <td className="px-6 py-4 text-center text-sm">
                            <div className="inline-flex items-center gap-2">
                              <button
                                aria-label={`view-${dept.id}`}
                                onClick={() => fetchDepartmentById(dept.id)}
                                className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                              >
                                <FaEye />
                              </button>
                              <button
                                aria-label={`edit-${dept.id}`}
                                onClick={() => openEditModal(dept)}
                                className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                              >
                                <FaEdit />
                              </button>
                              <button
                                aria-label={`delete-${dept.id}`}
                                onClick={() => deleteDepartment(dept.id)}
                                className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">
                          No departments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card list for small screens */}
            <div className="sm:hidden space-y-4">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <div key={dept.id} className="bg-white shadow-sm rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{dept.departmentName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{dept.description}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        aria-label={`view-${dept.id}`}
                        onClick={() => fetchDepartmentById(dept.id)}
                        className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                      >
                        <FaEye />
                      </button>
                      <button
                        aria-label={`edit-${dept.id}`}
                        onClick={() => openEditModal(dept)}
                        className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        aria-label={`delete-${dept.id}`}
                        onClick={() => deleteDepartment(dept.id)}
                        className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">No departments found</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Department</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  name="departmentName"
                  value={editDept.departmentName || ''}
                  onChange={handleEditChange}
                  placeholder="Department Name"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editDept.description || ''}
                  onChange={handleEditChange}
                  placeholder="Description"
                  rows="3"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={updateDepartment}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Create Department</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  name="departmentName"
                  value={newDept.departmentName}
                  onChange={handleNewChange}
                  placeholder="Department Name"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newDept.description}
                  onChange={handleNewChange}
                  placeholder="Description"
                  rows="3"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={createDepartment}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition"
                >
                  Create Department
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Department Details */}
      {isModalOpen && selectedDept && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Department Details</h2>
            <div className="space-y-3">
              <p><strong>Name:</strong> {selectedDept.departmentName}</p>
              <p><strong>Description:</strong> {selectedDept.description}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}