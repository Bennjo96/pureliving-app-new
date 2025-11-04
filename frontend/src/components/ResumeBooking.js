// src/components/ResumeBooking.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from './common/LoadingSpinner';

const ResumeBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { resumeBooking, updateBooking, currentBooking, loading, error, step } = useBooking();
  const { showToast } = useNotification();
  
  const [loadingState, setLoadingState] = useState('loading'); // 'loading', 'success', 'error'
  const [bookingData, setBookingData] = useState(null);
  const [loadingError, setLoadingError] = useState(null);

  // Load the booking
  useEffect(() => {
    const loadBooking = async () => {
      setLoadingState('loading');
      
      try {
        // First try to load from the BookingContext
        if (currentBooking && currentBooking.id === bookingId) {
          setBookingData(currentBooking);
          setLoadingState('success');
          return;
        }
        
        // If not in context, load from API
        const booking = await resumeBooking(bookingId);
        setBookingData(booking);
        setLoadingState('success');
      } catch (err) {
        console.error('Error resuming booking:', err);
        setLoadingError(err.message || 'Failed to resume booking');
        setLoadingState('error');
        showToast('Failed to resume booking: ' + (err.message || 'Unknown error'), 'error');
      }
    };
    
    loadBooking();
  }, [bookingId, resumeBooking, currentBooking, showToast]);

  // Handle continue booking
  const handleContinue = () => {
    // Route to the appropriate step in the booking flow
    if (step === 1) {
      navigate('/booking');
    } else if (step === 2) {
      navigate('/booking/cleaners');
    } else if (step === 3) {
      navigate('/booking/details');
    } else if (step === 4) {
      navigate('/booking/payment');
    } else {
      navigate('/booking');
    }
  };

  // Handle update booking
  const handleUpdate = (field, value) => {
    updateBooking({ [field]: value });
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    return timeString;
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-gray-800">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Resume Booking
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Continue your booking process where you left off.
            </p>
          </div>
          
          {/* Body */}
          <div className="px-4 py-5 sm:p-6">
            {loadingState === 'loading' ? (
              <div className="text-center py-12">
                <LoadingSpinner />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Loading your booking...
                </p>
              </div>
            ) : loadingState === 'error' ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                  <svg className="h-6 w-6 text-red-600 dark:text-red-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mt-3 text-sm font-medium text-red-800 dark:text-red-200">{loadingError}</h3>
                <div className="mt-4">
                  <Link
                    to="/booking"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Start a New Booking
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                {/* Booking summary */}
                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(bookingData.status)}`}>
                      {bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
                    </span>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      This booking was last updated on {formatDate(bookingData.updatedAt)}
                    </p>
                  </div>
                  
                  {/* Service type */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Service Type</h4>
                    <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                      {bookingData.serviceType}
                    </p>
                  </div>
                  
                  {/* Date and time */}
                  {bookingData.date && (
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h4>
                        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                          {formatDate(bookingData.date)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</h4>
                        <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                          {formatTime(bookingData.time)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Address */}
                  {bookingData.address && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</h4>
                      <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">
                        {bookingData.address}
                      </p>
                    </div>
                  )}
                  
                  {/* Selected cleaner */}
                  {bookingData.cleaner && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Selected Cleaner</h4>
                      <div className="mt-1 flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {bookingData.cleaner.profileImage ? (
                            <img className="h-10 w-10 rounded-full" src={bookingData.cleaner.profileImage} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-medium">
                                {bookingData.cleaner.firstName.charAt(0)}{bookingData.cleaner.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            {bookingData.cleaner.firstName} {bookingData.cleaner.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {bookingData.cleaner.rating ? `★ ${bookingData.cleaner.rating.toFixed(1)}` : 'No ratings yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {bookingData.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Special Instructions</h4>
                      <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
                        {bookingData.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Price */}
                  {bookingData.price && (
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="flex justify-between">
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">Total Price</h4>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          €{bookingData.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Next steps */}
                <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">Next Steps</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {step === 1 && "You need to select a service type and location."}
                    {step === 2 && "You need to select a cleaner."}
                    {step === 3 && "You need to provide booking details like date, time, and address."}
                    {step === 4 && "You need to complete the payment process."}
                  </p>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <Link
                      to="/booking"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      Start New Booking
                    </Link>
                    
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Continue Booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBooking;