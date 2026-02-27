import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

export default function JobRoles() {
  const [jobRoles, setJobRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedJobRole, setSelectedJobRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editJobRole, setEditJobRole] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newJobRole, setNewJobRole] = useState({
    roleName: '',
    departmentId: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobRoles();
    fetchDepartments();
  }, []);

  const fetchJobRoles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/jobroles?pageSize=1000`
      );
      console.log('Fetched job roles:', res.data);
      setJobRoles(res.data);
    } catch (err) {
      console.error('Error fetching job roles', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/departments`
      );
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments', err);
    }
  };



  const fetchJobRoleById = async (id) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/jobroles/${id}`
      );
      setSelectedJobRole(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching job role details', err);
    }
  };

  const openEditModal = (jobRole) => {
    setEditJobRole({ ...jobRole });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditJobRole((prev) => ({ ...prev, [name]: value }));
  };

  const updateJobRole = async () => {
    try {
      const payload = {
        roleName: editJobRole.roleName,
        departmentId: parseInt(editJobRole.departmentId),
        isActive: editJobRole.isActive ?? true
      };
      
      console.log('Updating job role:', payload);
      
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/jobroles/${editJobRole.id}`,
        payload
      );
      
      // Refresh the list
      await fetchJobRoles();
      
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating job role', err);
      console.error('Error response:', err.response?.data);
    }
  };

  const deleteJobRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job role?'))
      return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/jobroles/${id}`
      );
      setJobRoles((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      console.error('Error deleting job role', err);
    }
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewJobRole((prev) => ({ ...prev, [name]: value }));
  };

  const createJobRole = async () => {
    try {
      const payload = {
        roleName: newJobRole.roleName,
        departmentId: parseInt(newJobRole.departmentId),
        isActive: true
      };
      
      console.log('Creating job role:', payload);
      
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/jobroles`,
        payload
      );
      
      console.log('Job role created:', res.data);
      
      // Refresh the list
      await fetchJobRoles();
      
      setIsCreateModalOpen(false);
      setNewJobRole({ roleName: '', departmentId: '', isActive: true });
    } catch (err) {
      console.error('Error creating job role', err);
      console.error('Error response:', err.response?.data);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Job Roles</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage job roles and their department assignments
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              <span className="ml-3 text-gray-600">Loading job roles...</span>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {jobRoles.length > 0 ? (
                      jobRoles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-800">{role.roleName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{role.departmentName}</td>
                          <td className="px-6 py-4 text-center text-sm">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => fetchJobRoleById(role.id)}
                                className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => openEditModal(role)}
                                className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteJobRole(role.id)}
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
                          No job roles found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card list for small screens */}
            <div className="sm:hidden space-y-4">
              {jobRoles.length > 0 ? (
                jobRoles.map((role) => (
                  <div key={role.id} className="bg-white shadow-sm rounded-lg p-4 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{role.roleName}</div>
                      <div className="text-xs text-gray-500 mt-1">Dept: {role.departmentName}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => fetchJobRoleById(role.id)}
                        className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteJobRole(role.id)}
                        className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">No job roles found</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Job Role</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Role Name</label>
                <input
                  type="text"
                  name="roleName"
                  value={editJobRole.roleName || ''}
                  onChange={handleEditChange}
                  placeholder="e.g., Software Engineer"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="departmentId"
                  value={editJobRole.departmentId || ''}
                  onChange={handleEditChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={updateJobRole}
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
            <h2 className="text-xl font-bold mb-4">Create Job Role</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Role Name</label>
                <input
                  type="text"
                  name="roleName"
                  value={newJobRole.roleName}
                  onChange={handleNewChange}
                  placeholder="e.g., Software Engineer"
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  name="departmentId"
                  value={newJobRole.departmentId}
                  onChange={handleNewChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={createJobRole}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition"
                >
                  Create Job Role
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

      {/* View Modal */}
      {isModalOpen && selectedJobRole && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Job Role Details</h2>
            <div className="space-y-3">
              <p><strong>Role Name:</strong> {selectedJobRole.roleName}</p>
              <p><strong>Department:</strong> {selectedJobRole.departmentName}</p>
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
