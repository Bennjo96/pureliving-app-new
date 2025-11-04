import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle,
  User,
  Star,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  Gift,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';

// Progress Steps Component
const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: 'service', label: 'Service' },
    { id: 'cleaner', label: 'Cleaner' },
    { id: 'details', label: 'Details' },
    { id: 'payment', label: 'Payment' }
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
                          ${index < currentStep 
                          ? 'bg-teal-600 text-white' 
                          : index === currentStep 
                            ? 'bg-teal-100 text-teal-800 border border-teal-600' 
                            : 'bg-white text-gray-400 border border-gray-300'}`}
              >
                {index < currentStep ? (
                  <CheckCircle size={16} />
                ) : (
                  index + 1
                )}
              </div>
              <div className={`text-xs mt-1 whitespace-nowrap ${index === currentStep ? 'font-semibold text-teal-800' : 'text-gray-500'}`}>
                {step.label}
              </div>
            </div>
            
            {/* Connector Line (except after last step) */}
            {index < steps.length - 1 && (
              <div 
                className={`w-16 h-1 mx-1
                          ${index < currentStep 
                          ? 'bg-teal-600' 
                          : 'bg-gray-300'}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Special Instructions Component
const SpecialInstructions = ({ instructions, setInstructions }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <MessageSquare className="mr-2 text-teal-600" size={20} />
        Special Instructions
      </h3>
      
      <p className="text-gray-600 mb-4 text-sm">
        Let your cleaner know about any specific areas that need attention or how to access your home.
      </p>
      
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[120px]"
        placeholder="Add any special instructions for your cleaner here..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      ></textarea>
    </div>
  );
};

