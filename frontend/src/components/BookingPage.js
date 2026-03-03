import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useBooking } from "../contexts/BookingContext";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  Euro,
  Home,
  Shield,
  MapPin,
} from "lucide-react";

// Date and Time Picker Component - Keeping the existing implementation
const DateTimePicker = ({ onSelectDateTime, selectedDateTime }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Set values if they're already selected
  useEffect(() => {
    if (selectedDateTime) {
      setSelectedDate(selectedDateTime.date);
      setSelectedTime(selectedDateTime.time);
    }
  }, [selectedDateTime]);

  // Generate next 14 days for selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  };

  // Available time slots - could come from API based on cleaner availability
  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  // When both date and time are selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      onSelectDateTime({ date: selectedDate, time: selectedTime });
    }
  }, [selectedDate, selectedTime, onSelectDateTime]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-2 text-teal-600" size={20} />
        Select Date & Time
      </h3>

      {/* Date Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Available Dates</h4>
        <div className="flex overflow-x-auto pb-4 space-x-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {generateDates().map((date, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 p-3 rounded-lg text-center min-w-[85px] border transition-colors
                        ${
                          selectedDate &&
                          selectedDate.toDateString() === date.toDateString()
                            ? "bg-teal-600 text-white border-teal-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:shadow-sm"
                        }`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="font-bold">{date.getDate()}</div>
              <div className="text-xs uppercase">
                {new Intl.DateTimeFormat("en-US", { month: "short" }).format(
                  date
                )}
              </div>
              <div className="text-xs mt-1">
                {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
                  date
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Selection - Only show if date is selected */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-medium text-gray-700 mb-3">
            Available Times for {formatDate(selectedDate)}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {timeSlots.map((time, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`py-2 px-3 rounded-lg border text-center transition-colors
                          ${
                            selectedTime === time
                              ? "bg-teal-600 text-white border-teal-600 shadow-md"
                              : "bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:shadow-sm"
                          }`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-3 bg-teal-50 rounded-lg text-teal-700 flex items-center"
        >
          <CheckCircle size={18} className="mr-2" />
          <span>
            You selected: {formatDate(selectedDate)} at {selectedTime}
          </span>
        </motion.div>
      )}
    </div>
  );
};

// Apartment Size Component - Simplified
const ApartmentSize = ({ size, setSize }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Home className="mr-2 text-teal-600" size={20} />
        What is the size of your apartment?
      </h3>

      <p className="text-gray-600 mb-6 text-sm">
        This helps us estimate the cleaning time needed for your space
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer text-center transition-colors
                    ${
                      size === "50"
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-200 hover:shadow-sm"
                    }`}
          onClick={() => setSize("50")}
        >
          <h4 className="font-medium text-gray-800 mb-2">Small</h4>
          <p className="text-gray-500 mb-1">Up to 50m²</p>
          <p className="text-sm text-gray-700">Studio or 1 bedroom</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer text-center transition-colors
                    ${
                      size === "80"
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-200 hover:shadow-sm"
                    }`}
          onClick={() => setSize("80")}
        >
          <h4 className="font-medium text-gray-800 mb-2">Medium</h4>
          <p className="text-gray-500 mb-1">50-80m²</p>
          <p className="text-sm text-gray-700">1-2 bedrooms</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer text-center transition-colors
                    ${
                      size === "120"
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-200 hover:shadow-sm"
                    }`}
          onClick={() => setSize("120")}
        >
          <h4 className="font-medium text-gray-800 mb-2">Large</h4>
          <p className="text-gray-500 mb-1">80-120m²</p>
          <p className="text-sm text-gray-700">2-3 bedrooms</p>
        </motion.div>
      </div>
    </div>
  );
};

// Subscription Options Component - Renamed to CleaningFrequency
const CleaningFrequency = ({ onSelectFrequency, frequency }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Euro className="mr-2 text-teal-600" size={20} />
        How often do you need cleaning?
      </h3>

      <p className="text-gray-600 mb-6 text-sm">
        Get regular cleanings at a discounted rate. Cancel or reschedule
        anytime.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer transition-colors
                    ${
                      frequency === "one-time"
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-200 hover:shadow-sm"
                    }`}
          onClick={() => onSelectFrequency("one-time")}
        >
          <h4 className="font-medium text-gray-800 mb-2">One-time Service</h4>
          <p className="text-gray-500 mb-3">
            One-time cleaning without any commitment
          </p>
          <div className="text-teal-600 font-bold">Regular price</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer relative transition-colors
                    ${
                      frequency === "bi-weekly"
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-200 hover:shadow-sm"
                    }`}
          onClick={() => onSelectFrequency("bi-weekly")}
        >
          <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
            POPULAR
          </div>
          <h4 className="font-medium text-gray-800 mb-2">Bi-weekly</h4>
          <p className="text-gray-500 mb-3">Cleaning every two weeks</p>
          <div className="text-teal-600 font-bold">Save 10%</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer transition-colors
                    ${
                      frequency === "weekly"
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-200 hover:shadow-sm"
                    }`}
          onClick={() => onSelectFrequency("weekly")}
        >
          <h4 className="font-medium text-gray-800 mb-2">Weekly</h4>
          <p className="text-gray-500 mb-3">
            Cleaning every week for maximum convenience
          </p>
          <div className="text-teal-600 font-bold">Save 15%</div>
        </motion.div>
      </div>

      {frequency !== "one-time" && (
        <div className="mt-4 bg-green-50 p-3 rounded-lg text-sm text-green-700 flex">
          <CheckCircle className="mr-2 flex-shrink-0" size={18} />
          <p>
            Great choice! You'll save on every cleaning and can cancel or modify
            your plan anytime.
          </p>
        </div>
      )}
    </div>
  );
};

