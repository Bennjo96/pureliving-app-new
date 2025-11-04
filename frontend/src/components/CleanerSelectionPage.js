import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  CheckCircle,
  Star,
  MessageSquare,
  Info,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Loader,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { bookingService, adminService } from "../api/api";

// Progress Steps Component
const ProgressSteps = ({ currentStep }) => {
  const steps = [
    { id: "service", label: "Service" },
    { id: "details", label: "Details" },
    { id: "cleaner", label: "Cleaner" },
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

// Cleaner Card Component
const CleanerCard = ({ cleaner, isSelected, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className={`border p-6 rounded-xl cursor-pointer transition-all mb-6 ${
        isSelected
          ? "border-teal-500 ring-1 ring-teal-500 shadow-lg"
          : "border-gray-200 hover:border-teal-200 hover:shadow-md"
      }`}
      onClick={() => onSelect(cleaner)}
    >
      <div className="flex items-start">
        <div className="relative mr-4">
          <img
            src={cleaner.avatar || "/default-avatar.png"}
            alt={cleaner.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
          />
          {cleaner.isVerified && (
            <div
              className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full"
              title="Verified Cleaner"
            >
              <CheckCircle size={15} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-bold text-gray-800">{cleaner.name}</h4>
              <div className="flex items-center mt-1">
                <div className="flex items-center text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={
                        i < Math.floor(cleaner.rating) ? "currentColor" : "none"
                      }
                      stroke={
                        i < Math.floor(cleaner.rating) ? "none" : "currentColor"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {cleaner.rating?.toFixed(1) || "New"}{" "}
                  {cleaner.reviewCount > 0 && `(${cleaner.reviewCount} reviews)`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-teal-600 font-bold text-lg">
                €{cleaner.hourlyRate}/hr
              </span>
              {isSelected && (
                <div className="bg-teal-600 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">
                  Selected
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {cleaner.bio ||
              "Professional cleaner ready to help you with your cleaning needs."}
          </p>
          <div className="flex flex-wrap mt-3 text-sm">
            {cleaner.experience > 0 && (
              <div className="mr-4 flex items-center text-gray-600">
                <CheckCircle className="mr-1 text-teal-500" size={14} />
                <span>{cleaner.experience} years experience</span>
              </div>
            )}
            {cleaner.jobsCompleted > 0 && (
              <div className="mr-4 flex items-center text-gray-600">
                <CheckCircle className="mr-1 text-teal-500" size={14} />
                <span>{cleaner.jobsCompleted} jobs completed</span>
              </div>
            )}
            {(cleaner.bio ||
              cleaner.specialties?.length > 0 ||
              cleaner.recentReviews?.length > 0) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(!showDetails);
                }}
                className="text-teal-600 hover:underline font-medium flex items-center"
              >
                {showDetails ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t"
              onClick={(e) => e.stopPropagation()}
            >
              {cleaner.bio && (
                <>
                  <h5 className="font-medium mb-2">About {cleaner.name}</h5>
                  <p className="text-sm text-gray-600 mb-3">{cleaner.bio}</p>
                </>
              )}
              {cleaner.specialties && cleaner.specialties.length > 0 && (
                <>
                  <h5 className="font-medium mb-2">Specializes In</h5>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cleaner.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <div className="mt-3 flex justify-between">
                <button className="text-teal-600 text-sm font-medium flex items-center">
                  <MessageSquare size={16} className="mr-1" />
                  Chat with {cleaner.name.split(" ")[0]}
                </button>
                <button className="text-teal-600 text-sm font-medium flex items-center">
                  <Info size={16} className="mr-1" />
                  View Full Profile
                </button>
              </div>
              {cleaner.recentReviews && cleaner.recentReviews.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium mb-2">Recent Reviews</h5>
                  <div className="space-y-3">
                    {cleaner.recentReviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={
                                  i < review.rating ? "currentColor" : "none"
                                }
                                stroke={
                                  i < review.rating ? "none" : "currentColor"
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {review.date}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{review.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          - {review.author}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Empty State Component
const NoCleanersAvailable = ({ bookingData, onContinue }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-3">No Cleaners Available</h3>
      <p className="text-gray-600 mb-4">
        We're sorry, but there are currently no cleaners available in your area for the selected time.
      </p>
      <p className="text-gray-600 mb-6">
        You can still proceed with your booking and we'll match you with the best available cleaner as soon as possible.
      </p>
      <button
        onClick={onContinue}
        className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
      >
        Continue Without Selecting a Cleaner
      </button>
    </div>
  );
};

// Main Component
const CleanerSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Destructure booking details from location state
  const { selectedService, postalCode, cityName } = location.state || {};

  // Create booking data object
  const [bookingData, setBookingData] = useState({
    service: selectedService,
    location: cityName || "Unknown Location",
    postalCode: postalCode,
    dateTime: location.state?.dateTime || { date: new Date(), time: "Flexible" },
    subtotal: selectedService?.price || 0,
  });

  // Local component states
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [filterBy, setFilterBy] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [availableCleaners, setAvailableCleaners] = useState([]);

  // Redirect if no service is selected
  useEffect(() => {
    if (!selectedService) {
      navigate("/services");
    }
  }, [selectedService, navigate]);

  // Fetch cleaners from API
  const fetchCleaners = async () => {
    if (!postalCode) return;

    setIsLoading(true);
    setError(null);

    try {
      const formattedDate =
        bookingData.dateTime?.date instanceof Date
          ? bookingData.dateTime.date.toISOString().split("T")[0]
          : bookingData.dateTime?.date || "flexible";
      const timeSlot = bookingData.dateTime?.time || "flexible";
      const serviceType = selectedService?.id || "";

      console.log("Fetching cleaners with params:", {
        date: formattedDate,
        timeSlot,
        serviceType,
        location: postalCode,
      });

      // First attempt: search by specific location
      let response = await bookingService.getAvailableCleaners(
        formattedDate,
        timeSlot,
        serviceType,
        postalCode
      );
      console.log("Initial cleaner search response:", response.data);

      let cleaners = [];
      let localShowLocationWarning = false;

      if (
        response.data &&
        Array.isArray(response.data.cleaners) &&
        response.data.cleaners.length > 0
      ) {
        cleaners = response.data.cleaners;
      } else {
        console.log("No cleaners found in specific location. Trying broader search...");
        try {
          const fallbackResponse = await bookingService.getAvailableCleaners(
            formattedDate,
            timeSlot,
            serviceType,
            ""
          );
          console.log("Fallback cleaner search response:", fallbackResponse.data);

          if (
            fallbackResponse.data &&
            Array.isArray(fallbackResponse.data.cleaners) &&
            fallbackResponse.data.cleaners.length > 0
          ) {
            cleaners = fallbackResponse.data.cleaners;
            localShowLocationWarning = true;
          }

          if (cleaners.length === 0) {
            console.log("Trying alternative endpoint for all cleaners...");
            try {
              const allCleanersResponse = await adminService.getCleaners();
              if (
                allCleanersResponse.data &&
                Array.isArray(allCleanersResponse.data.cleaners) &&
                allCleanersResponse.data.cleaners.length > 0
              ) {
                cleaners = allCleanersResponse.data.cleaners.map((cleaner) => ({
                  id: cleaner.id,
                  name: cleaner.name || cleaner.fullName || "Available Cleaner",
                  avatar: cleaner.avatar || cleaner.profileImage,
                  rating: cleaner.rating || 0,
                  reviewCount: cleaner.reviewCount || 0,
                  hourlyRate: cleaner.hourlyRate || 25,
                  experience: cleaner.experience || 1,
                  jobsCompleted: cleaner.jobsCompleted || 0,
                  isVerified: true,
                  specialties: cleaner.specialties || ["General Cleaning"],
                  bio:
                    cleaner.bio ||
                    "Professional cleaner available for your cleaning needs.",
                }));
                localShowLocationWarning = true;
              }
            } catch (fallbackError) {
              console.error("Error fetching all cleaners:", fallbackError);
            }
          }
        } catch (fallbackError) {
          console.error("Error in fallback cleaner search:", fallbackError);
        }
      }

      setAvailableCleaners(cleaners);
      setShowLocationWarning(localShowLocationWarning && cleaners.length > 0);
    } catch (err) {
      console.error("Error fetching cleaners:", err);
      setError("Failed to load available cleaners. Please try again.");
      setAvailableCleaners([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cleaners on component mount or when postalCode changes
  useEffect(() => {
    fetchCleaners();
  }, [postalCode]);

  // Filter and sort cleaners
  const filteredCleaners = useMemo(() => {
    let result = [...availableCleaners];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (cleaner) =>
          cleaner.name?.toLowerCase().includes(query) ||
          cleaner.bio?.toLowerCase().includes(query) ||
          cleaner.specialties?.some((s) => s.toLowerCase().includes(query))
      );
    }

    switch (filterBy) {
      case "price_low":
        result.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "price_high":
        result.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "experience":
        result.sort((a, b) => (b.experience || 0) - (a.experience || 0));
        break;
      case "recommended":
      default:
        result.sort((a, b) => {
          const scoreA =
            (a.rating || 0) * 0.5 +
            (a.experience || 0) * 0.3 +
            (a.jobsCompleted || 0) * 0.0005;
          const scoreB =
            (b.rating || 0) * 0.5 +
            (b.experience || 0) * 0.3 +
            (b.jobsCompleted || 0) * 0.0005;
          return scoreB - scoreA;
        });
    }

    return result;
  }, [availableCleaners, filterBy, searchQuery]);

  const handleSelectCleaner = (cleaner) => {
    setSelectedCleaner(cleaner);
  };

  const getDurationHours = () => {
    if (!selectedService || !selectedService.duration) {
      return 2;
    }
    const durationStr = selectedService.duration;
    const matches = durationStr.match(/(\d+)-(\d+)/);
    if (matches && matches.length >= 3) {
      return parseInt(matches[2], 10);
    }
    const numberMatch = durationStr.match(/(\d+)/);
    if (numberMatch) {
      return parseInt(numberMatch[1], 10);
    }
    return 2;
  };

  const calculateTotal = () => {
    if (!selectedService || !selectedCleaner) {
      return 0;
    }
    const serviceFee = selectedService.price || 0;
    const hourlyRate = selectedCleaner.hourlyRate || 0;
    const hours = getDurationHours();
    return serviceFee + hourlyRate * hours;
  };

  const proceedToDetails = () => {
    const updatedBookingData = {
      ...bookingData,
      cleaner: selectedCleaner,
      total: calculateTotal(),
    };
    navigate("/booking/details", { state: { bookingData: updatedBookingData } });
  };

  const proceedWithoutCleaner = () => {
    const updatedBookingData = {
      ...bookingData,
      cleaner: null,
      total: selectedService?.price || 0,
    };
    navigate("/booking/details", { state: { bookingData: updatedBookingData } });
  };

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
            Back
          </button>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={2} />

        {/* Warning Banner if showing cleaners from other areas */}
        {showLocationWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800"
          >
            <div className="flex items-start">
              <AlertCircle className="mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="font-medium">Cleaners from other areas</h4>
                <p className="text-sm mt-1">
                  We don't have cleaners specifically registered for{" "}
                  {cityName || postalCode}, so we're showing you all available
                  cleaners. Some may need to travel from other areas, which could
                  affect availability and pricing.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Choose Your Cleaner
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select from our verified cleaning professionals available at your
            requested time.
          </p>
        </motion.div>

        {/* Booking info summary banner */}
        <div className="bg-teal-50 rounded-xl p-4 mb-8 flex flex-wrap justify-center items-center text-sm">
          <div className="flex items-center px-3 py-1">
            <Calendar className="text-teal-600 mr-2" size={16} />
            <span>
              {bookingData.dateTime.date instanceof Date
                ? new Intl.DateTimeFormat("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  }).format(bookingData.dateTime.date)
                : "Flexible Date"}
            </span>
          </div>
          <div className="flex items-center px-3 py-1">
            <Clock className="text-teal-600 mr-2" size={16} />
            <span>{bookingData.dateTime.time || "Flexible Time"}</span>
          </div>
          <div className="flex items-center px-3 py-1">
            <MapPin className="text-teal-600 mr-2" size={16} />
            <span>{bookingData.location}</span>
          </div>
          <div className="flex items-center px-3 py-1 font-medium">
            <span className="mr-1">Service:</span>
            <span className="text-teal-700">
              {selectedService?.title || "Selected Service"}
            </span>
          </div>
        </div>

        {/* Main content layout */}
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left Column: Cleaners list */}
          <div className="lg:w-2/3">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-md p-8 flex items-center justify-center">
                <Loader className="animate-spin text-teal-600 mr-2" size={24} />
                <span className="text-gray-700">
                  Loading available cleaners...
                </span>
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-teal-600 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : availableCleaners.length === 0 ? (
              <NoCleanersAvailable
                bookingData={bookingData}
                onContinue={proceedWithoutCleaner}
              />
            ) : (
              <>
                {/* Search and Filter Options */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search cleaners by name or specialty..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <Search
                        className="absolute left-3 top-2.5 text-gray-400"
                        size={18}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center mr-2">
                        <Filter size={16} className="text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">Sort by:</span>
                      </div>
                      <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-sm"
                      >
                        <option value="recommended">Recommended</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="experience">Most Experienced</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cleaners List */}
                <div className="relative">
                  {filteredCleaners.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                      <p className="text-gray-600 mb-2">
                        No cleaners match your search criteria.
                      </p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-teal-600 hover:underline"
                      >
                        Clear search and show all cleaners
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-bold text-gray-700 mb-4">
                        {filteredCleaners.length} Cleaners Available
                      </h3>
                      {filteredCleaners.map((cleaner) => (
                        <CleanerCard
                          key={cleaner.id}
                          cleaner={cleaner}
                          isSelected={selectedCleaner?.id === cleaner.id}
                          onSelect={handleSelectCleaner}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Next Step Button */}
                <div className="mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-colors ${
                      selectedCleaner
                        ? "bg-teal-600 text-white hover:bg-teal-700 shadow-md"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={proceedToDetails}
                    disabled={!selectedCleaner}
                  >
                    Continue with{" "}
                    {selectedCleaner
                      ? selectedCleaner.name
                      : "Selected Cleaner"}
                    <ChevronRight size={20} className="ml-2" />
                  </motion.button>
                  {!selectedCleaner && filteredCleaners.length > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Please select a cleaner to continue
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column: Selected Cleaner Summary and Guarantee */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-32">
              {selectedCleaner && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <User className="text-teal-600 mr-2" size={18} />
                    Selected Cleaner
                  </h3>
                  <div className="flex items-start">
                    <img
                      src={selectedCleaner.avatar || "/default-avatar.png"}
                      alt={selectedCleaner.name}
                      className="w-16 h-16 rounded-full object-cover mr-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {selectedCleaner.name}
                      </h4>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center text-yellow-400 mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={
                                i < Math.floor(selectedCleaner.rating || 0)
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke={
                                i < Math.floor(selectedCleaner.rating || 0)
                                  ? "none"
                                  : "currentColor"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedCleaner.rating?.toFixed(1) || "New"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        €{selectedCleaner.hourlyRate}/hr{" "}
                        {selectedCleaner.experience > 0 &&
                          `· ${selectedCleaner.experience} years exp.`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium text-gray-700 mb-2">
                      Estimated Cost
                    </h5>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        Service fee ({selectedService?.title || "Selected Service"})
                      </span>
                      <span className="text-gray-800">
                        €{selectedService?.price?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cleaner's rate</span>
                      <span className="text-gray-800">
                        €{selectedCleaner.hourlyRate} × {getDurationHours()} hrs
                      </span>
                    </div>
                    <div className="flex justify-between font-bold mt-3 pt-3 border-t">
                      <span className="text-gray-700">Total</span>
                      <span className="text-teal-600">
                        €{calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Our Guarantee
                </h3>
                <div className="space-y-4">
                  <div className="flex">
                    <Shield className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Verified Cleaners
                      </h4>
                      <p className="text-sm text-gray-600">
                        All cleaners undergo background checks and are fully insured.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <Shield className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Satisfaction Guarantee
                      </h4>
                      <p className="text-sm text-gray-600">
                        Not happy with the service? We'll send another cleaner to redo it.
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <Shield className="text-teal-600 mt-1 mr-3 flex-shrink-0" size={18} />
                    <div>
                      <h4 className="font-medium text-gray-800">
                        Secure Payments
                      </h4>
                      <p className="text-sm text-gray-600">
                        Payment is only released to the cleaner after you approve the job.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default CleanerSelectionPage;
