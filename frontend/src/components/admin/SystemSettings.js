// frontend/src/components/admin/SystemSettings.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Globe,
  Lock,
  Bell,
  Save,
  RefreshCw,
  DollarSign,
  Users,
  Shield,
  Globe as Languages,
  Wrench as Tool,
  Code,
  ClipboardList,
  Activity,
  Mail,
  Database,
  ToggleRight as Toggles,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Server,
  Percent as PercentIcon,
  CheckCircle,
  Filter,
  EyeOff
} from "lucide-react";

// Try to import the admin service, but provide a fallback if it doesn't exist
let adminService = { getSystemSettings: null, updateSystemSettings: null };
let handleApiError = err => ({ message: err.message || "An error occurred" });

try {
  // Dynamic import attempt to prevent errors if the module doesn't exist
  const apiModule = require("../../api/api");
  if (apiModule) {
    adminService = apiModule.adminService || adminService;
    handleApiError = apiModule.handleApiError || handleApiError;
  }
} catch (error) {
  console.warn("Admin API service not available, using mock implementation");
}

// Default settings
function getDefaultSettings() {
  return {
    // General platform settings
    general: {
      appName: "Pure Living Cleaning",
      logo: "/logo.png",
      supportEmail: "support@pureliving.com",
      supportPhone: "+49 123 456789",
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      businessDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      termsOfServiceUrl: "/terms",
      privacyPolicyUrl: "/privacy"
    },
    
    // Booking system settings
    booking: {
      minBookingNotice: 24, // hours
      maxBookingAdvance: 60, // days
      maxBookingDuration: 8, // hours
      minBookingDuration: 2, // hours
      cancellationTimeFrame: 24, // hours
      cancellationFeePercentage: 50, // percent
      autoConfirmBookings: true,
      autoConfirmDelay: 12, // hours
      allowRecurringBookings: true,
      allowSameDayBookings: false
    },
    
    // Payment & financial settings
    payment: {
      platformCommission: 15, // percent
      payoutFrequency: "weekly", // weekly, biweekly, monthly
      vatRate: 19, // percent
      defaultCurrency: "EUR",
      defaultPaymentProvider: "stripe",
      minimumPayoutAmount: 50, // EUR
      lateFeePercentage: 5,
      paymentReminders: true,
      invoiceGeneration: "automatic"
    },
    
    // User management settings
    user: {
      accountDeletionRetention: 90, // days
      requireIdVerification: true,
      requirePhoneVerification: true,
      requireProfilePhoto: true,
      requiredProfileFields: ["name", "email", "phone", "address"],
      autoApproveCleaners: false,
      autoApproveCustomers: true,
      maximumActiveCleaners: 500
    },
    
    // Notification & alert settings
    notification: {
      enableEmailAlerts: true,
      enableSmsAlerts: true,
      enablePushNotifications: false,
      urgentAlertThreshold: 3,
      notifyAdminOnRegistration: true,
      notifyAdminOnCancellation: true,
      notifyAdminOnDispute: true,
      notifyAdminOnPaymentFailure: true,
      bookingReminderHours: 24
    },
    
    // Data privacy & GDPR settings
    privacy: {
      dataRetentionPeriod: 12, // months
      cookieConsentRequired: true,
      allowDataDownload: true,
      allowDataDeletion: true,
      automaticDataAnonymization: true,
      privacyContactEmail: "privacy@pureliving.com",
      thirdPartyDataSharing: false,
      dataProcessingAgreementUrl: "/dpa"
    },
    
    // Language & localization settings
    localization: {
      defaultLanguage: "de",
      availableLanguages: ["de", "en", "fr"],
      dateFormat: "DD.MM.YYYY",
      timeFormat: "24h",
      timezone: "Europe/Berlin",
      measurementSystem: "metric",
      currencyFormat: "€#.###,##"
    },
    
    // System maintenance settings
    maintenance: {
      maintenanceMode: false,
      scheduledMaintenance: null,
      maintenanceMessage: "We're currently performing maintenance. Please check back later.",
      allowAdminAccess: true,
      notifyUsersBeforeMaintenance: true,
      maintenanceNotificationHours: 24
    },
    
    // API & webhook settings
    api: {
      enablePublicApi: false,
      autoRotateApiKeys: true,
      apiKeyRotationDays: 90,
      webhookEndpoints: [],
      apiThrottleLimits: 100, // requests per minute
      enabledIntegrations: ["stripe", "google_calendar", "mailchimp"]
    },
    
    // Audit log settings
    audit: {
      enableAuditLogging: true,
      auditLogRetention: 12, // months
      logAdminActions: true,
      logUserActions: true,
      logPaymentEvents: true,
      logSystemEvents: true,
      exportAuditLogs: true
    },
    
    // System health settings
    health: {
      enableHealthMonitoring: true,
      alertOnHighLatency: true,
      latencyThreshold: 2000, // ms
      alertOnErrorRates: true,
      errorRateThreshold: 5, // percent
      enablePerformanceMetrics: true,
      monitorApiEndpoints: true
    },
    
    // Email template settings
    email: {
      customizeTemplates: true,
      emailSender: "Pure Living <no-reply@pureliving.com>",
      emailFooter: "© 2023 Pure Living GmbH",
      includeLogoInEmails: true,
      defaultTemplateLanguage: "de",
      enableHtmlEmails: true
    },
    
    // Backup settings
    backup: {
      enableAutoBackups: true,
      backupFrequency: "daily", // daily, weekly, monthly
      backupRetention: 30, // days
      allowManualBackups: true,
      backupEncryption: true,
      backupLocation: "cloud",
      alertOnBackupFailure: true
    },
    
    // Feature toggles
    features: {
      enableInstantBooking: true,
      enableRatingsAndReviews: true,
      enableDisputeManagement: true,
      enableCleanerRanking: true,
      enablePromoCode: true,
      enableReferralProgram: false,
      enableGiftCards: false,
      enableSubscriptionBookings: true
    }
  };
}

