// src/components/admin/BookingManagement.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Home,
  Phone,
  MapPin,
  DollarSign,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../api/api';

const BookingManagement = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('table');
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cleaners, setCleaners] = useState([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedCleanerForReassign, setSelectedCleanerForReassign] = useState(null);
  const [bookingToReassign, setBookingToReassign] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewPeriod, setViewPeriod] = useState('week');
  const [urgentBookingsCount, setUrgentBookingsCount] = useState(0);
  
  // Load bookings data
  useEffect(() => {
    fetchBookingsData();
    fetchCleaners();
  }, []);
  
  const fetchBookingsData = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would get this from your API
      const response = await adminService.getBookings();
      setBookingsData(response.bookings || []);
      
      // Count urgent bookings (those that need immediate attention)
      const urgentCount = (response.bookings || []).filter(
        b => b.status === 'Canceled' || (b.status === 'Pending' && new Date(b.date) <= new Date())
      ).length;
      setUrgentBookingsCount(urgentCount);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("Failed to load bookings data. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCleaners = async () => {
    try {
      // In a real implementation, fetch from your API
      const response = await adminService.getCleaners();
      setCleaners(response.cleaners || []);
    } catch (error) {
      console.error("Error fetching cleaners:", error);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      fetchBookingsData();
      setRefreshing(false);
    }, 1200);
  };
  
  // Filter bookings based on search query and status
  const filteredBookings = bookingsData.filter(booking => {
    // Search filter
    const matchesSearch = 
      booking.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.cleaner?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    
    // Date range filter (simplified - in a real app, you'd use a proper date library)
    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      matchesDateRange = booking.date >= dateRange.start && booking.date <= dateRange.end;
    } else if (dateRange.start) {
      matchesDateRange = booking.date >= dateRange.start;
    } else if (dateRange.end) {
      matchesDateRange = booking.date <= dateRange.end;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });
  
  // Sort bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Pagination
  const bookingsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(sortedBookings.length / bookingsPerPage));
  const currentBookings = sortedBookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );
  
  // Handle sort
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };
  
  // Handle pagination
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };
  
  // Toggle booking details
  const toggleBookingDetails = (booking) => {
    setSelectedBooking(selectedBooking?.id === booking.id ? null : booking);
  };
  
  // Handle booking status change
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // In real implementation, call your API to update status
      await adminService.updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookingsData(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
      
      // If we were viewing this booking details, update it
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      // In real app, show error notification
    }
  };
  
  // Handle cleaner reassignment
  const openReassignModal = (booking) => {
    setBookingToReassign(booking);
    setSelectedCleanerForReassign(null);
    setShowReassignModal(true);
  };
  
  // Handle export functionality
  const handleExportData = () => {
    // Create CSV content
    const headers = [
      'Booking ID',
      'Service',
      'Customer',
      'Customer Email',
      'Customer Phone',
      'Date',
      'Time',
      'Duration',
      'Status',
      'Cleaner',
      'Amount',
      'Payment Method',
      'Payment Status',
      'Notes'
    ].join(',');
    
    const rows = filteredBookings.map(booking => [
      booking.id,
      booking.service,
      booking.customer?.name,
      booking.customer?.email,
      booking.customer?.phone,
      booking.date,
      booking.time,
      booking.duration,
      booking.status,
      booking.cleaner,
      booking.amount,
      booking.payment,
      booking.paymentStatus,
      booking.notes ? `"${booking.notes.replace(/"/g, '""')}"` : ''
    ].join(','));
    
    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    const fileName = `bookings_export_${new Date().toISOString().slice(0,10)}.csv`;
    
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  const handleReassignCleaner = async () => {
    if (!bookingToReassign || !selectedCleanerForReassign) return;
    
    try {
      // In real implementation, call your API to reassign cleaner
      await adminService.reassignCleaner(bookingToReassign.id, selectedCleanerForReassign);
      
      // Update local state
      setBookingsData(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingToReassign.id 
            ? { ...booking, cleaner: selectedCleanerForReassign } 
            : booking
        )
      );
      
      // If we were viewing this booking details, update it
      if (selectedBooking?.id === bookingToReassign.id) {
        setSelectedBooking(prev => ({ ...prev, cleaner: selectedCleanerForReassign }));
      }
      
      // Close modal
      setShowReassignModal(false);
      setBookingToReassign(null);
      setSelectedCleanerForReassign(null);
    } catch (error) {
      console.error("Error reassigning cleaner:", error);
      // In real app, show error notification
    }
  };
  
  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let bgColor = '';
    switch(status) {
      case 'Completed':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'In Progress':
        bgColor = 'bg-blue-100 text-blue-800';
        break;
      case 'Scheduled':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'Canceled':
        bgColor = 'bg-red-100 text-red-800';
        break;
      case 'Pending':
        bgColor = 'bg-orange-100 text-orange-800';
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
  
  // Render payment status badge
  const renderPaymentBadge = (status) => {
    let bgColor = '';
    switch(status) {
      case 'Paid':
        bgColor = 'bg-green-100 text-green-800';
        break;
      case 'Pending':
        bgColor = 'bg-yellow-100 text-yellow-800';
        break;
      case 'Refunded':
        bgColor = 'bg-purple-100 text-purple-800';
        break;
      case 'Failed':
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
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-sm"
      >
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Error Loading Bookings</h3>
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
    );
  }
  
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
            <h1 className="text-2xl font-bold">Booking Management</h1>
            <p className="text-teal-100 mt-1">
              View and manage all cleaning service bookings
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              {urgentBookingsCount > 0 && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="font-medium">{urgentBookingsCount} urgent bookings</span>
                </div>
              )}
              
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
      
      {/* Actions and Filters */}
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
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              showFilters 
                ? 'bg-teal-50 text-teal-600 border-teal-200' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp size={16} className="ml-2" />
            ) : (
              <ChevronDown size={16} className="ml-2" />
            )}
          </button>
          
          {/* Export Button */}
          <button
            onClick={() => handleExportData()}
            className="flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
          
          {/* View Selector */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 ${
                viewMode === 'table' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 ${
                viewMode === 'card' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
            
            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
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
                To Date
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
      
      {/* Table View */}
      {viewMode === 'table' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Booking ID
                      {sortConfig.key === 'id' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortConfig.key === 'customer' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('service')}
                  >
                    <div className="flex items-center">
                      Service
                      {sortConfig.key === 'service' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date & Time
                      {sortConfig.key === 'date' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
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
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {sortConfig.key === 'amount' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentBookings.map((booking) => (
                  <React.Fragment key={booking.id}>
                    <tr 
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedBooking?.id === booking.id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => toggleBookingDetails(booking)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {booking.id}
                        {booking.recurring && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Recurring
                          </span>
                        )}
                        {booking.urgent && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            Urgent
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.customer?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {booking.date} at {booking.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {renderStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ${booking.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="p-1 text-gray-500 hover:text-teal-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookingDetails(booking);
                            }}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="p-1 text-gray-500 hover:text-teal-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Edit booking
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-1 text-gray-500 hover:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Delete booking
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Booking Details */}
                    {selectedBooking?.id === booking.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Info */}
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Customer Details</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-start">
                                  <User size={16} className="mt-0.5 mr-2 text-gray-500" />
                                  <div>
                                    <div className="font-medium">{booking.customer?.name}</div>
                                    <div className="text-gray-500">{booking.customer?.email}</div>
                                  </div>
                                </li>
                                <li className="flex items-start">
                                  <Phone size={16} className="mt-0.5 mr-2 text-gray-500" />
                                  <span>{booking.customer?.phone}</span>
                                </li>
                                <li className="flex items-start">
                                  <MapPin size={16} className="mt-0.5 mr-2 text-gray-500" />
                                  <span>{booking.customer?.address}</span>
                                </li>
                              </ul>
                            </div>
                            
                            {/* Booking Info */}
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Booking Details</h4>
                              <ul className="space-y-2 text-sm">
                                <li className="flex items-center">
                                  <Home size={16} className="mr-2 text-gray-500" />
                                  <span>Service: <span className="font-medium">{booking.service}</span></span>
                                </li>
                                <li className="flex items-center">
                                  <User size={16} className="mr-2 text-gray-500" />
                                  <span>Cleaner: <span className="font-medium">{booking.cleaner}</span></span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openReassignModal(booking);
                                    }}
                                    className="ml-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                  >
                                    Reassign
                                  </button>
                                </li>
                                <li className="flex items-center">
                                  <Calendar size={16} className="mr-2 text-gray-500" />
                                  <span>Date: <span className="font-medium">{booking.date}</span></span>
                                </li>
                                <li className="flex items-center">
                                  <Clock size={16} className="mr-2 text-gray-500" />
                                  <span>Time: <span className="font-medium">{booking.time} ({booking.duration})</span></span>
                                </li>
                                <li className="flex items-center">
                                  <DollarSign size={16} className="mr-2 text-gray-500" />
                                  <span>
                                    Payment: <span className="font-medium">{booking.payment}</span> 
                                    <span className="ml-2">{renderPaymentBadge(booking.paymentStatus)}</span>
                                  </span>
                                </li>
                              </ul>
                            </div>
                            
                            {/* Notes */}
                            {booking.notes && (
                              <div className="md:col-span-2 mt-2">
                                <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                                <p className="text-sm p-3 bg-gray-100 rounded">{booking.notes}</p>
                              </div>
                            )}
                            
                            {/* Status Management */}
                            <div className="md:col-span-2 mt-2">
                              <h4 className="font-medium text-gray-700 mb-2">Update Status</h4>
                              <div className="flex space-x-2">
                                {booking.status !== 'Pending' && (
                                  <button 
                                    onClick={() => handleStatusChange(booking.id, 'Pending')}
                                    className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-md text-sm hover:bg-orange-200"
                                  >
                                    Pending
                                  </button>
                                )}
                                {booking.status !== 'Scheduled' && (
                                  <button 
                                    onClick={() => handleStatusChange(booking.id, 'Scheduled')}
                                    className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                                  >
                                    Scheduled
                                  </button>
                                )}
                                {booking.status !== 'In Progress' && (
                                  <button 
                                    onClick={() => handleStatusChange(booking.id, 'In Progress')}
                                    className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                                  >
                                    In Progress
                                  </button>
                                )}
                                {booking.status !== 'Completed' && (
                                  <button 
                                    onClick={() => handleStatusChange(booking.id, 'Completed')}
                                    className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                                  >
                                    Completed
                                  </button>
                                )}
                                {booking.status !== 'Canceled' && (
                                  <button 
                                    onClick={() => handleStatusChange(booking.id, 'Canceled')}
                                    className="px-3 py-1.5 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="md:col-span-2 mt-2 flex justify-end space-x-2">
                              <button 
                                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                onClick={() => {
                                  // Edit booking
                                }}
                              >
                                Edit Booking
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                
                {/* Empty State */}
                {currentBookings.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar size={48} className="text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium text-gray-500">No bookings found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Try adjusting your search or filter to find what you're looking for.
                        </p>
                        {(searchQuery || selectedStatus !== 'all' || dateRange.start || dateRange.end) && (
                          <button 
                            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedStatus('all');
                              setDateRange({ start: '', end: '' });
                            }}
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {sortedBookings.length > 0 && (
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * bookingsPerPage + 1, sortedBookings.length)}</span> to <span className="font-medium">{Math.min(currentPage * bookingsPerPage, sortedBookings.length)}</span> of <span className="font-medium">{sortedBookings.length}</span> bookings
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
      )}
      
      {/* Card View */}
      {viewMode === 'card' && (
        <div>
          {/* Card Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
          >
            {currentBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-4px]"
              >
                {/* Card Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <div>
                    <span className="text-xs font-medium text-gray-500">
                      {booking.id}
                    </span>
                    <h3 className="font-bold">{booking.service}</h3>
                  </div>
                  {renderStatusBadge(booking.status)}
                </div>
                
                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-4">
                    {/* Customer */}
                    <div className="flex items-start">
                      <User size={16} className="mt-0.5 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">{booking.customer?.name}</div>
                        <div className="text-xs text-gray-500">{booking.customer?.email}</div>
                      </div>
                    </div>
                    
                    {/* Date & Time */}
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span>{booking.date} at {booking.time}</span>
                    </div>
                    
                    {/* Cleaner */}
                    <div className="flex items-center">
                      <User size={16} className="mr-2 text-gray-500" />
                      <span>Cleaner: {booking.cleaner}</span>
                    </div>
                    
                    {/* Amount */}
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-2 text-gray-500" />
                      <div className="flex items-center">
                        <span className="font-medium">${booking.amount}</span>
                        <span className="mx-2">•</span>
                        {renderPaymentBadge(booking.paymentStatus)}
                      </div>
                    </div>
                    
                    {/* Notes (if any) */}
                    {booking.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs italic text-gray-500">
                          {booking.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className="p-4 border-t flex justify-between">
                  <div className="flex space-x-1">
                    {booking.status === 'Pending' && (
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'Scheduled')}
                        className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs hover:bg-teal-200"
                      >
                        <Check size={12} className="inline mr-1" />
                        Confirm
                      </button>
                    )}
                    
                    {booking.status === 'Scheduled' && (
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'In Progress')}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                      >
                        <ArrowRight size={12} className="inline mr-1" />
                        Start
                      </button>
                    )}
                    
                    {booking.status === 'In Progress' && (
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'Completed')}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                      >
                        <Check size={12} className="inline mr-1" />
                        Complete
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      className="p-1 text-gray-500 hover:text-teal-600"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-teal-600"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
          
          {/* Empty State for Cards */}
          {currentBookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100"
            >
              <div className="flex flex-col items-center">
                <Calendar size={48} className="text-gray-300 mb-2" />
                <h3 className="text-lg font-medium text-gray-500">No bookings found</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                {(searchQuery || selectedStatus !== 'all' || dateRange.start || dateRange.end) && (
                  <button 
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatus('all');
                      setDateRange({ start: '', end: '' });
                    }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Pagination for Cards */}
          {sortedBookings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center border border-gray-100"
            >
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{Math.min((currentPage - 1) * bookingsPerPage + 1, sortedBookings.length)}</span> to <span className="font-medium">{Math.min(currentPage * bookingsPerPage, sortedBookings.length)}</span> of <span className="font-medium">{sortedBookings.length}</span> bookings
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
            </motion.div>
          )}
        </div>
      )}
      
      {/* Booking Details Modal */}
      {selectedBooking && viewMode === 'card' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Booking Details</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <div className="mb-6">
                    <h4 className="text-lg font-bold mb-4">Booking Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Booking ID:</span>
                        <span className="font-medium">{selectedBooking.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Service:</span>
                        <span className="font-medium">{selectedBooking.service}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">{selectedBooking.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium">{selectedBooking.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">{selectedBooking.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span>{renderStatusBadge(selectedBooking.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-medium">${selectedBooking.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="font-medium">{selectedBooking.payment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Status:</span>
                        <span>{renderPaymentBadge(selectedBooking.paymentStatus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Recurring:</span>
                        <span className="font-medium">{selectedBooking.recurring ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cleaner:</span>
                        <div>
                          <span className="font-medium">{selectedBooking.cleaner}</span>
                          <button 
                            onClick={() => openReassignModal(selectedBooking)}
                            className="ml-2 px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div>
                  <h4 className="text-lg font-bold mb-4">Customer Information</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-gray-500 text-sm">Customer Name</div>
                      <div className="font-medium">{selectedBooking.customer?.name}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Email Address</div>
                      <div className="font-medium">{selectedBooking.customer?.email}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Phone Number</div>
                      <div className="font-medium">{selectedBooking.customer?.phone}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Address</div>
                      <div className="font-medium">{selectedBooking.customer?.address}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-bold mb-4">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.status !== 'Pending' && (
                        <button 
                          onClick={() => {
                            handleStatusChange(selectedBooking.id, 'Pending');
                            setSelectedBooking({...selectedBooking, status: 'Pending'});
                          }}
                          className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-md text-sm hover:bg-orange-200"
                        >
                          Pending
                        </button>
                      )}
                      {selectedBooking.status !== 'Scheduled' && (
                        <button 
                          onClick={() => {
                            handleStatusChange(selectedBooking.id, 'Scheduled');
                            setSelectedBooking({...selectedBooking, status: 'Scheduled'});
                          }}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200"
                        >
                          Scheduled
                        </button>
                      )}
                      {selectedBooking.status !== 'In Progress' && (
                        <button 
                          onClick={() => {
                            handleStatusChange(selectedBooking.id, 'In Progress');
                            setSelectedBooking({...selectedBooking, status: 'In Progress'});
                          }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
                        >
                          In Progress
                        </button>
                      )}
                      {selectedBooking.status !== 'Completed' && (
                        <button 
                          onClick={() => {
                            handleStatusChange(selectedBooking.id, 'Completed');
                            setSelectedBooking({...selectedBooking, status: 'Completed'});
                          }}
                          className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
                        >
                          Completed
                        </button>
                      )}
                      {selectedBooking.status !== 'Canceled' && (
                        <button 
                          onClick={() => {
                            handleStatusChange(selectedBooking.id, 'Canceled');
                            setSelectedBooking({...selectedBooking, status: 'Canceled'});
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {selectedBooking.notes && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-bold mb-2">Notes</h4>
                  <p className="bg-gray-50 p-4 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-between">
              <div>
                {selectedBooking.status === 'Scheduled' && (
                  <button 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                    onClick={() => {
                      handleStatusChange(selectedBooking.id, 'Canceled');
                      setSelectedBooking({...selectedBooking, status: 'Canceled'});
                    }}
                  >
                    <X size={16} className="mr-1" />
                    Cancel Booking
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
                <button 
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
                >
                  <Edit size={16} className="mr-1" />
                  Edit Booking
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Reassign Cleaner Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Reassign Cleaner</h3>
              <button 
                onClick={() => setShowReassignModal(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <p className="mb-4 text-gray-700">
                Select a new cleaner for booking {bookingToReassign?.id}:
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cleaners.map(cleaner => (
                  <div 
                    key={cleaner.id}
                    onClick={() => setSelectedCleanerForReassign(cleaner.name)}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                      selectedCleanerForReassign === cleaner.name ? 'border-teal-500 bg-teal-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center mr-3">
                      <User size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{cleaner.name}</div>
                      <div className="text-xs text-gray-500">
                        Rating: {cleaner.rating} • {cleaner.activeJobs} active jobs
                      </div>
                    </div>
                    {selectedCleanerForReassign === cleaner.name && (
                      <Check size={18} className="text-teal-600" />
                    )}
                  </div>
                ))}
                
                {cleaners.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No cleaners available
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setShowReassignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
                onClick={handleReassignCleaner}
                disabled={!selectedCleanerForReassign}
              >
                <UserCheck size={16} className="mr-1" />
                Assign Cleaner
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;