// src/components/admin/AdminLoginPage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2, 
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  Key
} from "lucide-react";
import ToastNotification from "../ToastNotification";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const AdminLoginPage = () => {
  const { setUser, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Login form state with admin code field
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminCode: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // Toast state for notifications
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Timer effect for account lockout
  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear errors on change
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Form validation with admin code requirement
  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = t("Admin email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("Please enter a valid email address");
    }
    
    if (!formData.password.trim()) {
      errors.password = t("Password is required");
    } else if (formData.password.length < 8) {
      errors.password = t("Password must be at least 8 characters");
    }
    
    if (!formData.adminCode.trim()) {
      errors.adminCode = t("Admin access code is required");
    } else if (formData.adminCode.length < 6) {
      errors.adminCode = t("Admin code must be at least 6 characters");
    }
    
    return errors;
  };

  // Show Toast Notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // Implement lockout after multiple failed attempts
  const handleFailedLogin = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      setIsLocked(true);
      setLockTimer(300); // 5 minutes lockout (300 seconds)
      showToast(
        t("Too many failed attempts. Account locked for 5 minutes."), 
        "error"
      );
    }
  };

  // Handle Form Submission for Admin Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      showToast(
        t(`Account is temporarily locked. Try again in ${Math.ceil(lockTimer / 60)} minutes.`), 
        "error"
      );
      return;
    }

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(t("Please fix the errors before continuing"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the login function from AuthContext but with an isAdmin flag
      const result = await login(
        formData.email, 
        formData.password, 
        formData.rememberMe, 
        { 
          isAdmin: true, 
          adminCode: formData.adminCode 
        }
      );

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      // Store role to help with UI decisions - in session or localStorage based on rememberMe
      if (formData.rememberMe) {
        localStorage.setItem("userRole", "admin");
      } else {
        sessionStorage.setItem("userRole", "admin");
      }
      
      // Set user in context if needed
      if (setUser && result.user) {
        setUser(result.user);
      }
      
      // Reset login attempts on successful login
      setLoginAttempts(0);
      
      showToast(t("Admin login successful"), "success");

      // Remember email if selected
      if (formData.rememberMe) {
        localStorage.setItem("rememberedAdminEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedAdminEmail");
      }

      // Navigate to the admin dashboard
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Admin Login error:", error);
      
      handleFailedLogin();
      
      // Extract error details
      const errorData = error.response?.data;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.message || error.message || t("Login failed. Please verify your credentials.");
      
      showToast(errorMessage, "error");
      
      // Set specific error messages based on error code
      if (errorCode === "INVALID_ADMIN_CODE") {
        setFormErrors({ adminCode: t("Invalid admin access code") });
      } else if (errorCode === "INVALID_CREDENTIALS") {
        setFormErrors({ password: t("Invalid email or password") });
      } else if (errorCode === "USER_NOT_ADMIN") {
        setFormErrors({ email: t("This user is not authorized for admin access") });
      } else {
        setFormErrors({ password: t("Authentication failed") });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Populate remembered email on mount, if any
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedAdminEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  // Format time for lock display
  const formatLockTime = () => {
    const minutes = Math.floor(lockTimer / 60);
    const seconds = lockTimer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-800 to-teal-700">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50"
          >
            <ToastNotification {...toast} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-8 px-6 flex justify-center">
        {/* Brand Logo with Admin Indicator */}
        <div className="text-white text-2xl font-bold">
          <span className="text-teal-300">Pure</span>Living
          <span className="ml-2 py-1 px-3 text-sm bg-teal-900 rounded-lg">ADMIN</span>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Admin Banner */}
          <div className="bg-teal-600 p-5 text-white flex items-center justify-center flex-col">
            <ShieldAlert className="h-12 w-12 mb-2" />
            <h1 className="text-2xl font-bold tracking-tight">
              {t("Secure Admin Portal")}
            </h1>
            <p className="text-teal-100 mt-1 text-sm">
              {t("Restricted access • PureLiving administrative area")}
            </p>
          </div>

          {/* Login Form */}
          <div className="p-6 bg-white">
            {isLocked && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                  <div>
                    <h3 className="text-red-800 font-medium">
                      {t("Account temporarily locked")}
                    </h3>
                    <p className="text-red-700 text-sm">
                      {t("Too many failed attempts. Try again in")} {formatLockTime()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t("Admin Email")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLocked}
                    className={`w-full pl-10 p-3 border rounded-lg ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                    placeholder="admin@pureliving.com"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t("Password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLocked}
                    className={`w-full pl-10 p-3 border rounded-lg ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
              </div>

              {/* Admin Code Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t("Admin Access Code")}
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="adminCode"
                    value={formData.adminCode}
                    onChange={handleChange}
                    disabled={isLocked}
                    className={`w-full pl-10 p-3 border rounded-lg ${
                      formErrors.adminCode ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:text-gray-500`}
                    placeholder="Enter admin access code"
                  />
                </div>
                {formErrors.adminCode && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.adminCode}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {t("This additional security code is provided by your system administrator")}
                </p>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLocked}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t("Remember me")}
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting || isLocked}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <ShieldAlert className="h-5 w-5 mr-2" />
                )}
                {t("Access Admin Portal")}
              </button>

              {/* Forgot Password & Back Link */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/"
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-teal-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("Return to main site")}
                </Link>
                
                <Link
                  to="/admin/forgot-password"
                  className="text-sm font-medium text-teal-600 hover:text-teal-800"
                >
                  {t("Forgot credentials?")}
                </Link>
              </div>
            </form>
            
            {/* Security Notice */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 text-center">
                {t("This is a secure area. All login attempts are monitored and recorded.")}
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                {t("PureLiving Admin Portal")} &copy; {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;