// Progress Steps Component - Updated for auto-assignment flow
const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: "service", label: "Service" },
    { id: "location", label: "Location" },
    { id: "schedule", label: "Schedule" },
    { id: "payment", label: "Payment" },
  ];

  return (
    <div className="hidden md:flex justify-center mb-10">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center font-medium 
                          ${
                            index < currentStep
                              ? "bg-teal-600 text-white"
                              : index === currentStep
                              ? "bg-teal-100 text-teal-800 border border-teal-600"
                              : "bg-white text-gray-400 border border-gray-300"
                          }`}
              >
                {index < currentStep ? <CheckCircle size={16} /> : index + 1}
              </div>
              <div
                className={`text-xs mt-1 whitespace-nowrap ${
                  index === currentStep
                    ? "font-semibold text-teal-800"
                    : "text-gray-500"
                }`}
              >
                {step.label}
              </div>
            </div>

            {/* Connector Line (except after last step) */}
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-1
                          ${
                            index < currentStep ? "bg-teal-600" : "bg-gray-300"
                          }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Main BookingPage Component - Fixed to properly handle location data
const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    bookingData,
    setDateTime,
    setCustomerDetails,
    calculateTotal,
    nextStep,
    updateBooking,
    startBooking,
  } = useBooking();

  // Extract information from the routing state or bookingContext
  // First check for service information
  const [selectedService, setSelectedService] = useState(() => {
    if (bookingData?.service) {
      return bookingData.service;
    }
    if (location.state?.selectedService) {
      return location.state.selectedService;
    }
    return null;
  });

  // Properly extract location information - FIXED
  const [selectedLocation, setSelectedLocation] = useState(() => {
    // Log state for debugging
    console.log("Location state coming in:", location.state);

    // Get location from either source
    const locationFromRouter = location.state?.selectedLocation;
    const locationFromContext = bookingData?.location;

    // Validation function
    const isValidLocation = (loc) => {
      return (
        loc &&
        loc.postalCode &&
        (loc.formattedAddress || (loc.cityName && loc.postalCode))
      );
    };

    // First try to get from location state (prioritize this)
    if (locationFromRouter && isValidLocation(locationFromRouter)) {
      console.log(
        "Using valid location from router state:",
        locationFromRouter
      );
      return locationFromRouter;
    }

    // Then try from booking context
    if (locationFromContext && isValidLocation(locationFromContext)) {
      console.log(
        "Using valid location from booking context:",
        locationFromContext
      );
      return locationFromContext;
    }

    // If we have location data but it's invalid, still use it but warn
    if (locationFromRouter || locationFromContext) {
      const partialLocation = locationFromRouter || locationFromContext;
      console.warn(
        "Location data is incomplete but using anyway:",
        partialLocation
      );
      return partialLocation;
    }

    console.error("No location data found in router state or booking context");
    return null;
  });

  // Keep booking context in sync with location from router
  useEffect(() => {
    if (selectedLocation && location.state?.selectedLocation) {
      // If we got location from router state and it's different from context, update context
      if (
        JSON.stringify(selectedLocation) !==
        JSON.stringify(bookingData?.location)
      ) {
        console.log("Syncing location to booking context");
        if (typeof updateBooking === "function") {
          updateBooking({ location: selectedLocation });
        } else if (typeof startBooking === "function") {
          startBooking({
            service: selectedService,
            location: selectedLocation,
          });
        }
      }
    }
  }, [selectedLocation]);

  // Format the location for display - FIXED
  const getFormattedLocation = () => {
    if (!selectedLocation) return "Location not set";

    // If we have a formatted address, use it
    if (selectedLocation.formattedAddress) {
      return selectedLocation.formattedAddress;
    }

    // Otherwise build from components
    if (selectedLocation.cityName && selectedLocation.postalCode) {
      return `${selectedLocation.cityName}, ${selectedLocation.postalCode}`;
    }

    // Fallback to basic components
    const components = [];
    if (selectedLocation.streetName)
      components.push(selectedLocation.streetName);
    if (selectedLocation.streetNumber)
      components.push(selectedLocation.streetNumber);
    if (selectedLocation.cityName) components.push(selectedLocation.cityName);
    if (selectedLocation.postalCode)
      components.push(selectedLocation.postalCode);

    return components.length > 0
      ? components.join(", ")
      : "Location not specified";
  };

  // Get the formatted location for display
  const serviceLocation = getFormattedLocation();

  // Setup local state from context or defaults
  const [frequency, setFrequency] = useState(
    bookingData.customer?.frequency || "one-time"
  );
  const [apartmentSize, setApartmentSize] = useState(
    bookingData.customer?.apartmentSize || "80"
  );
  const [dateTime, setDateTimeLocal] = useState(
    bookingData.dateTime?.date && bookingData.dateTime?.time
      ? { date: bookingData.dateTime.date, time: bookingData.dateTime.time }
      : null
  );

  // Calculate subtotal as selections change
  const [subtotal, setSubtotal] = useState(selectedService?.price || 0);

  // Update subtotal when form values change
  useEffect(() => {
    if (!selectedService) return;

    let total = selectedService.price;

    // Apply subscription discounts
    if (frequency === "bi-weekly") {
      total = total * 0.9; // 10% discount
    } else if (frequency === "weekly") {
      total = total * 0.85; // 15% discount
    }

    // Adjust based on apartment size
    if (apartmentSize === "120") {
      total = total * 1.2; // 20% increase for large apartments
    }

    setSubtotal(total);
  }, [selectedService, frequency, apartmentSize]);

  // Check if we have required data and redirect if missing
  useEffect(() => {
    if (!selectedService) {
      console.log("No service selected, redirecting to services page");
      navigate("/services");
      return;
    }

    if (!selectedLocation) {
      console.log("No location provided, redirecting to location page");
      navigate("/location", { state: { selectedService } });
      return;
    }

    // Log the exact location data we have for debugging
    console.log("Current location data in BookingPage:", selectedLocation);
  }, [selectedService, selectedLocation, navigate]);

  // Update context when frequency changes
  const handleFrequencyChange = (newFrequency) => {
    setFrequency(newFrequency);
    setCustomerDetails({
      ...bookingData.customer,
      frequency: newFrequency,
    });
  };

  // Update context when apartment size changes
  const handleApartmentSizeChange = (newSize) => {
    setApartmentSize(newSize);
    setCustomerDetails({
      ...bookingData.customer,
      apartmentSize: newSize,
    });
  };

  // Update context when date/time changes
  const handleDateTimeChange = useCallback(
    (newDateTime) => {
      setDateTimeLocal(newDateTime);

      if (newDateTime?.date && newDateTime?.time) {
        setDateTime(newDateTime.date, newDateTime.time);
      }
    },
    [setDateTime]
  ); // Only recreate if setDateTime changes

  // Proceed to payment page
  const proceedToPayment = () => {
    // Validate required fields
    if (!dateTime) {
      alert("Please select a date and time to continue");
      return;
    }

    // Update any final context data
    setCustomerDetails({
      ...bookingData.customer,
      frequency,
      apartmentSize,
    });

    // Update price in context
    calculateTotal();

    // Move to next step in context
    nextStep();

    // Make sure location data is correctly preserved and logged
    console.log("Location being passed to payment:", selectedLocation);

    // Navigate to payment page (skipping cleaner selection)
    navigate("/booking/customer-details", {
      state: {
        selectedService,
        selectedLocation,
        dateTime,
        frequency,
        apartmentSize,
        subtotal,
        customizations: bookingData?.customizations
      }
    });
  };

  // If no service or location, show loading while redirect happens
  if (!selectedService || !selectedLocation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Clock className="animate-spin mr-2 text-teal-600" size={24} />
          <span className="text-gray-700">Loading your booking details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/location")}
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Location
          </button>
        </div>

        {/* Progress Steps - Shows user's progress */}
        <ProgressSteps currentStep={2} />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Schedule Your Cleaning
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose when and how often you'd like your space cleaned.
          </p>
        </motion.div>

        {/* Auto-Matching Banner - NEW */}
        <div className="bg-blue-50 rounded-xl p-5 mb-8 border border-blue-100">
          <div className="flex items-center">
            <Shield className="text-blue-600 mr-4 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-medium text-gray-800 mb-1">
                Smart Matching Enabled
              </h3>
              <p className="text-gray-600 text-sm">
                Based on your schedule and location, we'll automatically match
                you with the best available cleaner. No need to browse profiles
                – we handle the selection for you.
              </p>
            </div>
          </div>
        </div>

        {/* Main content - 2 column layout on larger screens */}
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left column - primary booking flow */}
          <div className="lg:w-2/3 space-y-6">
            {/* Selected Service & Location Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Your Booking
              </h3>

              {/* Service Info */}
              <div className="flex items-center mb-4 pb-4 border-b">
                <div className="bg-teal-100 p-3 rounded-full mr-3 flex-shrink-0">
                  <svg
                    className="text-teal-600 w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 9V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4"></path>
                    <path d="M3 13h18"></path>
                    <path d="M5 17h14"></path>
                    <path d="M12 21v-8"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">
                    {selectedService.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedService.description}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="text-teal-600 font-bold">
                    €{selectedService.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Location Info */}
              <div className="flex items-center">
                <div className="bg-teal-100 p-3 rounded-full mr-3 flex-shrink-0">
                  <MapPin className="text-teal-600 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">Location</h4>
                  <p className="text-sm text-gray-600">{serviceLocation}</p>
                </div>
              </div>
            </div>

            {/* Date and Time Selection */}
            <DateTimePicker
              onSelectDateTime={handleDateTimeChange}
              selectedDateTime={dateTime}
            />

            {/* Apartment Size */}
            <ApartmentSize
              size={apartmentSize}
              setSize={handleApartmentSizeChange}
            />

            {/* Cleaning Frequency */}
            <CleaningFrequency
              onSelectFrequency={handleFrequencyChange}
              frequency={frequency}
            />

            {/* Next Step Button - Updated text */}
            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-colors
                        ${
                          dateTime
                            ? "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                onClick={proceedToPayment}
                disabled={!dateTime}
              >
                Continue to Payment
                <ChevronRight size={20} className="ml-2" />
              </motion.button>

              {!dateTime && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Please select a date and time to continue
                </p>
              )}
            </div>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-32">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Booking Summary
                </h3>

                <div className="space-y-3">
                  {selectedService?.title && (
                    <div className="flex justify-between pb-3 border-b">
                      <div className="text-gray-600">Service</div>
                      <div className="font-medium text-gray-800">
                        {selectedService.title}
                      </div>
                    </div>
                  )}

                  {serviceLocation && (
                    <div className="flex justify-between pb-3 border-b">
                      <div className="text-gray-600">Location</div>
                      <div className="font-medium text-gray-800 max-w-[170px] truncate text-right">
                        {serviceLocation}
                      </div>
                    </div>
                  )}

                  {frequency && (
                    <div className="flex justify-between pb-3 border-b">
                      <div className="text-gray-600">Frequency</div>
                      <div className="font-medium text-gray-800 capitalize">
                        {frequency.replace("-", " ")}
                        {frequency !== "one-time" && (
                          <span className="ml-2 text-sm text-teal-600 font-semibold">
                            ({frequency === "bi-weekly" ? "10% off" : "15% off"}
                            )
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {apartmentSize && (
                    <div className="flex justify-between pb-3 border-b">
                      <div className="text-gray-600">Apartment Size</div>
                      <div className="font-medium text-gray-800">
                        {apartmentSize} m²
                      </div>
                    </div>
                  )}

                  {dateTime && (
                    <div className="flex justify-between pb-3 border-b">
                      <div className="text-gray-600">Date & Time</div>
                      <div className="font-medium text-gray-800">
                        {new Intl.DateTimeFormat("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }).format(dateTime.date)}{" "}
                        at {dateTime.time}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 font-bold">
                    <div className="text-gray-700">Total Price</div>
                    <div className="text-teal-600">€{subtotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-xl p-5 text-sm text-teal-800">
                <h4 className="font-bold mb-2">What happens next:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Complete your booking with payment details</li>
                  <li>
                    Our system will automatically match you with the best
                    available cleaner
                  </li>
                  <li>
                    You'll receive confirmation with your cleaner's details
                  </li>
                  <li>Your cleaner will arrive at the scheduled time</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
