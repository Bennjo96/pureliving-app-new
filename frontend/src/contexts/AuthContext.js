import React, { createContext, useState, useEffect, useContext } from 'react';
import { userService, authService } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount or when dependencies change
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Check for admin token first - admin tokens take precedence
      const adminPersistentToken = localStorage.getItem('adminAuthToken');
      const adminSessionToken = sessionStorage.getItem('adminAuthToken');
      const adminToken = adminPersistentToken || adminSessionToken;
      
      // Check for regular user token
      const persistentToken = localStorage.getItem('authToken');
      const sessionToken = sessionStorage.getItem('authToken');
      const userToken = persistentToken || sessionToken;
      
      // Use admin token if available, otherwise use user token
      const token = adminToken || userToken;
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Use appropriate service method based on token type
        const isAdminToken = !!adminToken;
        const response = isAdminToken
          ? await userService.getAdminProfile()
          : await userService.getProfile();
        
        const fetchedUser = response.data.user;
        setUser(fetchedUser);
        setIsAuthenticated(true);
        
        // Wrap the role in an array if roles array is not provided
        const roles = fetchedUser.roles ? fetchedUser.roles : [fetchedUser.role];
        
        // Determine active role:
        // Check if an active role is already stored and valid
        const storedActiveRole = localStorage.getItem('activeRole');
        if (storedActiveRole && roles.includes(storedActiveRole)) {
          setActiveRole(storedActiveRole);
        } else {
          // Default to the first role in the roles array
          const defaultRole = roles[0];
          setActiveRole(defaultRole);
          localStorage.setItem('activeRole', defaultRole);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setUser(null);
        setIsAuthenticated(false);
        
        // Token is invalid or expired, clear it from storage
        if (adminPersistentToken) localStorage.removeItem('adminAuthToken');
        if (adminSessionToken) sessionStorage.removeItem('adminAuthToken');
        if (persistentToken) localStorage.removeItem('authToken');
        if (sessionToken) sessionStorage.removeItem('authToken');
        
        // Clear stored role information
        localStorage.removeItem('userRole');
        sessionStorage.removeItem('userRole');
        localStorage.removeItem('activeRole');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function with Remember Me support (and optional admin login)
  const login = async (email, password, rememberMe = false, options = {}) => {
    setLoading(true);
    
    try {
      // Check if this is an admin login
      const isAdmin = options.isAdmin || false;
      
      // Use the appropriate login endpoint
      const response = isAdmin 
        ? await authService.adminLogin({
            email, 
            password, 
            adminCode: options.adminCode
          })
        : await authService.login({ email, password });
      
      if (response.data && response.data.token) {
        const tokenKey = isAdmin ? 'adminAuthToken' : 'authToken';
        
        // Store token based on rememberMe preference
        if (rememberMe) {
          localStorage.setItem(tokenKey, response.data.token);
          sessionStorage.removeItem(tokenKey);
        } else {
          sessionStorage.setItem(tokenKey, response.data.token);
          localStorage.removeItem(tokenKey);
        }
        
        setUser(response.data.user);
        setIsAuthenticated(true);

        // Wrap role in an array if not provided
        const roles = response.data.user.roles ? response.data.user.roles : [response.data.user.role];

        // Determine active role on login: use the one provided via options if valid
        if (options.activeRole && roles.includes(options.activeRole)) {
          setActiveRole(options.activeRole);
          localStorage.setItem('activeRole', options.activeRole);
        } else {
          const defaultRole = roles[0];
          setActiveRole(defaultRole);
          localStorage.setItem('activeRole', defaultRole);
        }
        
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Invalid login response' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to log in. Please check your credentials.',
        response: error.response
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function - handles both admin and regular users
  const logout = async () => {
    try {
      const isAdmin = user?.roles
        ? user.roles.includes('admin')
        : user?.role === 'admin' ||
          localStorage.getItem('userRole') === 'admin' ||
          sessionStorage.getItem('userRole') === 'admin';
      
      if (isAdmin) {
        await authService.adminLogout();
      } else {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  // Clear authentication state and storage
  const clearAuth = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('adminAuthToken');
    sessionStorage.removeItem('adminAuthToken');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('userRole');
    localStorage.removeItem('activeRole');
    
    setUser(null);
    setIsAuthenticated(false);
    setActiveRole(null);
  };

  const value = {
    user,
    setUser,
    activeRole,
    setActiveRole,
    loading,
    isAuthenticated,
    login,
    logout,
    clearAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
