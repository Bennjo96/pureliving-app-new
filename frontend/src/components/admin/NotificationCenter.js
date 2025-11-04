// src/components/admin/NotificationCenter.js
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from "framer-motion";
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  Clock, 
  Filter, 
  X,
  Archive,
  RefreshCw,
  Calendar,
  User,
  CreditCard,
  BookOpen,
  UserX,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  FileText
} from 'lucide-react';
import { adminService, handleApiError } from '../../api/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Notification Types with updated categories
  const notificationTypes = {
    system: {
      icon: AlertOctagon,
      color: 'text-purple-600 bg-purple-50',
      label: 'System Alert'
    },
    payment: {
      icon: CreditCard,
      color: 'text-blue-600 bg-blue-50',
      label: 'Payment Alert'
    },
    booking: {
      icon: BookOpen,
      color: 'text-green-600 bg-green-50',
      label: 'Booking Alert'
    },
    user: {
      icon: UserX,
      color: 'text-orange-600 bg-orange-50',
      label: 'User Issue'
    },
    success: {
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
      label: 'Success'
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-600 bg-yellow-50',
      label: 'Warning'
    },
    error: {
      icon: XCircle,
      color: 'text-red-600 bg-red-50',
      label: 'Error'
    },
    info: {
      icon: Info,
      color: 'text-blue-600 bg-blue-50',
      label: 'Information'
    }
  };

  // Recipient Types
  const recipientTypes = {
    all: 'All Recipients',
    admin: 'Admins Only',
    cleaner: 'Cleaners Only',
    customer: 'Customers Only'
  };

  // Date Filter Options
  const dateFilterOptions = {
    all: 'All Time',
    today: 'Today',
    week: 'This Week',
    month: 'This Month'
  };

  // Format date using date-fns
  const format = (date, formatStr) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await adminService.getNotifications();
        if (response.data && response.data.data) {
          setNotifications(response.data.data);
        }
        setLastRefreshed(new Date());
      } catch (error) {
        const apiError = handleApiError(error);
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Polling mechanism for real-time updates
    const pollingInterval = setInterval(fetchNotifications, 60000); // Poll every minute
    
    return () => clearInterval(pollingInterval);
  }, []);

  // Fetch unread count separately (optional optimization)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await adminService.getUnreadCount();
        if (response.data && response.data.success) {
          // If you want to use the server's count instead of calculating it client-side
          // You could update a separate state variable here
          // setUnreadCountFromServer(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    // You can uncomment this if you want to fetch the unread count separately
    // This might be useful if you have a large number of notifications
    // fetchUnreadCount();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await adminService.markAsRead(notificationId);
      if (response.data && response.data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark notification as unread - Not implemented in backend yet
  const markAsUnread = async (notificationId) => {
    // Since there's no "mark as unread" endpoint in your API, we'll show a message
    alert("Mark as unread functionality is not implemented in the backend yet.");
    
    // Optionally, you could implement this in your backend with another endpoint like:
    // router.patch('/:id/unread', notificationController.markAsUnread);
    
    /*
    try {
      const response = await adminService.markAsUnread(notificationId);
      if (response.data && response.data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: false } 
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
    */
  };

  // Archive notification (delete in your backend)
  const archiveNotification = async (notificationId) => {
    try {
      const response = await adminService.deleteNotification(notificationId);
      if (response.data && response.data.success) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Clear all notifications (not implemented in backend yet)
  const clearAllNotifications = async () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      try {
        // Since there's no "delete all" endpoint in your API, we can implement a workaround
        // by deleting notifications one by one
        const deletePromises = notifications.map(notification => 
          adminService.deleteNotification(notification._id)
        );
        
        await Promise.all(deletePromises);
        setNotifications([]);
        
        // Optionally, you could implement this in your backend with another endpoint like:
        // router.delete('/', notificationController.deleteAllNotifications);
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await adminService.markAllAsRead();
      if (response.data && response.data.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Filter notifications by date
  const filterByDate = (notification) => {
    const notificationDate = new Date(notification.createdAt);
    const today = new Date();
    
    switch (dateFilter) {
      case 'today':
        return notificationDate.toDateString() === today.toDateString();
      case 'week': {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        return notificationDate >= oneWeekAgo;
      }
      case 'month': {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        return notificationDate >= oneMonthAgo;
      }
      default:
        return true;
    }
  };

  // Memoized filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(notification => 
        (filter === 'all' || notification.type === filter) &&
        (recipientFilter === 'all' || notification.recipient === recipientFilter) &&
        (filter !== 'read' && filter !== 'unread' || filter === 'read' ? notification.read : !notification.read) &&
        filterByDate(notification)
      )
      .sort((a, b) => {
        // Sort by priority first (high priority first)
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        // Then sort by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [notifications, filter, recipientFilter, dateFilter]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Format time with relative time
  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };

  // Render Notification Item
  const NotificationItem = ({ notification }) => {
    const NotificationIcon = notificationTypes[notification.type]?.icon || Info;
    const iconColor = notificationTypes[notification.type]?.color || 'text-gray-600 bg-gray-50';
    const isPriority = notification.priority > 0;

    return (
      <div 
        className={`flex items-start p-4 hover:bg-gray-50 transition-colors duration-150 ${notification.read ? 'bg-white' : 'bg-blue-50'} ${isPriority ? 'border-l-4 border-red-500 pl-3' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => {
          setSelectedNotification(notification);
          if (!notification.read) markAsRead(notification._id);
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setSelectedNotification(notification);
            if (!notification.read) markAsRead(notification._id);
          }
        }}
      >
        <div className={`mr-4 p-2 rounded-full ${iconColor} flex-shrink-0`}>
          <NotificationIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-semibold text-gray-800 truncate pr-2">{notification.title}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {isPriority && (
                  <span className="inline-flex items-center bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    High Priority
                  </span>
                )}
                {notification.recipientType && (
                  <span className="inline-flex items-center bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                    <User className="w-3 h-3 mr-1" />
                    {recipientTypes[notification.recipientType] || notification.recipientType}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-500 flex items-center whitespace-nowrap ml-2">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {notification.message}
          </p>
        </div>
      </div>
    );
  };

  // Loading State
  if (loading && !notifications.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Error State
  if (error && !notifications.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-sm"
      >
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">
              Error Loading Notifications
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
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
          <svg
            width="300"
            height="150"
            viewBox="0 0 52 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.5,21.5h49.251c0,0-20.865-17.472-37.958-5.433C-4.303,28.108,1.5,21.5,1.5,21.5z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center">
            <Bell className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              <p className="text-teal-100 mt-1">
                Manage system alerts, updates, and communication with users
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="ml-3 px-2.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              <p className="text-teal-100 text-sm">
                Last refreshed: {format(lastRefreshed, "MMM d, yyyy HH:mm:ss")}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 flex items-center justify-center"
                aria-label="Refresh notifications"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
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
          {/* Type Filter */}
          <div className="relative flex-grow">
            <select
              id="typeFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
              aria-label="Filter Notifications"
            >
              <option value="all">All Notification Types</option>
              {Object.keys(notificationTypes).map(type => (
                <option key={type} value={type}>
                  {notificationTypes[type].label}
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Filter */}
          <div>
            <select
              id="recipientFilter"
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
            >
              {Object.entries(recipientTypes).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              showFilters
                ? "bg-teal-50 text-teal-600 border-teal-200"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={18} className="mr-2" />
            More Filters
            {showFilters ? (
              <ChevronUp size={16} className="ml-2" />
            ) : (
              <ChevronDown size={16} className="ml-2" />
            )}
          </button>

          {/* Mark All as Read Button */}
          <button 
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.read)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </button>

          {/* Clear All Button */}
          <button 
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Filter */}
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Time Period
              </label>
              <select
                id="dateFilter"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring focus:ring-teal-200"
              >
                {Object.entries(dateFilterOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={filter === 'all' ? 'all' : filter === 'read' ? 'read' : 'unread'}
                onChange={(e) => {
                  if (e.target.value === 'all') setFilter('all');
                  else if (e.target.value === 'read') setFilter('read');
                  else setFilter('unread');
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring focus:ring-teal-200"
              >
                <option value="all">All Statuses</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-9 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring focus:ring-teal-200"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Notification Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Unread</p>
              <h3 className="text-2xl font-bold mt-2">{unreadCount}</h3>
              <div className="flex items-center mt-2">
                {unreadCount > 0 ? (
                  <TrendingUp className="h-4 w-4 text-teal-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-gray-400 mr-1" />
                )}
                <p className={`text-sm ${unreadCount > 0 ? 'text-teal-500' : 'text-gray-400'}`}>
                  {unreadCount > 0 ? 'Active' : 'None'}
                </p>
              </div>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Bell className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">System Alerts</p>
              <h3 className="text-2xl font-bold mt-2">
                {notifications.filter(n => n.type === 'system').length}
              </h3>
              <div className="flex items-center mt-2">
                <AlertOctagon className="h-4 w-4 text-purple-500 mr-1" />
                <p className="text-sm text-purple-500">
                  {notifications.filter(n => n.type === 'system' && !n.read).length} new
                </p>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <AlertOctagon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Payment Alerts</p>
              <h3 className="text-2xl font-bold mt-2">
                {notifications.filter(n => n.type === 'payment').length}
              </h3>
              <div className="flex items-center mt-2">
                <CreditCard className="h-4 w-4 text-blue-500 mr-1" />
                <p className="text-sm text-blue-500">
                  {notifications.filter(n => n.type === 'payment' && !n.read).length} unread
                </p>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">High Priority</p>
              <h3 className="text-2xl font-bold mt-2">
                {notifications.filter(n => (n.priority > 0)).length}
              </h3>
              <div className="flex items-center mt-2">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-sm text-red-500">
                  Needs attention
                </p>
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
      >
        <div className="overflow-x-auto">
          <div className="flex p-2 space-x-1">
            <button 
              onClick={() => setFilter('all')}
              className={`flex items-center px-4 py-2 rounded-md ${
                filter === 'all' ? "bg-teal-600 text-white" : "hover:bg-gray-50"
              }`}
            >
              <Bell className="h-5 w-5 mr-2" />
              <span>All</span>
            </button>
            <button 
              onClick={() => setFilter('system')}
              className={`flex items-center px-4 py-2 rounded-md ${
                filter === 'system' ? "bg-teal-600 text-white" : "hover:bg-gray-50"
              }`}
            >
              <AlertOctagon className="h-5 w-5 mr-2" />
              <span>System</span>
            </button>
            <button 
              onClick={() => setFilter('payment')}
              className={`flex items-center px-4 py-2 rounded-md ${
                filter === 'payment' ? "bg-teal-600 text-white" : "hover:bg-gray-50"
              }`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              <span>Payments</span>
            </button>
            <button 
              onClick={() => setFilter('booking')}
              className={`flex items-center px-4 py-2 rounded-md ${
                filter === 'booking' ? "bg-teal-600 text-white" : "hover:bg-gray-50"
              }`}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              <span>Bookings</span>
            </button>
            <button 
              onClick={() => setFilter('user')}
              className={`flex items-center px-4 py-2 rounded-md ${
                filter === 'user' ? "bg-teal-600 text-white" : "hover:bg-gray-50"
              }`}
            >
              <UserX className="h-5 w-5 mr-2" />
              <span>User Issues</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
      >
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Notification Feed
          </h2>
          <button 
            className="text-gray-600 hover:text-teal-600 flex items-center text-sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
        
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Bell className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no notifications matching your current filter settings.
            </p>
            {(filter !== 'all' || recipientFilter !== 'all' || dateFilter !== 'all') && (
              <button
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                onClick={() => {
                  setFilter('all');
                  setRecipientFilter('all');
                  setDateFilter('all');
                }}
              >
                <RefreshCw className="inline-block mr-1 h-4 w-4" /> Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => (
              <NotificationItem 
                key={notification._id} 
                notification={notification} 
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="notificationModalTitle"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-lg w-full shadow-xl"
          >
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 id="notificationModalTitle" className="text-xl font-semibold text-gray-900">
                {selectedNotification.title}
              </h2>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                aria-label="Close notification details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-full ${notificationTypes[selectedNotification.type]?.color || 'bg-gray-100'} mr-3`}>
                  {React.createElement(notificationTypes[selectedNotification.type]?.icon || Info, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {notificationTypes[selectedNotification.type]?.label || 'Notification'}
                  </p>
                  {selectedNotification.recipientType && (
                    <p className="text-sm text-gray-500">
                      For: {recipientTypes[selectedNotification.recipientType] || selectedNotification.recipientType}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 whitespace-pre-line">{selectedNotification.message}</p>
              </div>

              <div className="text-sm text-gray-500 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2" /> 
                Received: {new Date(selectedNotification.createdAt).toLocaleString()}
              </div>

              <div className="flex space-x-3 mt-4 pt-4 border-t">
                {selectedNotification.read ? (
                  <button 
                    onClick={() => {
                      alert("Mark as unread functionality is not implemented in the backend yet.");
                      setSelectedNotification(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Mark as Unread
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      markAsRead(selectedNotification._id);
                      setSelectedNotification(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </button>
                )}
                <button 
                  onClick={() => {
                    archiveNotification(selectedNotification._id);
                    setSelectedNotification(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;