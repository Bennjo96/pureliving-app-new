import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Phone, 
  Info, 
  User, 
  Calendar, 
  ChevronRight, 
  Star, 
  Navigation,
  MoreVertical,
  ExternalLink,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import Navbar from './Navbar';

// Simulating a service for fetching job tracking data
// In a real implementation, this would be an API call
const fetchJobStatus = (bookingId) => {
  // This would be an API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bookingId: bookingId || "BK-2025042801",
        service: {
          title: "Deep Cleaning",
          price: 129.00,
          duration: "4 hours"
        },
        dateTime: {
          date: "2025-05-02T09:00:00",
          time: "09:00"
        },
        location: "Berliner Strasse 127, 10827 Berlin",
        status: "in_progress", // ["confirmed", "en_route", "in_progress", "completed"]
        statusUpdates: [
          { 
            status: "confirmed", 
            timestamp: "2025-04-28T14:32:00", 
            message: "Your booking has been confirmed" 
          },
          { 
            status: "en_route", 
            timestamp: "2025-05-02T08:35:00", 
            message: "Your cleaner is on the way" 
          },
          { 
            status: "in_progress", 
            timestamp: "2025-05-02T09:05:00", 
            message: "Cleaning in progress" 
          }
        ],
        estimatedCompletion: "2025-05-02T13:00:00",
        cleaner: {
          id: "CL-22443",
          name: "Julia Schmidt",
          avatar: "/cleaner-avatar.jpg",
          rating: 4.9,
          experience: "3 years",
          bio: "Professional cleaner specialized in deep cleaning services. Known for attention to detail and thoroughness.",
          location: {
            lat: 52.4850,
            lng: 13.3506
          }
        },
        specialInstructions: "Please pay special attention to the bathroom tiles and kitchen cabinets. The entry code is 4432.",
        contactOptions: ["message", "call"],
        modifications: {
          canAddInstructions: true,
          canRequestExtraTime: true,
          canCancel: false
        }
      });
    }, 1000);
  });
};

// Status Icon Component
const StatusIcon = ({ status }) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="w-6 h-6 text-teal-600" />;
    case 'en_route':
      return <Navigation className="w-6 h-6 text-blue-600" />;
    case 'in_progress':
      return <Clock className="w-6 h-6 text-amber-600" />;
    case 'completed':
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    default:
      return <Info className="w-6 h-6 text-gray-600" />;
  }
};

