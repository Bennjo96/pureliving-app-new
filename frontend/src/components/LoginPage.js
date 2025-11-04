// src/pages/LoginPage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ToastNotification from "../components/ToastNotification";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Determine if redirected from signup and intended role (default to "customer")
  const fromSignup = location.state?.fromSignup || false;
  const intendedRole = location.state?.role || "customer"; // "cleaner" if logging in as service provider

  // Login form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [formStage, setFormStage] = useState(fromSignup ? "success" : "initial");
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Show welcome toast if coming from signup
  useEffect(() => {
    if (fromSignup) {
      showToast(
        t("Account created successfully! Please sign in to continue."),
        "success"
      );
    }
  }, [fromSignup, t]);

  // Remember Me Effect - load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors on change
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Reset form stage when user starts editing after an error
    if (formStage === "error") {
      setFormStage("initial");
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = t("Please enter your email");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("Please enter a valid email address");
    }
    if (!formData.password.trim()) {
      errors.password = t("Please enter your password");
    }
    return errors;
  };

  // Show Toast Notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
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

    setFormStage("submitting");

    try {
      // Pass intendedRole as activeRole to login function
      const result = await login(
        formData.email,
        formData.password,
        formData.rememberMe,
        { activeRole: intendedRole }
      );

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      const userData = result.user;

      // Enforce strict role match:
      // If the intended role is "cleaner", ensure user's roles include "cleaner".
      // Similarly for "customer".
      if (!userData.roles.includes(intendedRole)) {
        setFormStage("error");
        showToast(
          t(
            `Your account is not registered as a ${
              intendedRole === "cleaner"
                ? "service provider"
                : "customer"
            }. Please register or upgrade your account.`
          ),
          "error"
        );
        return;
      }

      // Also, check if the user is an admin and block them from using this login page.
      if (userData.roles.includes("admin")) {
        setFormStage("error");
        showToast(
          t("This login is for customers and service providers only"),
          "error"
        );
        return;
      }

      // Set user data in context (if not already set by login)
      if (setUser && userData) {
        setUser(userData);
      }

      // Remember email if selected
      if (formData.rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Set success state and show a success toast
      setFormStage("success");
      showToast(t("Login successful"), "success");

      // Navigate based on the intended role
      setTimeout(() => {
        if (intendedRole === "cleaner") {
          navigate("/cleaner/dashboard");
        } else {
          navigate("/customer/dashboard");
        }
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      setFormStage("error");

      const errorData = error.response?.data;
      const errorCode = errorData?.code;
      const errorMessage =
        errorData?.message ||
        error.message ||
        t("Login failed. Please try again.");

      showToast(errorMessage, "error");

      if (errorCode === "INVALID_CREDENTIALS") {
        setFormErrors({ password: t("Invalid email or password") });
      } else if (errorCode === "EMAIL_NOT_VERIFIED") {
        setFormErrors({
          email: t("Please verify your email before logging in."),
        });
      } else if (errorCode === "MISSING_CREDENTIALS") {
        if (!formData.email) setFormErrors({ email: t("Email is required") });
        if (!formData.password)
          setFormErrors({ password: t("Password is required") });
      } else {
        setFormErrors({ password: t("Login failed. Please try again.") });
      }
    }
  };

  // Render login form or message based on form stage
  const renderFormContent = () => {
    if (formStage === "success" && fromSignup) {
      return (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-medium text-gray-900">
            {t("Your account has been created!")}
          </h2>
          <p className="text-gray-600 mb-4">
            {t("Please sign in with your credentials to continue.")}
          </p>
          <button
            onClick={() => setFormStage("initial")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
          >
            {t("Continue to Login")} <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {formStage === "error" && (
          <div className="p-4 rounded-md bg-red-50 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {t("Unable to sign in")}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {t("Please check your credentials and try again.")}
                </p>
              </div>
            </div>
          </div>
        )}

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
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("Password")}
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-teal-600 hover:text-teal-500"
            >
              {t("Forgot your password?")}
            </Link>
          </div>
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
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              {t("Remember me")}
            </label>
          </div>
        </div>

        {/* Sign In Button */}
        <div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={formStage === "submitting"}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {formStage === "submitting" ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              t("Sign in")
            )}
          </motion.button>
        </div>
      </form>
    );
  };

  // Determine the login title based on the intended role
  const loginTitle =
    intendedRole === "cleaner"
      ? t("Login as Service Provider")
      : t("Login as Customer");

  // Content for different user types to show in the side panel
  const getSidePanelContent = () => {
    const emailDomain = formData.email ? formData.email.split("@")[1] : "";
    const mightBeCleaner =
      emailDomain === "cleaningpro.com" || formData.email.includes("clean");

    if (mightBeCleaner) {
      return {
        title: t("Cleaner Portal"),
        features: [
          t("Manage your cleaning schedule"),
          t("Track your earnings"),
          t("View client feedback"),
          t("Update your service offerings"),
        ],
        testimonial: {
          quote: t(
            "The platform makes it easy to organize my schedule and connect with new clients. I've been able to grow my business substantially."
          ),
          author: t("— Carlos M., Professional Cleaner"),
        },
      };
    }

    return {
      title: t("Professional Cleaning Services"),
      features: [
        t("Book professional cleaners"),
        t("Schedule recurring visits"),
        t("Track your cleaning history"),
        t("Rate your service experiences"),
      ],
      testimonial: {
        quote: t(
          "The service has been incredible. Our house has never looked better, and the booking process is so easy!"
        ),
        author: t("— Maria K., Happy Customer"),
      },
    };
  };

  const sidePanelContent = getSidePanelContent();

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
          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {loginTitle}
              </h1>
              <p className="text-gray-600">
                {intendedRole === "cleaner"
                  ? t("Please sign in with your service provider credentials.")
                  : t("Please sign in with your customer credentials.")}
              </p>
            </div>

            {renderFormContent()}

            {formStage !== "success" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {t("Don't have an account?")}{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-teal-600 hover:text-teal-500"
                  >
                    {t("Sign up")}
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
                <h2 className="text-2xl font-bold">{sidePanelContent.title}</h2>
              </div>

              <div className="space-y-4 mb-12">
                <p className="opacity-90">
                  {t(
                    "Login to access your account and manage your cleaning services with ease."
                  )}
                </p>
                {sidePanelContent.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <p className="opacity-80">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                <p className="italic opacity-90 text-sm">
                  {sidePanelContent.testimonial.quote}
                </p>
                <p className="text-xs mt-2 font-medium">
                  {sidePanelContent.testimonial.author}
                </p>
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

export default LoginPage;
