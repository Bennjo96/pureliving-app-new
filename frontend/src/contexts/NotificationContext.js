// src/contexts/NotificationContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

// Create the context
const NotificationContext = createContext(null);

/**
 * Custom hook to use the notification context
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

/**
 * NotificationProvider component
 * Manages notifications throughout the application
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  /**
   * Fetch notifications from the server
   */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = user.role === 'admin' 
        ? '/admin/notifications' 
        : '/notifications';
      
      const response = await api.get(endpoint);
      setNotifications(response.data.notifications || []);
      
      // Count unread notifications
      const unread = response.data.notifications?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   */
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      const endpoint = user.role === 'admin' 
        ? `/admin/notifications/${notificationId}/read` 
        : `/notifications/${notificationId}/read`;
      
      await api.patch(endpoint);
      
      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError(err.response?.data?.message || 'Failed to update notification');
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const endpoint = user.role === 'admin' 
        ? '/admin/notifications/read-all' 
        : '/notifications/read-all';
      
      await api.patch(endpoint);
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError(err.response?.data?.message || 'Failed to update notifications');
    }
  };

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of notification ('success', 'error', 'warning', 'info')
   */
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  /**
   * Hide the current toast notification
   */
  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Combine all notification-related values and functions
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    toast,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    showToast,
    hideToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;