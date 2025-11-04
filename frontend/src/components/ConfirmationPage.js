import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  User,
  Home,
  Copy,
  Download,
  ChevronRight,
  Share2,
  Shield,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useBooking } from "../contexts/BookingContext";

// Booking Status Component
const BookingStatus = ({ status }) => {
  if (status === 'success') {
    return (
      <div className="flex items-center justify-center bg-green-50 p-4 rounded-xl mb-6 border border-green-200">
        <CheckCircle className="text-green-500 mr-3" size={24} />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment Successful</h2>
          <p className="text-sm text-gray-600">Your booking has been confirmed!</p>
        </div>
      </div>
    );
  } else if (status === 'pending') {
    return (
      <div className="flex items-center justify-center bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
        <Clock className="text-yellow-500 mr-3" size={24} />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment Processing</h2>
          <p className="text-sm text-gray-600">We're confirming your payment, please wait...</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex items-center justify-center bg-red-50 p-4 rounded-xl mb-6 border border-red-200">
        <AlertCircle className="text-red-500 mr-3" size={24} />
        <div>
          <h2 className="text-lg font-bold text-gray-800">Payment Failed</h2>
          <p className="text-sm text-gray-600">
            There was an issue with your payment. Please try again.
          </p>
        </div>
      </div>
    );
  }
};

