import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useBooking } from "../contexts/BookingContext";
import {
  User,
  Mail,
  Phone,
  Home,
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Info,
  Lock,
  AlertCircle
} from "lucide-react";

const CustomerDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { bookingData, setCustomerDetails } = useBooking();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialInstructions: '',
    accessInstructions: '',
    hasAccount: false,
    createAccount: false,
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showAccountOption, setShowAccountOption] = useState(false);

  // Pre-fill form if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        hasAccount: true
      }));
    }
  }, [isAuthenticated, user]);

  // Get booking data from state
  const serviceData = location.state || bookingData;

  // Progress Steps Component
  const ProgressSteps = () => {
    const steps = [
      { id: "service", label: "Service" },
      { id: "customize", label: "Customize" },
      { id: "location", label: "Location" },
      { id: "schedule", label: "Schedule" },
      { id: "details", label: "Your Details" },
      { id: "payment", label: "Payment" }
    ];

    return (
      <div className="hidden md:flex justify-center mb-10">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center font-medium 
                  ${index < 4 ? "bg-teal-600 text-white" : 
                    index === 4 ? "bg-teal-100 text-teal-800 border border-teal-600" : 
                    "bg-white text-gray-400 border border-gray-300"}`}>
                  {index < 4 ? <CheckCircle size={16} /> : index + 1}
                </div>
                <div className={`text-xs mt-1 whitespace-nowrap ${
                  index === 4 ? "font-semibold text-teal-800" : "text-gray-500"
                }`}>
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-1 ${
                  index < 4 ? "bg-teal-600" : "bg-gray-300"
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "Phone number is invalid";
    }
    
    if (formData.createAccount && !formData.password) {
      newErrors.password = "Password is required for account creation";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Save customer details to booking context
    setCustomerDetails({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      specialInstructions: formData.specialInstructions,
      accessInstructions: formData.accessInstructions,
      createAccount: formData.createAccount
    });

    // If user wants to create account, handle that first
    if (formData.createAccount && !isAuthenticated) {
      try {
        // Call your signup API
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: 'customer'
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Log them in automatically
          localStorage.setItem('token', data.token);
          // Update auth context if you have a method for it
        }
      } catch (error) {
        console.error('Account creation failed:', error);
        // Continue as guest if account creation fails
      }
    }

    // Navigate to payment
    navigate('/booking/payment', { 
      state: { 
        ...serviceData,
        customerDetails: formData 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-teal-600 hover:text-teal-700 font-medium mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>

        <ProgressSteps />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Your Contact Details
            </h1>
            <p className="text-gray-600">
              {isAuthenticated 
                ? "Confirm your details for this booking"
                : "Tell us how to reach you about your booking"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <User className="mr-2 text-teal-600" size={20} />
                    Contact Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isAuthenticated}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        disabled={isAuthenticated}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline w-4 h-4 mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isAuthenticated}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline w-4 h-4 mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+49 123 456 7890"
                      className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Home className="mr-2 text-teal-600" size={20} />
                    Access & Special Instructions
                  </h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How should the cleaner access your property?
                    </label>
                    <textarea
                      name="accessInstructions"
                      value={formData.accessInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g., Ring doorbell, key under mat, building code: 1234"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Any special instructions for the cleaner?
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g., Please be quiet in the study room, use eco-friendly products only"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Account Creation Option */}
                {!isAuthenticated && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <Lock className="mr-2 text-teal-600" size={20} />
                        Create an Account (Optional)
                      </h3>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          createAccount: !prev.createAccount 
                        }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.createAccount 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {formData.createAccount ? 'Yes, create account' : 'No thanks'}
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      Create an account to track bookings, save addresses, and manage subscriptions
                    </p>

                    {formData.createAccount && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Create a Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 ${
                            errors.password ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center"
                >
                  Continue to Payment
                  <ChevronRight size={20} className="ml-2" />
                </motion.button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Booking Summary
                </h3>
                
                {/* Display booking details */}
                <div className="space-y-3 text-sm">
                  {serviceData?.selectedService && (
                    <div className="pb-3 border-b">
                      <p className="text-gray-600">Service</p>
                      <p className="font-medium">{serviceData.selectedService.title}</p>
                    </div>
                  )}
                  
                  {serviceData?.selectedLocation && (
                    <div className="pb-3 border-b">
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium">
                        {serviceData.selectedLocation.formattedAddress || 
                         serviceData.selectedLocation.cityName}
                      </p>
                    </div>
                  )}
                  
                  {serviceData?.dateTime && (
                    <div className="pb-3 border-b">
                      <p className="text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {new Date(serviceData.dateTime.date).toLocaleDateString()} at {serviceData.dateTime.time}
                      </p>
                    </div>
                  )}
                  
                  {serviceData?.subtotal && (
                    <div className="pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-teal-600">€{serviceData.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-blue-800">
                      {isAuthenticated 
                        ? "Your details are pre-filled from your account"
                        : "No account needed! Book as a guest or create one for easy management"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;