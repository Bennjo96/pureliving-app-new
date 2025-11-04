import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Clock, 
  User,
  Camera,
  Smile,
  MessageSquare,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Home,
  Heart,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Menu
} from 'lucide-react';
import Navbar from './Navbar';

// Simulating a service for fetching booking data
// In a real implementation, this would be an API call
const fetchBookingDetails = (bookingId) => {
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
        status: "completed",
        cleaner: {
          id: "CL-22443",
          name: "Julia Schmidt",
          avatar: "/cleaner-avatar.jpg",
          rating: 4.9,
          experience: "3 years"
        },
        paymentMethod: "credit_card",
        totalAmount: 129.00,
        rating: null,
        tip: null,
        feedback: null
      });
    }, 1000);
  });
};

// Simulating submitting rating data
// In a real implementation, this would be an API call
const submitRatingAndTip = (bookingId, ratingData) => {
  // This would be an API call in production
  console.log('Submitting rating data:', ratingData);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Rating and tip submitted successfully" });
    }, 1500);
  });
};

// Star Rating Component
const StarRating = ({ value, onChange, size = "large", disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  // Determine star sizes based on the size prop
  const starSize = size === "large" ? 32 : size === "medium" ? 24 : 18;
  
  const ratingLabels = [
    "Poor",
    "Below Average",
    "Average", 
    "Good", 
    "Excellent"
  ];
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => !disabled && setHoverRating(0)}
            className={`${disabled ? 'cursor-default' : 'cursor-pointer'} p-1 transition-transform ${!disabled && 'hover:scale-110'}`}
          >
            <Star
              fill={(hoverRating || value) >= star ? 'currentColor' : 'none'}
              className={`${
                (hoverRating || value) >= star
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
              size={starSize}
            />
          </button>
        ))}
      </div>
      
      {/* Rating Label */}
      {(value > 0 || hoverRating > 0) && (
        <div className="text-gray-700 font-medium">
          {ratingLabels[(hoverRating || value) - 1]}
        </div>
      )}
    </div>
  );
};

// Category Rating Component
const CategoryRating = ({ category, value, onChange, disabled = false }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-gray-700 font-medium">{category}</label>
        <div className="text-sm text-gray-500">{value > 0 ? `${value}/5` : ''}</div>
      </div>
      <StarRating 
        value={value} 
        onChange={onChange} 
        size="small" 
        disabled={disabled}
      />
    </div>
  );
};

// Tip Option Component
const TipOption = ({ amount, percentage, selected, onSelect }) => {
  return (
    <button
      className={`p-4 rounded-lg text-center transition-colors ${
        selected
          ? 'bg-teal-600 text-white shadow-md'
          : 'bg-white border border-gray-200 text-gray-800 hover:border-teal-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
    >
      <div className="font-bold text-lg">
        {percentage ? `${percentage}%` : 'Custom'}
      </div>
      {amount !== null && (
        <div className={`text-sm ${selected ? 'text-teal-100' : 'text-gray-500'}`}>
          €{amount.toFixed(2)}
        </div>
      )}
    </button>
  );
};

// Main Post-Service Rating Page Component
const PostServiceRatingPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Rating state
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    cleanliness: 0,
    timeliness: 0,
    communication: 0,
    value: 0
  });
  const [feedback, setFeedback] = useState('');
  
  // Tip state
  const [tipPercentage, setTipPercentage] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [customTipAmount, setCustomTipAmount] = useState('');
  
  // Positive aspects selection
  const [selectedPositives, setSelectedPositives] = useState([]);
  const positiveAspects = [
    'Thorough cleaning',
    'Attention to detail',
    'Professional attitude',
    'Punctual',
    'Friendly service',
    'Exceeded expectations',
    'Great communication',
    'Respectful of property'
  ];
  
  // Areas for improvement (only shown for ratings < 4)
  const [selectedImprovements, setSelectedImprovements] = useState([]);
  const improvementAreas = [
    'Thoroughness',
    'Time management',
    'Communication',
    'Attention to detail',
    'Professionalism',
    'Following instructions'
  ];
  
  // Photos state
  const [photos, setPhotos] = useState([]);
  
  // Load booking data on component mount
  useEffect(() => {
    setLoading(true);
    fetchBookingDetails(bookingId)
      .then(data => {
        setBookingData(data);
        setLoading(false);
        
        // Pre-fill data if rating exists
        if (data.rating) {
          setOverallRating(data.rating.overall);
          setCategoryRatings(data.rating.categories);
          setFeedback(data.rating.feedback || '');
          setTipAmount(data.tip?.amount || 0);
          setTipPercentage(data.tip?.percentage || 0);
          setSuccess(true);
        }
      })
      .catch(err => {
        setError("Could not load booking information. Please try again.");
        setLoading(false);
        console.error("Error fetching booking details:", err);
      });
  }, [bookingId]);
  
  // Update tip amount when percentage changes
  useEffect(() => {
    if (bookingData && tipPercentage > 0) {
      setTipAmount((bookingData.totalAmount * (tipPercentage / 100)).toFixed(2));
      setCustomTipAmount('');
    }
  }, [tipPercentage, bookingData]);
  
  // Handle custom tip amount changes
  const handleCustomTipChange = (e) => {
    const value = e.target.value;
    
    // Only allow numbers and decimals
    if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
      setCustomTipAmount(value);
      setTipPercentage(0);
      setTipAmount(value === '' ? 0 : parseFloat(value));
    }
  };
  
  // Handle positive aspect selection
  const togglePositiveAspect = (aspect) => {
    if (selectedPositives.includes(aspect)) {
      setSelectedPositives(selectedPositives.filter(item => item !== aspect));
    } else {
      setSelectedPositives([...selectedPositives, aspect]);
    }
  };
  
  // Handle improvement area selection
  const toggleImprovementArea = (area) => {
    if (selectedImprovements.includes(area)) {
      setSelectedImprovements(selectedImprovements.filter(item => item !== area));
    } else {
      setSelectedImprovements([...selectedImprovements, area]);
    }
  };
  
  // Handle photo upload
  const handlePhotoUpload = (e) => {
    // This would handle real file uploads in production
    console.log('Photo upload triggered');
    
    // Mock photo upload for demo
    if (photos.length < 3) {
      setPhotos([...photos, {
        id: Date.now(),
        url: '/placeholder-image.jpg',
        name: `photo-${photos.length + 1}.jpg`
      }]);
    }
  };
  
  // Remove uploaded photo
  const removePhoto = (photoId) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };
  
  // Handle star rating change
  const handleCategoryRatingChange = (category, value) => {
    setCategoryRatings({
      ...categoryRatings,
      [category]: value
    });
  };
  
  // Check if step 1 (rating) is complete
  const isStep1Complete = () => {
    return overallRating > 0;
  };
  
  // Check if step 2 (details) is complete
  const isStep2Complete = () => {
    return Object.values(categoryRatings).every(rating => rating > 0);
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Submit rating and tip
  const handleSubmit = () => {
    if (submitting) return;
    
    setSubmitting(true);
    
    // Prepare data for submission
    const ratingData = {
      bookingId,
      overallRating,
      categoryRatings,
      feedback,
      positiveFeedback: selectedPositives,
      improvementAreas: selectedImprovements,
      photos,
      tip: {
        amount: tipAmount,
        percentage: tipPercentage
      }
    };
    
    submitRatingAndTip(bookingId, ratingData)
      .then(response => {
        console.log('Rating submitted successfully', response);
        setSubmitting(false);
        setSuccess(true);
      })
      .catch(err => {
        console.error('Error submitting rating:', err);
        setSubmitting(false);
        setError('There was an error submitting your rating. Please try again.');
      });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
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
  
  // If success (rating already submitted), show thank you state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-3">Thank You for Your Feedback!</h1>
            <p className="text-gray-600 mb-8">Your rating and feedback help improve our service for everyone.</p>
            
            {/* Rating Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      fill={overallRating >= star ? 'currentColor' : 'none'}
                      className={`mx-1 ${
                        overallRating >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      size={28}
                    />
                  ))}
                </div>
              </div>
              
              {tipAmount > 0 && (
                <div className="text-center p-3 bg-teal-50 rounded-lg mb-4">
                  <p className="text-teal-800">
                    You added a €{parseFloat(tipAmount).toFixed(2)} tip for your cleaner. Thank you!
                  </p>
                </div>
              )}
              
              <p className="text-gray-600 text-center">
                Your feedback for the {bookingData.service.title} on {formatDate(bookingData.dateTime.date)} has been saved.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                to="/dashboard" 
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center font-medium"
              >
                <Home size={18} className="mr-2" />
                Back to Dashboard
              </Link>
              
              <Link 
                to="/booking" 
                className="bg-white border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-3 rounded-lg transition-colors flex items-center justify-center font-medium"
              >
                <Calendar size={18} className="mr-2" />
                Book Another Service
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
  
  // Main content with rating steps
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
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Rate Your Cleaning Experience</h1>
          <p className="text-gray-600 text-center">Your feedback helps improve our service and rewards great cleaners.</p>
        </div>
        
        {/* Service Info */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-5 mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-6 h-6 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6l1.8 12.4c.1.8.8 1.4 1.6 1.4h12.2c.8 0 1.5-.6 1.6-1.4L21 6"></path>
                <path d="M3 6h18"></path>
                <path d="M15 6s-.5-3-3-3-3 3-3 3"></path>
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-800">{bookingData.service.title}</h2>
              <p className="text-sm text-gray-600">
                {formatDate(bookingData.dateTime.date)} · {bookingData.cleaner.name}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold text-teal-600">€{bookingData.totalAmount.toFixed(2)}</div>
              <div className="text-xs text-gray-500">{bookingData.service.duration}</div>
            </div>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mb-1 ${currentStep >= 1 ? 'bg-teal-600' : 'bg-gray-300'}`}>
                1
              </div>
              <div className="text-xs font-medium">Rating</div>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mb-1 ${currentStep >= 2 ? 'bg-teal-600' : 'bg-gray-300'}`}>
                2
              </div>
              <div className="text-xs font-medium">Details</div>
            </div>
            
            <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-teal-600' : 'bg-gray-300'}`}></div>
            
            <div className={`flex flex-col items-center ${currentStep >= 3 ? 'text-teal-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mb-1 ${currentStep >= 3 ? 'bg-teal-600' : 'bg-gray-300'}`}>
                3
              </div>
              <div className="text-xs font-medium">Tip</div>
            </div>
          </div>
        </div>
        
        {/* Rating Steps Content */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Overall Rating */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">How was your cleaning experience?</h2>
                
                <div className="flex flex-col items-center mb-8">
                  <div className="mb-6">
                    <StarRating value={overallRating} onChange={setOverallRating} />
                  </div>
                  
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{bookingData.cleaner.name}</h3>
                  <p className="text-gray-600 text-sm">Professional Cleaner</p>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-6">
                    Your rating helps other customers and provides valuable feedback to our cleaners.
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Detailed Ratings */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Please rate specific aspects of your service</h2>
                
                <div className="space-y-6">
                  <CategoryRating 
                    category="Cleanliness" 
                    value={categoryRatings.cleanliness}
                    onChange={(value) => handleCategoryRatingChange('cleanliness', value)}
                  />
                  
                  <CategoryRating 
                    category="Timeliness" 
                    value={categoryRatings.timeliness}
                    onChange={(value) => handleCategoryRatingChange('timeliness', value)}
                  />
                  
                  <CategoryRating 
                    category="Communication" 
                    value={categoryRatings.communication}
                    onChange={(value) => handleCategoryRatingChange('communication', value)}
                  />
                  
                  <CategoryRating 
                    category="Value for money" 
                    value={categoryRatings.value}
                    onChange={(value) => handleCategoryRatingChange('value', value)}
                  />
                </div>
                
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium text-gray-800 mb-3">What went well?</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {positiveAspects.map((aspect) => (
                      <button
                        key={aspect}
                        onClick={() => togglePositiveAspect(aspect)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedPositives.includes(aspect)
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedPositives.includes(aspect) && (
                          <CheckCircle className="inline-block w-3 h-3 mr-1" />
                        )}
                        {aspect}
                      </button>
                    ))}
                  </div>
                  
                  {overallRating < 4 && (
                    <>
                      <h3 className="font-medium text-gray-800 mb-3">What could be improved?</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {improvementAreas.map((area) => (
                          <button
                            key={area}
                            onClick={() => toggleImprovementArea(area)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                              selectedImprovements.includes(area)
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {selectedImprovements.includes(area) && (
                              <CheckCircle className="inline-block w-3 h-3 mr-1" />
                            )}
                            {area}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <h3 className="font-medium text-gray-800 mb-3">Additional Comments (Optional)</h3>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-teal-200 focus:border-teal-500"
                    placeholder="Share more details about your experience..."
                    rows={4}
                  />
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-gray-800 mb-3">Share Photos (Optional)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload photos of the cleaned areas to highlight the quality of work.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    {photos.map(photo => (
                      <div key={photo.id} className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Camera size={24} />
                        </div>
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          aria-label="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {photos.length < 3 && (
                      <button
                        onClick={handlePhotoUpload}
                        className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-teal-500 hover:text-teal-500 transition-colors"
                      >
                        <Camera size={24} className="mb-1" />
                        <span className="text-xs">Add Photo</span>
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    You can upload up to 3 photos. Each photo must be less than 5MB.
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Tip */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Would you like to add a tip?</h2>
                <p className="text-gray-600 mb-6">
                  100% of your tip goes directly to your cleaner as appreciation for their great service.
                </p>
                
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1 text-center">{bookingData.cleaner.name}</h3>
                
                <div className="mt-8">
                  <h3 className="font-medium text-gray-800 mb-4">Select tip amount:</h3>
                  
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <TipOption
                      amount={0}
                      percentage={0}
                      selected={tipPercentage === 0 && tipAmount === 0}
                      onSelect={() => {
                        setTipPercentage(0);
                        setTipAmount(0);
                        setCustomTipAmount('');
                      }}
                    />
                    <TipOption
                      amount={(bookingData.totalAmount * 0.1).toFixed(2)}
                      percentage={10}
                      selected={tipPercentage === 10}
                      onSelect={() => setTipPercentage(10)}
                    />
                    <TipOption
                      amount={(bookingData.totalAmount * 0.15).toFixed(2)}
                      percentage={15}
                      selected={tipPercentage === 15}
                      onSelect={() => setTipPercentage(15)}
                    />
                    <TipOption
                      amount={(bookingData.totalAmount * 0.2).toFixed(2)}
                      percentage={20}
                      selected={tipPercentage === 20}
                      onSelect={() => setTipPercentage(20)}
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-gray-700 font-medium mb-2">Custom amount:</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 px-3 py-2 rounded-l-lg text-gray-700 border border-gray-300 border-r-0">€</span>
                      <input
                        type="text"
                        value={customTipAmount}
                        onChange={handleCustomTipChange}
                        placeholder="Enter amount"
                        className="flex-1 p-2 border border-gray-300 rounded-r-lg focus:ring focus:ring-teal-200 focus:border-teal-500"
                      />
                    </div>
                  </div>
                  
                  {tipAmount > 0 && (
                    <div className="p-4 bg-teal-50 rounded-lg mb-6 text-center">
                      <p className="font-medium text-teal-800">
                        You're adding a <span className="font-bold">€{parseFloat(tipAmount).toFixed(2)}</span> tip
                      </p>
                      <p className="text-sm text-teal-700">Thank you for appreciating your cleaner!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 ? (
              <button
                onClick={goToPreviousStep}
                className="px-6 py-3 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back
              </button>
            ) : (
              <div></div> // Empty div for flex alignment
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={goToNextStep}
                disabled={currentStep === 1 && !isStep1Complete() || currentStep === 2 && !isStep2Complete()}
                className={`px-6 py-3 rounded-lg flex items-center justify-center font-medium ${
                  (currentStep === 1 && isStep1Complete()) || (currentStep === 2 && isStep2Complete())
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentStep === 1 && !isStep1Complete() && 'Select Rating'}
                {currentStep === 1 && isStep1Complete() && 'Continue'}
                {currentStep === 2 && !isStep2Complete() && 'Complete All Ratings'}
                {currentStep === 2 && isStep2Complete() && 'Continue'}
                <ArrowRight size={18} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center justify-center disabled:bg-teal-400"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Feedback
                    <CheckCircle size={18} className="ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostServiceRatingPage;