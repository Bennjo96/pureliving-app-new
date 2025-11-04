// src/components/admin/AdminSignupPage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  Key
} from "lucide-react";
import ToastNotification from "../ToastNotification";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { authService } from "../../api/api";

const AdminSignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Check for invitation token in the URL query params
  const queryParams = new URLSearchParams(location.search);
  const invitationToken = queryParams.get('token');
  
  // State to track if the invitation is valid
  const [invitationValid, setInvitationValid] = useState(false);
  const [validating, setValidating] = useState(true);

  // Admin signup form state with admin code and invitation token
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminCode: "",
    invitationToken: invitationToken || ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toast state for notifications
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Validate invitation token on mount
  useEffect(() => {
    const validateInvitation = async () => {
      if (!invitationToken) {
        setInvitationValid(false);
        setValidating(false);
        showToast(t("Invalid or missing invitation token"), "error");
        return;
      }

      try {
        // Call API to validate the invitation token
        const response = await authService.validateAdminInvitation(invitationToken);
        if (response.data.valid) {
          setInvitationValid(true);
          // Pre-fill email if provided in the response
          if (response.data.email) {
            setFormData(prev => ({
              ...prev,
              email: response.data.email
            }));
          }
        } else {
          setInvitationValid(false);
          showToast(t("Invalid invitation token"), "error");
        }
      } catch (error) {
        console.error("Error validating invitation:", error);
        setInvitationValid(false);
        showToast(t("Error validating invitation"), "error");
      } finally {
        setValidating(false);
      }
    };

    validateInvitation();
  }, [invitationToken, t]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors on change
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = t("Full name is required");
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = t("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("Invalid email format");
    }

    // Password validation
    if (!formData.password) {
      errors.password = t("Password is required");
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      errors.password = t(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
      );
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = t("Please confirm your password");
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("Passwords do not match");
    }

    // Admin code validation
    if (!formData.adminCode.trim()) {
      errors.adminCode = t("Admin code is required");
    }

    return errors;
  };

  // Show Toast Message
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // Handle Form Submission for Admin Signup
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(t("Please fix the errors before continuing"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the admin registration endpoint with invitation token
      const response = await authService.adminRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        adminCode: formData.adminCode,
        invitationToken: formData.invitationToken
      });

      if (response.data.success) {
        // Store the admin token
        localStorage.setItem("adminAuthToken", response.data.token);
        
        // Also store the role for UI decisions
        localStorage.setItem("userRole", "admin");
        
        showToast(t("Admin account created successfully"), "success");

        // Optionally call signup from AuthContext if needed
        if (signup) {
          await signup(formData.name, formData.email, formData.password, "admin");
        }

        // Navigate to admin dashboard after short delay
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        throw new Error(response.data.message || t("Signup failed"));
      }
    } catch (error) {
      console.error("Admin Signup error:", error);
      
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           t("Failed to create admin account");
      
      showToast(errorMessage, "error");
      
      // Set field-specific errors if provided in the response
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading indicator while validating invitation
  if (validating) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-800 to-teal-700">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-center">
            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
            <p className="text-xl font-medium">{t("Validating invitation...")}</p>
          </div>
        </div>
      </div>
    );
  }

  // If invitation token is invalid, show error message
  if (!invitationValid) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-teal-800 to-teal-700">
        <div className="pt-8 px-6 flex justify-center">
          <div className="text-white text-2xl font-bold">
            <span className="text-teal-300">Pure</span>Living
            <span className="ml-2 py-1 px-3 text-sm bg-teal-900 rounded-lg">ADMIN</span>
          </div>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
              {t("Invalid Invitation")}
            </h1>
            <p className="text-gray-600 text-center mb-6">
              {t("The invitation link is invalid or has expired. Please contact your administrator for a new invitation.")}
            </p>
            <Link
              to="/"
              className="block w-full py-3 px-4 text-center bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              {t("Return to Main Site")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Admin Banner */}
          <div className="bg-teal-600 p-5 text-white flex items-center justify-center flex-col">
            <ShieldAlert className="h-12 w-12 mb-2" />
            <h1 className="text-2xl font-bold tracking-tight">
              {t("Admin Account Creation")}
            </h1>
            <p className="text-teal-100 mt-1 text-sm">
              {t("By invitation only • Create your administrator account")}
            </p>
          </div>

          {/* Signup Form */}
          <div className="p-6 bg-white">
            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 mb-6 rounded">
              <p className="text-sm text-teal-800">
                {t("You've been invited to create an admin account for PureLiving. Please complete all fields below.")}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t("Full Name")}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 p-3 border rounded-lg ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="John Doe"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t("Email Address")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={!!invitationToken} // Make email readonly if it came from invitation
                    className={`w-full pl-10 p-3 border rounded-lg ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      invitationToken ? "bg-gray-100" : ""
                    }`}
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
                    className={`w-full pl-10 pr-10 p-3 border rounded-lg ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {t("Minimum 8 characters, with upper & lowercase letters, number and symbol")}
                </p>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t("Confirm Password")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 p-3 border rounded-lg ${
                      formErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
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
                    type="text"
                    name="adminCode"
                    value={formData.adminCode}
                    onChange={handleChange}
                    className={`w-full pl-10 p-3 border rounded-lg ${
                      formErrors.adminCode ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="Enter admin access code"
                  />
                </div>
                {formErrors.adminCode && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.adminCode}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {t("This code is required and should have been provided with your invitation")}
                </p>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <ShieldAlert className="h-5 w-5 mr-2" />
                )}
                {t("Create Admin Account")}
              </button>

              {/* Back to Login Link */}
              <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-200">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("Back to Admin Login")}
                </Link>
              </div>
            </form>

            {/* Security Notice */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500 text-center">
                {t("This is a secure area. Account creation is monitored and requires authorization.")}
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

export default AdminSignupPage;