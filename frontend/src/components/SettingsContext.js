// src/contexts/SettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

// Create the context
const SettingsContext = createContext(null);

/**
 * Custom hook to use the settings context
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === null) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

/**
 * SettingsProvider component
 * Manages application settings throughout the app
 */
export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  
  // App theme settings
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('#4F46E5'); // Default indigo
  
  // Language settings
  const [language, setLanguage] = useState('en');
  
  // User preferences
  const [userPreferences, setUserPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
  });
  
  // Admin settings
  const [systemSettings, setSystemSettings] = useState(null);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user preferences from localStorage on mount
  useEffect(() => {
    // Theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', prefersDark);
    }
    
    // Language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    // Accent color
    const savedAccentColor = localStorage.getItem('accentColor');
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
      document.documentElement.style.setProperty('--accent-color', savedAccentColor);
    } else {
      document.documentElement.style.setProperty('--accent-color', '#4F46E5');
    }
    
    // User notification preferences
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        setUserPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Error parsing saved preferences:', e);
      }
    }
  }, []);

  // Load user-specific settings when user changes
  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  /**
   * Fetch user settings from the server
   */
  const fetchUserSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/users/settings');
      const settings = response.data.settings;
      
      // Update state with fetched settings
      setUserPreferences(prev => ({
        ...prev,
        ...settings.notifications
      }));
      
      // If admin, also fetch system settings
      if (user.role === 'admin') {
        fetchSystemSettings();
      }
    } catch (err) {
      console.error('Error fetching user settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch system settings (admin only)
   */
  const fetchSystemSettings = async () => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/admin/system-settings');
      setSystemSettings(response.data.settings);
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError(err.response?.data?.message || 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  /**
   * Change the application language
   * @param {string} newLanguage - Language code (e.g., 'en', 'de', 'fr')
   */
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // If using i18next, you'd also call i18n.changeLanguage(newLanguage) here
  };

  /**
   * Change the accent color
   * @param {string} newColor - Hex color code
   */
  const changeAccentColor = (newColor) => {
    setAccentColor(newColor);
    localStorage.setItem('accentColor', newColor);
    document.documentElement.style.setProperty('--accent-color', newColor);
  };

  /**
   * Update user notification preferences
   * @param {Object} updates - Updates to apply to preferences
   */
  const updateNotificationPreferences = async (updates) => {
    setLoading(true);
    setError(null);
    
    try {
      // Update on the server
      await api.put('/users/notification-preferences', updates);
      
      // Update local state
      const newPreferences = { ...userPreferences, ...updates };
      setUserPreferences(newPreferences);
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update system settings (admin only)
   * @param {Object} updates - Updates to apply to system settings
   */
  const updateSystemSettings = async (updates) => {
    if (!user || user.role !== 'admin') return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update on the server
      await api.put('/admin/system-settings', updates);
      
      // Update local state
      setSystemSettings(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Error updating system settings:', err);
      setError(err.response?.data?.message || 'Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  // Combine all settings-related values and functions
  const value = {
    theme,
    accentColor,
    language,
    userPreferences,
    systemSettings,
    loading,
    error,
    toggleTheme,
    changeLanguage,
    changeAccentColor,
    updateNotificationPreferences,
    updateSystemSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;