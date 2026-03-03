import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useBooking } from "../contexts/BookingContext";
import { useAuth } from "../contexts/AuthContext";
import { paymentService, bookingService } from "../api/api";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Lock,
  MapPin,
  Calendar,
  Home,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// Initialize Stripe — reads REACT_APP_STRIPE_PUBLISHABLE_KEY from frontend/.env
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");

// Progress Steps Component
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
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-1 ${
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

// Payment Method Section
const PaymentMethodSection = ({
  selectedMethod,
  setSelectedMethod,
  isTestMode,
}) => {
  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Secure and instant payment",
      icon: CreditCard,
      testNote: "Test cards available in MVP mode",
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Fast checkout with PayPal",
      icon: CreditCard,
      testNote: "Simulated PayPal in MVP mode",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <CreditCard className="mr-2 text-teal-600" size={20} />
        Payment Method
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`flex items-center p-4 rounded-lg cursor-pointer border transition-all
              ${
                selectedMethod === method.id
                  ? "border-teal-500 bg-teal-50 shadow-sm"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <method.icon className="text-teal-600 mr-3" size={20} />
            <div className="flex-1">
              <span className="text-gray-800 font-medium">{method.name}</span>
              <p className="text-sm text-gray-500 mt-1">{method.description}</p>
              {isTestMode && (
                <p className="text-xs text-amber-600 mt-1">{method.testNote}</p>
              )}
            </div>
            {selectedMethod === method.id && (
              <CheckCircle className="ml-auto text-teal-600" size={18} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// MVP Test Card Form
const TestCardForm = ({ cardDetails, setCardDetails, formErrors }) => {
  const handleCardNumberChange = (value) => {
    const cleaned = value.replace(/\s+/g, "").replace(/\D/g, "");
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (value) => {
    const cleaned = value.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    setCardDetails({ ...cardDetails, expiry: formatted });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <input
          type="text"
          placeholder="1234 5678 9012 3456"
          className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500
            ${formErrors.cardNumber ? "border-red-300" : "border-gray-300"}`}
          value={cardDetails.number}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          maxLength={19}
        />
        {formErrors.cardNumber && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {formErrors.cardNumber}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="text"
            placeholder="MM/YY"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500
              ${formErrors.expiry ? "border-red-300" : "border-gray-300"}`}
            value={cardDetails.expiry}
            onChange={(e) => handleExpiryChange(e.target.value)}
            maxLength={5}
          />
          {formErrors.expiry && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {formErrors.expiry}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            placeholder="123"
            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500
              ${formErrors.cvv ? "border-red-300" : "border-gray-300"}`}
            value={cardDetails.cvv}
            onChange={(e) =>
              setCardDetails({
                ...cardDetails,
                cvv: e.target.value.replace(/\D/g, ""),
              })
            }
            maxLength={3}
          />
          {formErrors.cvv && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {formErrors.cvv}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Stripe Card Form Component
const StripeCardForm = ({ formErrors }) => {
  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
          <CardElement options={cardElementOptions} />
        </div>
        {formErrors.card && (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            {formErrors.card}
          </p>
        )}
      </div>
    </div>
  );
};

// Card Details Form Wrapper
const CardDetailsForm = ({
  isTestMode,
  cardDetails,
  setCardDetails,
  formErrors,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Lock className="mr-2 text-teal-600" size={20} />
        Card Details
      </h3>
      {isTestMode ? (
        <TestCardForm
          cardDetails={cardDetails}
          setCardDetails={setCardDetails}
          formErrors={formErrors}
        />
      ) : (
        <StripeCardForm formErrors={formErrors} />
      )}
    </div>
  );
};

// Checkout Form Component (handles Stripe payment)
const CheckoutForm = ({
  handlePayment,
  isProcessing,
  paymentError,
  bookingData,
  isTestMode,
  cardDetails,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const processStripePayment = async () => {
    if (!stripe || !elements) {
      return handlePayment(async () => {
        throw new Error("Stripe has not loaded yet. Please refresh the page and try again.");
      });
    }

    const card = elements.getElement(CardElement);
    if (!card) return;

    return await handlePayment(async (clientSecret) => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card,
            billing_details: {
              name: bookingData?.customer?.firstName
                ? `${bookingData.customer.firstName} ${bookingData.customer.lastName || ""}`.trim()
                : "Customer",
              email: bookingData?.customer?.email || undefined,
            },
          },
        }
      );

      if (error) {
        // Stripe errors already have user-friendly messages
        throw new Error(error.message);
      }

      if (paymentIntent.status !== "succeeded") {
        throw new Error(
          `Payment ${paymentIntent.status}. Please try again or contact support.`
        );
      }

      return {
        id: paymentIntent.id,
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
      };
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-colors
        ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
        }`}
      onClick={isTestMode ? () => handlePayment() : processStripePayment}
      disabled={isProcessing || (!isTestMode && (!stripe || !elements))}
    >
      {isProcessing ? (
        <div className="flex items-center">
          <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing Payment...</span>
        </div>
      ) : (
        <>
          Complete Payment
          <ChevronRight size={20} className="ml-2" />
        </>
      )}
    </motion.button>
  );
};

// MVP payment processing
const processMVPPayment = async (paymentData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isFailureTest =
        paymentData.cardNumber?.replace(/\s/g, "") === "4111111111111111";

      if (isFailureTest) {
        reject(new Error("Payment declined for testing purposes"));
      } else {
        resolve({
          transactionId: "MVP_TRANS_" + Math.floor(Math.random() * 1000000),
          status: "success",
          message: "Payment processed successfully (MVP Mode)",
        });
      }
    }, 1500);
  });
};

// Main Payment Page Component
const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData, completeBooking, createBooking } = useBooking();
  const { isAuthenticated } = useAuth();

  // MVP Mode Toggle
  const [isTestMode, setIsTestMode] = useState(true); // Start in test mode for MVP

  // Get data from router state or booking context
  const [selectedService] = useState(() => {
    return location.state?.selectedService || bookingData?.service || null;
  });

  const [selectedLocation] = useState(() => {
    return location.state?.selectedLocation || bookingData?.location || null;
  });

  const [dateTime] = useState(() => {
    return (
      location.state?.dateTime ||
      (bookingData?.dateTime?.date && bookingData?.dateTime?.time
        ? { date: bookingData.dateTime.date, time: bookingData.dateTime.time }
        : null)
    );
  });

  const [apartmentSize] = useState(
    location.state?.apartmentSize ||
      bookingData?.customer?.apartmentSize ||
      "80"
  );

  const [frequency] = useState(
    location.state?.frequency || bookingData?.customer?.frequency || "one-time"
  );

  const [subtotal] = useState(
    location.state?.subtotal || selectedService?.price || 0
  );

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "4242424242424242",
    expiry: "12/25",
    cvv: "123",
  });
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [paymentError, setPaymentError] = useState(null);

  // PayPal configuration
  const paypalOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test",
    currency: "EUR",
    intent: "capture",
    "disable-funding": "credit,card", // Disable credit and card options in PayPal
  };

  // Format location for display
  const getFormattedLocation = () => {
    if (!selectedLocation) return "Location not set";
    if (selectedLocation.formattedAddress) {
      return selectedLocation.formattedAddress;
    }
    if (selectedLocation.cityName && selectedLocation.postalCode) {
      return `${selectedLocation.cityName}, ${selectedLocation.postalCode}`;
    }
    return "Location not specified";
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  // Redirect if essential data is missing
  useEffect(() => {
    if (!selectedService) {
      navigate("/services");
    } else if (!selectedLocation) {
      navigate("/location", { state: { selectedService } });
    } else if (!dateTime) {
      navigate("/booking", { state: { selectedService, selectedLocation } });
    }
  }, [selectedService, selectedLocation, dateTime, navigate]);

  // In live (non-test) mode, ensure the booking is created on the backend before payment
  useEffect(() => {
    if (isTestMode) return;
    if (bookingData.bookingId) return; // already created
    if (!selectedService || !selectedLocation || !dateTime) return;

    createBooking().catch((err) => {
      console.error("Failed to pre-create booking:", err);
      setPaymentError(
        "We couldn't initialise your booking. Please go back and try again."
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestMode]);

  // Reset payment error when payment method changes
  useEffect(() => {
    setPaymentError(null);
  }, [paymentMethod]);

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (isTestMode && paymentMethod === "card") {
      if (
        !cardDetails.number ||
        cardDetails.number.replace(/\s/g, "").length < 16
      ) {
        errors.cardNumber = "Please enter a valid card number";
      }

      if (!cardDetails.expiry || !cardDetails.expiry.includes("/")) {
        errors.expiry = "Please enter a valid expiry date";
      } else {
        const [month, year] = cardDetails.expiry.split("/");
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (
          parseInt(year) < currentYear ||
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)
        ) {
          errors.expiry = "Card is expired";
        }
      }

      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        errors.cvv = "Please enter a valid CVV";
      }
    }

    if (!isTermsAccepted) {
      errors.terms = "You must accept the terms to continue";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle payment submission
  // Handle payment submission
  const handleSubmitPayment = async (stripePaymentProcessor) => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setPaymentError(null);

    try {
      let paymentResult;

      if (isTestMode) {
        // MVP Mode Payment Processing
        paymentResult = await processMVPPayment({
          amount: subtotal,
          cardNumber: cardDetails.number,
          expiry: cardDetails.expiry,
          cvv: cardDetails.cvv,
          paymentMethod: paymentMethod,
        });
      } else {
        // Real Payment Processing
        if (paymentMethod === "card" && stripePaymentProcessor) {
          // 1. Create a payment intent on the backend
          let intentResponse;
          try {
            intentResponse = await paymentService.createStripePaymentIntent(
              bookingData?.bookingId,
              subtotal
            );
          } catch {
            throw new Error(
              "We couldn't connect to the payment processor. Please check your connection and try again."
            );
          }
          const { clientSecret } = intentResponse.data;

          // 2. Confirm the payment client-side with Stripe.js
          paymentResult = await stripePaymentProcessor(clientSecret);
        }
      }

      // Process booking completion
      const safeService = selectedService
        ? {
            ...selectedService,
            id: selectedService.id || `service-${Date.now()}`,
          }
        : {
            id: `service-${Date.now()}`,
            title: "Cleaning Service",
            price: subtotal,
            duration: "2 hours",
          };

      // For MVP mode, simulate backend response
      if (isTestMode) {
        // Create mock booking response
        const mockBookingResponse = {
          success: true,
          data: {
            _id: "BK" + Math.floor(100000 + Math.random() * 900000),
            service: safeService,
            location: selectedLocation,
            dateTime: dateTime,
            frequency: frequency,
            apartmentSize: apartmentSize,
            total: subtotal,
            paymentMethod: paymentMethod,
            paymentStatus: "completed",
            transactionId: paymentResult.transactionId,
            bookingDate: new Date().toISOString(),
            status: "confirmed",
            cleaner: {
              name: "Julia Schmidt",
              id: "CL-" + Math.floor(10000 + Math.random() * 90000),
              rating: 4.9,
              experience: "3 years",
            },
          },
        };

        // Store booking data in sessionStorage as backup
        sessionStorage.setItem(
          "pendingBookingConfirmation",
          JSON.stringify({
            confirmationData: mockBookingResponse.data,
            paymentResult: paymentResult,
          })
        );

        // Update booking context
        if (typeof completeBooking === "function") {
          completeBooking(mockBookingResponse.data);
        }

        // Navigate to confirmation page
        navigate("/booking/confirmation", {
          state: {
            bookingData: mockBookingResponse.data,
            isTestMode: isTestMode,
          },
        });
      } else {
        // Real backend call — notify backend of confirmed payment and trigger assignment
        const bookingApiResponse = await bookingService.processPayment(
          bookingData?.bookingId,
          {
            paymentMethod,
            paymentDetails: {
              transactionId: paymentResult.transactionId,
              paymentIntentId: paymentResult.transactionId, // Stripe paymentIntent.id
              paypalOrderId: paymentResult.paypalOrderId,   // PayPal order ID if applicable
              status: paymentResult.status,
              isTestMode: false,
            },
          }
        );

        const bookingResponse = bookingApiResponse.data;

        if (!bookingResponse.success) {
          throw new Error(bookingResponse.message || "Booking completion failed");
        }

        // Store booking data in sessionStorage as backup
        sessionStorage.setItem(
          "pendingBookingConfirmation",
          JSON.stringify({
            confirmationData: bookingResponse.data,
            paymentResult: paymentResult,
          })
        );

        // Update booking context
        if (typeof completeBooking === "function") {
          completeBooking(bookingResponse.data);
        }

        // Navigate to confirmation page
        navigate("/booking/confirmation", {
          state: {
            bookingData: bookingResponse.data,
            isTestMode: isTestMode,
          },
        });
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      // Stripe errors already contain user-friendly text; fall back to a generic message otherwise
      const msg = error?.message || "";
      setPaymentError(
        msg.length > 0 && msg.length < 200
          ? msg
          : "Something went wrong while processing your payment. Please try again or use a different payment method."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // PayPal create order — must be async so we can await in live mode
  const createPayPalOrder = async (data, actions) => {
    // Both test and live mode: create the order client-side via the PayPal SDK.
    // The SDK handles sandboxing automatically based on the client-id env.
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: subtotal.toFixed(2),
            currency_code: "EUR",
          },
          description: selectedService?.title || "Cleaning Service",
        },
      ],
    });
  };

  // PayPal approve order
  const onPayPalApprove = async (data, actions) => {
    setIsProcessing(true);
    try {
      const order = await actions.order.capture();

      // Notify the backend with the captured PayPal order ID
      await handleSubmitPayment(async () => ({
        id: order.id,
        transactionId: order.id,
        paypalOrderId: order.id,
        status: "completed",
        paymentMethod: "paypal",
      }));
    } catch (error) {
      console.error("PayPal error:", error);
      setPaymentError(
        "Your PayPal payment could not be completed. " +
        "No money has been charged. Please try again or choose a different payment method."
      );
      setIsProcessing(false);
    }
  };

  // If missing required data, show loading state
  if (!selectedService || !selectedLocation || !dateTime) {
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
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Schedule
          </button>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={3} />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Complete Your Payment
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Securely finalize your booking with your preferred payment method.
          </p>
        </motion.div>

        {/* MVP Mode Toggle */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start">
              <Info
                className="text-amber-600 mr-2 mt-0.5 flex-shrink-0"
                size={18}
              />
              <div>
                <h4 className="font-medium text-gray-800">Payment Mode</h4>
                <p className="text-sm text-gray-600">
                  {isTestMode
                    ? "You're in MVP test mode. No real payments will be processed."
                    : "Live payment mode - Real transactions will be processed."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsTestMode(!isTestMode)}
              className="flex items-center space-x-2"
            >
              <span className="text-sm font-medium text-gray-700">
                {isTestMode ? "Test Mode" : "Live Mode"}
              </span>
              {isTestMode ? (
                <ToggleLeft className="text-amber-600" size={32} />
              ) : (
                <ToggleRight className="text-teal-600" size={32} />
              )}
            </button>
          </div>
        </div>

        {/* Payment Error Message */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 flex items-start">
            <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium">Payment Failed</p>
              <p className="text-sm">{paymentError}</p>
            </div>
          </div>
        )}

        {/* Main content - 2 column layout on larger screens */}
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left column - payment form */}
          <div className="lg:w-2/3 space-y-6">
            <PaymentMethodSection
              selectedMethod={paymentMethod}
              setSelectedMethod={setPaymentMethod}
              isTestMode={isTestMode}
            />

            {/* Card Details Form - show for card payment */}
            {paymentMethod === "card" &&
              (isTestMode ? (
                <CardDetailsForm
                  isTestMode={isTestMode}
                  cardDetails={cardDetails}
                  setCardDetails={setCardDetails}
                  formErrors={formErrors}
                />
              ) : (
                <Elements stripe={stripePromise}>
                  <CardDetailsForm
                    isTestMode={isTestMode}
                    formErrors={formErrors}
                  />
                </Elements>
              ))}

            {/* PayPal Button - show for PayPal payment */}
            {paymentMethod === "paypal" && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  PayPal Checkout
                </h3>
                {isTestMode ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Click below to simulate PayPal payment
                    </p>
                    <button
                      onClick={() => handleSubmitPayment()}
                      disabled={!isTermsAccepted || isProcessing}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing
                        ? "Processing..."
                        : "Pay with PayPal (Test)"}
                    </button>
                  </div>
                ) : (
                  <PayPalScriptProvider options={paypalOptions}>
                    <PayPalButtons
                      createOrder={createPayPalOrder}
                      onApprove={onPayPalApprove}
                      onError={(err) => {
                        console.error("PayPal error:", err);
                        setPaymentError(
                          "PayPal checkout failed. Please try again."
                        );
                      }}
                      disabled={!isTermsAccepted}
                    />
                  </PayPalScriptProvider>
                )}
              </div>
            )}

            {/* Test Card Info - For MVP Only */}
            {isTestMode && paymentMethod === "card" && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-4">
                <div className="flex items-start">
                  <Info
                    className="text-amber-600 mr-2 mt-0.5 flex-shrink-0"
                    size={18}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">
                      Test Card Numbers
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>✅ Success: 4242 4242 4242 4242</li>
                      <li>❌ Failure: 4111 1111 1111 1111</li>
                      <li>Use any future expiry date and any 3-digit CVV</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 mr-3"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/terms-of-service", "_blank")}
                    className="text-teal-600 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/privacy-policy", "_blank")}
                    className="text-teal-600 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
              {formErrors.terms && (
                <p className="text-red-500 text-sm mt-2 ml-6 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {formErrors.terms}
                </p>
              )}
            </div>

            {/* Security Info */}
            <div className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-100">
              <div className="flex items-start">
                <ShieldCheck
                  className="text-blue-600 mr-3 mt-1 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    {isTestMode ? "Test Mode Active" : "Secure Payments"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isTestMode
                      ? "This is a test environment. Use the provided test cards to simulate payments."
                      : "Your payment is protected with SSL encryption and complies with the highest security standards."}
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Payment Button */}
            <div className="mt-8">
              {paymentMethod === "card" && !isTestMode ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    handlePayment={handleSubmitPayment}
                    isProcessing={isProcessing}
                    paymentError={paymentError}
                    bookingData={bookingData}
                    isTestMode={isTestMode}
                    cardDetails={cardDetails}
                  />
                </Elements>
              ) : paymentMethod === "card" ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-colors
                   ${
                     isProcessing
                       ? "bg-gray-400 cursor-not-allowed"
                       : "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
                   }`}
                  onClick={() => handleSubmitPayment()}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    <>
                      Complete Payment
                      <ChevronRight size={20} className="ml-2" />
                    </>
                  )}
                </motion.button>
              ) : null}
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

                  {selectedLocation && (
                    <div className="flex justify-between pb-3 border-b">
                      <div className="text-gray-600">Location</div>
                      <div className="font-medium text-gray-800 max-w-[170px] truncate text-right">
                        {getFormattedLocation()}
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
                        {formatDate(dateTime.date)} at {dateTime.time}
                      </div>
                    </div>
                  )}

                  {/* Payment Mode Indicator */}
                  <div className="flex justify-between pb-3 border-b">
                    <div className="text-gray-600">Payment Mode</div>
                    <div
                      className={`font-medium ${
                        isTestMode ? "text-amber-600" : "text-green-600"
                      }`}
                    >
                      {isTestMode ? "Test Mode" : "Live Mode"}
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 font-bold">
                    <div className="text-gray-700">Total Price</div>
                    <div className="text-teal-600">€{subtotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-teal-50 rounded-xl p-5 text-sm text-teal-800">
                <h4 className="font-bold mb-2">What happens next:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>You'll receive an email confirmation of your booking</li>
                  <li>Our system will assign the best available cleaner</li>
                  <li>Your cleaner will arrive at the scheduled time</li>
                  <li>After the service, you can rate your experience</li>
                </ol>
                {isTestMode && (
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                    Note: This is a test booking. No real service will be
                    scheduled.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