// Mock API service for development
const mockSettingsService = {
  getSystemSettings: async () => {
    console.log("Mock API: Getting system settings");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return null to simulate no settings saved yet
    return { data: null };
  },
  
  updateSystemSettings: async (settings) => {
    console.log("Mock API: Updating system settings", settings);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate success response
    return { success: true };
  }
};

// Form Field Component
const FormField = ({ label, type, value, checked, onChange, options, min, max, ...props }) => {
  const handleChange = (e) => {
    switch (type) {
      case "checkbox":
        onChange(e.target.checked);
        break;
      case "number":
        onChange(e.target.value);
        break;
      case "select":
        // For select fields, prevent null values
        onChange(e.target.value || '');
        break;
      default:
        onChange(e.target.value || '');
    }
  };

  // Ensure we have default values to prevent errors
  if (type === "checkbox" && checked === undefined) {
    checked = false;
  }
  
  if (value === undefined && type !== "checkbox") {
    value = type === "number" ? 0 : "";
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {type === "select" ? (
        <select
          value={value}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          {...props}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          rows={3}
          {...props}
        />
      ) : type === "checkbox" ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            {...props}
          />
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
          min={min}
          max={max}
          {...props}
        />
      )}
    </div>
  );
};

// Settings Section Component
const SettingsSection = ({ title, icon: Icon, children, onToggle, isExpanded }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div 
        className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <h2 className="font-medium text-gray-800 flex items-center">
          <Icon className="h-5 w-5 mr-2 text-teal-500" />
          {title}
        </h2>
        <button className="text-gray-400 hover:text-gray-600">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {isExpanded && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

// Main Component
const SystemSettings = () => {
  const [settings, setSettings] = useState(getDefaultSettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    booking: false,
    payment: false,
    user: false,
    notification: false,
    privacy: false,
    localization: false,
    maintenance: false,
    api: false,
    audit: false,
    health: false,
    email: false,
    backup: false,
    features: false
  });
  
  // Format date function for timestamp display
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

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      
      // Use the real service if available, otherwise use mock
      const apiService = adminService.getSystemSettings ? adminService : mockSettingsService;
      
      const response = await apiService.getSystemSettings();
      
      if (response && response.data) {
        // Merge the API response with default settings to ensure all properties exist
        const defaultSettings = getDefaultSettings();
        const mergedSettings = {};
        
        // Loop through all categories in default settings
        Object.keys(defaultSettings).forEach(category => {
          // Initialize the category if it doesn't exist in response data
          mergedSettings[category] = {
            ...defaultSettings[category], // Start with defaults
            ...(response.data[category] || {}) // Override with API data if available
          };
        });
        
        setSettings(mergedSettings);
      } else {
        setSettings(getDefaultSettings());
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setSettings(getDefaultSettings());
      setError("Error fetching settings: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // Use the real service if available, otherwise use mock
      const apiService = adminService.updateSystemSettings ? adminService : mockSettingsService;
      
      await apiService.updateSystemSettings(settings);
      
      setSaveMessage("Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Error saving settings: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value,
      },
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Navigation for different settings sections
  const settingSections = [
    { id: "general", label: "General Platform", icon: Globe },
    { id: "booking", label: "Booking System", icon: Calendar },
    { id: "payment", label: "Payment & Financial", icon: DollarSign },
    { id: "user", label: "User Management", icon: Users },
    { id: "notification", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Data Privacy & GDPR", icon: Shield },
    { id: "localization", label: "Language & Localization", icon: Languages },
    { id: "maintenance", label: "System Maintenance", icon: Tool },
    { id: "api", label: "API & Webhooks", icon: Code },
    { id: "audit", label: "Audit Logging", icon: ClipboardList },
    { id: "health", label: "System Health", icon: Activity },
    { id: "email", label: "Email Templates", icon: Mail },
    { id: "backup", label: "Backup Controls", icon: Database },
    { id: "features", label: "Feature Toggles", icon: Toggles }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <RefreshCw className="animate-spin text-teal-500" size={32} />
        <p className="mt-2 text-gray-600">Loading system settings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-sm">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">
              Error Loading Settings
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={fetchSystemSettings}
              className="mt-3 text-red-700 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200 inline-flex items-center"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* Header */}
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
            <Settings className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">System Settings</h1>
              <p className="text-teal-100 mt-1">
                Configure platform-wide settings and preferences
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-white text-teal-600 hover:bg-teal-50 focus:outline-none disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6"
        >
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p>{saveMessage}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-4">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-medium text-gray-800">Settings Categories</h2>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                {settingSections.map((section) => (
                  <li key={section.id}>
                    <button
                      className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === section.id
                          ? "bg-teal-50 text-teal-600"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setActiveSection(section.id);
                        toggleSection(section.id);
                      }}
                    >
                      <section.icon
                        className={`h-4 w-4 mr-2 ${
                          activeSection === section.id
                            ? "text-teal-500"
                            : "text-gray-500"
                        }`}
                      />
                      <span>{section.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </motion.div>

        {/* Settings Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          <div className="space-y-6">
            {/* General Platform Settings */}
            {expandedSections.general && (
              <SettingsSection
                title="General Platform Settings"
                icon={Globe}
                onToggle={() => toggleSection("general")}
                isExpanded={expandedSections.general}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Platform Name"
                      type="text"
                      value={settings.general?.appName || ""}
                      onChange={(value) => handleSettingChange("general", "appName", value)}
                    />
                    <FormField
                      label="Support Email"
                      type="email"
                      value={settings.general?.supportEmail || ""}
                      onChange={(value) => handleSettingChange("general", "supportEmail", value)}
                    />
                    <FormField
                      label="Support Phone"
                      type="tel"
                      value={settings.general?.supportPhone || ""}
                      onChange={(value) => handleSettingChange("general", "supportPhone", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        label="Business Hours Start"
                        type="time"
                        value={settings.general?.businessHoursStart || "09:00"}
                        onChange={(value) => handleSettingChange("general", "businessHoursStart", value)}
                      />
                      <FormField
                        label="Business Hours End"
                        type="time"
                        value={settings.general?.businessHoursEnd || "18:00"}
                        onChange={(value) => handleSettingChange("general", "businessHoursEnd", value)}
                      />
                    </div>
                    <FormField
                      label="Terms of Service URL"
                      type="text"
                      value={settings.general?.termsOfServiceUrl || ""}
                      onChange={(value) => handleSettingChange("general", "termsOfServiceUrl", value)}
                    />
                    <FormField
                      label="Privacy Policy URL"
                      type="text"
                      value={settings.general?.privacyPolicyUrl || ""}
                      onChange={(value) => handleSettingChange("general", "privacyPolicyUrl", value)}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Booking System Settings */}
            {expandedSections.booking && (
              <SettingsSection
                title="Booking System Settings"
                icon={Calendar}
                onToggle={() => toggleSection("booking")}
                isExpanded={expandedSections.booking}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Minimum Booking Notice (hours)"
                      type="number"
                      value={settings.booking?.minBookingNotice || 0}
                      onChange={(value) => handleSettingChange("booking", "minBookingNotice", parseInt(value))}
                      min={0}
                    />
                    <FormField
                      label="Maximum Booking in Advance (days)"
                      type="number"
                      value={settings.booking?.maxBookingAdvance || 1}
                      onChange={(value) => handleSettingChange("booking", "maxBookingAdvance", parseInt(value))}
                      min={1}
                    />
                    <FormField
                      label="Maximum Booking Duration (hours)"
                      type="number"
                      value={settings.booking?.maxBookingDuration || 1}
                      onChange={(value) => handleSettingChange("booking", "maxBookingDuration", parseInt(value))}
                      min={1}
                    />
                    <FormField
                      label="Minimum Booking Duration (hours)"
                      type="number"
                      value={settings.booking?.minBookingDuration || 1}
                      onChange={(value) => handleSettingChange("booking", "minBookingDuration", parseInt(value))}
                      min={1}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Cancellation Time Frame (hours)"
                      type="number"
                      value={settings.booking?.cancellationTimeFrame || 0}
                      onChange={(value) => handleSettingChange("booking", "cancellationTimeFrame", parseInt(value))}
                      min={0}
                    />
                    <FormField
                      label="Cancellation Fee Percentage (%)"
                      type="number"
                      value={settings.booking?.cancellationFeePercentage || 0}
                      onChange={(value) => handleSettingChange("booking", "cancellationFeePercentage", parseInt(value))}
                      min={0}
                      max={100}
                    />
                    <FormField
                      label="Booking Confirmation Rules"
                      type="select"
                      value={settings.booking?.autoConfirmDelay || 12}
                      onChange={(value) => handleSettingChange("booking", "autoConfirmDelay", parseInt(value))}
                      options={[
                        { value: 0, label: "Immediate" },
                        { value: 1, label: "After 1 hour" },
                        { value: 6, label: "After 6 hours" },
                        { value: 12, label: "After 12 hours" },
                        { value: 24, label: "After 24 hours" }
                      ]}
                    />
                    <FormField
                      label="Allow Same-Day Bookings"
                      type="checkbox"
                      checked={settings.booking?.allowSameDayBookings || false}
                      onChange={(value) => handleSettingChange("booking", "allowSameDayBookings", value)}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Payment & Financial Settings */}
            {expandedSections.payment && (
              <SettingsSection
                title="Payment & Financial Settings"
                icon={DollarSign}
                onToggle={() => toggleSection("payment")}
                isExpanded={expandedSections.payment}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Platform Commission (%)"
                      type="number"
                      value={settings.payment?.platformCommission || 0}
                      onChange={(value) => handleSettingChange("payment", "platformCommission", parseFloat(value))}
                      min={0}
                      max={100}
                    />
                    <FormField
                      label="Payout Frequency"
                      type="select"
                      value={settings.payment?.payoutFrequency || "weekly"}
                      onChange={(value) => handleSettingChange("payment", "payoutFrequency", value)}
                      options={[
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "biweekly", label: "Bi-Weekly" },
                        { value: "monthly", label: "Monthly" }
                      ]}
                    />
                    <FormField
                      label="VAT Rate (%)"
                      type="number"
                      value={settings.payment?.vatRate || 0}
                      onChange={(value) => handleSettingChange("payment", "vatRate", parseFloat(value))}
                      min={0}
                      max={100}
                    />
                    <FormField
                      label="Default Currency"
                      type="select"
                      value={settings.payment?.defaultCurrency || "EUR"}
                      onChange={(value) => handleSettingChange("payment", "defaultCurrency", value)}
                      options={[
                        { value: "EUR", label: "Euro (€)" },
                        { value: "USD", label: "US Dollar ($)" },
                        { value: "GBP", label: "British Pound (£)" },
                        { value: "CHF", label: "Swiss Franc (CHF)" }
                      ]}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Default Payment Provider"
                      type="select"
                      value={settings.payment?.defaultPaymentProvider || "stripe"}
                      onChange={(value) => handleSettingChange("payment", "defaultPaymentProvider", value)}
                      options={[
                        { value: "stripe", label: "Stripe" },
                        { value: "paypal", label: "PayPal" },
                        { value: "adyen", label: "Adyen" },
                        { value: "bank_transfer", label: "Bank Transfer" }
                      ]}
                    />
                    <FormField
                      label="Minimum Payout Amount (EUR)"
                      type="number"
                      value={settings.payment?.minimumPayoutAmount || 0}
                      onChange={(value) => handleSettingChange("payment", "minimumPayoutAmount", parseFloat(value))}
                      min={0}
                    />
                    <FormField
                      label="Late Fee Percentage (%)"
                      type="number"
                      value={settings.payment?.lateFeePercentage || 0}
                      onChange={(value) => handleSettingChange("payment", "lateFeePercentage", parseFloat(value))}
                      min={0}
                      max={100}
                    />
                    <FormField
                      label="Invoice Generation"
                      type="select"
                      value={settings.payment?.invoiceGeneration || "automatic"}
                      onChange={(value) => handleSettingChange("payment", "invoiceGeneration", value)}
                      options={[
                        { value: "automatic", label: "Automatic" },
                        { value: "manual", label: "Manual" },
                        { value: "on_demand", label: "On Demand" }
                      ]}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* User Management Settings */}
            {expandedSections.user && (
              <SettingsSection
                title="User Management Settings"
                icon={Users}
                onToggle={() => toggleSection("user")}
                isExpanded={expandedSections.user}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Account Deletion Retention (days)"
                      type="number"
                      value={settings.user?.accountDeletionRetention || 0}
                      onChange={(value) => handleSettingChange("user", "accountDeletionRetention", parseInt(value))}
                      min={0}
                    />
                    <FormField
                      label="Require ID Verification"
                      type="checkbox"
                      checked={settings.user?.requireIdVerification || false}
                      onChange={(value) => handleSettingChange("user", "requireIdVerification", value)}
                    />
                    <FormField
                      label="Require Phone Verification"
                      type="checkbox"
                      checked={settings.user?.requirePhoneVerification || false}
                      onChange={(value) => handleSettingChange("user", "requirePhoneVerification", value)}
                    />
                    <FormField
                      label="Require Profile Photo"
                      type="checkbox"
                      checked={settings.user?.requireProfilePhoto || false}
                      onChange={(value) => handleSettingChange("user", "requireProfilePhoto", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Auto-Approve Cleaners"
                      type="checkbox"
                      checked={settings.user?.autoApproveCleaners || false}
                      onChange={(value) => handleSettingChange("user", "autoApproveCleaners", value)}
                    />
                    <FormField
                      label="Auto-Approve Customers"
                      type="checkbox"
                      checked={settings.user?.autoApproveCustomers || false}
                      onChange={(value) => handleSettingChange("user", "autoApproveCustomers", value)}
                    />
                    <FormField
                      label="Maximum Active Cleaners"
                      type="number"
                      value={settings.user?.maximumActiveCleaners || 0}
                      onChange={(value) => handleSettingChange("user", "maximumActiveCleaners", parseInt(value))}
                      min={1}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Notification Settings */}
            {expandedSections.notification && (
              <SettingsSection
                title="Notification Settings"
                icon={Bell}
                onToggle={() => toggleSection("notification")}
                isExpanded={expandedSections.notification}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Enable Email Alerts"
                      type="checkbox"
                      checked={settings.notification?.enableEmailAlerts || false}
                      onChange={(value) => handleSettingChange("notification", "enableEmailAlerts", value)}
                    />
                    <FormField
                      label="Enable SMS Alerts"
                      type="checkbox"
                      checked={settings.notification?.enableSmsAlerts || false}
                      onChange={(value) => handleSettingChange("notification", "enableSmsAlerts", value)}
                    />
                    <FormField
                      label="Enable Push Notifications"
                      type="checkbox"
                      checked={settings.notification?.enablePushNotifications || false}
                      onChange={(value) => handleSettingChange("notification", "enablePushNotifications", value)}
                    />
                    <FormField
                      label="Urgent Alert Threshold"
                      type="number"
                      value={settings.notification?.urgentAlertThreshold || 0}
                      onChange={(value) => handleSettingChange("notification", "urgentAlertThreshold", parseInt(value))}
                      min={1}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Notify Admin on New Registration"
                      type="checkbox"
                      checked={settings.notification?.notifyAdminOnRegistration || false}
                      onChange={(value) => handleSettingChange("notification", "notifyAdminOnRegistration", value)}
                    />
                    <FormField
                      label="Notify Admin on Booking Cancellation"
                      type="checkbox"
                      checked={settings.notification?.notifyAdminOnCancellation || false}
                      onChange={(value) => handleSettingChange("notification", "notifyAdminOnCancellation", value)}
                    />
                    <FormField
                      label="Notify Admin on Dispute"
                      type="checkbox"
                      checked={settings.notification?.notifyAdminOnDispute || false}
                      onChange={(value) => handleSettingChange("notification", "notifyAdminOnDispute", value)}
                    />
                    <FormField
                      label="Booking Reminder Hours"
                      type="number"
                      value={settings.notification?.bookingReminderHours || 0}
                      onChange={(value) => handleSettingChange("notification", "bookingReminderHours", parseInt(value))}
                      min={1}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Data Privacy & GDPR Settings */}
            {expandedSections.privacy && (
              <SettingsSection
                title="Data Privacy & GDPR Settings"
                icon={Shield}
                onToggle={() => toggleSection("privacy")}
                isExpanded={expandedSections.privacy}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Data Retention Period (months)"
                      type="number"
                      value={settings.privacy?.dataRetentionPeriod || 0}
                      onChange={(value) => handleSettingChange("privacy", "dataRetentionPeriod", parseInt(value))}
                      min={1}
                    />
                    <FormField
                      label="Cookie Consent Required"
                      type="checkbox"
                      checked={settings.privacy?.cookieConsentRequired || false}
                      onChange={(value) => handleSettingChange("privacy", "cookieConsentRequired", value)}
                    />
                    <FormField
                      label="Allow Data Download"
                      type="checkbox"
                      checked={settings.privacy?.allowDataDownload || false}
                      onChange={(value) => handleSettingChange("privacy", "allowDataDownload", value)}
                    />
                    <FormField
                      label="Allow Data Deletion"
                      type="checkbox"
                      checked={settings.privacy?.allowDataDeletion || false}
                      onChange={(value) => handleSettingChange("privacy", "allowDataDeletion", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Automatic Data Anonymization"
                      type="checkbox"
                      checked={settings.privacy?.automaticDataAnonymization || false}
                      onChange={(value) => handleSettingChange("privacy", "automaticDataAnonymization", value)}
                    />
                    <FormField
                      label="Privacy Contact Email"
                      type="email"
                      value={settings.privacy?.privacyContactEmail || ""}
                      onChange={(value) => handleSettingChange("privacy", "privacyContactEmail", value)}
                    />
                    <FormField
                      label="Third Party Data Sharing"
                      type="checkbox"
                      checked={settings.privacy?.thirdPartyDataSharing || false}
                      onChange={(value) => handleSettingChange("privacy", "thirdPartyDataSharing", value)}
                    />
                    <FormField
                      label="Data Processing Agreement URL"
                      type="text"
                      value={settings.privacy?.dataProcessingAgreementUrl || ""}
                      onChange={(value) => handleSettingChange("privacy", "dataProcessingAgreementUrl", value)}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Language & Localization Settings */}
            {expandedSections.localization && (
              <SettingsSection
                title="Language & Localization Settings"
                icon={Languages}
                onToggle={() => toggleSection("localization")}
                isExpanded={expandedSections.localization}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Default Language"
                      type="select"
                      value={settings.localization?.defaultLanguage || "en"}
                      onChange={(value) => handleSettingChange("localization", "defaultLanguage", value)}
                      options={[
                        { value: "de", label: "German" },
                        { value: "en", label: "English" },
                        { value: "fr", label: "French" },
                        { value: "es", label: "Spanish" }
                      ]}
                    />
                    <FormField
                      label="Date Format"
                      type="select"
                      value={settings.localization?.dateFormat || "DD.MM.YYYY"}
                      onChange={(value) => handleSettingChange("localization", "dateFormat", value)}
                      options={[
                        { value: "DD.MM.YYYY", label: "DD.MM.YYYY (European)" },
                        { value: "MM/DD/YYYY", label: "MM/DD/YYYY (US)" },
                        { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" }
                      ]}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Time Format"
                      type="select"
                      value={settings.localization?.timeFormat || "24h"}
                      onChange={(value) => handleSettingChange("localization", "timeFormat", value)}
                      options={[
                        { value: "24h", label: "24-hour (14:30)" },
                        { value: "12h", label: "12-hour (2:30 PM)" }
                      ]}
                    />
                    <FormField
                      label="Timezone"
                      type="select"
                      value={settings.localization?.timezone || "Europe/Berlin"}
                      onChange={(value) => handleSettingChange("localization", "timezone", value)}
                      options={[
                        { value: "Europe/Berlin", label: "Europe/Berlin" },
                        { value: "Europe/London", label: "Europe/London" },
                        { value: "America/New_York", label: "America/New_York" },
                        { value: "Asia/Tokyo", label: "Asia/Tokyo" }
                      ]}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* System Maintenance Settings */}
            {expandedSections.maintenance && (
              <SettingsSection
                title="System Maintenance Settings"
                icon={Tool}
                onToggle={() => toggleSection("maintenance")}
                isExpanded={expandedSections.maintenance}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Maintenance Mode"
                      type="checkbox"
                      checked={settings.maintenance?.maintenanceMode || false}
                      onChange={(value) => handleSettingChange("maintenance", "maintenanceMode", value)}
                    />
                    <FormField
                      label="Maintenance Message"
                      type="textarea"
                      value={settings.maintenance?.maintenanceMessage || ""}
                      onChange={(value) => handleSettingChange("maintenance", "maintenanceMessage", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Allow Admin Access During Maintenance"
                      type="checkbox"
                      checked={settings.maintenance?.allowAdminAccess || false}
                      onChange={(value) => handleSettingChange("maintenance", "allowAdminAccess", value)}
                    />
                    <FormField
                      label="Notify Users Before Maintenance"
                      type="checkbox"
                      checked={settings.maintenance?.notifyUsersBeforeMaintenance || false}
                      onChange={(value) => handleSettingChange("maintenance", "notifyUsersBeforeMaintenance", value)}
                    />
                    <FormField
                      label="Maintenance Notification Hours"
                      type="number"
                      value={settings.maintenance?.maintenanceNotificationHours || 0}
                      onChange={(value) => handleSettingChange("maintenance", "maintenanceNotificationHours", parseInt(value))}
                      min={1}
                    />
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* API & Webhook Settings */}
            {expandedSections.api && (
              <SettingsSection
                title="API & Webhook Settings"
                icon={Code}
                onToggle={() => toggleSection("api")}
                isExpanded={expandedSections.api}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Enable Public API"
                      type="checkbox"
                      checked={settings.api?.enablePublicApi || false}
                      onChange={(value) => handleSettingChange("api", "enablePublicApi", value)}
                    />
                    <FormField
                      label="Auto-Rotate API Keys"
                      type="checkbox"
                      checked={settings.api?.autoRotateApiKeys || false}
                      onChange={(value) => handleSettingChange("api", "autoRotateApiKeys", value)}
                    />
                    <FormField
                      label="API Key Rotation Days"
                      type="number"
                      value={settings.api?.apiKeyRotationDays || 0}
                      onChange={(value) => handleSettingChange("api", "apiKeyRotationDays", parseInt(value))}
                      min={1}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="API Throttle Limit (requests per minute)"
                      type="number"
                      value={settings.api?.apiThrottleLimits || 0}
                      onChange={(value) => handleSettingChange("api", "apiThrottleLimits", parseInt(value))}
                      min={1}
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Enabled Integrations</label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={settings.api?.enabledIntegrations?.includes("stripe") || false}
                            onChange={(e) => {
                              const currentIntegrations = settings.api?.enabledIntegrations || [];
                              const newIntegrations = e.target.checked 
                                ? [...currentIntegrations, "stripe"]
                                : currentIntegrations.filter(i => i !== "stripe");
                              handleSettingChange("api", "enabledIntegrations", newIntegrations);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-gray-700">Stripe</span>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={settings.api?.enabledIntegrations?.includes("google_calendar") || false}
                            onChange={(e) => {
                              const currentIntegrations = settings.api?.enabledIntegrations || [];
                              const newIntegrations = e.target.checked 
                                ? [...currentIntegrations, "google_calendar"]
                                : currentIntegrations.filter(i => i !== "google_calendar");
                              handleSettingChange("api", "enabledIntegrations", newIntegrations);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-gray-700">Google Calendar</span>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={settings.api?.enabledIntegrations?.includes("mailchimp") || false}
                            onChange={(e) => {
                              const currentIntegrations = settings.api?.enabledIntegrations || [];
                              const newIntegrations = e.target.checked 
                                ? [...currentIntegrations, "mailchimp"]
                                : currentIntegrations.filter(i => i !== "mailchimp");
                              handleSettingChange("api", "enabledIntegrations", newIntegrations);
                            }}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-gray-700">Mailchimp</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Audit Log Settings */}
            {expandedSections.audit && (
              <SettingsSection
                title="Audit Log Settings"
                icon={ClipboardList}
                onToggle={() => toggleSection("audit")}
                isExpanded={expandedSections.audit}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Enable Audit Logging"
                      type="checkbox"
                      checked={settings.audit?.enableAuditLogging || false}
                      onChange={(value) => handleSettingChange("audit", "enableAuditLogging", value)}
                    />
                    <FormField
                      label="Audit Log Retention (months)"
                      type="number"
                      value={settings.audit?.auditLogRetention || 0}
                      onChange={(value) => handleSettingChange("audit", "auditLogRetention", parseInt(value))}
                      min={1}
                    />
                    <FormField
                      label="Log Admin Actions"
                      type="checkbox"
                      checked={settings.audit?.logAdminActions || false}
                      onChange={(value) => handleSettingChange("audit", "logAdminActions", value)}
                    />
                    <FormField
                      label="Log User Actions"
                      type="checkbox"
                      checked={settings.audit?.logUserActions || false}
                      onChange={(value) => handleSettingChange("audit", "logUserActions", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Log Payment Events"
                      type="checkbox"
                      checked={settings.audit?.logPaymentEvents || false}
                      onChange={(value) => handleSettingChange("audit", "logPaymentEvents", value)}
                    />
                    <FormField
                      label="Log System Events"
                      type="checkbox"
                      checked={settings.audit?.logSystemEvents || false}
                      onChange={(value) => handleSettingChange("audit", "logSystemEvents", value)}
                    />
                    <FormField
                      label="Allow Audit Log Export"
                      type="checkbox"
                      checked={settings.audit?.exportAuditLogs || false}
                      onChange={(value) => handleSettingChange("audit", "exportAuditLogs", value)}
                    />
                    <div className="mt-4">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export Audit Logs
                      </button>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* System Health Settings */}
            {expandedSections.health && (
              <SettingsSection
                title="System Health Monitoring"
                icon={Activity}
                onToggle={() => toggleSection("health")}
                isExpanded={expandedSections.health}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Enable Health Monitoring"
                      type="checkbox"
                      checked={settings.health?.enableHealthMonitoring || false}
                      onChange={(value) => handleSettingChange("health", "enableHealthMonitoring", value)}
                    />
                    <FormField
                      label="Alert on High Latency"
                      type="checkbox"
                      checked={settings.health?.alertOnHighLatency || false}
                      onChange={(value) => handleSettingChange("health", "alertOnHighLatency", value)}
                    />
                    <FormField
                      label="Latency Threshold (ms)"
                      type="number"
                      value={settings.health?.latencyThreshold || 0}
                      onChange={(value) => handleSettingChange("health", "latencyThreshold", parseInt(value))}
                      min={100}
                    />
                    <FormField
                      label="Alert on Error Rates"
                      type="checkbox"
                      checked={settings.health?.alertOnErrorRates || false}
                      onChange={(value) => handleSettingChange("health", "alertOnErrorRates", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Error Rate Threshold (%)"
                      type="number"
                      value={settings.health?.errorRateThreshold || 0}
                      onChange={(value) => handleSettingChange("health", "errorRateThreshold", parseInt(value))}
                      min={1}
                      max={100}
                    />
                    <FormField
                      label="Enable Performance Metrics"
                      type="checkbox"
                      checked={settings.health?.enablePerformanceMetrics || false}
                      onChange={(value) => handleSettingChange("health", "enablePerformanceMetrics", value)}
                    />
                    <FormField
                      label="Monitor API Endpoints"
                      type="checkbox"
                      checked={settings.health?.monitorApiEndpoints || false}
                      onChange={(value) => handleSettingChange("health", "monitorApiEndpoints", value)}
                    />
                    <div className="mt-4">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <Server className="mr-2 h-4 w-4" />
                        View System Status
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Current System Status Overview */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-base font-medium mb-3">Current System Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">API Response Time</span>
                        <span className="text-sm font-medium text-green-600">120ms</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Error Rate</span>
                        <span className="text-sm font-medium text-green-600">0.2%</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '2%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">System Load</span>
                        <span className="text-sm font-medium text-yellow-600">62%</span>
                      </div>
                      <div className="mt-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-yellow-500 rounded-full" style={{ width: '62%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Email Templates Settings */}
            {expandedSections.email && (
              <SettingsSection
                title="Email Templates Settings"
                icon={Mail}
                onToggle={() => toggleSection("email")}
                isExpanded={expandedSections.email}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Customize Email Templates"
                      type="checkbox"
                      checked={settings.email?.customizeTemplates || false}
                      onChange={(value) => handleSettingChange("email", "customizeTemplates", value)}
                    />
                    <FormField
                      label="Email Sender Address"
                      type="text"
                      value={settings.email?.emailSender || ""}
                      onChange={(value) => handleSettingChange("email", "emailSender", value)}
                    />
                    <FormField
                      label="Email Footer Text"
                      type="text"
                      value={settings.email?.emailFooter || ""}
                      onChange={(value) => handleSettingChange("email", "emailFooter", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Include Logo in Emails"
                      type="checkbox"
                      checked={settings.email?.includeLogoInEmails || false}
                      onChange={(value) => handleSettingChange("email", "includeLogoInEmails", value)}
                    />
                    <FormField
                      label="Default Template Language"
                      type="select"
                      value={settings.email?.defaultTemplateLanguage || "en"}
                      onChange={(value) => handleSettingChange("email", "defaultTemplateLanguage", value)}
                      options={[
                        { value: "de", label: "German" },
                        { value: "en", label: "English" },
                        { value: "fr", label: "French" },
                        { value: "es", label: "Spanish" }
                      ]}
                    />
                    <FormField
                      label="Enable HTML Emails"
                      type="checkbox"
                      checked={settings.email?.enableHtmlEmails || false}
                      onChange={(value) => handleSettingChange("email", "enableHtmlEmails", value)}
                    />
                  </div>
                </div>
                
                {/* Email Template List */}
                <div className="mt-6">
                  <h3 className="text-base font-medium mb-3">Available Email Templates</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      <li className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium">Booking Confirmation</h4>
                          <p className="text-sm text-gray-500">Sent when a booking is confirmed</p>
                        </div>
                        <button className="text-teal-600 hover:text-teal-800 text-sm">
                          Edit Template
                        </button>
                      </li>
                      <li className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium">Booking Reminder</h4>
                          <p className="text-sm text-gray-500">Sent 24 hours before scheduled cleaning</p>
                        </div>
                        <button className="text-teal-600 hover:text-teal-800 text-sm">
                          Edit Template
                        </button>
                      </li>
                      <li className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium">Cancellation Notice</h4>
                          <p className="text-sm text-gray-500">Sent when a booking is cancelled</p>
                        </div>
                        <button className="text-teal-600 hover:text-teal-800 text-sm">
                          Edit Template
                        </button>
                      </li>
                      <li className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div>
                          <h4 className="font-medium">Payment Receipt</h4>
                          <p className="text-sm text-gray-500">Sent after a successful payment</p>
                        </div>
                        <button className="text-teal-600 hover:text-teal-800 text-sm">
                          Edit Template
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Backup Controls */}
            {expandedSections.backup && (
              <SettingsSection
                title="Backup Controls"
                icon={Database}
                onToggle={() => toggleSection("backup")}
                isExpanded={expandedSections.backup}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      label="Enable Automatic Backups"
                      type="checkbox"
                      checked={settings.backup?.enableAutoBackups || false}
                      onChange={(value) => handleSettingChange("backup", "enableAutoBackups", value)}
                    />
                    <FormField
                      label="Backup Frequency"
                      type="select"
                      value={settings.backup?.backupFrequency || "daily"}
                      onChange={(value) => handleSettingChange("backup", "backupFrequency", value)}
                      options={[
                        { value: "hourly", label: "Hourly" },
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" }
                      ]}
                    />
                    <FormField
                      label="Backup Retention (days)"
                      type="number"
                      value={settings.backup?.backupRetention || 0}
                      onChange={(value) => handleSettingChange("backup", "backupRetention", parseInt(value))}
                      min={1}
                    />
                    <FormField
                      label="Allow Manual Backups"
                      type="checkbox"
                      checked={settings.backup?.allowManualBackups || false}
                      onChange={(value) => handleSettingChange("backup", "allowManualBackups", value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      label="Backup Encryption"
                      type="checkbox"
                      checked={settings.backup?.backupEncryption || false}
                      onChange={(value) => handleSettingChange("backup", "backupEncryption", value)}
                    />
                    <FormField
                      label="Backup Storage Location"
                      type="select"
                      value={settings.backup?.backupLocation || "cloud"}
                      onChange={(value) => handleSettingChange("backup", "backupLocation", value)}
                      options={[
                        { value: "local", label: "Local Server" },
                        { value: "cloud", label: "Cloud Storage" },
                        { value: "hybrid", label: "Hybrid (Local + Cloud)" }
                      ]}
                    />
                    <FormField
                      label="Alert on Backup Failure"
                      type="checkbox"
                      checked={settings.backup?.alertOnBackupFailure || false}
                      onChange={(value) => handleSettingChange("backup", "alertOnBackupFailure", value)}
                    />
                    <div className="mt-4">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none"
                      >
                        <Database className="mr-2 h-4 w-4" />
                        Create Manual Backup
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Recent Backups */}
                <div className="mt-6">
                  <h3 className="text-base font-medium mb-3">Recent Backups</h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-11-20 12:00:00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            256 MB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Automated
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-teal-600 hover:text-teal-900">
                              Restore
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-11-19 12:00:00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            248 MB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Automated
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-teal-600 hover:text-teal-900">
                              Restore
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            2023-11-18 12:00:00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            252 MB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Manual
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-teal-600 hover:text-teal-900">
                              Restore
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </SettingsSection>
            )}

            {/* Feature Toggles */}
            {expandedSections.features && (
              <SettingsSection
                title="Feature Toggles"
                icon={Toggles}
                onToggle={() => toggleSection("features")}
                isExpanded={expandedSections.features}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  <FormField
                    label="Enable Instant Booking"
                    type="checkbox"
                    checked={settings.features?.enableInstantBooking || false}
                    onChange={(value) => handleSettingChange("features", "enableInstantBooking", value)}
                  />
                  <FormField
                    label="Enable Ratings and Reviews"
                    type="checkbox"
                    checked={settings.features?.enableRatingsAndReviews || false}
                    onChange={(value) => handleSettingChange("features", "enableRatingsAndReviews", value)}
                  />
                  <FormField
                    label="Enable Dispute Management"
                    type="checkbox"
                    checked={settings.features?.enableDisputeManagement || false}
                    onChange={(value) => handleSettingChange("features", "enableDisputeManagement", value)}
                  />
                  <FormField
                    label="Enable Cleaner Ranking"
                    type="checkbox"
                    checked={settings.features?.enableCleanerRanking || false}
                    onChange={(value) => handleSettingChange("features", "enableCleanerRanking", value)}
                  />
                  <FormField
                    label="Enable Promo Codes"
                    type="checkbox"
                    checked={settings.features?.enablePromoCode || false}
                    onChange={(value) => handleSettingChange("features", "enablePromoCode", value)}
                  />
                  <FormField
                    label="Enable Referral Program"
                    type="checkbox"
                    checked={settings.features?.enableReferralProgram || false}
                    onChange={(value) => handleSettingChange("features", "enableReferralProgram", value)}
                  />
                  <FormField
                    label="Enable Gift Cards"
                    type="checkbox"
                    checked={settings.features?.enableGiftCards || false}
                    onChange={(value) => handleSettingChange("features", "enableGiftCards", value)}
                  />
                  <FormField
                    label="Enable Subscription Bookings"
                    type="checkbox"
                    checked={settings.features?.enableSubscriptionBookings || false}
                    onChange={(value) => handleSettingChange("features", "enableSubscriptionBookings", value)}
                  />
                </div>
              </SettingsSection>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SystemSettings;