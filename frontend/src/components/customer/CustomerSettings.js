// src/components/customer/CustomerSettings.js
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Bell, Lock, Globe, Moon, Sun, ChevronRight } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const CustomerSettings = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useSettings();
  
  // State for notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  // Handle language change
  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="bg-white pb-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 mb-6 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-white">
          {t("Settings")}
        </h1>
        <p className="text-teal-100 mt-1">
          {t("Manage your account preferences")}
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Account Settings */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">
              {t("Account Security")}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="px-5 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-gray-100 mr-4">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t("Password")}</h3>
                    <p className="text-sm text-gray-500">{t("Change your account password")}</p>
                  </div>
                </div>
                <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center">
                  {t("Change")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Notification Settings */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">
              {t("Notifications")}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Email notifications */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 mr-4">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t("Email Notifications")}</h3>
                    <p className="text-sm text-gray-500">{t("Receive booking confirmations and reminders")}</p>
                  </div>
                </div>
                <div>
                  <button 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${emailNotifications ? 'bg-teal-600' : 'bg-gray-200'}`}
                    onClick={() => setEmailNotifications(!emailNotifications)}
                  >
                    <span 
                      className={`${emailNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {/* SMS notifications */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100 mr-4">
                    <Bell className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t("SMS Notifications")}</h3>
                    <p className="text-sm text-gray-500">{t("Receive text messages about your bookings")}</p>
                  </div>
                </div>
                <div>
                  <button 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${smsNotifications ? 'bg-teal-600' : 'bg-gray-200'}`}
                    onClick={() => setSmsNotifications(!smsNotifications)}
                  >
                    <span 
                      className={`${smsNotifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Appearance & Language Settings */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">
              {t("Preferences")}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Theme toggle */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100 mr-4">
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <Sun className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t("Theme")}</h3>
                    <p className="text-sm text-gray-500">
                      {theme === 'dark' ? t("Currently using dark theme") : t("Currently using light theme")}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4 mr-1.5" />
                      {t("Light Mode")}
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-1.5" />
                      {t("Dark Mode")}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Language selector */}
            <div className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100 mr-4">
                    <Globe className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{t("Language")}</h3>
                    <p className="text-sm text-gray-500">{t("Select your preferred language")}</p>
                  </div>
                </div>
                <select 
                  className="block pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  value={i18n.language}
                  onChange={changeLanguage}
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerSettings;