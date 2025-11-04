import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  Plus,
  Download,
  MessageSquare,
  Home,
  ChevronRight,
  Info,
  AlertCircle,
  Navigation
} from 'lucide-react';

// Booking Confirmation Page
const BookingConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData } = location.state || {};
  const receiptRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper function to format location for display
  const formatLocation = (location) => {
    // If it's already a string, return it directly
    if (typeof location === 'string') {
      return location;
    }
    
    // If it's an object, format it
    if (location && typeof location === 'object') {
      // If we have a formatted address, use it
      if (location.formattedAddress) {
        return location.formattedAddress;
      }
      
      // Otherwise try to build from components
      const components = [];
      if (location.streetName) components.push(location.streetName);
      if (location.streetNumber) components.push(location.streetNumber);
      if (location.cityName) components.push(location.cityName);
      if (location.postalCode) components.push(location.postalCode);
      
      return components.length > 0 ? components.join(', ') : "Location not specified";
    }
    
    // Fallback
    return "Location not available";
  };

  // Ensure we have booking data, redirect if not
  useEffect(() => {
    if (!bookingData) {
      console.error("No booking data found in location state");
      
      // Try to recover from sessionStorage
      const savedBooking = sessionStorage.getItem('pendingBookingConfirmation');
      if (savedBooking) {
        try {
          const parsedData = JSON.parse(savedBooking);
          if (parsedData.confirmationData) {
            console.log("Recovered booking data from sessionStorage", parsedData.confirmationData);
            // Redirect with the recovered data
            navigate('/booking/confirmation', { 
              state: { bookingData: parsedData.confirmationData },
              replace: true 
            });
            return;
          }
        } catch (e) {
          console.error("Error parsing stored booking data:", e);
        }
      }
      
      // If we couldn't recover, redirect to booking
      navigate('/booking');
    }
  }, [bookingData, navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  // Generate and download receipt
  const downloadReceipt = () => {
    if (!bookingData) return;
    
    setIsDownloading(true);
    
    try {
      // Create receipt content
      const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Booking Receipt - ${bookingData.bookingId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #eaeaea;
            padding: 40px;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 20px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0D9488;
          }
          .title {
            font-size: 20px;
            margin: 15px 0;
          }
          .booking-id {
            font-size: 14px;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #0D9488;
          }
          .detail-row {
            display: flex;
            margin-bottom: 8px;
          }
          .detail-label {
            width: 150px;
            font-weight: bold;
          }
          .detail-value {
            flex: 1;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          .table th, .table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eaeaea;
            text-align: left;
          }
          .table th {
            background-color: #f8f9fa;
          }
          .total-row {
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">PureLiving Helpers</div>
            <div class="title">Booking Receipt</div>
            <div class="booking-id">Booking ID: ${bookingData.bookingId}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Booking Details</div>
            <div class="detail-row">
              <div class="detail-label">Service:</div>
              <div class="detail-value">${bookingData.service.title}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date & Time:</div>
              <div class="detail-value">${formatDate(bookingData.dateTime.date)} at ${bookingData.dateTime.time}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Cleaner:</div>
              <div class="detail-value">${bookingData.cleaner.name}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Location:</div>
              <div class="detail-value">${formatLocation(bookingData.location)}</div>
            </div>
            ${bookingData.frequency ? `
            <div class="detail-row">
              <div class="detail-label">Frequency:</div>
              <div class="detail-value">${bookingData.frequency.replace(/-/g, ' ')}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">Payment Summary</div>
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${bookingData.service.title}</td>
                  <td style="text-align: right;">€${bookingData.service.price.toFixed(2)}</td>
                </tr>
                ${bookingData.addons?.map(addon => `
                <tr>
                  <td>Add-on: ${addon.title}</td>
                  <td style="text-align: right;">€${addon.price.toFixed(2)}</td>
                </tr>
                `).join('') || ''}
                ${bookingData.discount ? `
                <tr>
                  <td>Discount (${bookingData.discount.code})</td>
                  <td style="text-align: right;">-€${(bookingData.total - bookingData.finalTotal).toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                  <td>Total</td>
                  <td style="text-align: right;">€${bookingData.finalTotal}</td>
                </tr>
              </tbody>
            </table>
            <div class="detail-row">
              <div class="detail-label">Payment Method:</div>
              <div class="detail-value">${bookingData.paymentMethod.replace(/_/g, ' ')}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Payment Status:</div>
              <div class="detail-value">${bookingData.paymentStatus}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your booking!</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>© ${new Date().getFullYear()} PureLiving Helpers GmbH. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
      `;
      
      // Create blob from HTML content
      const blob = new Blob([receiptContent], { type: 'text/html' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${bookingData.bookingId}.html`;
      
      // Append link, trigger click, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 800); // Longer delay to ensure animation is visible
    } catch (error) {
      console.error("Error generating receipt:", error);
      setIsDownloading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // If no booking data, show loading
  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12">
        {/* Success Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-10"
        >
          <div className="inline-flex justify-center items-center w-24 h-24 bg-teal-100 rounded-full mb-4">
            <CheckCircle className="text-teal-600 w-12 h-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-600">Your booking has been successfully confirmed.</p>
          <div className="flex items-center justify-center mt-4 text-teal-600 font-medium">
            <span>Booking ID: {bookingData.bookingId}</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Booking Details */}
          <motion.div 
            className="md:col-span-3 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Booking Details Card */}
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Booking Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium text-gray-800">
                        {formatDate(bookingData.dateTime.date)} at {bookingData.dateTime.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">{formatLocation(bookingData.location)}</p>
                    </div>
                  </div>
                  
                  {bookingData.frequency && (
                    <div className="flex items-start">
                      <Clock className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-sm text-gray-500">Frequency</p>
                        <p className="font-medium text-gray-800 capitalize">
                          {bookingData.frequency.replace(/-/g, ' ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <User className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Cleaner</p>
                      <p className="font-medium text-gray-800">{bookingData.cleaner.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg 
                      className="text-teal-600 mt-1 mr-3 flex-shrink-0" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M3 6l1.8 12.4c.1.8.8 1.4 1.6 1.4h12.2c.8 0 1.5-.6 1.6-1.4l1.8-12.4" />
                      <path d="M12 10.4V17"/>
                      <path d="M8.4 10.4V17"/>
                      <path d="M15.6 10.4V17"/>
                      <path d="M2.6 6h18.8"/>
                      <path d="M15 6V4.6c0-.9-.7-1.6-1.6-1.6H10.6C9.7 3 9 3.7 9 4.6V6"/>
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-medium text-gray-800">{bookingData.service.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg 
                      className="text-teal-600 mt-1 mr-3 flex-shrink-0" 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M7 15h0"/>
                      <path d="M12 15h0"/>
                      <path d="M17 15h0"/>
                      <path d="M7 9h0"/>
                      <path d="M12 9h0"/>
                      <path d="M17 9h0"/>
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-800 capitalize">
                        {bookingData.paymentMethod.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {bookingData.specialInstructions && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-start">
                    <Info className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Special Instructions</p>
                      <p className="text-gray-800">{bookingData.specialInstructions}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* What to Expect */}
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What to Expect Next</h2>
              
              <ol className="space-y-4">
                <li className="flex">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-gray-800">Confirmation Email</p>
                    <p className="text-gray-600 text-sm">You'll receive a detailed confirmation email with all booking information.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-gray-800">Cleaner Preparation</p>
                    <p className="text-gray-600 text-sm">Your cleaner will prepare for your appointment and may contact you with any questions.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-gray-800">Day of Service</p>
                    <p className="text-gray-600 text-sm">Your cleaner will arrive at the scheduled time. Please ensure access to your property.</p>
                  </div>
                </li>
                
                <li className="flex">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium text-gray-800">Post-Service Rating</p>
                    <p className="text-gray-600 text-sm">After the service, you'll be able to rate your experience and provide feedback.</p>
                  </div>
                </li>
              </ol>

              <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
                <div className="flex items-start">
                  <Navigation className="text-teal-600 mr-3 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-teal-800">Track Your Service in Real-Time</p>
                    <p className="text-sm text-teal-700 mt-1">
                      You can monitor your booking status, see when your cleaner is on the way, and communicate directly through our tracking page.
                    </p>
                    <Link 
                      to={`/booking/track/${bookingData.bookingId}`}
                      className="inline-flex items-center mt-2 text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      Track Your Booking
                      <ChevronRight size={16} className="ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to={`/booking/track/${bookingData.bookingId}`} 
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:bg-teal-50 hover:border-teal-200 border border-transparent transition-all"
              >
                <Navigation className="text-teal-600 mb-2" size={24} />
                <span className="text-gray-800 font-medium">Track Booking</span>
              </Link>

              <Link to="/dashboard" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors">
                <Home className="text-teal-600 mb-2" size={24} />
                <span className="text-gray-800 font-medium">Dashboard</span>
              </Link>
              
              <Link to="/bookings" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors">
                <Calendar className="text-teal-600 mb-2" size={24} />
                <span className="text-gray-800 font-medium">My Bookings</span>
              </Link>
              
              <Link to="/contact" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors">
                <MessageSquare className="text-teal-600 mb-2" size={24} />
                <span className="text-gray-800 font-medium">Contact Us</span>
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Order Summary */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="md:col-span-2"
          >
            <motion.div variants={itemVariants} className="bg-white rounded-lg shadow-sm p-6 md:sticky md:top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Payment Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{bookingData.service.title}</span>
                  <span className="text-gray-800">€{bookingData.service.price.toFixed(2)}</span>
                </div>
                
                {bookingData.addons?.length > 0 && (
                  <>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-600 font-medium">Add-ons</span>
                      <span></span>
                    </div>
                    
                    {bookingData.addons.map((addon, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-gray-600 flex items-center">
                          <Plus size={14} className="mr-1 text-teal-500" />
                          {addon.title}
                        </span>
                        <span className="text-gray-800">€{addon.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </>
                )}
                
                {bookingData.discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({bookingData.discount.code})</span>
                    <span>-€{(bookingData.total - bookingData.finalTotal).toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-teal-600">€{bookingData.finalTotal}</span>
                </div>
                
                <p className="text-gray-500 text-xs mt-2">
                  {bookingData.frequency !== 'one-time' && (
                    <>Recurring {bookingData.frequency.replace(/-/g, ' ')} &middot; </>
                  )}
                  All taxes included
                </p>
              </div>
              
              <div className="flex items-center mt-6 p-3 bg-teal-50 rounded-lg">
                <CheckCircle className="text-teal-600 mr-2 flex-shrink-0" size={18} />
                <p className="text-sm text-teal-800">Payment successfully processed</p>
              </div>
              
              <button 
                onClick={downloadReceipt}
                disabled={isDownloading}
                className="mt-6 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Download size={18} className="mr-2" />
                    Download Receipt
                  </>
                )}
              </button>
              
              <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-yellow-800">Need to make changes?</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      You can modify or cancel your booking up to 24 hours before the scheduled time.
                    </p>
                    <a href="/contact" className="inline-flex items-center mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900">
                      Contact Support
                      <ChevronRight size={16} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;