// src/pages/SignupPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Check,
  Loader2,
  CheckCircle,
  Info,
  Shield,
  AlertTriangle,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ToastNotification from "./ToastNotification";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { authService } from "../api/api";

const SignupPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Signup form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    role: "customer", // Default role is "customer"
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formStage, setFormStage] = useState("initial"); // initial, success, error

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Helper function to show toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Check password strength when password field changes
    if (name === "password") {
      checkPasswordStrength(value);
    }

    // Clear errors on change
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 6) strength += 1;
    if (password.length > 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  // Get password strength info
  const getPasswordStrengthInfo = () => {
    const strengthTexts = [
      { text: t("Weak"), color: "bg-red-500" },
      { text: t("Fair"), color: "bg-orange-500" },
      { text: t("Good"), color: "bg-yellow-500" },
      { text: t("Strong"), color: "bg-green-500" },
      { text: t("Very Strong"), color: "bg-green-600" },
    ];
    return strengthTexts[Math.min(passwordStrength, 4)];
  };

  // Get password criteria checks
  const getPasswordCriteria = () => {
    const { password } = formData;
    return [
      { text: t("At least 8 characters"), met: password.length >= 8 },
      { text: t("Contains uppercase letter"), met: /[A-Z]/.test(password) },
      { text: t("Contains number"), met: /[0-9]/.test(password) },
      { text: t("Contains special character"), met: /[^A-Za-z0-9]/.test(password) },
    ];
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = t("Please enter your full name");
    }
    if (!formData.email.trim()) {
      errors.email = t("Please enter your email");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("Please enter a valid email address");
    }
    if (!formData.password.trim()) {
      errors.password = t("Please enter a password");
    } else if (formData.password.length < 8) {
      errors.password = t("Password must be at least 8 characters long");
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("Passwords do not match");
    }
    if (!formData.acceptTerms) {
      errors.acceptTerms = t("You must accept the Terms and Privacy Policy");
    }
    return errors;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(t("Please fix the errors in the form"), "error");
      return;
    }
    setIsSubmitting(true);
    setFormStage("submitting");
    try {
      // Use authService.register to sign up the user.
      const response = await authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role, // "customer" or "cleaner"
      });
      setFormStage("success");
      showToast(t("Account created successfully! Please log in."), "success");
      // Instead of auto-login, redirect to the login page with state
      setTimeout(() => {
        navigate("/login", { state: { role: formData.role } });
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      setFormStage("error");
      const errorData = error.response?.data;
      const errorCode = errorData?.code;
      const errorMessage =
        errorData?.message || t("Signup failed. Please try again.");
      showToast(errorMessage, "error");
      if (
        errorCode === "EMAIL_EXISTS" ||
        errorMessage.includes("already registered")
      ) {
        setFormErrors({
          email: t("This email is already registered. Please sign in instead."),
        });
      } else if (errorCode === "EMAIL_EXISTS_NOT_VERIFIED") {
        setFormErrors({
          email: t(
            "Account exists but not verified. Check your email or request a new verification link."
          ),
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render success view after submission
  const renderSuccessView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <CheckCircle className="h-6 w-6 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {t("Registration Successful!")}
      </h2>
      <p className="text-gray-600 mb-6">
        {t("Please check your email for verification (if required) and then log in.")}
      </p>
      <Link
        to="/login"
        state={{ role: formData.role }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
      >
        {t("Go to Login")}
      </Link>
    </motion.div>
  );

  // Render main signup form or success view
  const renderFormContent = () => {
    if (formStage === "success") {
      return renderSuccessView();
    }
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        {formStage === "error" && (
          <div className="p-4 rounded-md bg-red-50 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t("There was a problem creating your account")}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {t("Please check your information and try again.")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("Full Name")}
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-3 border ${
                formErrors.fullName ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
              placeholder={t("John Doe")}
            />
          </div>
          {formErrors.fullName && (
            <p className="mt-2 text-sm text-red-600">{formErrors.fullName}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("Email")}
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-3 border ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
              placeholder="you@example.com"
            />
          </div>
          {formErrors.email && (
            <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("Password")}
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-3 border ${
                formErrors.password ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {formErrors.password && (
            <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
          )}

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs text-gray-500">
                  {t("Password Strength")}:
                  <span
                    className={`ml-1 font-medium ${
                      passwordStrength >= 3
                        ? "text-green-600"
                        : "text-orange-500"
                    }`}
                  >
                    {getPasswordStrengthInfo().text}
                  </span>
                </div>
              </div>
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getPasswordStrengthInfo().color}`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                ></div>
              </div>

              {/* Password criteria list */}
              <div className="mt-2 space-y-1">
                {getPasswordCriteria().map((criteria, index) => (
                  <div key={index} className="flex items-center">
                    <Check
                      className={`h-4 w-4 mr-1 ${
                        criteria.met ? "text-green-500" : "text-gray-300"
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        criteria.met ? "text-gray-700" : "text-gray-500"
                      }`}
                    >
                      {criteria.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("Confirm Password")}
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full pl-10 pr-10 py-3 border ${
                formErrors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {formErrors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Account Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("I am signing up as a")}:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={`py-2 px-4 border rounded-md text-sm font-medium transition-colors
                        ${
                          formData.role === "customer"
                            ? "bg-teal-50 border-teal-500 text-teal-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }
                      `}
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "customer" }))
              }
            >
              {formData.role === "customer" && (
                <Check className="inline-block h-4 w-4 mr-1" />
              )}
              {t("Customer")}
            </button>
            <button
              type="button"
              className={`py-2 px-4 border rounded-md text-sm font-medium transition-colors
                        ${
                          formData.role === "cleaner"
                            ? "bg-teal-50 border-teal-500 text-teal-700"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }
                      `}
              onClick={() =>
                setFormData((prev) => ({ ...prev, role: "cleaner" }))
              }
            >
              {formData.role === "cleaner" && (
                <Check className="inline-block h-4 w-4 mr-1" />
              )}
              {t("Service Provider")}
            </button>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className={`h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded ${
                formErrors.acceptTerms ? "border-red-500" : ""
              }`}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-700">
              {t("I agree to the")}{" "}
              <Link to="/terms" className="text-teal-600 hover:text-teal-500">
                {t("Terms of Service")}
              </Link>{" "}
              {t("and")}{" "}
              <Link to="/privacy" className="text-teal-600 hover:text-teal-500">
                {t("Privacy Policy")}
              </Link>
            </label>
            {formErrors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.acceptTerms}
              </p>
            )}
          </div>
        </div>

        {/* Sign Up Button */}
        <div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              t("Create Account")
            )}
          </motion.button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

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

      <div className="flex-grow flex items-center justify-center p-6 pt-32">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-xl">
          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t("Create Your Account")}
              </h1>
              <p className="text-gray-600">
                {t("Join us and enjoy professional cleaning services")}
              </p>
            </div>

            {renderFormContent()}

            {/* Login Option */}
            {formStage !== "success" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {t("Already have an account?")}{" "}
                  <Link
                    to="/login"
                    className="font-medium text-teal-600 hover:text-teal-500"
                  >
                    {t("Sign in")}
                  </Link>
                </p>
              </div>
            )}
          </motion.div>

          {/* Decorative/Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden md:block bg-gradient-to-br from-teal-500 to-teal-600 p-12 text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center mb-8">
                <div className="p-2 bg-white bg-opacity-20 rounded-full mr-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">
                  {formData.role === "customer"
                    ? t("Discover Top Cleaning Services")
                    : t("Join Our Cleaning Professionals")}
                </h2>
              </div>

              <div className="space-y-4 mb-12">
                <p className="opacity-90">
                  {formData.role === "customer"
                    ? t("Create an account to enjoy these benefits:")
                    : t("As a service provider, you'll enjoy:")}
                </p>

                {formData.role === "customer" ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">
                        {t("Personalized cleaning plans")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">
                        {t("Save favorite cleaning professionals")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">
                        {t("Special offers and discounts")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">
                        {t("Easy booking management")}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">
                        {t("Flexible work schedule")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">{t("Competitive earnings")}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">
                        {t("Easy client management")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <p className="opacity-80">
                        {t("Professional development opportunities")}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <div className="flex items-start mb-2">
                  <Info className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm opacity-90">
                    {formData.role === "customer"
                      ? t(
                          "As a customer, you'll be able to book services, manage appointments, and rate your experiences."
                        )
                      : t(
                          "As a service provider, you'll need to complete your profile with additional verification steps after registration."
                        )}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full"></div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SignupPage;