// Booking Add-ons Component
const BookingAddons = ({ addons, toggleAddon }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Gift className="mr-2 text-teal-600" size={20} />
        Enhance Your Service
      </h3>
      
      <p className="text-gray-600 mb-6 text-sm">
        Add these popular extras to make your cleaning experience even better.
      </p>
      
      <div className="space-y-4">
        {addons.map((addon) => (
          <div 
            key={addon.id} 
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:border-teal-200 transition-colors"
          >
            <div className="flex items-start">
              <div className="bg-teal-100 p-2 rounded-lg mr-3">
                {/* Generic cleaning icon */}
                <svg 
                  className="text-teal-600 w-5 h-5"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18.7 8.7l-3-3" />
                  <path d="M18.7 5.7h-3v3" />
                  <path d="M13 9l-4 4" />
                  <path d="M7 17l-2-2" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{addon.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-teal-600 font-medium mr-3">+€{addon.price.toFixed(2)}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={addon.selected}
                  onChange={() => toggleAddon(addon.id)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Auth Section Component
const AuthSection = ({ authMethod, setAuthMethod }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="mr-2 text-teal-600" size={20} />
        Account Options
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer text-center transition-colors
                    ${authMethod === 'login' 
                    ? 'border-teal-500 bg-teal-50 shadow-md' 
                    : 'border-gray-200 hover:border-teal-200 hover:shadow-sm'}`}
          onClick={() => setAuthMethod('login')}
        >
          <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <User className="text-teal-600" size={24} />
          </div>
          <h4 className="font-medium text-gray-800 mb-1">Login</h4>
          <p className="text-xs text-gray-500">Already have an account</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer text-center transition-colors
                    ${authMethod === 'register' 
                    ? 'border-teal-500 bg-teal-50 shadow-md' 
                    : 'border-gray-200 hover:border-teal-200 hover:shadow-sm'}`}
          onClick={() => setAuthMethod('register')}
        >
          <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <User className="text-teal-600" size={24} />
          </div>
          <h4 className="font-medium text-gray-800 mb-1">Sign Up</h4>
          <p className="text-xs text-gray-500">Create a new account</p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`border p-5 rounded-lg cursor-pointer text-center transition-colors
                    ${authMethod === 'guest' 
                    ? 'border-teal-500 bg-teal-50 shadow-md' 
                    : 'border-gray-200 hover:border-teal-200 hover:shadow-sm'}`}
          onClick={() => setAuthMethod('guest')}
        >
          <div className="bg-teal-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <User className="text-teal-600" size={24} />
          </div>
          <h4 className="font-medium text-gray-800 mb-1">Guest Checkout</h4>
          <p className="text-xs text-gray-500">Book without an account</p>
        </motion.div>
      </div>
      
      {/* Form based on selection */}
      {authMethod === 'login' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <button className="text-sm text-teal-600 hover:underline">
                Forgot password?
              </button>
            </div>
            <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
              Login
            </button>
          </div>
        </motion.div>
      )}
      
      {authMethod === 'register' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="+49 123 45678900"
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <label className="text-sm text-gray-600">
                I agree to the <button className="text-teal-600 hover:underline">Terms of Service</button> and{" "}
                <button className="text-teal-600 hover:underline">Privacy Policy</button>
              </label>
            </div>
            <button className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors">
              Create Account
            </button>
          </div>
        </motion.div>
      )}
      
      {authMethod === 'guest' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="+49 123 45678900"
              />
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-700 flex">
              <Info className="mr-2 flex-shrink-0" size={18} />
              <p>Checking out as a guest? Consider creating an account to easily manage your bookings and get exclusive offers.</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Main Component
const BookingDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking data from previous page
  const [bookingData, setBookingData] = useState(location.state?.bookingData || null);
  
  // Go back if no booking data
  useEffect(() => {
    if (!bookingData) {
      navigate('/booking');
    }
  }, [bookingData, navigate]);
  
  // State for booking details
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [authMethod, setAuthMethod] = useState(null);
  const [addons, setAddons] = useState([
    {
      id: 'fridge',
      title: 'Fridge Cleaning',
      description: 'Deep clean inside and outside of your refrigerator',
      price: 25,
      selected: false
    },
    {
      id: 'oven',
      title: 'Oven Cleaning',
      description: 'Thorough cleaning of your oven and stovetop',
      price: 30,
      selected: false
    },
    {
      id: 'laundry',
      title: 'Laundry Service',
      description: 'Wash, dry, and fold up to 2 loads of laundry',
      price: 20,
      selected: false
    }
  ]);
  
  // Toggle addon selection
  const toggleAddon = (addonId) => {
    setAddons(addons.map(addon => 
      addon.id === addonId 
        ? { ...addon, selected: !addon.selected } 
        : addon
    ));
  };
  
  // Calculate total price with addons
  const calculateTotal = () => {
    if (!bookingData) return 0;
    
    // Base price from service and cleaner
    let total = bookingData.subtotal;
    
    // Add cleaner's hourly rate
    const hours = parseInt(bookingData.service.duration.split('-')[1]?.trim().split(' ')[0] || '3');
    total += bookingData.cleaner.hourlyRate * hours;
    
    // Add selected addons
    addons.forEach(addon => {
      if (addon.selected) {
        total += addon.price;
      }
    });
    
    return total;
  };
  
  // Proceed to payment
  const proceedToPayment = () => {
    // Validate required fields
    if (!authMethod) {
      alert('Please select an account option to continue');
      return;
    }
    
    // Update booking data with details
    const updatedBookingData = {
      ...bookingData,
      specialInstructions,
      addons: addons.filter(addon => addon.selected),
      authMethod,
      total: calculateTotal()
    };
    
    // Navigate to payment page
    navigate('/booking/payment', { state: { bookingData: updatedBookingData } });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button - positioned at top left */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Cleaner Selection
          </button>
        </div>
      
        {/* Progress Steps - Shows the user's progress */}
        <ProgressSteps currentStep={2} />
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Booking Details
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Add special instructions and create your account to complete your booking.
          </p>
        </motion.div>
        
        {/* Main content - 2 column layout on larger screens */}
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left column - main form */}
          <div className="lg:w-2/3">
            {/* Booking Summary */}
            {bookingData && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Service Section */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <Calendar className="mr-2 text-teal-600" size={16} />
                      Service Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">{bookingData.service.title}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {new Intl.DateTimeFormat('en-GB', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                          }).format(bookingData.dateTime.date)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{bookingData.dateTime.time}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-medium capitalize">{bookingData.frequency.replace('-', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{bookingData.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Apartment Size:</span>
                        <span className="font-medium">{bookingData.apartmentSize} m²</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cleaner Section */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <User className="mr-2 text-teal-600" size={16} />
                      Your Cleaner
                    </h4>
                    <div className="flex items-start">
                      <img 
                        src={bookingData.cleaner.avatar} 
                        alt={bookingData.cleaner.name} 
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 mr-3" 
                      />
                      <div>
                        <h5 className="font-medium text-gray-800">{bookingData.cleaner.name}</h5>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12}
                                fill={i < Math.floor(bookingData.cleaner.rating) ? "currentColor" : "none"}
                                stroke={i < Math.floor(bookingData.cleaner.rating) ? "none" : "currentColor"}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {bookingData.cleaner.rating} ({bookingData.cleaner.reviewCount} reviews)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{bookingData.cleaner.experience} years experience</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  Need to change something? <button onClick={() => navigate(-1)} className="text-teal-600 ml-1 hover:underline">Go back</button> to the previous step.
                </div>
              </div>
            )}
            
            {/* Special Instructions */}
            <SpecialInstructions 
              instructions={specialInstructions}
              setInstructions={setSpecialInstructions}
            />
            
            {/* Service Add-ons */}
            <BookingAddons 
              addons={addons}
              toggleAddon={toggleAddon}
            />
            
            {/* Account/Authentication Section */}
            <AuthSection 
              authMethod={authMethod}
              setAuthMethod={setAuthMethod}
            />
            
            {/* Next Step Button */}
            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-colors
                        ${authMethod 
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                onClick={proceedToPayment}
                disabled={!authMethod}
              >
                Proceed to Payment
                <ChevronRight size={20} className="ml-2" />
              </motion.button>
              
              {!authMethod && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Please select an account option to continue
                </p>
              )}
            </div>
          </div>
          
          {/* Right column - Order summary */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-32">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Price Breakdown</h3>
                
                <div className="space-y-3">
                  {bookingData?.service && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{bookingData.service.title}</span>
                      <span className="text-gray-800">€{bookingData.service.price.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bookingData?.cleaner && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cleaner's Rate</span>
                      <span className="text-gray-800">
                        €{bookingData.cleaner.hourlyRate} × {bookingData.service.duration.split('-')[1]?.trim().split(' ')[0] || '3'} hrs
                      </span>
                    </div>
                  )}
                  
                  {/* Display frequency discount if applicable */}
                  {bookingData?.frequency !== 'one-time' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Frequency Discount</span>
                      <span>
                        {bookingData.frequency === 'bi-weekly' ? '-10%' : '-15%'}
                      </span>
                    </div>
                  )}
                  
                  {/* Display selected addons */}
                  {addons.filter(addon => addon.selected).length > 0 && (
                    <>
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Add-ons:</p>
                        {addons.filter(addon => addon.selected).map(addon => (
                          <div key={addon.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{addon.title}</span>
                            <span className="text-gray-800">€{addon.price.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between pt-3 border-t font-bold">
                    <span className="text-gray-700">Total</span>
                    <span className="text-teal-600">€{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Payment Methods Preview */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium text-gray-700 mb-3">We Accept</h4>
                  <div className="flex space-x-2">
                    <div className="bg-gray-100 rounded p-2 flex-1 text-center text-sm">
                      <span>Credit Card</span>
                    </div>
                    <div className="bg-gray-100 rounded p-2 flex-1 text-center text-sm">
                      <span>PayPal</span>
                    </div>
                    <div className="bg-gray-100 rounded p-2 flex-1 text-center text-sm">
                      <span>Klarna</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Need Help Section */}
              <div className="bg-teal-50 rounded-xl p-5">
                <h4 className="font-bold text-teal-800 mb-3">Need Help?</h4>
                <p className="text-sm text-teal-700 mb-3">
                  Have questions about your booking or need to make special arrangements?
                </p>
                <button className="bg-white text-teal-600 border border-teal-300 rounded-lg py-2 px-4 text-sm font-medium flex items-center hover:bg-teal-600 hover:text-white transition-colors">
                  <MessageSquare size={16} className="mr-2" />
                  Contact Customer Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;