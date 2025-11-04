// src/components/customer/CustomerLayout.js
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  MapPin, 
  Star, 
  UserCircle, 
  Settings, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSettings } from '../../contexts/SettingsContext';
import ToastNotification from '../ToastNotification';
import { useTranslation } from "react-i18next";

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, toast, showToast } = useNotification();
  const { theme, toggleTheme } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Close profile menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
      if (isNotificationsOpen && !event.target.closest('.notification-menu-container')) {
        setIsNotificationsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu, isNotificationsOpen]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
      showToast(t("Logged out successfully"), "success");
    } catch (error) {
      console.error('Logout failed:', error);
      showToast(t("Logout failed"), "error");
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  // Navigation items with groups
  const navigation = [
    { 
      name: t("Dashboard"), 
      path: '/customer/dashboard', 
      icon: Home,
      group: "Overview"
    },
    { 
      name: t("My Bookings"), 
      path: '/customer/bookings', 
      icon: Calendar,
      group: "Services"
    },
    { 
      name: t("Payment Methods"), 
      path: '/customer/payment-methods', 
      icon: CreditCard,
      group: "Financial"
    },
    { 
      name: t("Saved Addresses"), 
      path: '/customer/addresses', 
      icon: MapPin,
      group: "Services"
    },
    { 
      name: t("My Reviews"), 
      path: '/customer/reviews', 
      icon: Star,
      group: "Services"
    },
    { 
      name: t("Profile"), 
      path: '/customer/profile', 
      icon: UserCircle,
      group: "Account"
    },
    { 
      name: t("Settings"), 
      path: '/customer/settings', 
      icon: Settings,
      group: "Account"
    },
  ];

  // Group navigation items
  const groupedNavigation = navigation.reduce((acc, item) => {
    const group = item.group || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  // Get page title from URL path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    return path.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Sidebar animation variants
  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4.5rem" }
  };

  // Render user avatar
  const renderUserAvatar = (size = "small") => {
    const sizeClasses = size === "small" 
      ? "h-8 w-8" 
      : "h-10 w-10";
    
    const textSizeClass = size === "small" 
      ? "text-sm" 
      : "text-lg";
    
    return (
      <div className={`${sizeClasses} rounded-full bg-teal-600/30 flex items-center justify-center text-white overflow-hidden`}>
        {user?.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={`${user.firstName} ${user.lastName}`} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-teal-500 to-teal-600">
            <span className={`${textSizeClass} font-medium`}>
              {user?.firstName?.charAt(0) || ""}{user?.lastName?.charAt(0) || "U"}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Show toast notification if active */}
      {toast.show && (
        <div className="fixed top-20 right-4 z-50">
          <ToastNotification {...toast} />
        </div>
      )}
    
      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.2 }}
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-teal-700 to-teal-800 shadow-lg z-20`}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Logo Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-teal-600/50 mb-2">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src="/logo-clean.png"
                  alt="CleanConnect"
                  className="h-8 transition-transform hover:scale-105"
                />
              ) : (
                <div className="flex justify-center w-full">
                  <span className="flex h-9 w-9 rounded-lg bg-white/20 items-center justify-center text-white font-semibold shadow-inner shadow-teal-900/20">
                    CA
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 px-2 py-2 space-y-8 overflow-y-auto">
            {Object.entries(groupedNavigation).map(([groupName, items]) => (
              <div key={groupName} className="space-y-1">
                {!isCollapsed && (
                  <h3 className="px-3 text-xs font-medium text-teal-200 uppercase tracking-wider mb-2 mt-2">
                    {groupName}
                  </h3>
                )}
                {items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center ${isCollapsed ? 'px-2 justify-center' : 'px-3'} py-2.5 
                      ${isCollapsed ? 'mx-1' : 'mx-1.5'} rounded-lg transition-all duration-200
                      ${isActive 
                        ? "bg-teal-600 text-white shadow-md shadow-teal-900/20"
                        : "text-teal-100 hover:bg-teal-600/30 hover:text-white"}`
                    }
                  >
                    <item.icon className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 flex-shrink-0`} />
                    
                    {!isCollapsed && (
                      <span className="text-sm font-medium flex-1">{item.name}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Book Service Button */}
          <div className="p-2 border-t border-teal-600/30">
            {!isCollapsed ? (
              <NavLink 
                to="/booking"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 border border-transparent rounded-lg shadow-sm transition-colors duration-200"
              >
                {t("Book a Service")}
              </NavLink>
            ) : (
              <NavLink 
                to="/booking"
                className="flex items-center justify-center w-full px-2 py-2 text-white bg-teal-600 hover:bg-teal-500 border border-transparent rounded-lg shadow-sm transition-colors duration-200"
              >
                <Calendar className="h-5 w-5" />
              </NavLink>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="p-2 border-t border-teal-600/30 mt-auto">
            <div className={`flex items-center justify-between px-3 py-2 mb-2 rounded-lg ${!isCollapsed ? "bg-teal-600/20" : ""}`}>
              {!isCollapsed && (
                <div className="flex items-center">
                  <div className="mr-3">
                    {renderUserAvatar("small")}
                  </div>
                  <div className="text-sm text-white">
                    <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                    <div className="text-xs text-teal-200 truncate max-w-[120px]">{user?.email}</div>
                  </div>
                </div>
              )}
              {isCollapsed && (
                <div className="mx-auto">
                  {renderUserAvatar("small")}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg
                       text-teal-100 bg-teal-600/20 hover:bg-teal-600/30 transition-colors duration-200"
              >
                {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                {!isCollapsed && <span className="ml-2 text-sm">{t("Collapse")}</span>}
              </button>
            
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg
                       text-teal-100 bg-teal-600/20 hover:bg-teal-600/30 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-5 w-5" />
                {!isCollapsed && (
                  <span className="ml-2 text-sm">
                    {isLoggingOut ? t("Logging out...") : t("Logout")}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Header */}
      <div className="md:hidden bg-teal-700 w-full fixed top-0 z-40 shadow-md">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 mr-3 rounded-full hover:bg-white/10 text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <img src="/logo-clean.png" alt="CleanConnect" className="h-7" />
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-1.5 rounded-full hover:bg-white/10 text-white"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-teal-700"></span>
              )}
            </button>
            {renderUserAvatar("small")}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-0 top-16 bottom-0 w-4/5 max-w-xs bg-white shadow-xl z-40 overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="mr-3">
                    {renderUserAvatar("large")}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">{user?.email}</div>
                  </div>
                </div>
                <NavLink 
                  to="/booking"
                  className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 border border-transparent rounded-lg shadow-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("Book a Service")}
                </NavLink>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="p-4 space-y-6 divide-y divide-gray-100">
                {Object.entries(groupedNavigation).map(([groupName, items]) => (
                  <div key={groupName} className="py-3 space-y-1 first:pt-0">
                    <h3 className="px-1 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {groupName}
                    </h3>
                    {items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-3 rounded-lg transition-all
                          ${isActive 
                            ? "bg-teal-50 text-teal-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"}`
                        }
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5 text-teal-600" />
                        <span>{item.name}</span>
                      </NavLink>
                    ))}
                  </div>
                ))}
                <div className="pt-4">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center px-3 py-3 rounded-lg
                             text-gray-700 hover:bg-gray-50 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-teal-600" />
                    {isLoggingOut ? t("Logging out...") : t("Logout")}
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Notifications Panel */}
        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed right-0 top-16 bottom-0 w-4/5 max-w-xs bg-white shadow-xl z-40 overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500">
                <h3 className="text-sm font-medium text-white">{t("Notifications")}</h3>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-teal-800">
                    {unreadCount} {t("new")}
                  </span>
                )}
              </div>
              
              <div className="max-h-full overflow-y-auto divide-y divide-gray-100">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <motion.div 
                      key={notification._id} 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-teal-50 border-l-4 border-teal-500' : ''} transition-colors`}
                    >
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">
                    <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                    {t("No notifications")}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className={`${isCollapsed ? 'md:pl-[4.5rem]' : 'md:pl-64'} flex flex-col flex-1 transition-all duration-200`}>
        {/* Fixed White Navbar */}
        <div className="sticky top-0 z-20 md:z-10">
          <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-6 transition-all">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 capitalize truncate">
                {getPageTitle()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Theme toggle */}
              <button
                type="button"
                className="p-1.5 text-gray-500 bg-gray-100 rounded-full hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                onClick={toggleTheme}
              >
                <span className="sr-only">Toggle theme</span>
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              
              {/* Message Link - Desktop only */}
              <NavLink
                to="/messages"
                className="hidden md:block p-1.5 text-gray-500 bg-gray-100 rounded-full hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <span className="sr-only">View messages</span>
                <MessageSquare className="w-5 h-5" />
              </NavLink>
              
              {/* Notification dropdown - Desktop only */}
              <div className="notification-menu-container relative hidden md:block">
                <button
                  type="button"
                  className="relative p-1.5 text-gray-500 bg-gray-100 rounded-full hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {/* Notification dropdown panel */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50"
                      role="menu" 
                      aria-orientation="vertical" 
                      aria-labelledby="notification-menu"
                    >
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500">
                        <h3 className="text-sm font-medium text-white">{t("Notifications")}</h3>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-teal-800">
                            {unreadCount} {t("new")}
                          </span>
                        )}
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto">
                        {notifications && notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notification) => (
                            <motion.div 
                              key={notification._id} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2 }}
                              className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-teal-50 border-l-4 border-teal-500' : ''} transition-colors`}
                            >
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </motion.div>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-sm text-gray-500 text-center">
                            <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                            {t("No notifications")}
                          </div>
                        )}
                      </div>
                      
                      <div className="py-1 border-t border-gray-100">
                        <NavLink
                          to="/notifications"
                          className="block px-4 py-2 text-sm text-teal-600 hover:bg-gray-100 transition-colors"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          {t("View all notifications")}
                        </NavLink>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Profile Menu */}
              <div className="profile-menu-container relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {renderUserAvatar("small")}
                  <span className="hidden md:block">{user?.firstName || "Profile"}</span>
                </button>
                
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white">
                      <div className="font-semibold">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-teal-100">{user?.email}</div>
                    </div>
                    
                    <NavLink 
                      to="/customer/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      {t("My Profile")}
                    </NavLink>
                    
                    <NavLink 
                      to="/customer/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      {t("Settings")}
                    </NavLink>
                    
                    <hr className="my-1 border-gray-200" />
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors disabled:opacity-50"
                    >
                      {isLoggingOut ? t("Logging out...") : t("Sign out")}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </header>
        </div>

        {/* Page Content with Padding for Mobile Header */}
        <div className="mt-16 md:mt-0">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-4 md:p-6 bg-white"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;