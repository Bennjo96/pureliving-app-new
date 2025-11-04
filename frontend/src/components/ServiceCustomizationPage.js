import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "../contexts/BookingContext";
import {
  ArrowLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Minus,
  Info,
  Dog,
  Baby,
  Briefcase,
  Home,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";

const ServiceCustomizationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateBooking } = useBooking();

  const selectedService = location.state?.selectedService;

  // Redirect if no service selected
  useEffect(() => {
    if (!selectedService) {
      navigate("/services");
    }
  }, [selectedService, navigate]);

  // Customization options based on service type
  const [customizations, setCustomizations] = useState({
    extraRooms: [],
    addOns: [],
    priorities: [],
    homeDetails: {
      hasPets: false,
      hasChildren: false,
      homeOffice: false,
      petDetails: "",
    },
    cleaningProducts: "standard", // standard, eco, allergySafe, bringOwn
    specialRequests: "",
  });

  // Available add-ons
  const addOns = [
    {
      id: "inside-oven",
      name: "Inside Oven Cleaning",
      price: 15,
      duration: "+30 min",
      icon: "🔥",
      description: "Deep clean inside of oven",
    },
    {
      id: "inside-fridge",
      name: "Inside Fridge Cleaning",
      price: 15,
      duration: "+30 min",
      icon: "❄️",
      description: "Clean and organize refrigerator",
    },
    {
      id: "windows",
      name: "Window Cleaning",
      price: 20,
      duration: "+45 min",
      icon: "🪟",
      description: "Interior window cleaning",
    },
    {
      id: "laundry",
      name: "Laundry Service",
      price: 25,
      duration: "+60 min",
      icon: "👔",
      description: "Wash, dry, and fold one load",
    },
    {
      id: "dishes",
      name: "Dishes & Kitchen Deep Clean",
      price: 10,
      duration: "+20 min",
      icon: "🍽️",
      description: "Wash dishes and deep clean kitchen",
    },
    {
      id: "balcony",
      name: "Balcony/Terrace Cleaning",
      price: 20,
      duration: "+30 min",
      icon: "🌿",
      description: "Clean outdoor spaces",
    },
  ];

  // Extra rooms
  const extraRooms = [
    { id: "bedroom", name: "Extra Bedroom", price: 15, icon: "🛏️" },
    { id: "bathroom", name: "Extra Bathroom", price: 20, icon: "🚿" },
    { id: "office", name: "Home Office", price: 15, icon: "💼" },
    { id: "basement", name: "Basement", price: 25, icon: "🏠" },
  ];

  // Priority areas
  const priorityAreas = [
    { id: "kitchen", name: "Kitchen", icon: "👨‍🍳" },
    { id: "bathrooms", name: "Bathrooms", icon: "🚿" },
    { id: "living", name: "Living Areas", icon: "🛋️" },
    { id: "bedrooms", name: "Bedrooms", icon: "🛏️" },
  ];

  const toggleAddOn = (addOn) => {
    setCustomizations((prev) => ({
      ...prev,
      addOns: prev.addOns.find((a) => a.id === addOn.id)
        ? prev.addOns.filter((a) => a.id !== addOn.id)
        : [...prev.addOns, addOn],
    }));
  };

  const toggleExtraRoom = (room) => {
    setCustomizations((prev) => ({
      ...prev,
      extraRooms: prev.extraRooms.find((r) => r.id === room.id)
        ? prev.extraRooms.filter((r) => r.id !== room.id)
        : [...prev.extraRooms, room],
    }));
  };

  const togglePriority = (area) => {
    setCustomizations((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(area.id)
        ? prev.priorities.filter((p) => p !== area.id)
        : [...prev.priorities, area.id],
    }));
  };

  const calculateTotal = () => {
    const basePrice = selectedService?.price || 0;
    const addOnsTotal = customizations.addOns.reduce(
      (sum, addon) => sum + addon.price,
      0
    );
    const roomsTotal = customizations.extraRooms.reduce(
      (sum, room) => sum + room.price,
      0
    );
    return basePrice + addOnsTotal + roomsTotal;
  };

  const calculateDuration = () => {
    const baseDuration = 120; // 2 hours in minutes
    const addOnsDuration = customizations.addOns.reduce((sum, addon) => {
      const duration = parseInt(addon.duration.replace(/\D/g, "")) || 0;
      return sum + duration;
    }, 0);
    return baseDuration + addOnsDuration;
  };

  const handleContinue = () => {
    // Save customizations to booking context
    updateBooking({
      service: selectedService,
      customizations: customizations,
      estimatedPrice: calculateTotal(),
      estimatedDuration: calculateDuration(),
    });

    // Navigate to location page
    navigate("/location", {
      state: {
        selectedService: selectedService,
        customizations: customizations,
        totalPrice: calculateTotal(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate("/services")}
          className="flex items-center text-teal-600 hover:text-teal-700 font-medium mb-6"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Services
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Customize Your {selectedService?.title}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tailor your cleaning service to your specific needs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Home Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Tell us about your home
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() =>
                    setCustomizations((prev) => ({
                      ...prev,
                      homeDetails: {
                        ...prev.homeDetails,
                        hasPets: !prev.homeDetails.hasPets,
                      },
                    }))
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    customizations.homeDetails.hasPets
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Dog
                    className={`mx-auto mb-2 ${
                      customizations.homeDetails.hasPets
                        ? "text-teal-600"
                        : "text-gray-400"
                    }`}
                    size={24}
                  />
                  <p className="font-medium">I have pets</p>
                </button>

                <button
                  onClick={() =>
                    setCustomizations((prev) => ({
                      ...prev,
                      homeDetails: {
                        ...prev.homeDetails,
                        hasChildren: !prev.homeDetails.hasChildren,
                      },
                    }))
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    customizations.homeDetails.hasChildren
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Baby
                    className={`mx-auto mb-2 ${
                      customizations.homeDetails.hasChildren
                        ? "text-teal-600"
                        : "text-gray-400"
                    }`}
                    size={24}
                  />
                  <p className="font-medium">Children at home</p>
                </button>

                <button
                  onClick={() =>
                    setCustomizations((prev) => ({
                      ...prev,
                      homeDetails: {
                        ...prev.homeDetails,
                        homeOffice: !prev.homeDetails.homeOffice,
                      },
                    }))
                  }
                  className={`p-4 rounded-lg border-2 transition-all ${
                    customizations.homeDetails.homeOffice
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Briefcase
                    className={`mx-auto mb-2 ${
                      customizations.homeDetails.homeOffice
                        ? "text-teal-600"
                        : "text-gray-400"
                    }`}
                    size={24}
                  />
                  <p className="font-medium">Home office</p>
                </button>
              </div>

              {customizations.homeDetails.hasPets && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    placeholder="Tell us about your pets (e.g., 2 cats, 1 friendly dog)"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={customizations.homeDetails.petDetails}
                    onChange={(e) =>
                      setCustomizations((prev) => ({
                        ...prev,
                        homeDetails: {
                          ...prev.homeDetails,
                          petDetails: e.target.value,
                        },
                      }))
                    }
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Extra Rooms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Extra Rooms
              </h3>
              <p className="text-gray-600 mb-4">
                Add rooms beyond the standard service
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {extraRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => toggleExtraRoom(room)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      customizations.extraRooms.find((r) => r.id === room.id)
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{room.icon}</div>
                    <p className="font-medium text-sm">{room.name}</p>
                    <p className="text-xs text-gray-500">+€{room.price}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Add-on Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Add-on Services
              </h3>
              <p className="text-gray-600 mb-4">
                Enhance your cleaning with these extras
              </p>

              <div className="space-y-3">
                {addOns.map((addon) => (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddOn(addon)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      customizations.addOns.find((a) => a.id === addon.id)
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div className="text-2xl mr-3">{addon.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {addon.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {addon.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-teal-600">
                          +€{addon.price}
                        </p>
                        <p className="text-xs text-gray-500">
                          {addon.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Priority Areas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Priority Areas
              </h3>
              <p className="text-gray-600 mb-4">
                Tell us where to focus extra attention (select up to 2)
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {priorityAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => togglePriority(area)}
                    disabled={
                      customizations.priorities.length >= 2 &&
                      !customizations.priorities.includes(area.id)
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      customizations.priorities.includes(area.id)
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    }`}
                  >
                    <div className="text-2xl mb-1">{area.icon}</div>
                    <p className="font-medium text-sm">{area.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Cleaning Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Cleaning Products Preference
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    id: "standard",
                    name: "Standard Products",
                    icon: "🧽",
                    desc: "Professional grade cleaning products",
                  },
                  {
                    id: "eco",
                    name: "Eco-Friendly",
                    icon: "🌿",
                    desc: "Environmental and pet-safe products",
                  },
                  {
                    id: "allergySafe",
                    name: "Allergy Safe",
                    icon: "🛡️",
                    desc: "Hypoallergenic and fragrance-free",
                  },
                  {
                    id: "bringOwn",
                    name: "Use My Products",
                    icon: "🏠",
                    desc: "I'll provide the cleaning products",
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      setCustomizations((prev) => ({
                        ...prev,
                        cleaningProducts: option.id,
                      }))
                    }
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      customizations.cleaningProducts === option.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">{option.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {option.name}
                        </h4>
                        <p className="text-xs text-gray-600">{option.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Special Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Special Requests
              </h3>
              <textarea
                placeholder="Any other specific requests or areas to avoid?"
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={4}
                value={customizations.specialRequests}
                onChange={(e) =>
                  setCustomizations((prev) => ({
                    ...prev,
                    specialRequests: e.target.value,
                  }))
                }
              />
            </motion.div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Service Summary
              </h3>

              {/* Base Service */}
              <div className="pb-3 mb-3 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedService?.title}</p>
                    <p className="text-sm text-gray-500">Base service</p>
                  </div>
                  <p className="font-bold">
                    €{selectedService?.price?.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Extra Rooms */}
              {customizations.extraRooms.length > 0 && (
                <div className="pb-3 mb-3 border-b">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Extra Rooms
                  </p>
                  {customizations.extraRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex justify-between items-center mb-1"
                    >
                      <p className="text-sm text-gray-600">{room.name}</p>
                      <p className="text-sm font-medium">+€{room.price}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add-ons */}
              {customizations.addOns.length > 0 && (
                <div className="pb-3 mb-3 border-b">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Add-ons
                  </p>
                  {customizations.addOns.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex justify-between items-center mb-1"
                    >
                      <p className="text-sm text-gray-600">{addon.name}</p>
                      <p className="text-sm font-medium">+€{addon.price}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="pt-3 mb-4">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-800">Estimated Total</p>
                  <p className="font-bold text-xl text-teal-600">
                    €{calculateTotal().toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-600">Estimated Duration</p>
                  <p className="text-sm font-medium">
                    {Math.floor(calculateDuration() / 60)}h{" "}
                    {calculateDuration() % 60}min
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info
                    className="text-blue-600 mr-2 flex-shrink-0 mt-0.5"
                    size={16}
                  />
                  <p className="text-xs text-blue-800">
                    Final price may vary based on actual home condition. Your
                    cleaner will confirm any changes before proceeding.
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors flex items-center justify-center"
              >
                Continue to Location
                <ChevronRight size={20} className="ml-2" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCustomizationPage;
