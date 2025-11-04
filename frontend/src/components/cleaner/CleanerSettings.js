import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Bell,
  Lock,
  Globe,
  Wallet,
  User,
  Shield,
  Mail,
  Phone,
  Smartphone,
  Calendar,
  LogOut,
  AlertTriangle,
  UserX,
  ChevronRight,
  Check,
  Eye,
  AlertCircle,
  X,
  Loader,
  DollarSign,
  Home,
  Info,
} from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { useAuth } from "../../contexts/AuthContext";
import { userService, cleanerService } from "../../api/api";

const CleanerSettings = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettings();
  const { clearAuth } = useAuth();

  // Form visibility states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // User data state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    lastPasswordChange: "",
    bankAccount: "",
    bankName: "",
    accountHolder: "",
    iban: "",
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    newJobs: true,
    payments: true,
    reminders: true,
  });

  // Communication channels state
  const [channels, setChannels] = useState({
    email: true,
    sms: true,
    app: true,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    shareLocation: true,
    dataCollection: true,
  });

  // Form states
  const [nameForm, setNameForm] = useState({
    name: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailForm, setEmailForm] = useState({
    email: "",
    confirmEmail: "",
  });

  const [phoneForm, setPhoneForm] = useState({
    phone: "",
  });

  const [bankForm, setBankForm] = useState({
    accountHolder: "",
    iban: "",
    bankName: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getProfile();
        const userData = response.data.user;

        // Get cleaner-specific data if available
        let cleanerData = {};
        try {
          const cleanerResponse = await cleanerService.getProfile();
          cleanerData = cleanerResponse.data;
        } catch (error) {
          console.error("Error fetching cleaner data:", error);
        }

        // Combine user and cleaner data
        setUserData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          lastPasswordChange:
            userData.lastPasswordChange || new Date().toISOString(),
          bankAccount: cleanerData.bankAccount || "••••••••••1234",
          bankName: cleanerData.bankName || "Bank",
          accountHolder: cleanerData.accountHolder || userData.name,
          iban: cleanerData.iban || "",
        });

        // Initialize form values
        setNameForm({ name: userData.name || "" });
        setEmailForm({ email: userData.email || "", confirmEmail: "" });
        setPhoneForm({ phone: userData.phone || "" });
        setBankForm({
          accountHolder: cleanerData.accountHolder || userData.name || "",
          iban: cleanerData.iban || "",
          bankName: cleanerData.bankName || "",
        });

        // Initialize notification preferences with sensible defaults (ON by default)
        setNotificationPrefs({
          newJobs: userData.preferences?.notifications?.newJobs !== false,
          payments: userData.preferences?.notifications?.payments !== false,
          reminders: userData.preferences?.notifications?.reminders !== false,
        });

        // Initialize communication channels with sensible defaults (ON by default)
        setChannels({
          email: userData.preferences?.notifications?.email !== false,
          sms: userData.preferences?.notifications?.sms !== false,
          app: userData.preferences?.notifications?.app !== false,
        });

        // Initialize privacy settings with sensible defaults (ON by default)
        setPrivacySettings({
          profileVisibility:
            userData.preferences?.privacy?.shareProfileData !== false,
          shareLocation:
            userData.preferences?.privacy?.allowLocationAccess !== false,
          dataCollection:
            userData.preferences?.privacy?.dataCollection !== false,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        showNotification(
          t("Failed to load your settings. Please try again."),
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [t]);

  // Helper to show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 5000);
  };

  // Update name
  const handleNameUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await userService.updateProfile({ name: nameForm.name });
      setUserData({ ...userData, name: nameForm.name });
      showNotification(t("Name successfully updated"));
      setShowNameForm(false);
    } catch (error) {
      console.error("Error updating name:", error);
      showNotification(t("Failed to update name. Please try again."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update email
  const handleEmailUpdate = async (e) => {
    e.preventDefault();

    if (emailForm.email !== emailForm.confirmEmail) {
      showNotification(t("Email addresses do not match"), "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await userService.updateProfile({ email: emailForm.email });
      setUserData({ ...userData, email: emailForm.email });
      showNotification(t("Email successfully updated"));
      setShowEmailForm(false);
    } catch (error) {
      console.error("Error updating email:", error);
      showNotification(t("Failed to update email. Please try again."), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update phone
  const handlePhoneUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await userService.updateProfile({ phone: phoneForm.phone });
      setUserData({ ...userData, phone: phoneForm.phone });
      showNotification(t("Phone number successfully updated"));
      setShowPhoneForm(false);
    } catch (error) {
      console.error("Error updating phone:", error);
      showNotification(
        t("Failed to update phone number. Please try again."),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update password
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification(t("Passwords do not match"), "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showNotification(t("Password successfully updated"));
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error updating password:", error);
      showNotification(
        t("Failed to update password. Please check your current password."),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update bank details
  const handleBankUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await cleanerService.updateProfile({
        bankDetails: {
          accountHolder: bankForm.accountHolder,
          iban: bankForm.iban,
          bankName: bankForm.bankName,
        },
      });
      setUserData({
        ...userData,
        accountHolder: bankForm.accountHolder,
        iban: bankForm.iban,
        bankName: bankForm.bankName,
        bankAccount: `••••••••••${bankForm.iban.slice(-4)}`,
      });
      showNotification(t("Bank details successfully updated"));
      setShowBankForm(false);
    } catch (error) {
      console.error("Error updating bank details:", error);
      showNotification(
        t("Failed to update bank details. Please try again."),
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle notification toggle
  // Handle notification toggle
  const handleNotificationToggle = async (key) => {
    try {
      const newPrefs = {
        ...notificationPrefs,
        [key]: !notificationPrefs[key],
      };
      setNotificationPrefs(newPrefs);

      // Format for API
      const notifications = {
        [key]: newPrefs[key],
      };

      await userService.updateSettings({ notifications });
    } catch (error) {
      console.error(`Error toggling notification setting ${key}:`, error);
      // Revert the change on error
      setNotificationPrefs({ ...notificationPrefs });
      showNotification(t("Failed to update notification settings"), "error");
    }
  };

  // Handle channel toggle
  const handleChannelToggle = async (key) => {
    try {
      const newChannels = {
        ...channels,
        [key]: !channels[key],
      };
      setChannels(newChannels);

      // Format for API
      const notifications = {
        [key]: newChannels[key],
      };

      await userService.updateSettings({ notifications });
    } catch (error) {
      console.error(`Error toggling channel setting ${key}:`, error);
      // Revert the change on error
      setChannels({ ...channels });
      showNotification(t("Failed to update notification channels"), "error");
    }
  };

  // Handle privacy setting toggle
  const handlePrivacyToggle = async (key) => {
    try {
      const newSettings = {
        ...privacySettings,
        [key]: !privacySettings[key],
      };
      setPrivacySettings(newSettings);

      const mappedSetting = {
        profileVisibility: "shareProfileData",
        shareLocation: "allowLocationAccess",
        dataCollection: "dataCollection",
      }[key];

      // Format for API
      const privacy = {
        [mappedSetting]: newSettings[key],
      };

      await userService.updateSettings({ privacy });
    } catch (error) {
      console.error(`Error toggling privacy setting ${key}:`, error);
      // Revert the change on error
      setPrivacySettings({ ...privacySettings });
      showNotification(t("Failed to update privacy settings"), "error");
    }
  };

  // Handle language change
  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;
    try {
      setLanguage(newLanguage);
      await userService.updateSettings({
        preferences: {
          language: newLanguage,
        },
      });
    } catch (error) {
      console.error("Error changing language:", error);
      showNotification(t("Failed to update language setting"), "error");
    }
  };

  // Handle account deactivation
  const handleDeactivate = async () => {
    try {
      setIsSubmitting(true);
      await userService.deleteAccount();
      showNotification(t("Your account has been deactivated"));
      clearAuth();
      // Redirect to login page after a delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Error deactivating account:", error);
      showNotification(
        t("Failed to deactivate account. Please try again."),
        "error"
      );
      setShowDeactivateModal(false);
      setIsSubmitting(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 p-8 text-white shadow-lg">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white opacity-10"></div>
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white opacity-10"></div>

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">{t("Account Settings")}</h1>
          <p className="text-teal-100 max-w-xl">
            {t(
              "Manage your personal information, payment details, and account preferences."
            )}
          </p>
        </div>
      </div>

      {/* Success notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 p-4 rounded shadow-md z-50 animate-fade-in-right flex items-center
          ${
            notification.type === "success"
              ? "bg-green-100 border-l-4 border-green-500 text-green-700"
              : "bg-red-100 border-l-4 border-red-500 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="h-5 w-5 mr-2 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 text-teal-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <User className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Personal Information")}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Full Name */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Full Name")}
                      </h3>
                      <p className="text-sm text-gray-600">{userData.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNameForm(!showNameForm)}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    {t("Change")}
                  </button>
                </div>

                {/* Name change form */}
                {showNameForm && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-3 animate-fade-in">
                    <h4 className="font-medium text-gray-800 mb-4">
                      {t("Change Name")}
                    </h4>
                    <form onSubmit={handleNameUpdate}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Full Name")}
                          </label>
                          <input
                            type="text"
                            value={nameForm.name}
                            onChange={(e) =>
                              setNameForm({ name: e.target.value })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowNameForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                            disabled={isSubmitting}
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting && (
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {t("Update Name")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Email Address */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Email Address")}
                      </h3>
                      <p className="text-sm text-gray-600">{userData.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEmailForm(!showEmailForm)}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    {t("Change")}
                  </button>
                </div>

                {/* Email change form */}
                {showEmailForm && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-3 animate-fade-in">
                    <h4 className="font-medium text-gray-800 mb-4">
                      {t("Change Email Address")}
                    </h4>
                    <form onSubmit={handleEmailUpdate}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("New Email Address")}
                          </label>
                          <input
                            type="email"
                            value={emailForm.email}
                            onChange={(e) =>
                              setEmailForm({
                                ...emailForm,
                                email: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Confirm Email Address")}
                          </label>
                          <input
                            type="email"
                            value={emailForm.confirmEmail}
                            onChange={(e) =>
                              setEmailForm({
                                ...emailForm,
                                confirmEmail: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowEmailForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                            disabled={isSubmitting}
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting && (
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {t("Update Email")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Phone Number */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Phone Number")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {userData.phone || t("Not set")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPhoneForm(!showPhoneForm)}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                  >
                    {t("Change")}
                  </button>
                </div>

                {/* Phone change form */}
                {showPhoneForm && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-3 animate-fade-in">
                    <h4 className="font-medium text-gray-800 mb-4">
                      {t("Change Phone Number")}
                    </h4>
                    <form onSubmit={handlePhoneUpdate}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Phone Number")}
                          </label>
                          <input
                            type="tel"
                            value={phoneForm.phone}
                            onChange={(e) =>
                              setPhoneForm({
                                ...phoneForm,
                                phone: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                            placeholder="+491234567890"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {t(
                              "Please include country code (e.g., +49 for Germany)"
                            )}
                          </p>
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowPhoneForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                            disabled={isSubmitting}
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting && (
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {t("Update Phone")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Account Security Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Shield className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Account Security")}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Password */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Lock className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Password")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("Last changed")}{" "}
                        {new Date(
                          userData.lastPasswordChange
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium shadow-sm"
                  >
                    {t("Change")}
                  </button>
                </div>

                {/* Password change form */}
                {showPasswordForm && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-3 animate-fade-in">
                    <h4 className="font-medium text-gray-800 mb-4">
                      {t("Change Password")}
                    </h4>
                    <form onSubmit={handlePasswordChange}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Current Password")}
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("New Password")}
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                            minLength={8}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {t("Minimum 8 characters with at least 1 number")}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Confirm New Password")}
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowPasswordForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                            disabled={isSubmitting}
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting && (
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {t("Update Password")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Login Security Tips */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">
                        {t("Security Tips")}
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                        <li>
                          {t(
                            "Use a unique password that you don't use elsewhere"
                          )}
                        </li>
                        <li>
                          {t(
                            "Include numbers, symbols, and both uppercase and lowercase letters"
                          )}
                        </li>
                        <li>
                          {t(
                            "Avoid using personal information in your password"
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Settings Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Wallet className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Payment Settings")}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Bank Account */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Bank Account")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {userData.bankName} • {userData.bankAccount}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBankForm(!showBankForm)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium shadow-sm"
                  >
                    {t("Update")}
                  </button>
                </div>

                {/* Bank account form */}
                {showBankForm && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-3 animate-fade-in">
                    <h4 className="font-medium text-gray-800 mb-4">
                      {t("Update Bank Details")}
                    </h4>
                    <form onSubmit={handleBankUpdate}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Account Holder Name")}
                          </label>
                          <input
                            type="text"
                            value={bankForm.accountHolder}
                            onChange={(e) =>
                              setBankForm({
                                ...bankForm,
                                accountHolder: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("IBAN")}
                          </label>
                          <input
                            type="text"
                            value={bankForm.iban}
                            onChange={(e) =>
                              setBankForm({ ...bankForm, iban: e.target.value })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("Bank Name")}
                          </label>
                          <input
                            type="text"
                            value={bankForm.bankName}
                            onChange={(e) =>
                              setBankForm({
                                ...bankForm,
                                bankName: e.target.value,
                              })
                            }
                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                            required
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowBankForm(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                            disabled={isSubmitting}
                          >
                            {t("Cancel")}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                            disabled={isSubmitting}
                          >
                            {isSubmitting && (
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {t("Save Bank Details")}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Payout Schedule */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Payout Schedule")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("Monthly payments processed on the 15th")}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-700 text-sm font-medium px-3 py-1 bg-gray-100 rounded-md">
                    {t("Monthly")}
                  </span>
                </div>

                {/* Tax Information */}
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Tax Information")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("Update your tax details for proper reporting")}
                      </p>
                    </div>
                  </div>
                  <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center">
                    {t("Manage")}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Preferences & Actions */}
          <div className="space-y-8">
            {/* Notification Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Bell className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Notifications")}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Notification Types */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-4">
                    {t("Notification Preferences")}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {t("New Job Alerts")}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t("Get notified about new cleaning jobs")}
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.newJobs}
                          onChange={() => handleNotificationToggle("newJobs")}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {t("Payment Updates")}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t("Get notified about payment transactions")}
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.payments}
                          onChange={() => handleNotificationToggle("payments")}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {t("Reminders & Updates")}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {t("Job reminders and platform updates")}
                        </p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notificationPrefs.reminders}
                          onChange={() => handleNotificationToggle("reminders")}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Communication Channels */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-medium text-gray-800 mb-4">
                    {t("Communication Channels")}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-800">{t("Email")}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={channels.email}
                          onChange={() => handleChannelToggle("email")}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-800">{t("SMS")}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={channels.sms}
                          onChange={() => handleChannelToggle("sms")}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-800">{t("In-App")}</span>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={channels.app}
                          onChange={() => handleChannelToggle("app")}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Eye className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Privacy")}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {t("Profile Visibility")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("Allow clients to view your public profile")}
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.profileVisibility}
                      onChange={() => handlePrivacyToggle("profileVisibility")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {t("Location Sharing")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("Share your location with clients during jobs")}
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.shareLocation}
                      onChange={() => handlePrivacyToggle("shareLocation")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {t("Data Collection")}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t("Allow collection of usage data to improve service")}
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={privacySettings.dataCollection}
                      onChange={() => handlePrivacyToggle("dataCollection")}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <Globe className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Language")}
                </h2>
              </div>

              <div className="p-6">
                {/* Language */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {t("App Language")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("Select your preferred language")}
                      </p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center">
                <User className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("Account Actions")}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <Link
                  to="/cleaner/profile"
                  className="w-full py-3 flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors border border-teal-200"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">{t("View My Profile")}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full py-3 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors border border-gray-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">{t("Logout")}</span>
                </button>

                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 rounded-lg transition-colors hover:bg-red-50"
                >
                  <UserX className="h-5 w-5" />
                  <span className="font-medium">{t("Deactivate Account")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in-up">
            <div className="text-center mb-5">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("Deactivate Account")}
              </h3>
              <p className="text-gray-600">
                {t(
                  "Are you sure you want to deactivate your account? This action cannot be undone."
                )}
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-5">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">
                    {t("What happens when you deactivate your account:")}
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{t("Your profile will be hidden from clients")}</li>
                    <li>{t("You'll no longer receive new job requests")}</li>
                    <li>
                      {t(
                        "Your account data will be kept for 30 days before permanent deletion"
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 py-2.5 bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200"
                disabled={isSubmitting}
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleDeactivate}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader className="h-5 w-5 animate-spin text-white" />
                ) : (
                  t("Deactivate")
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: 0.3s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        input:checked + .slider {
          background-color: #0d9488;
        }

        input:focus + .slider {
          box-shadow: 0 0 1px #0d9488;
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CleanerSettings;
