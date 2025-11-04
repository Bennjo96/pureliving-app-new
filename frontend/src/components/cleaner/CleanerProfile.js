import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  User,
  Star,
  Edit,
  X,
  Camera,
  AlertCircle,
  Check,
  EyeOff,
  Eye,
  Briefcase,
  Loader,
  Home,
  MapPinned,
  Info,
  Sparkles,
  Clock,
  Calendar,
  Search,
  CheckCircle,
  ChevronRight,
  FileText,
  CreditCard,
  MapPin,
} from "lucide-react";
import { cleanerService } from "../../api/api";

const CleanerProfile = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [cleanerData, setCleanerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for form visibility
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showServiceAreaForm, setShowServiceAreaForm] = useState(false);
  const [showSkillsSection, setShowSkillsSection] = useState(false);

  // State for data
  const [availability, setAvailability] = useState(true);
  const [profilePicture, setProfilePicture] = useState(null);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [experienceForm, setExperienceForm] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [serviceAreas, setServiceAreas] = useState([]);
  const [serviceRadius, setServiceRadius] = useState(25);
  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState({});

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Area search states
  const [newArea, setNewArea] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Load cleaner data
  useEffect(() => {
    const fetchCleanerData = async () => {
      try {
        setLoading(true);
        const response = await cleanerService.getProfile();
        const userData = response.data.user;

        // Set basic profile info for display only
        setName(userData.name || "");
        setExperience(userData.experience || "");
        setExperienceForm(userData.experience || "");
        setProfilePicture(userData.profilePicture);
        setAvailability(userData.isAvailable !== false);

        // Set address
        if (userData.addresses && userData.addresses.length > 0) {
          setAddress({
            street: userData.addresses[0].street || "",
            city: userData.addresses[0].city || "",
            state: userData.addresses[0].state || "",
            postalCode: userData.addresses[0].postalCode || "",
          });
        }

        // Set services
        const servicesData = {};
        if (userData.services && Array.isArray(userData.services)) {
          userData.services.forEach((service) => {
            servicesData[service] = true;
          });
        }
        setServices(servicesData);

        // Set service areas
        if (userData.serviceAreas && Array.isArray(userData.serviceAreas)) {
          setServiceAreas(userData.serviceAreas);
        }

        // Set service radius
        if (userData.serviceRadius) {
          setServiceRadius(userData.serviceRadius);
        }

        // Set skills/specializations
        if (userData.skills && Array.isArray(userData.skills)) {
          setSkills(
            userData.skills.map((skill) =>
              typeof skill === "object" ? skill.name : skill
            )
          );
        }

        setCleanerData(userData);
      } catch (error) {
        console.error("Error loading cleaner profile:", error);
        showNotification(t("Failed to load profile data"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchCleanerData();
  }, [t]);

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, show: false })),
      5000
    );
  };

  // Handle avatar update
  const handleAvatarUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await cleanerService.updateAvatar(formData);
      setProfilePicture(response.data.profilePicture);
      showNotification(t("Profile picture updated successfully"));
    } catch (error) {
      console.error("Error updating profile picture:", error);
      showNotification(t("Failed to update profile picture"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle availability toggle
  const handleAvailabilityToggle = async () => {
    try {
      setIsSaving(true);
      const newStatus = !availability;
      await cleanerService.updateProfile({ isAvailable: newStatus });
      setAvailability(newStatus);
      showNotification(
        newStatus
          ? t("Your profile is now visible to clients")
          : t("Your profile is now hidden from clients")
      );
    } catch (error) {
      console.error("Error updating availability:", error);
      showNotification(t("Failed to update availability"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle experience update
  const handleExperienceUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      await cleanerService.updateProfile({ experience: experienceForm });
      setExperience(experienceForm);
      setShowExperienceForm(false);
      showNotification(t("Experience updated successfully"));
    } catch (error) {
      console.error("Error updating experience:", error);
      showNotification(t("Failed to update experience"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle address update
  const handleAddressUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      // Format address for API
      const formattedAddress = {
        ...address,
        isPrimary: true,
        type: "home",
      };

      await cleanerService.updateProfile({
        addresses: [formattedAddress],
      });

      setShowAddressForm(false);
      showNotification(t("Address updated successfully"));
    } catch (error) {
      console.error("Error updating address:", error);
      showNotification(t("Failed to update address"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle service toggle
  const handleServiceToggle = async (serviceKey, isEnabled) => {
    try {
      setIsSaving(true);

      // Update local state first
      const updatedServices = {
        ...services,
        [serviceKey]: isEnabled,
      };
      setServices(updatedServices);

      // Create services array for API
      const servicesArray = Object.entries(updatedServices)
        .filter(([_, value]) => value)
        .map(([key]) => key);

      // Update API using updateProfile instead of updateServices
      await cleanerService.updateProfile({
        services: servicesArray,
      });

      showNotification(t("Services updated successfully"));
    } catch (error) {
      console.error("Error updating services:", error);
      showNotification(t("Failed to update services"), "error");

      // Revert on error
      setServices((prev) => ({ ...prev }));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle area search
  const handleAreaSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // This would be your API call
      const response = await cleanerService
        .searchLocations(query)
        .catch(() => ({ data: [] }));

      // If API fails or returns no results, provide a fallback suggestion
      if (!response.data || response.data.length === 0) {
        setSearchResults([
          { code: query, name: query, description: t("Postal Code") },
        ]);
      } else {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      setSearchResults([
        { code: query, name: query, description: t("Postal Code") },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAreaSearch(newArea);
    }, 500);

    return () => clearTimeout(timer);
  }, [newArea]);

  // Add service area
  const addServiceArea = (area) => {
    if (!serviceAreas.includes(area)) {
      setServiceAreas((prev) => [...prev, area]);
      setNewArea("");
      setSearchResults([]);
    }
  };

  // Remove service area
  const removeServiceArea = (area) => {
    setServiceAreas((prev) => prev.filter((a) => a !== area));
  };

  // Save service areas
  const handleServiceAreaUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      await cleanerService.updateProfile({
        serviceAreas,
        serviceRadius,
        // Important for algorithm: save the coordinates
        serviceAreaRefs: serviceAreas.map((area) => ({ code: area })),
      });

      setShowServiceAreaForm(false);
      showNotification(t("Service areas updated successfully"));
    } catch (error) {
      console.error("Error updating service areas:", error);
      showNotification(t("Failed to update service areas"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle skill selection
  const toggleSkill = (skillId) => {
    if (skills.includes(skillId)) {
      setSkills((prev) => prev.filter((id) => id !== skillId));
    } else {
      setSkills((prev) => [...prev, skillId]);
    }
  };

  // Save skills
  const handleSkillsUpdate = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      // Format skills for API
      const formattedSkills = skills.map((id) => ({
        name: id,
        level: "intermediate",
      }));

      await cleanerService.updateProfile({ skills: formattedSkills });

      setShowSkillsSection(false);
      showNotification(t("Skills updated successfully"));
    } catch (error) {
      console.error("Error updating skills:", error);
      showNotification(t("Failed to update skills"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Define services list
  const serviceList = [
    { id: "standard", name: t("Standard Cleaning") },
    { id: "deep", name: t("Deep Cleaning") },
    { id: "window", name: t("Window Cleaning") },
    { id: "carpet", name: t("Carpet Cleaning") },
    { id: "moveInOut", name: t("Move-in/Move-out Cleaning") },
    { id: "office", name: t("Office Cleaning") },
    { id: "postConstruction", name: t("Post-Construction Cleaning") },
  ];

  // Define skill categories
  const skillCategories = [
    {
      id: "specialties",
      name: t("Cleaning Specialties"),
      skills: [
        { id: "pet-friendly", name: t("Pet-Friendly Cleaning") },
        { id: "allergy-sensitive", name: t("Allergy-Sensitive Cleaning") },
        { id: "eco-friendly", name: t("Eco-Friendly Products") },
        { id: "deep-cleaning", name: t("Deep Cleaning Specialist") },
      ],
    },
    {
      id: "areas",
      name: t("Area Specialties"),
      skills: [
        { id: "kitchen", name: t("Kitchen Specialist") },
        { id: "bathroom", name: t("Bathroom Specialist") },
        { id: "windows", name: t("Window Cleaning") },
        { id: "floors", name: t("Floor & Carpet Expert") },
      ],
    },
    {
      id: "special",
      name: t("Special Skills"),
      skills: [
        { id: "stain-removal", name: t("Stain Removal Expert") },
        { id: "organizing", name: t("Organizing & Decluttering") },
        { id: "polishing", name: t("Furniture Polishing") },
        { id: "high-end", name: t("High-End Homes") },
      ],
    },
  ];

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const requirements = [
      !!profilePicture,
      !!experience,
      !!(address.street && address.city && address.postalCode),
      serviceAreas.length > 0,
      Object.values(services).some((enabled) => enabled),
      skills.length > 0,
    ];

    const completed = requirements.filter(Boolean).length;
    return Math.round((completed / requirements.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-5 right-5 p-4 rounded shadow-md z-50 animate-fade-in-right flex items-center
          ${
            notification.type === "success"
              ? "bg-green-100 border-l-4 border-green-500 text-green-700"
              : "bg-red-100 border-l-4 border-red-500 text-red-700"
          }`}
        >
          {notification.type === "success" ? (
            <Check className="h-5 w-5 mr-2 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header with gradient background */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 p-8 text-white shadow-lg">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white opacity-10"></div>
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white opacity-10"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-md">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={name || t("Your Name")}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-white" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpdate}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Camera className="w-4 h-4 text-teal-600" />
              </label>
            </div>

            <div>
              <h1 className="text-3xl font-bold">{name || t("Your Name")}</h1>
              <p className="text-teal-100 mb-2">{t("Professional Cleaner")}</p>

              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`w-4 h-4 ${
                        index < Math.floor(cleanerData?.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-white">
                  {cleanerData?.rating
                    ? `${cleanerData.rating.toFixed(1)}`
                    : t("No ratings yet")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-3">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-white">
                  {t("Profile Completion")}
                </span>
                <span className="text-sm font-medium text-white">
                  {profileCompletion}%
                </span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full">
                <div
                  className="h-2 bg-white rounded-full"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
            </div>

            <button
              onClick={handleAvailabilityToggle}
              disabled={isSaving}
              className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm text-sm font-medium
                ${
                  availability
                    ? "bg-white text-teal-700 hover:bg-teal-50"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              {availability ? (
                <>
                  <Eye className="w-4 h-4" /> {t("Available for Work")}
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" /> {t("Not Available for Work")}
                </>
              )}
              {isSaving && <Loader className="w-3 h-3 ml-1 animate-spin" />}
            </button>

            <div className="flex mt-3 gap-4">
              <Link
                to="/cleaner/availability"
                className="flex items-center text-teal-100 hover:text-white text-sm"
              >
                <Calendar className="w-4 h-4 mr-1" /> {t("Availability")}
              </Link>
              <Link
                to="/cleaner/reviews"
                className="flex items-center text-teal-100 hover:text-white text-sm"
              >
                <Star className="w-4 h-4 mr-1" /> {t("Reviews")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Professional Info & Address */}
        <div className="lg:col-span-1 space-y-6">
          {/* Professional Experience */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <Briefcase className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Professional Experience")}
              </h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Experience */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {t("Experience (Years)")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {experience || t("Not set")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExperienceForm(true)}
                  className="text-teal-600 hover:text-teal-700 font-medium text-sm"
                >
                  {t("Edit")}
                </button>
              </div>

              {/* Experience Form */}
              {showExperienceForm && (
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-3 animate-fade-in">
                  <form onSubmit={handleExperienceUpdate}>
                    <h4 className="font-medium text-gray-800 mb-4">
                      {t("Update Experience")}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("Years of Experience")}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={experienceForm}
                          onChange={(e) => setExperienceForm(e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowExperienceForm(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                          disabled={isSaving}
                        >
                          {t("Cancel")}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                          disabled={isSaving}
                        >
                          {isSaving && (
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          {t("Save")}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <Home className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Work Base Location")}
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {t(
                  "This address is used as a starting point for calculating job distances and is not shared with clients."
                )}
              </p>

              {!showAddressForm ? (
                <>
                  {address.street ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="font-medium text-gray-800">
                        {address.street}
                      </div>
                      <div className="text-gray-600">
                        {address.city}, {address.state}
                      </div>
                      <div className="text-gray-600">{address.postalCode}</div>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="mt-3 text-sm text-teal-600 hover:text-teal-800 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" /> {t("Edit Location")}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <MapPin className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        {t("No location has been set")}
                      </p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-sm"
                      >
                        {t("Add Location")}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="animate-fade-in">
                  <form onSubmit={handleAddressUpdate} className="space-y-4">
                    <h3 className="font-medium text-gray-800 mb-4">
                      {address.street ? t("Edit Location") : t("Add Location")}
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Street Address")}
                      </label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) =>
                          setAddress({ ...address, street: e.target.value })
                        }
                        placeholder={t("123 Main St")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("City")}
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                          placeholder={t("Munich")}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("State/Province")}
                        </label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) =>
                            setAddress({ ...address, state: e.target.value })
                          }
                          placeholder={t("Bavaria")}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Postal Code")}
                      </label>
                      <input
                        type="text"
                        value={address.postalCode}
                        onChange={(e) =>
                          setAddress({ ...address, postalCode: e.target.value })
                        }
                        placeholder={t("80331")}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                        disabled={isSaving}
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                        disabled={isSaving}
                      >
                        {isSaving && (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {t("Save Location")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
          {/* Availability Shortcut Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <Clock className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Working Hours")}
              </h2>
            </div>

            <div className="p-6">
              <div className="p-4 border border-teal-200 bg-teal-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-teal-800 mb-1">
                      {t("Set your weekly schedule")}
                    </h4>
                    <p className="text-sm text-teal-700 mb-3">
                      {t(
                        "Our matching algorithm requires your weekly availability to assign you to jobs. Make sure to set your working hours for each day of the week."
                      )}
                    </p>
                    <Link
                      to="/cleaner/availability"
                      className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {t("Manage Availability")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Preview Mode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <Eye className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Client View")}
              </h2>
            </div>

            <div className="p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  {t("See how clients view your profile when booking")}
                </p>
                <Link
                  to="/cleaner/preview"
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {t("Preview Profile")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column - Service Areas & Services Offered */}
        <div className="lg:col-span-1 space-y-6">
          {/* Service Areas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <MapPinned className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Service Areas")}
              </h2>
            </div>

            <div className="p-6">
              {!showServiceAreaForm ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {t("Service Radius")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t("Maximum distance for jobs")}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                      {serviceRadius} km
                    </div>
                  </div>

                  {serviceAreas.length > 0 ? (
                    <>
                      <h3 className="font-medium text-gray-800 mb-3">
                        {t("Your Service Areas")}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {serviceAreas.map((area, index) => (
                          <div
                            key={index}
                            className="bg-teal-50 text-teal-800 px-3 py-1 rounded-full flex items-center text-sm"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span>{area}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
                      <p className="text-gray-600 text-sm">
                        {t("No specific service areas added yet")}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowServiceAreaForm(true)}
                    className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium shadow-sm"
                  >
                    {serviceAreas.length > 0
                      ? t("Manage Service Areas")
                      : t("Add Service Areas")}
                  </button>
                </>
              ) : (
                <div className="animate-fade-in space-y-6">
                  <form onSubmit={handleServiceAreaUpdate}>
                    <h3 className="font-medium text-gray-800 mb-3">
                      {t("Update Service Areas")}
                    </h3>

                    {/* Service Radius Slider */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">
                          {t("Service Radius")}
                        </h4>
                        <span className="text-teal-600 font-medium">
                          {serviceRadius} km
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-gray-600">
                            {t("5 km")}
                          </span>
                          <span className="text-xs text-gray-600">
                            {t("50 km")}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={serviceRadius}
                            onChange={(e) =>
                              setServiceRadius(parseInt(e.target.value))
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Specific Service Areas */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-3">
                        {t("Specific Service Areas")}
                      </h4>

                      {/* Area search input */}
                      <div className="relative mb-3">
                        <input
                          type="text"
                          value={newArea}
                          onChange={(e) => setNewArea(e.target.value)}
                          placeholder={t("Search postal code or neighborhood")}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                        {isSearching ? (
                          <Loader className="absolute right-3 top-2.5 animate-spin h-5 w-5 text-gray-400" />
                        ) : (
                          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        )}

                        {/* Search results dropdown */}
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {searchResults.map((result, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() =>
                                  addServiceArea(result.code || result.name)
                                }
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                <div className="font-medium">
                                  {result.code || result.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {result.description}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected areas */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {serviceAreas.map((area, index) => (
                          <div
                            key={index}
                            className="bg-teal-50 text-teal-800 px-3 py-1 rounded-full flex items-center text-sm"
                          >
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            <span>{area}</span>
                            <button
                              type="button"
                              onClick={() => removeServiceArea(area)}
                              className="ml-1.5 text-teal-600 hover:text-teal-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {serviceAreas.length === 0 && (
                          <div className="text-sm text-gray-500 italic w-full text-center py-2 bg-gray-50 rounded-lg">
                            {t("No service areas added yet")}
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 mb-4">
                        <div className="flex items-start">
                          <Info className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            {t(
                              "Adding specific service areas helps our algorithm match you with nearby jobs."
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Save/Cancel buttons */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowServiceAreaForm(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                        disabled={isSaving}
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                        disabled={isSaving}
                      >
                        {isSaving && (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {t("Save Service Areas")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Services Offered */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <Briefcase className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Services Offered")}
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                {t("Select the services you can provide")}
              </p>

              <div className="space-y-3 mb-4">
                {serviceList.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center px-4 py-3 border border-gray-200 rounded-lg"
                  >
                    <label className="relative inline-flex items-center cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={services[service.id] || false}
                        onChange={(e) =>
                          handleServiceToggle(service.id, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900 flex-1">
                        {service.name}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    {t(
                      "Your services determine what types of cleaning jobs you'll be matched with"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Skills & Job Matching */}
        <div className="lg:col-span-1 space-y-6">
          {/* Skills & Specializations */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <Sparkles className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Skills & Specializations")}
              </h2>
            </div>

            <div className="p-6">
              {!showSkillsSection ? (
                <>
                  {skills.length > 0 ? (
                    <>
                      <h3 className="font-medium text-gray-800 mb-3">
                        {t("Your Skills")}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-teal-50 text-teal-800 px-3 py-1 rounded-lg flex items-center text-sm"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            <span>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
                      <p className="text-gray-600 text-sm">
                        {t("No skills added yet")}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setShowSkillsSection(true)}
                    className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium shadow-sm"
                  >
                    {skills.length > 0 ? t("Manage Skills") : t("Add Skills")}
                  </button>
                </>
              ) : (
                <div className="animate-fade-in space-y-6">
                  <form onSubmit={handleSkillsUpdate}>
                    <h3 className="font-medium text-gray-800">
                      {t("Select your specializations")}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {t("Choose your cleaning skills to improve job matching")}
                    </p>

                    {skillCategories.map((category) => (
                      <div key={category.id} className="mb-5">
                        <h4 className="font-medium text-gray-700 mb-2">
                          {category.name}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {category.skills.map((skill) => (
                            <button
                              type="button"
                              key={skill.id}
                              onClick={() => toggleSkill(skill.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${
                                  skills.includes(skill.id)
                                    ? "bg-teal-100 text-teal-800 border-2 border-teal-500"
                                    : "bg-gray-100 text-gray-800 border-2 border-gray-200 hover:bg-gray-200"
                                }`}
                            >
                              {skill.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="p-4 bg-blue-50 rounded-lg mb-4">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-700 mb-1">
                            {t("How skills matching works")}
                          </h4>
                          <p className="text-sm text-blue-600">
                            {t(
                              "Our assignment algorithm will prioritize matching you with jobs that require your specific skills. For example, if you select 'Pet-Friendly Cleaning', you'll be matched with customers who have pets and need specialized cleaning."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Save/Cancel buttons */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowSkillsSection(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md bg-white hover:bg-gray-50 text-sm"
                        disabled={isSaving}
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium shadow-sm flex items-center"
                        disabled={isSaving}
                      >
                        {isSaving && (
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {t("Save Skills")}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Algorithm Explanation Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <svg
                className="w-6 h-6 text-teal-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Job Matching")}
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-5">
                {t(
                  "Our smart matching algorithm uses your profile information to find the best jobs for you."
                )}
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{t("Location")}</p>
                    <p className="text-sm text-gray-600">
                      {t(
                        "Jobs closer to your address and within your selected service areas are prioritized."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {t("Availability")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t(
                        "Jobs are matched with your weekly schedule and respect your time-off periods."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{t("Skills")}</p>
                    <p className="text-sm text-gray-600">
                      {t(
                        "Special requests from customers are matched with your skillset."
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-teal-100 text-teal-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{t("Ratings")}</p>
                    <p className="text-sm text-gray-600">
                      {t(
                        "Higher ratings increase your chances of being matched with premium customers."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-6">
                <Link
                  to="/cleaner/availability"
                  className="text-teal-600 hover:text-teal-700 font-medium flex items-center"
                >
                  {t("Set your availability")}{" "}
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center">
              <FileText className="w-6 h-6 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">
                {t("Documents & Verification")}
              </h2>
            </div>

            <div className="p-6">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg mb-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-teal-800 mb-1">
                      {t("Identity Verification")}
                    </h4>
                    <p className="text-sm text-teal-700 mb-3">
                      {t(
                        "Verified cleaners receive more jobs and build customer trust. Upload your ID to get verified."
                      )}
                    </p>
                    <Link
                      to="/cleaner/verification"
                      className="inline-flex items-center text-teal-700 hover:text-teal-800 font-medium text-sm"
                    >
                      {t("Manage Verification")}{" "}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CleanerProfile;
