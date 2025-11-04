import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Building,
  Navigation,
  Clock,
  Heart,
  CornerDownRight,
  Loader,
  X,
  Shield,
  Calendar,
  User,
} from "lucide-react";
import { bookingService } from "../api/api";
import { useBooking } from "../contexts/BookingContext";
import { useGoogleMaps } from "../contexts/GoogleMapsContext";
import GooglePlacesAutocomplete from "../components/common/GooglePlacesAutocomplete";
import Navbar from "./Navbar";

// --- Sub-Component: Popular Districts (No Changes) ---
const PopularDistricts = ({ onSelect }) => {
  const popularDistricts = [
    { name: "Berlin Mitte", plz: "10115" },
    { name: "München Schwabing", plz: "80802" },
    { name: "Hamburg Altona", plz: "22767" },
    { name: "Frankfurt Sachsenhausen", plz: "60594" },
    { name: "Köln Ehrenfeld", plz: "50823" },
    { name: "Dresden Neustadt", plz: "01097" },
  ];
  return (
    <div className="mt-6">
      <h3 className="text-gray-700 font-medium mb-3">Popular Districts</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {popularDistricts.map((district) => (
          <motion.button
            key={district.plz}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:shadow-md text-left"
            onClick={() => onSelect(district)}
          >
            <Building className="text-teal-600 mr-2 flex-shrink-0" size={16} />
            <div>
              <div className="font-medium text-gray-800">{district.name}</div>
              <div className="text-xs text-gray-500">PLZ: {district.plz}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// --- Sub-Component: Recent Searches ---
const RecentSearches = ({ searches, onSelect }) => {
  if (!searches || !searches.length) return null;
  return (
    <div className="mt-6">
      <h3 className="text-gray-700 font-medium mb-3">Recent Locations</h3>
      <div className="space-y-2">
        {searches.map((location, index) => (
          <motion.button
            key={index}
            whileHover={{ x: 4 }}
            className="flex items-center w-full p-2 hover:bg-gray-50 rounded-md text-left"
            onClick={() => onSelect(location)}
          >
            <Clock className="text-gray-400 mr-2" size={16} />
            <div className="text-gray-600">
              {location.formattedAddress}
              {location.postalCode && (
                <span className="text-gray-400 text-sm ml-1">
                  ({location.postalCode})
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// --- Main LocationInputPage Component ---
const LocationInputPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const bookingContext = useBooking();
  const googleMapsContext = useGoogleMaps();

  // State for location input
  const [inputValue, setInputValue] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentLocations, setRecentLocations] = useState([]);
  const [inputFocus, setInputFocus] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Get selected service from navigation state or booking context
  const selectedService =
    bookingContext?.currentBooking?.service ||
    routeLocation.state?.selectedService ||
    null;

  // Check if Google Maps API is loaded
  const isLoaded = googleMapsContext?.isLoaded || !!window.google?.maps?.places;

  // Extract booking context values safely
  const updateBooking = bookingContext?.updateBooking;
  const startBooking = bookingContext?.startBooking;
  const currentBooking = bookingContext?.currentBooking;

  // Load recent locations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentLocations");
      if (saved) {
        setRecentLocations(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading recent locations:", e);
    }
  }, []);

  // Redirect if no service is selected
  useEffect(() => {
    if (
      !selectedService &&
      !routeLocation.pathname.includes("/booking/resume")
    ) {
      console.log("No service selected, redirecting...");
      navigate("/services");
    }
  }, [selectedService, navigate, routeLocation.pathname]);

  // Safe function to update booking
  const safeUpdateBooking = useCallback(
    (location) => {
      try {
        if (typeof updateBooking === "function" && currentBooking) {
          updateBooking({ location });
          return true;
        } else if (typeof startBooking === "function") {
          startBooking({ location });
          return true;
        } else {
          console.warn("Booking functions not available", {
            updateBookingType: typeof updateBooking,
            startBookingType: typeof startBooking,
          });
          return false;
        }
      } catch (err) {
        console.error("Error updating booking:", err);
        return false;
      }
    },
    [updateBooking, startBooking, currentBooking]
  );

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback(
    (place) => {
      setLocationData(place);
      setError(place ? null : t("error_valid_address"));
    },
    [t]
  );

  // Handle recent location selection
  const handleRecentLocationSelect = useCallback((location) => {
    setInputValue(location.formattedAddress);
    setLocationData(location);
    setError(null);
  }, []);

  // Handle location form submission
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
  
      if (!locationData) {
        setError(t("error_valid_address"));
        return;
      }
  
      setLoading(true);
      try {
        // Add timestamp
        const locationToStore = {
          ...locationData,
          timestamp: new Date().toISOString(),
        };
  
        // Save to recent locations
        const newRecents = [
          locationToStore,
          ...recentLocations.filter(
            (l) => l.formattedAddress !== locationToStore.formattedAddress
          ),
        ].slice(0, 5);
  
        setRecentLocations(newRecents);
        localStorage.setItem("recentLocations", JSON.stringify(newRecents));
  
        // Check if postal code is valid
        const postalCode = locationData.postalCode;
        if (!postalCode || !/^\d{5}$/.test(postalCode)) {
          setError(t("error_invalid_postal_code"));
          setLoading(false);
          return;
        }
  
        // Try to update booking context
        const updateSuccessful = safeUpdateBooking(locationToStore);
        console.log("Context update successful:", updateSuccessful);
        console.log("Proceeding with location:", locationToStore);
        
        // Log the exact location data we're passing
        console.log("Location data being passed to booking page:", locationToStore);
        
        // Navigate to booking page with location data explicitly passed
        const { icon, ...safeService } = selectedService;
        navigate("/booking", {
          state: { 
            selectedService, 
            selectedLocation: locationToStore  // Note the key name matches what we look for in BookingPage
          }
        });
      } catch (err) {
        console.error("Error processing location:", err);
        setError(t("error_process_location"));
      } finally {
        setLoading(false);
        setCheckingAvailability(false);
      }
    },
    [locationData, safeUpdateBooking, navigate, t, recentLocations, selectedService]
  );

  // Geolocation detection
  const handleDetect = useCallback(async () => {
    setDetectLoading(true);
    setError(null);

    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError(t("error_geolocation_not_supported"));
      setDetectLoading(false);
      return;
    }

    try {
      // First check if Google Maps is loaded
      if (!window.google?.maps) {
        throw new Error("Maps API not available");
      }

      // Get user position first
      let position;
      try {
        position = await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Location request timed out"));
          }, 10000);

          navigator.geolocation.getCurrentPosition(
            (pos) => {
              clearTimeout(timeoutId);
              resolve(pos);
            },
            (err) => {
              clearTimeout(timeoutId);
              switch (err.code) {
                case 1: // PERMISSION_DENIED
                  reject(new Error("location_permission_denied"));
                  break;
                case 2: // POSITION_UNAVAILABLE
                  reject(new Error("location_unavailable"));
                  break;
                case 3: // TIMEOUT
                  reject(new Error("location_timeout"));
                  break;
                default:
                  reject(err);
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      } catch (posError) {
        throw posError; // Re-throw to be caught by the outer try/catch
      }

      const { latitude, longitude } = position.coords;

      // Now do the geocoding in a separate try block
      let locationToStore;
      try {
        // Create geocoder safely
        const geocoder = new window.google.maps.Geocoder();

        const result = await new Promise((resolve, reject) => {
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === "OK" && results && results[0]) {
                resolve(results[0]);
              } else {
                reject(new Error(`Geocoding failed: ${status}`));
              }
            }
          );
        });

        // Extract address components
        let postalCode = "";
        let cityName = "";
        let streetName = "";
        let streetNumber = "";

        if (result.address_components) {
          result.address_components.forEach((component) => {
            if (component.types.includes("postal_code"))
              postalCode = component.long_name;
            if (component.types.includes("locality"))
              cityName = component.long_name;
            if (component.types.includes("route"))
              streetName = component.long_name;
            if (component.types.includes("street_number"))
              streetNumber = component.long_name;
          });
        }

        locationToStore = {
          postalCode,
          cityName,
          streetName,
          streetNumber,
          coordinates: { lat: latitude, lng: longitude },
          formattedAddress:
            result.formatted_address || `${latitude}, ${longitude}`,
          detected: true,
          timestamp: new Date().toISOString(),
        };
      } catch (geoError) {
        console.error("Geocoding error:", geoError);
        // Create a minimal location object with just coordinates
        locationToStore = {
          coordinates: { lat: latitude, lng: longitude },
          formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          detected: true,
          timestamp: new Date().toISOString(),
        };
      }

      // Update state first to reflect in UI
      setLocationData(locationToStore);
      setInputValue(locationToStore.formattedAddress);

      // Set loading to false before saving location
      setDetectLoading(false);

      // Save to recent locations
      try {
        const newRecents = [
          locationToStore,
          ...recentLocations.filter(
            (l) => l.formattedAddress !== locationToStore.formattedAddress
          ),
        ].slice(0, 5);

        setRecentLocations(newRecents);
        localStorage.setItem("recentLocations", JSON.stringify(newRecents));
      } catch (storageError) {
        console.warn("Could not save to localStorage:", storageError);
      }

      // Try to update booking
      safeUpdateBooking(locationToStore);
    } catch (err) {
      console.error("Detection error:", err);

      // More specific error messages
      if (err.message === "location_permission_denied") {
        setError(t("error_location_permission_denied"));
      } else if (err.message === "location_unavailable") {
        setError(t("error_location_unavailable"));
      } else if (err.message === "location_timeout") {
        setError(t("error_location_timeout"));
      } else if (err.message.includes("Geocoding failed")) {
        setError(t("error_geocoding_failed"));
      } else {
        setError(t("error_detect_location"));
      }

      setDetectLoading(false);
    }
  }, [navigate, t, recentLocations, safeUpdateBooking]);

  // Handle popular district selection
  const handleDistrictSelect = (district) => {
    const locationData = {
      postalCode: district.plz,
      cityName: district.name,
      formattedAddress: `${district.name}, ${district.plz}`,
      timestamp: new Date().toISOString(),
    };

    setLocationData(locationData);
    setInputValue(locationData.formattedAddress);
    setError(null);

    // Save to recent locations
    const newRecents = [
      locationData,
      ...recentLocations.filter((l) => l.postalCode !== district.plz),
    ].slice(0, 5);

    setRecentLocations(newRecents);
    localStorage.setItem("recentLocations", JSON.stringify(newRecents));
  };

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 md:pt-32 pb-16">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-12"
        >
          {/* Progress Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-medium text-sm">
                <CheckCircle size={16} />
              </div>
              <div className="h-1 w-12 sm:w-16 bg-teal-500 mx-1 sm:mx-2"></div>
              <div className="w-8 h-8 rounded-full bg-teal-500 border border-teal-600 flex items-center justify-center text-white font-medium text-sm">
                2
              </div>
              <div className="h-1 w-12 sm:w-16 bg-teal-100 mx-1 sm:mx-2"></div>
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-gray-400 font-medium text-sm">
                3
              </div>
              <div className="h-1 w-12 sm:w-16 bg-teal-100 mx-1 sm:mx-2"></div>
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-gray-400 font-medium text-sm">
                4
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
            Where Do You Need Cleaning?
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            Enter your location so we can match you with the best cleaner for
            your area.
          </p>
        </motion.div>

        {/* Main Content - 2 column layout on larger screens */}
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left column - primary location input */}
          <div className="lg:w-2/3">
            {/* Selected Service Card - NEW with more detail */}
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-5 mb-6"
              >
                <h3 className="font-bold text-gray-800 mb-3">
                  Selected Service
                </h3>
                <div className="flex items-center">
                  <div className="bg-teal-100 p-3 rounded-full mr-4 flex-shrink-0">
                    {selectedService.icon ? (
                      <selectedService.icon className="text-teal-600 w-6 h-6" />
                    ) : (
                      <CheckCircle className="text-teal-600 w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">
                      {selectedService.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedService.description ||
                        "Professional cleaning service"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-teal-600 font-bold">
                      €{selectedService.price}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedService.duration}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Auto-Matching Info Box - NEW */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100"
            >
              <div className="flex items-start">
                <Shield
                  className="text-blue-600 mr-3 mt-1 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    Smart Cleaner Matching
                  </h4>
                  <p className="text-sm text-gray-600">
                    Your location helps us match you with the best available
                    cleaner in your area. We consider proximity, availability,
                    and expertise to find your perfect match.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Location Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden mb-6"
            >
              <div className="p-5 md:p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="mr-2 text-teal-600" size={20} />
                  Enter Your Location
                </h3>

                {/* Search Input Group */}
                <div className="relative">
                  {/* Input Field */}
                  <div
                    className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors duration-300 focus-within:ring-2 focus-within:ring-teal-300 focus-within:border-teal-500 ${
                      error
                        ? "border-red-400"
                        : inputFocus
                        ? "border-teal-400"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="pl-4 text-gray-400">
                      <Search size={20} />
                    </div>

                    {/* Using GooglePlacesAutocomplete from HeroSection */}
                    {isLoaded ? (
                      <GooglePlacesAutocomplete
                        placeholder={t("Enter your address")}
                        disabled={loading || detectLoading}
                        value={inputValue}
                        onChange={setInputValue}
                        onPlaceSelect={handlePlaceSelect}
                        onFocus={() => setInputFocus(true)}
                        onBlur={() =>
                          setTimeout(() => setInputFocus(false), 150)
                        }
                        country="de"
                        className="w-full p-4 outline-none text-gray-700 placeholder-gray-400 text-base"
                      />
                    ) : (
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setInputFocus(true)}
                        onBlur={() =>
                          setTimeout(() => setInputFocus(false), 150)
                        }
                        placeholder="Loading location service..."
                        className="w-full p-4 outline-none text-gray-700 placeholder-gray-400 text-base"
                        disabled
                      />
                    )}

                    {detectLoading && (
                      <div className="pr-4">
                        <Loader className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    )}
                    {inputValue && !detectLoading && (
                      <button
                        onClick={() => {
                          setInputValue("");
                          setLocationData(null);
                          setError(null);
                        }}
                        className="pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label="Clear input"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {/* API Loading Indicator */}
                  {!isLoaded && !error && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center px-1">
                      <Loader className="w-4 h-4 mr-1.5 animate-spin" />
                      Initializing location service...
                    </div>
                  )}

                  {/* Error Display */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 flex items-center text-sm text-red-600 px-1"
                        role="alert"
                      >
                        <AlertCircle
                          size={16}
                          className="mr-1.5 flex-shrink-0"
                        />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Selected Location Display */}
                <AnimatePresence>
                  {locationData && !inputFocus && !detectLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mt-5 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-start">
                        <MapPin
                          className="text-teal-600 mr-3 mt-0.5 flex-shrink-0"
                          size={20}
                        />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {locationData.formattedAddress}
                          </div>
                          {locationData.postalCode && (
                            <div className="text-gray-600 text-sm mt-0.5">
                              PLZ: {locationData.postalCode}
                            </div>
                          )}
                        </div>
                      </div>
                      <CheckCircle
                        className="text-teal-500 flex-shrink-0"
                        size={22}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Geolocation / Popular / Recent Sections */}
                {isLoaded && !inputFocus && !locationData && !detectLoading && (
                  <div className="mt-4">
                    {/* Geolocation Button */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start">
                      <Navigation
                        className="text-blue-500 mr-3 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <div>
                        <div className="font-medium text-gray-800 mb-1">
                          Use current location?
                        </div>
                        <button
                          className="text-sm text-blue-600 font-medium flex items-center hover:text-blue-700 disabled:opacity-60 disabled:cursor-wait"
                          onClick={handleDetect}
                          disabled={detectLoading || !isLoaded}
                          aria-label="Detect my current location"
                        >
                          {detectLoading ? (
                            <>
                              <Loader className="w-4 h-4 mr-1.5 animate-spin" />
                              Detecting...
                            </>
                          ) : (
                            <>
                              <CornerDownRight size={16} className="mr-1" />
                              Detect Location
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Recent & Popular */}
                    <RecentSearches
                      searches={recentLocations}
                      onSelect={handleRecentLocationSelect}
                    />
                    <PopularDistricts onSelect={handleDistrictSelect} />
                  </div>
                )}

                {/* Continue Button - UPDATED */}
                <div className="mt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      !locationData?.postalCode ||
                      checkingAvailability ||
                      loading ||
                      detectLoading ||
                      !isLoaded
                    }
                    className={`w-full flex items-center justify-center p-4 rounded-xl text-lg text-white font-semibold transition-all duration-300 ease-in-out ${
                      locationData?.postalCode &&
                      !checkingAvailability &&
                      !loading &&
                      isLoaded &&
                      !detectLoading
                        ? "bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-md"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                    aria-label={
                      locationData
                        ? "Continue to schedule your booking"
                        : "Select a location first"
                    }
                  >
                    {checkingAvailability ? (
                      <>
                        <Loader className="animate-spin w-5 h-5 mr-2" />
                        Checking Availability...
                      </>
                    ) : (
                      <>
                        <span>Continue to Schedule</span>
                        <ArrowRight className="ml-2" size={20} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Help/Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white p-4 rounded-lg shadow border border-gray-100"
            >
              <div className="flex items-start">
                <Heart
                  className="text-red-400 mr-3 mt-1 flex-shrink-0"
                  size={18}
                />
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Can't find your location or need service in a different
                    area? We're constantly expanding!
                    <button className="text-teal-600 font-medium hover:underline focus:outline-none focus:underline ml-1">
                      Request your area here.
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - Order summary - NEW */}
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

                  {locationData && (
                    <div className="flex justify-between pb-3 border-b">
                      <div className="text-gray-600">Location</div>
                      <div className="font-medium text-gray-800 text-right max-w-[200px] truncate">
                        {locationData.formattedAddress ||
                          `${locationData.cityName}, ${locationData.postalCode}`}
                      </div>
                    </div>
                  )}

                  {selectedService?.price && (
                    <div className="flex justify-between pt-3 font-bold">
                      <div className="text-gray-700">Estimated Price</div>
                      <div className="text-teal-600">
                        €{selectedService.price.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Steps - NEW */}
              <div className="bg-teal-50 rounded-xl p-5 text-sm text-teal-800">
                <h4 className="font-bold mb-2">Your Progress:</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  <li className="text-teal-900 font-medium">
                    Select service{" "}
                    <CheckCircle
                      className="inline-block ml-2 text-teal-600"
                      size={14}
                    />
                  </li>
                  <li className="font-medium">
                    Enter your location (current step)
                  </li>
                  <li className="text-teal-700/70">Choose date and time</li>
                  <li className="text-teal-700/70">Review and pay</li>
                </ol>
                <div className="mt-4 pt-4 border-t border-teal-200/50">
                  <div className="flex items-start">
                    <Shield
                      className="text-teal-600 mr-2 flex-shrink-0 mt-0.5"
                      size={16}
                    />
                    <p className="text-teal-700 text-xs">
                      Your location helps us find the best cleaner for your
                      area. Our smart matching system considers availability,
                      proximity, and expertise.
                    </p>
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

export default LocationInputPage;
