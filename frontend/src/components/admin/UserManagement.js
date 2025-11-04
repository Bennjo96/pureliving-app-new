// src/components/admin/UserManagement.js
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Download,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  MapPin,
  Eye,
  X,
  CheckCircle2,
  ShieldAlert,
  MessageSquare,
  DollarSign,
  Filter,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { adminService, handleApiError } from "../../api/api";
import { useNotification } from "../../contexts/NotificationContext";
import { Link } from "react-router-dom";

const UserManagement = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "client",
    status: "active",
    phone: "",
    address: "",
  });
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const currentTime = new Date();
  
  // Format date for header
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(currentTime);
  
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers();
      setUsers(Array.isArray(response.data.data) ? response.data.data : []);
      setError(null);
    } catch (error) {
      setError(handleApiError(error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      fetchUsers();
      setRefreshing(false);
    }, 1200);
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await adminService.updateUser(userId, { status });
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await adminService.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "client",
      status: user.status || "active",
      phone: user.phone || "",
      address: user.address || "",
    });
  };
  
  const openViewModal = (user) => {
    setViewingUser(user);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      if (Object.keys(editingUser).length === 0) {
        // This is a new user - use create API
        await adminService.createUser(formData);
        showToast(
          `User created successfully. Default password is: Welcome@123`, 
          "success"
        );
      } else {
        // This is an existing user - use update API
        await adminService.updateUser(editingUser._id, formData);
        showToast("User updated successfully", "success");
      }
      
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      showToast("Error saving user", "error");
    }
  };
  
  // Handle sort
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  // Export users data as CSV
  const handleExportData = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Created At',
      'Total Bookings',
      'Total Spent'
    ].join(',');
    
    const rows = filteredUsers.map(user => [
      user._id || '',
      user.name || '',
      user.email || '',
      user.phone || '',
      user.role || '',
      user.status || '',
      user.createdAt || '',
      user.totalBookings || '0',
      user.totalSpent ? `$${user.totalSpent}` : '$0'
    ].join(','));
    
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const fileName = `users_export_${new Date().toISOString().slice(0,10)}.csv`;
    
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Apply filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role filter
      const matchesRole = filterRole === "all" || user.role === filterRole;
      
      // Status filter
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      
      // Search term
      const searchTerm = search.toLowerCase();
      const matchesSearch = !search || 
        (user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.phone?.toLowerCase().includes(searchTerm));
      
      // Date range filter
      let matchesDateRange = true;
      if (dateRange.start && dateRange.end && user.createdAt) {
        const userDate = new Date(user.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        matchesDateRange = userDate >= startDate && userDate <= endDate;
      } else if (dateRange.start && user.createdAt) {
        const userDate = new Date(user.createdAt);
        const startDate = new Date(dateRange.start);
        matchesDateRange = userDate >= startDate;
      } else if (dateRange.end && user.createdAt) {
        const userDate = new Date(user.createdAt);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        matchesDateRange = userDate <= endDate;
      }
      
      return matchesRole && matchesStatus && matchesSearch && matchesDateRange;
    });
  }, [users, filterRole, filterStatus, search, dateRange]);
  
  // Apply sorting
  const sortedUsers = useMemo(() => {
    if (!filteredUsers.length) return [];
    
    return [...filteredUsers].sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (bValue > aValue ? 1 : -1);
    });
  }, [filteredUsers, sortConfig]);
  
  // Pagination
  const usersPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / usersPerPage));
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  
  // Go to page
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let bgColor = '';
    switch(status) {
      case 'active':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'suspended':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'inactive':
        bgColor = 'bg-red-100 text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };
  
  // Render role badge with appropriate color
  const renderRoleBadge = (role) => {
    let bgColor = '';
    switch(role) {
      case 'client':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      case 'cleaner':
        bgColor = 'bg-purple-100 text-purple-800';
        break;
      case 'admin':
        bgColor = 'bg-red-100 text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {role}
      </span>
    );
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pb-10">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg shadow-md p-6 mb-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-5">
          <svg width="300" height="150" viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5,21.5h49.251c0,0-20.865-17.472-37.958-5.433C-4.303,28.108,1.5,21.5,1.5,21.5z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <div className="flex items-center mt-2 text-teal-100">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>{formattedDate}</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-2" />
              <span>{formattedTime}</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <button
                onClick={handleRefresh} 
                className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 flex items-center justify-center"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search users by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Roles</option>
            <option value="client">Clients</option>
            <option value="cleaner">Cleaners</option>
            <option value="admin">Admins</option>
          </select>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          
          {/* More Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              showFilters 
                ? 'bg-teal-50 text-teal-600 border-teal-200' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" />
            More Filters
          </button>
          
          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
          
          {/* Add User Button */}
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: "",
                email: "",
                role: "client",
                status: "active",
                phone: "",
                address: "",
              });
              setEditingUser({});
            }}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus size={18} className="mr-2" />
            Add User
          </button>
        </div>
        
        {/* Additional Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Date From
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Date To
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Error State */}
      {error && !refreshing && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-sm mb-6"
        >
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-medium mb-1">Error Loading Users</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-3 text-red-700 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200 inline-flex items-center"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
              </button>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Loading State */}
      {loading && !refreshing ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
        <>
          {/* Users Table */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'asc' ? <ChevronRight size={16} className="ml-1" /> : <ChevronLeft size={16} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center">
                        Role
                        {sortConfig.key === 'role' && (
                          sortConfig.direction === 'asc' ? <ChevronRight size={16} className="ml-1" /> : <ChevronLeft size={16} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Registered
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'asc' ? <ChevronRight size={16} className="ml-1" /> : <ChevronLeft size={16} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ChevronRight size={16} className="ml-1" /> : <ChevronLeft size={16} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                            {user.profileImage ? (
                              <img 
                                src={user.profileImage} 
                                alt={user.name} 
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-teal-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">ID: {user._id?.substring(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Mail size={14} className="text-gray-400 mr-1" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center mt-1">
                              <Phone size={14} className="text-gray-400 mr-1" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </div>
                        {user.lastLogin && (
                          <div className="text-xs text-gray-400 mt-1">
                            Last login: {formatDate(user.lastLogin)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.status || "active"}
                          onChange={(e) => handleStatusChange(user._id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            className="p-1 text-gray-500 hover:text-teal-600"
                            onClick={() => openViewModal(user)}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-teal-600"
                            onClick={() => openEditModal(user)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-red-600"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Empty State */}
            {currentUsers.length === 0 && (
              <div className="py-8 text-center">
                <User size={48} className="text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-500">No users found</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {search || filterRole !== "all" || filterStatus !== "all" || dateRange.start || dateRange.end
                    ? "Try adjusting your search or filters."
                    : "Add users to get started."}
                </p>
                {(search || filterRole !== "all" || filterStatus !== "all" || dateRange.start || dateRange.end) && (
                  <button 
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                    onClick={() => {
                      setSearch("");
                      setFilterRole("all");
                      setFilterStatus("all");
                      setDateRange({ start: "", end: "" });
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
            
            {/* Pagination */}
            {sortedUsers.length > 0 && (
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{Math.min((currentPage - 1) * usersPerPage + 1, sortedUsers.length)}</span> to <span className="font-medium">{Math.min(currentPage * usersPerPage, sortedUsers.length)}</span> of <span className="font-medium">{sortedUsers.length}</span> users
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center px-3 py-1 rounded ${
                      currentPage === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToPage(idx + 1)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          currentPage === idx + 1 
                            ? 'bg-teal-600 text-white' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center px-3 py-1 rounded ${
                      currentPage === totalPages 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Edit/Add User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md m-4"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">{editingUser._id ? "Edit User" : "Add User"}</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSaveUser}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={editingUser._id} // Disable email edit for existing users
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role*
                    </label>
                    <select
                      name="role"
                      id="role"
                      required
                      value={formData.role}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="client">Client</option>
                      <option value="cleaner">Cleaner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status*
                    </label>
                    <select
                      name="status"
                      id="status"
                      required
                      value={formData.status}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    {editingUser._id ? "Update User" : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* View User Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">User Profile</h3>
              <button 
                onClick={() => setViewingUser(null)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                  {viewingUser.profileImage ? (
                    <img 
                      src={viewingUser.profileImage}
                      alt={viewingUser.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User size={24} className="text-teal-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewingUser.name}</h2>
                  <div className="flex items-center mt-1">
                    {renderRoleBadge(viewingUser.role)}
                    <span className="ml-2 text-gray-500">ID: {viewingUser._id?.substring(0, 8)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Contact Information</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{viewingUser.email}</span>
                    </li>
                    {viewingUser.phone && (
                      <li className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-500 mr-2" />
                        <span>{viewingUser.phone}</span>
                      </li>
                    )}
                    {viewingUser.address && (
                      <li className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <span>{viewingUser.address}</span>
                      </li>
                    )}
                  </ul>
                  
                  <h4 className="font-medium text-gray-700 mb-3 mt-6">Account Details</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Registered: {formatDate(viewingUser.createdAt)}</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-gray-500 mr-2" />
                      <span>Status: {renderStatusBadge(viewingUser.status)}</span>
                    </li>
                    {viewingUser.lastLogin && (
                      <li className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Last login: {formatDate(viewingUser.lastLogin)}</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Activity Summary</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Total Bookings</span>
                      </div>
                      <span className="font-medium">{viewingUser.totalBookings || 0}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Total Spent</span>
                      </div>
                      <span className="font-medium">${viewingUser.totalSpent || 0}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Support Requests</span>
                      </div>
                      <span className="font-medium">{viewingUser.supportRequests || 0}</span>
                    </li>
                  </ul>
                  
                  {viewingUser.role === 'client' && viewingUser.preferredServices && (
                    <>
                      <h4 className="font-medium text-gray-700 mb-3 mt-6">Preferred Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingUser.preferredServices.map(service => (
                          <span 
                            key={service}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Admin Notes Section */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-700 mb-3">Admin Notes</h4>
                {viewingUser.adminNotes ? (
                  <p className="bg-gray-50 p-4 rounded-lg text-sm">{viewingUser.adminNotes}</p>
                ) : (
                  <p className="text-gray-500 text-sm">No admin notes for this user.</p>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-between">
              <div>
                {viewingUser.status === 'active' ? (
                  <button
                    onClick={() => {
                      handleStatusChange(viewingUser._id, 'suspended');
                      setViewingUser({...viewingUser, status: 'suspended'});
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  >
                    <ShieldAlert size={16} className="mr-1" />
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleStatusChange(viewingUser._id, 'active');
                      setViewingUser({...viewingUser, status: 'active'});
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <CheckCircle2 size={16} className="mr-1" />
                    Activate User
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setViewingUser(null)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
                  onClick={() => {
                    setViewingUser(null);
                    openEditModal(viewingUser);
                  }}
                >
                  <Edit size={16} className="mr-1" />
                  Edit User
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;