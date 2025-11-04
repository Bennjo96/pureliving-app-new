import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Bell,
  DollarSign,
  Menu,
  X,
  LogOut,
  BarChart,
  ChevronRight,
  ChevronLeft,
  Home,
  UserPlus
} from "lucide-react";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Updated navigation array with invitations added
  const navigation = [
    { 
      name: "Dashboard", 
      path: "/admin", 
      icon: LayoutDashboard,
      group: "Overview",
      exact: true
    },
    { 
      name: "Bookings", 
      path: "/admin/bookings", 
      icon: Calendar,
      group: "Management"
    },
    { 
      name: "Users", 
      path: "/admin/users", 
      icon: Users,
      group: "Management"
    },
    { 
      name: "Cleaners", 
      path: "/admin/cleaners", 
      icon: Users,
      group: "Management"
    },
    { 
      name: "Reports", 
      path: "/admin/analytics", 
      icon: BarChart,
      group: "Analytics"
    },
    { 
      name: "Payments", 
      path: "/admin/payments", 
      icon: DollarSign,
      group: "Analytics"
    },
    { 
      name: "Notifications", 
      path: "/admin/notifications", 
      icon: Bell,
      group: "System"
    },
    { 
      name: "Invitations", 
      path: "/admin/invitations", 
      icon: UserPlus,
      group: "System"
    },
    { 
      name: "Settings", 
      path: "/admin/settings", 
      icon: Settings,
      group: "System"
    }
  ];

  const groupedNavigation = navigation.reduce((acc, item) => {
    const group = item.group || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard';
    const path = location.pathname.split('/').pop();
    return path.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Sidebar animation
  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4.5rem" }
  };

  // Renders the user's avatar
  const renderUserAvatar = (size = "small") => {
    const sizeClasses = size === "small" ? "h-8 w-8" : "h-10 w-10";
    const textSizeClass = size === "small" ? "text-sm" : "text-lg";
    
    return (
      <div
        className={`${sizeClasses} rounded-full bg-teal-600/30 flex items-center justify-center text-white`}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user?.name || "Admin"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className={`${textSizeClass} font-medium`}>
            {user?.name?.charAt(0) || "A"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-gradient-to-b from-teal-700 to-teal-800 shadow-lg z-20"
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Logo Header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-teal-600/50 mb-2">
            <AnimatePresence mode="wait">
              {!isCollapsed ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <motion.img
                    src="/logo-clean.png"
                    alt="PureLiving"
                    className="h-8 transition-transform hover:scale-105"
                  />
                </motion.div>
              ) : (
                <div className="flex justify-center w-full">
                  <span className="flex h-9 w-9 rounded-lg bg-white/20 items-center justify-center text-white font-semibold shadow-inner shadow-teal-900/20">
                    PL
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Links - Added scrollbar-hide */}
          <nav className="flex-1 px-2 py-2 space-y-8 overflow-y-auto scrollbar-hide">
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
                    end={item.exact}
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
                      <span className="text-sm font-medium flex-1">
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-2 border-t border-teal-600/30 mt-auto">
            <div
              className={`flex items-center justify-between px-3 py-2 mb-2 rounded-lg ${
                !isCollapsed ? "bg-teal-600/20" : ""
              }`}
            >
              {!isCollapsed && (
                <div className="flex items-center">
                  <div className="mr-3">{renderUserAvatar("small")}</div>
                  <div className="text-sm text-white">
                    <div className="font-medium">{user?.name || "Admin"}</div>
                    <div className="text-xs text-teal-200 truncate max-w-[120px]">
                      {user?.email || "admin@example.com"}
                    </div>
                  </div>
                </div>
              )}
              {isCollapsed && (
                <div className="mx-auto">{renderUserAvatar("small")}</div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex-1 flex items-center justify-center px-3 py-2 rounded-lg
                  text-teal-100 bg-teal-600/20 hover:bg-teal-600/30 transition-colors duration-200"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
                {!isCollapsed && (
                  <span className="ml-2 text-sm">Collapse</span>
                )}
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
                    {isLoggingOut ? "Logging out..." : "Logout"}
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
            <div className="flex items-center">
              <img src="/logo-clean.png" alt="PureLiving" className="h-7" />
            </div>
          </div>
          <div className="flex items-center">{renderUserAvatar("small")}</div>
        </div>

        {/* Mobile Menu - Added scrollbar-hide */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-0 top-16 bottom-0 w-4/5 max-w-xs bg-white shadow-xl z-40 overflow-y-auto scrollbar-hide"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="mr-3">{renderUserAvatar("large")}</div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {user?.name || "Admin"}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {user?.email || "admin@example.com"}
                    </div>
                  </div>
                </div>
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
                        end={item.exact}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-3 rounded-lg transition-all
                          ${
                            isActive
                              ? "bg-teal-50 text-teal-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`
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
                  <NavLink
                    to="/"
                    className="flex items-center px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home className="mr-3 h-5 w-5 text-teal-600" />
                    <span>Back to Main Site</span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center px-3 py-3 rounded-lg mt-4
                              text-gray-700 hover:bg-gray-50 transition-colors
                              disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-red-600" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div
        className={`${
          isCollapsed ? "md:pl-[4.5rem]" : "md:pl-64"
        } flex flex-col flex-1 transition-all duration-200`}
      >
        {/* Fixed White Navbar */}
        <div className="sticky top-0 z-20 md:z-10">
          <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 md:px-6 transition-all">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 capitalize truncate">
                {getPageTitle()}
              </h1>
            </div>

            {/* Profile Menu */}
            <div className="profile-menu-container relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <div className="hidden md:block">{renderUserAvatar("small")}</div>
                <span className="hidden md:block">
                  {user?.name?.split(" ")[0] || "Admin"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <NavLink
                    to="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    My Profile
                  </NavLink>
                  <NavLink
                    to="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Settings
                  </NavLink>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </header>
        </div>

        {/* Page Content with Padding for Mobile Header - Added scrollbar-hide */}
        <div className="mt-16 md:mt-0">
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 p-4 md:p-6 bg-gray-50 scrollbar-hide"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;