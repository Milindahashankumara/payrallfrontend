import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaCalendarAlt, FaSearch, FaSync } from 'react-icons/fa';

export default function SpecialHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [filteredHolidays, setFilteredHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    date: formatDate(new Date()),
    description: '',
    isRecurring: false,
    holidayType: 'Public'
  });

  // Helper function to format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper function to format date for display
  function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Helper function to get month name
  function getMonthName(date) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // Helper function to get start of month
  function getStartOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  // Helper function to get end of month
  function getEndOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }

  // Helper function to get all days in month
  function getDaysInMonth(date) {
    const start = getStartOfMonth(date);
    const end = getEndOfMonth(date);
    const days = [];
    const current = new Date(start);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  // Helper function to check if two dates are the same day
  function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Helper function to check if two dates are in the same month
  function isSameMonth(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth();
  }

  // Helper function to add months
  function addMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }

  // Helper function to subtract months
  function subMonths(date, months) {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months);
    return newDate;
  }

  // Fetch holidays
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/specialHolidays/year/${year}`);
      setHolidays(response.data);
      setFilteredHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      alert('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  // Fetch holidays on component mount
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // Filter holidays based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = holidays.filter(holiday =>
        holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (holiday.description && holiday.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        holiday.holidayType.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHolidays(filtered);
    } else {
      setFilteredHolidays(holidays);
    }
  }, [searchTerm, holidays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedHoliday) {
        // Update existing holiday
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/specialHolidays/${selectedHoliday.id}`, formData);
        alert('Holiday updated successfully!');
      } else {
        // Create new holiday
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/specialHolidays`, formData);
        alert('Holiday created successfully!');
      }
      setIsModalOpen(false);
      setSelectedHoliday(null);
      setFormData({
        name: '',
        date: formatDate(new Date()),
        description: '',
        isRecurring: false,
        holidayType: 'Public'
      });
      fetchHolidays();
    } catch (error) {
      console.error('Error saving holiday:', error);
      alert('Failed to save holiday');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/specialHolidays/${selectedHoliday.id}`);
      alert('Holiday deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedHoliday(null);
      fetchHolidays();
    } catch (error) {
      console.error('Error deleting holiday:', error);
      alert('Failed to delete holiday');
    }
  };

  const handleEdit = (holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: formatDate(new Date(holiday.date)),
      description: holiday.description || '',
      isRecurring: holiday.isRecurring,
      holidayType: holiday.holidayType || 'Public'
    });
    setIsModalOpen(true);
  };

  const handleNewHoliday = () => {
    setSelectedHoliday(null);
    setFormData({
      name: '',
      date: formatDate(new Date()),
      description: '',
      isRecurring: false,
      holidayType: 'Public'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calendar functions
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = getStartOfMonth(currentDate);
  const monthEnd = getEndOfMonth(currentDate);

  const getHolidaysForDay = (day) => {
    return holidays.filter(holiday => isSameDay(new Date(holiday.date), day));
  };

  const getHolidayCountForMonth = () => {
    return holidays.filter(holiday => 
      isSameMonth(new Date(holiday.date), currentDate)
    ).length;
  };

  // Get day names for calendar header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Special Holidays Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage company holidays and special events
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Holidays</h3>
                <p className="text-2xl font-bold text-gray-800">{holidays.length}</p>
              </div>
            </div>
          </div> */}

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCalendarAlt className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Holidays In This Month</h3>
                <p className="text-2xl font-bold text-gray-800">{getHolidayCountForMonth()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaCalendarAlt className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Holidays In Current Year</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {holidays.filter(h => new Date(h.date).getFullYear() === currentDate.getFullYear()).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar View */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Calendar View</h2>
              <div className="flex space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Previous month"
                >
                  ←
                </button>
                <button
                  onClick={goToToday}
                  className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Next month"
                >
                  →
                </button>
                <button
                  onClick={fetchHolidays}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Refresh"
                >
                  <FaSync />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-center mb-6 text-gray-800">
              {getMonthName(currentDate)}
            </h3>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {(() => {
                // Create a complete calendar grid (6 weeks)
                const calendarDays = [];
                const startDate = new Date(monthStart);
                startDate.setDate(startDate.getDate() - monthStart.getDay()); // Start from Sunday of the week containing the 1st
                
                // Generate 42 days (6 weeks)
                for (let i = 0; i < 42; i++) {
                  const currentDay = new Date(startDate);
                  currentDay.setDate(startDate.getDate() + i);
                  const dayHolidays = getHolidaysForDay(currentDay);
                  const isCurrentMonth = isSameMonth(currentDay, currentDate);
                  const isToday = isSameDay(currentDay, new Date());
                  
                  calendarDays.push(
                    <div
                      key={currentDay.getTime()}
                      className={`p-2 rounded-lg border text-center min-h-16 transition-colors ${
                        !isCurrentMonth 
                          ? 'bg-gray-50 border-gray-100 text-gray-400' 
                          : dayHolidays.length > 0 
                          ? 'bg-red-50 border-red-200 hover:bg-red-100' 
                          : isToday
                          ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        isToday 
                          ? 'text-blue-600' 
                          : !isCurrentMonth
                          ? 'text-gray-400'
                          : dayHolidays.length > 0 
                          ? 'text-red-700' 
                          : 'text-gray-700'
                      }`}>
                        {currentDay.getDate()}
                      </div>
                      {isCurrentMonth && dayHolidays.slice(0, 2).map(holiday => (
                        <div
                          key={holiday.id}
                          className="text-xs text-red-600 truncate cursor-pointer hover:underline mt-1"
                          onClick={() => handleEdit(holiday)}
                          title={`${holiday.name} (${holiday.holidayType})`}
                        >
                          {holiday.name}
                        </div>
                      ))}
                      {isCurrentMonth && dayHolidays.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{dayHolidays.length - 2} more
                        </div>
                      )}
                    </div>
                  );
                }
                
                return calendarDays;
              })()}
            </div>

            {/* Calendar Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                <span>Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                <span>Other Month</span>
              </div>
            </div>
          </div>

          {/* Holidays List */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Holidays List</h2>
              <button
                onClick={handleNewHoliday}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FaPlus /> Add Holiday
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search holidays by name, description, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredHolidays.map(holiday => (
                <div key={holiday.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-800">{holiday.name}</h4>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatDisplayDate(holiday.date)}
                        </span>
                      </div>
                      {holiday.description && (
                        <p className="text-sm text-gray-600 mt-1">{holiday.description}</p>
                      )}
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          holiday.holidayType === 'Public' ? 'bg-blue-100 text-blue-800' :
                          holiday.holidayType === 'Company' ? 'bg-green-100 text-green-800' :
                          holiday.holidayType === 'Religious' ? 'bg-purple-100 text-purple-800' :
                          holiday.holidayType === 'National' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {holiday.holidayType}
                        </span>
                        {holiday.isRecurring && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={() => handleEdit(holiday)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit holiday"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedHoliday(holiday);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete holiday"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredHolidays.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No holidays match your search.' : 'No holidays found. Click "Add Holiday" to create one.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {selectedHoliday ? 'Edit Holiday' : 'Add New Holiday'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Holiday Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter holiday name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Optional holiday description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="holidayType"
                    value={formData.holidayType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Public">Public Holiday</option>
                    <option value="Company">Company Holiday</option>
                    <option value="Religious">Religious</option>
                    <option value="National">National</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Recurring every year
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedHoliday(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    {selectedHoliday ? 'Update Holiday' : 'Create Holiday'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedHoliday && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete the holiday "<span className="font-semibold">{selectedHoliday.name}</span>" on {formatDisplayDate(selectedHoliday.date)}?
              </p>
              {selectedHoliday.isRecurring && (
                <p className="text-yellow-600 text-sm mb-4">
                  ⚠️ This is a recurring holiday. It will be removed from all future years.
                </p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Holiday
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}