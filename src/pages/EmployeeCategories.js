import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

export default function EmployeeCategories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/empcategories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchCategoryById = async (id) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/empcategories/${id}`);
      setSelectedCategory(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching category details', err);
    }
  };

  const openEditModal = (cat) => {
    setEditCategory({ ...cat });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditCategory((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const createOrUpdateCategory = async () => {
    try {
      if (editCategory.id) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/empcategories/${editCategory.id}`,
          editCategory
        );
        setCategories((prev) =>
          prev.map((cat) => (cat.id === editCategory.id ? editCategory : cat))
        );
      } else {
        const res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/empcategories`,
          editCategory
        );
        setCategories((prev) => [...prev, res.data]);
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error saving category', err);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/empcategories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category', err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Employee Categories</h1>
            <p className="text-sm text-gray-500 mt-1">Manage categories — view, edit, or remove.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* <button
              type="button"
              onClick={() => { setEditCategory({}); setIsEditModalOpen(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              <FaPlus /> Create New
            </button> */}
          </div>
        </div>

        {/* Table for medium+ screens */}
        <div className="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Employment Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      {/* <td className="px-6 py-4 text-sm text-gray-700">{cat.id}</td> */}
                      <td className="px-6 py-4 text-sm text-gray-800">{cat.categoryName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{cat.description}</td>
                      <td className="px-6 py-4 text-sm text-center">{cat.daySalarybased ? 'Day Salary Based' : 'Monthly Salary'}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        <div className="inline-flex items-center gap-2">
                          <button
                            aria-label={`view-${cat.id}`}
                            onClick={() => fetchCategoryById(cat.id)}
                            className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"
                          ><FaEye /></button>
                          <button
                            aria-label={`edit-${cat.id}`}
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"
                          ><FaEdit /></button>
                          {/* <button
                            aria-label={`delete-${cat.id}`}
                            onClick={() => deleteCategory(cat.id)}
                            className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"
                          ><FaTrash /></button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card list for small screens */}
        <div className="sm:hidden space-y-4">
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div key={cat.id} className="bg-white shadow-sm rounded-lg p-4 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{cat.categoryName}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{cat.description}</div>
                  <div className="text-xs text-gray-500 mt-1">{cat.daySalarybased ? 'Day Salary Based' : 'Monthly Salary'}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => fetchCategoryById(cat.id)} className="p-2 rounded-md text-blue-600 hover:bg-blue-50 transition"><FaEye /></button>
                  <button onClick={() => openEditModal(cat)} className="p-2 rounded-md text-indigo-600 hover:bg-indigo-50 transition"><FaEdit /></button>
                  {/* <button onClick={() => deleteCategory(cat.id)} className="p-2 rounded-md text-red-600 hover:bg-red-50 transition"><FaTrash /></button> */}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white shadow-sm rounded-lg p-6 text-center text-gray-500">No categories found</div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{editCategory.id ? 'Edit Category' : 'Create Category'}</h2>
            <form className="space-y-3">
              <input
                type="text"
                name="categoryName"
                value={editCategory.categoryName || ''}
                onChange={handleEditChange}
                placeholder="Category Name"
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                name="description"
                value={editCategory.description || ''}
                onChange={handleEditChange}
                placeholder="Description"
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="daySalarybased"
                  checked={editCategory.daySalarybased || false}
                  onChange={handleEditChange}
                  className="h-4 w-4"
                />
                <label>Day Salary Based</label>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={createOrUpdateCategory} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isModalOpen && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Category Details</h2>
            {/* <p><strong>ID:</strong> {selectedCategory.id}</p> */}
            <p><strong>Name:</strong> {selectedCategory.categoryName}</p>
            <p><strong>Description:</strong> {selectedCategory.description}</p>
            <p><strong>Salary Based:</strong> {selectedCategory.daySalarybased ? 'Day Salary' : 'Monthly Salary'}</p>
            <button onClick={() => setIsModalOpen(false)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