// Main Confirmation Page Component
const BookingConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingData, resetBooking } = useBooking();
  const [paymentStatus, setPaymentStatus] = useState('success'); // Default to success for MVP
  const [bookingDetails, setBookingDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  // Initialize booking details from state or context
  useEffect(() => {
    // First try to get from location state
    if (location.state?.confirmationData) {
      console.log("Using confirmation data from location state:", location.state.confirmationData);
      setBookingDetails(location.state.confirmationData);
      return;
    }
    
    // Fall back to booking context
    if (bookingData && Object.keys(bookingData).length > 0) {
      console.log("Using booking data from context:", bookingData);
      setBookingDetails(bookingData);
      return;
    }
    
    // If no data found, redirect to home
    console.log("No booking data found, redirecting to home");
    navigate('/');
  }, [location.state, bookingData, navigate]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  };

  // Format location for display
  const formatLocation = (location) => {
    if (!location) return '';
    
    if (location.formattedAddress) {
      return location.formattedAddress;
    }
    
    if (location.streetName && location.cityName) {
      return `${location.streetName} ${location.streetNumber || ''}, ${location.cityName} ${location.postalCode || ''}`;
    }
    
    return location.toString();
  };

  // Copy booking ID to clipboard
  const copyBookingId = () => {
    if (!bookingDetails?.bookingId) return;
    
    navigator.clipboard.writeText(bookingDetails.bookingId)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy booking ID:', err));
  };

  // Start a new booking
  const handleNewBooking = () => {
    resetBooking();
    navigate('/services');
  };

  // If no booking details, show loading
  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-teal-500 border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={16} className="mr-1" />
            Return to Home
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Booking Confirmation
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Thank you for your booking. Your cleaning service is confirmed.
          </p>
        </motion.div>

        {/* Booking Status */}
        <BookingStatus status={paymentStatus} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details - Left/Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking ID */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
                  <p className="text-lg font-bold text-gray-800">{bookingDetails.bookingId || 'BK12345678'}</p>
                </div>
                <button 
                  onClick={copyBookingId}
                  className="flex items-center text-teal-600 hover:text-teal-700 p-2 rounded-md hover:bg-teal-50"
                >
                  {copied ? (
                    <><CheckCircle size={16} className="mr-1" /> Copied</>
                  ) : (
                    <><Copy size={16} className="mr-1" /> Copy ID</>
                  )}
                </button>
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Service Details</h3>
              
              <div className="space-y-4">
                {/* Service */}
                <div className="flex items-start">
                  <div className="bg-teal-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                    <Home className="text-teal-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Service</h4>
                    <p className="text-gray-900">{bookingDetails.service?.title || 'Home Cleaning'}</p>
                    <p className="text-sm text-gray-500 mt-1">{bookingDetails.service?.description || 'Regular home cleaning service'}</p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start">
                  <div className="bg-teal-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                    <Calendar className="text-teal-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Date & Time</h4>
                    <p className="text-gray-900">
                      {bookingDetails.dateTime ? (
                        `${formatDate(bookingDetails.dateTime.date)} at ${bookingDetails.dateTime.time}`
                      ) : 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start">
                  <div className="bg-teal-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                    <MapPin className="text-teal-600 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Location</h4>
                    <p className="text-gray-900">{formatLocation(bookingDetails.location) || 'Not specified'}</p>
                  </div>
                </div>

                {/* Apartment Size */}
                {bookingDetails.apartmentSize && (
                  <div className="flex items-start">
                    <div className="bg-teal-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                      <Home className="text-teal-600 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Apartment Size</h4>
                      <p className="text-gray-900">{bookingDetails.apartmentSize} m²</p>
                    </div>
                  </div>
                )}

                {/* Frequency */}
                {bookingDetails.frequency && (
                  <div className="flex items-start">
                    <div className="bg-teal-100 p-2 rounded-full mr-3 mt-1 flex-shrink-0">
                      <Clock className="text-teal-600 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Frequency</h4>
                      <p className="text-gray-900">{bookingDetails.frequency.replace("-", " ")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Auto-Matched Cleaner Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Your Cleaner</h3>
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  Auto-matched
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-gray-200 rounded-full p-3 mr-4">
                  <User className="text-gray-500 w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Professional Cleaner</h4>
                  <p className="text-sm text-gray-600">
                    We've matched you with one of our top-rated professionals
                  </p>
                  <div className="mt-2 text-sm text-blue-600 flex items-center">
                    <Shield size={14} className="mr-1" />
                    Details will be sent via email 24h before your appointment
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center py-2.5 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                <Download size={16} className="mr-2" />
                Download Receipt
              </button>
              
              <button
                onClick={() => navigate('/dashboard')} 
                className="flex items-center justify-center py-2.5 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              >
                <User size={16} className="mr-2" />
                Manage Booking
              </button>
              
              <button 
                onClick={handleNewBooking}
                className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              >
                Book Another Service
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>

          {/* Right Column - Summary & What's Next */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payment Summary</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Service Price</span>
                  <span>€{bookingDetails.service?.price?.toFixed(2) || '0.00'}</span>
                </div>
                
                {bookingDetails.frequency && bookingDetails.frequency !== 'one-time' && (
                  <div className="flex justify-between text-green-600">
                    <span>Frequency Discount</span>
                    <span>
                      {bookingDetails.frequency === 'weekly' ? '-15%' : 
                       bookingDetails.frequency === 'bi-weekly' ? '-10%' : ''}
                    </span>
                  </div>
                )}
                
                {bookingDetails.apartmentSize === '120' && (
                  <div className="flex justify-between">
                    <span>Large Apartment Fee</span>
                    <span>+20%</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-teal-600">€{bookingDetails.total?.toFixed(2) || bookingDetails.service?.price?.toFixed(2) || '0.00'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Paid with {bookingDetails.paymentMethod || 'Card'}</p>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
              <h3 className="text-lg font-bold text-gray-800 mb-3">What's Next?</h3>
              
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="text-teal-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>You'll receive a confirmation email with all details</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-teal-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>Cleaner information will be shared 24h before the appointment</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-teal-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>You'll get a reminder on the day of service</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="text-teal-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>After the service, you can rate your experience and provide feedback</span>
                </li>
              </ul>
            </div>

            {/* Need Help? */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Need help?</h3>
              <p className="text-gray-600 text-sm mb-3">
                If you have any questions about your booking, our support team is ready to help.
              </p>
              <Link
                to="/contact"
                className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center"
              >
                Contact Support
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;