// Timeline Item Component
const TimelineItem = ({ status, current, timestamp, message, last }) => {
  const date = new Date(timestamp);
  const formattedTime = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  return (
    <div className="flex items-start mb-6 relative">
      {/* Status bullet and line */}
      <div className="flex flex-col items-center mr-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          current 
            ? 'bg-teal-500 text-white ring-4 ring-teal-100' 
            : 'bg-gray-100 text-gray-500'
        }`}>
          <StatusIcon status={status} />
        </div>
        {!last && (
          <div className={`h-full border-l-2 ${
            current ? 'border-dashed border-teal-500' : 'border-gray-200'
          } ml-0 my-2`} style={{ height: '30px' }}></div>
        )}
      </div>
      
      {/* Status information */}
      <div className="flex-1">
        <div className={`font-medium ${current ? 'text-teal-700' : 'text-gray-700'}`}>
          {status === 'confirmed' && 'Booking Confirmed'}
          {status === 'en_route' && 'Cleaner En Route'}
          {status === 'in_progress' && 'Cleaning In Progress'}
          {status === 'completed' && 'Cleaning Completed'}
        </div>
        <div className="text-sm text-gray-500">{formattedTime} - {message}</div>
      </div>
    </div>
  );
};

// Mini Map Component (Placeholder)
const LocationMap = ({ location, cleaner }) => {
  return (
    <div className="mt-4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 h-40 flex items-center justify-center relative">
      <div className="text-gray-500 text-sm flex flex-col items-center">
        <MapPin className="mb-2 text-teal-600" size={24} />
        <div>Interactive map with cleaner location</div>
        <div className="text-xs text-gray-400 mt-1">(Map integration demo)</div>
      </div>
      
      {/* This would be replaced with an actual map integration */}
      <button className="absolute bottom-2 right-2 bg-white p-2 rounded shadow-sm text-xs flex items-center text-gray-700">
        <ExternalLink size={12} className="mr-1" />
        Open in Maps
      </button>
    </div>
  );
};

// Main Job Tracking Page Component
const JobTrackingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showInstructionsInput, setShowInstructionsInput] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Load job data on component mount
  useEffect(() => {
    setLoading(true);
    fetchJobStatus(bookingId)
      .then(data => {
        setJobData(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Could not load booking information. Please try again.");
        setLoading(false);
        console.error("Error fetching job status:", err);
      });
  }, [bookingId]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate estimated time remaining
  const getTimeRemaining = (endTime) => {
    if (!endTime) return null;
    
    const end = new Date(endTime);
    const now = new Date();
    const diffMs = end - now;
    
    if (diffMs < 0) return "Complete soon";
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m remaining`;
    } else {
      return `${diffMins} minutes remaining`;
    }
  };

  // Submit additional instructions
  const handleAdditionalInstructions = () => {
    // This would submit to an API in production
    console.log('Submitting additional instructions:', additionalInstructions);
    
    // Simulating successful submission
    setTimeout(() => {
      setShowInstructionsInput(false);
      // Would update jobData with the new instructions from API
      setJobData(prevData => ({
        ...prevData,
        specialInstructions: prevData.specialInstructions + ' ' + additionalInstructions
      }));
      setAdditionalInstructions('');
    }, 1000);
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-20 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="text-red-500 w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content with job data
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20">
        {/* Back navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Dashboard
          </button>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Job Tracking</h1>
            <p className="text-gray-600">Booking #{jobData.bookingId}</p>
          </div>
          <div className="bg-white shadow-sm rounded-lg px-4 py-2 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase">Status</div>
            <div className="flex items-center font-medium">
              {jobData.status === 'confirmed' && <span className="text-teal-600">Confirmed</span>}
              {jobData.status === 'en_route' && <span className="text-blue-600">En Route</span>}
              {jobData.status === 'in_progress' && <span className="text-amber-600">In Progress</span>}
              {jobData.status === 'completed' && <span className="text-green-600">Completed</span>}
            </div>
          </div>
        </div>

        {/* Main content - 2 column layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Timeline & Details */}
          <div className="lg:w-2/3 space-y-6">
            {/* Timeline Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Service Timeline</h2>
              <div className="pl-2">
                {jobData.statusUpdates.map((update, index) => (
                  <TimelineItem 
                    key={update.status}
                    status={update.status}
                    current={index === jobData.statusUpdates.length - 1}
                    timestamp={update.timestamp}
                    message={update.message}
                    last={index === jobData.statusUpdates.length - 1}
                  />
                ))}
                
                {/* If not all statuses have been reached yet, show future statuses */}
                {!jobData.statusUpdates.some(u => u.status === 'completed') && (
                  <div className="flex items-start mb-6 opacity-50">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">Cleaning Completed</div>
                      <div className="text-sm text-gray-500">Estimated: {formatTime(jobData.estimatedCompletion)}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Estimated completion */}
              {jobData.status === 'in_progress' && (
                <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center">
                    <Clock className="text-amber-600 mr-3" size={20} />
                    <div>
                      <div className="text-sm font-medium text-amber-900">
                        Estimated Completion
                      </div>
                      <div className="text-amber-800">
                        {formatTime(jobData.estimatedCompletion)} ({getTimeRemaining(jobData.estimatedCompletion)})
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Service Information Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium text-gray-800">
                        {formatDate(jobData.dateTime.date)} at {jobData.dateTime.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-800">{jobData.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
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
                      <p className="font-medium text-gray-800">{jobData.service.title}</p>
                      <p className="text-xs text-gray-500">€{jobData.service.price.toFixed(2)} · {jobData.service.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium text-gray-800">{jobData.service.duration}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Special Instructions */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <Info className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Special Instructions</p>
                      <p className="text-gray-800">{jobData.specialInstructions}</p>
                    </div>
                  </div>
                  
                  {jobData.modifications.canAddInstructions && jobData.status !== 'completed' && (
                    <button 
                      onClick={() => setShowInstructionsInput(!showInstructionsInput)}
                      className="text-teal-600 text-sm font-medium hover:text-teal-700 flex-shrink-0"
                    >
                      {showInstructionsInput ? 'Cancel' : 'Add More'}
                    </button>
                  )}
                </div>
                
                {/* Add additional instructions form */}
                <AnimatePresence>
                  {showInstructionsInput && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <textarea
                        value={additionalInstructions}
                        onChange={(e) => setAdditionalInstructions(e.target.value)}
                        placeholder="Add additional instructions for your cleaner..."
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 text-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setShowInstructionsInput(false);
                            setAdditionalInstructions('');
                          }}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAdditionalInstructions}
                          disabled={!additionalInstructions.trim()}
                          className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                          Send Instructions
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            {/* Map Location (if en route) */}
            {jobData.status === 'en_route' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Cleaner Location</h2>
                <p className="text-gray-600 text-sm mb-3">Your cleaner is currently en route to your location.</p>
                <LocationMap location={jobData.location} cleaner={jobData.cleaner.location} />
              </motion.div>
            )}
            
            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              <Link to="/dashboard" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors">
                <svg className="text-teal-600 mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="text-gray-800 font-medium">Dashboard</span>
              </Link>
              
              <Link to="/bookings" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors">
                <Calendar className="text-teal-600 mb-2" size={24} />
                <span className="text-gray-800 font-medium">My Bookings</span>
              </Link>
              
              <Link to="/contact" className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:bg-gray-50 transition-colors">
                <HelpCircle className="text-teal-600 mb-2" size={24} />
                <span className="text-gray-800 font-medium">Help</span>
              </Link>
            </motion.div>
          </div>
          
          {/* Right Column - Cleaner Info & Actions */}
          <div className="lg:w-1/3 space-y-6">
            {/* Cleaner Information Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Cleaner</h2>
                
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 mr-4">
                    {/* Placeholder for cleaner avatar */}
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="text-gray-400" size={32} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-800">{jobData.cleaner.name}</h3>
                    <div className="flex items-center">
                      <div className="flex items-center text-yellow-500 mr-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-gray-700 ml-1">{jobData.cleaner.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm">{jobData.cleaner.experience}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{jobData.cleaner.bio}</p>
                
                {/* Contact Actions */}
                <div className="relative">
                  <button
                    onClick={() => setShowContactOptions(!showContactOptions)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    Contact Cleaner
                    <ChevronRight size={18} className={`ml-2 transition-transform ${showContactOptions ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showContactOptions && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200"
                      >
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center text-gray-700">
                          <MessageSquare size={18} className="mr-3 text-teal-600" />
                          <span>Send a message</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center text-gray-700 border-t border-gray-100">
                          <Phone size={18} className="mr-3 text-teal-600" />
                          <span>Call cleaner</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            
            {/* Service Modification Options */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Service Options</h2>
              
              <div className="space-y-4">
                {/* Request Extra Time */}
                {jobData.modifications.canRequestExtraTime && jobData.status !== 'completed' && (
                  <button className="w-full flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                    <div className="flex items-center">
                      <Clock className="text-teal-600 mr-3" size={18} />
                      <div>
                        <div className="font-medium text-gray-800">Request Extra Time</div>
                        <div className="text-gray-500 text-sm">Add more cleaning time if needed</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                  </button>
                )}
                
                {/* Cancel Booking */}
                {jobData.modifications.canCancel && jobData.status !== 'completed' && (
                  <button className="w-full flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                    <div className="flex items-center">
                      <AlertCircle className="text-red-500 mr-3" size={18} />
                      <div>
                        <div className="font-medium text-gray-800">Cancel Booking</div>
                        <div className="text-gray-500 text-sm">Cancellation policy applies</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                )}
                
                {/* Support Button */}
                <button className="w-full flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                  <div className="flex items-center">
                    <HelpCircle className="text-teal-600 mr-3" size={18} />
                    <div>
                      <div className="font-medium text-gray-800">Contact Support</div>
                      <div className="text-gray-500 text-sm">Need help with your booking?</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-600 transition-colors" />
                </button>
              </div>
            </motion.div>
            
            {/* What Happens Next Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-teal-50 rounded-xl p-6"
            >
              <h2 className="text-lg font-semibold text-teal-800 mb-3">What's Next?</h2>
              
              {jobData.status === 'confirmed' && (
                <div className="space-y-3 text-teal-700 text-sm">
                  <p>Your cleaner will be notified of this booking.</p>
                  <p>You'll receive a notification when they're on the way.</p>
                  <p>Make sure your location is accessible at the scheduled time.</p>
                </div>
              )}
              
              {jobData.status === 'en_route' && (
                <div className="space-y-3 text-teal-700 text-sm">
                  <p>Your cleaner is on the way to your location.</p>
                  <p>Please ensure your location is accessible.</p>
                  <p>You can contact your cleaner directly if needed.</p>
                </div>
              )}
              
              {jobData.status === 'in_progress' && (
                <div className="space-y-3 text-teal-700 text-sm">
                  <p>Your cleaner is currently working at your location.</p>
                  <p>You'll be notified when the cleaning is complete.</p>
                  <p>You'll be able to rate and review the service afterward.</p>
                </div>
              )}
              
              {jobData.status === 'completed' && (
                <div className="space-y-3 text-teal-700 text-sm">
                  <p>The cleaning service has been completed.</p>
                  <p>Please rate your experience and provide feedback.</p>
                  <p>You can book your next cleaning through your dashboard.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTrackingPage;