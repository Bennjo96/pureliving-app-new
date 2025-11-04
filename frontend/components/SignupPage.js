import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ToastNotification from "./ToastNotification";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const SignupPage = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Signup form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "client",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Newsletter state for footer
  const [emailNewsletter, setEmailNewsletter] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast(t("fix_errors"), "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      showToast(t("account_created"));
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        userType: "client",
      });
      setFormErrors({});
      navigate("/");
    } catch (error) {
      showToast(t("signup_failed"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Newsletter handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!emailNewsletter.trim()) {
      setEmailError(t("enter_email"));
      showToast(t("enter_email"), "error");
      return;
    }
    setIsEmailSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast(t("subscription_successful"));
      setEmailNewsletter("");
    } catch (error) {
      setEmailError(t("subscription_failed"));
      showToast(t("subscription_failed"), "error");
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = t("name_required");
    }

    if (!formData.email.trim()) {
      errors.email = t("email_required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("email_invalid");
    }

    if (!formData.password.trim()) {
      errors.password = t("password_required");
    } else if (formData.password.length < 6) {
      errors.password = t("password_length");
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("passwords_no_match");
    }

    return errors;
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="h-16">
        <Navbar />
      </div>

      {/* Toast Notification */}
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

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4 bg-gray-50">
        {/* Signup Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10 m-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Logo or Brand Icon */}
            <div className="text-center mb-8">
              <motion.img
                src="/logo.png"
                alt="Pureliving Helpers Logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-800">
                {t("create_account")}
              </h1>
              <p className="text-gray-600 mt-2">{t("join_us_experience")}</p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("full_name")}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formErrors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-teal-500"
                    } focus:ring-2 focus:ring-teal-500/20 transition-all duration-200`}
                    disabled={isSubmitting || loading}
                    aria-invalid={formErrors.name ? "true" : "false"}
                    aria-describedby="name-error"
                  />
                </div>
                {formErrors.name && (
                  <p
                    id="name-error"
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("email_address")}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formErrors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-teal-500"
                    } focus:ring-2 focus:ring-teal-500/20 transition-all duration-200`}
                    disabled={isSubmitting || loading}
                    aria-invalid={formErrors.email ? "true" : "false"}
                    aria-describedby="email-error"
                  />
                </div>
                {formErrors.email && (
                  <p
                    id="email-error"
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("password")}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      formErrors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-teal-500"
                    } focus:ring-2 focus:ring-teal-500/20 transition-all duration-200`}
                    disabled={isSubmitting || loading}
                    aria-invalid={formErrors.password ? "true" : "false"}
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p
                    id="password-error"
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("confirm_password")}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                      formErrors.confirmPassword
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-teal-500"
                    } focus:ring-2 focus:ring-teal-500/20 transition-all duration-200`}
                    disabled={isSubmitting || loading}
                    aria-invalid={formErrors.confirmPassword ? "true" : "false"}
                    aria-describedby="confirm-password-error"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="text-red-500 text-sm mt-1 flex items-center"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* User Type Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t("i_am_a")}
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="client"
                      checked={formData.userType === "client"}
                      onChange={handleChange}
                      className="w-4 h-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                      disabled={isSubmitting || loading}
                    />
                    <span className="ml-2 text-gray-700">{t("client")}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="userType"
                      value="cleaner"
                      checked={formData.userType === "cleaner"}
                      onChange={handleChange}
                      className="w-4 h-4 text-teal-500 border-gray-300 focus:ring-teal-500"
                      disabled={isSubmitting || loading}
                    />
                    <span className="ml-2 text-gray-700">{t("cleaner")}</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || loading}
                whileHover={{ scale: isSubmitting || loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 px-4 rounded-lg ${
                  isSubmitting || loading
                    ? "bg-teal-400 cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-600"
                } text-white font-medium transition-colors duration-200 flex items-center justify-center`}
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {t("creating_account")}
                  </>
                ) : (
                  t("create_account")
                )}
              </motion.button>

              {/* Login Link */}
              <p className="text-center text-gray-600">
                {t("already_have_account")}{" "}
                <Link
                  to="/login"
                  className="text-teal-500 hover:text-teal-600 hover:underline font-medium"
                >
                  {t("log_in_here")}
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer with newsletter functionality */}
      <Footer
        email={emailNewsletter}
        setEmail={setEmailNewsletter}
        emailError={emailError}
        setEmailError={setEmailError}
        handleNewsletterSubmit={handleNewsletterSubmit}
        isEmailSubmitting={isEmailSubmitting}
      />
    </div>
  );
};

export default SignupPage;
