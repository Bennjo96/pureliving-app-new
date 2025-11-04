// src/components/admin/CleanerManagement.js
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Star,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  Clock,
  UserX,
  UserCheck,
  Filter,
  Download,
  BarChart2,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext";
import api from "../../api/api";
import LoadingSpinner from "../common/LoadingSpinner";

const CleanerManagement = () => {
  const { showToast } = useNotification();
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "lastName",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCleaners, setPendingCleaners] = useState(0);
  const currentTime = new Date();

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    serviceAreas: [],
    services: [],
    rate: "",
    availability: {
      monday: { isAvailable: false, slots: [] },
      tuesday: { isAvailable: false, slots: [] },
      wednesday: { isAvailable: false, slots: [] },
      thursday: { isAvailable: false, slots: [] },
      friday: { isAvailable: false, slots: [] },
      saturday: { isAvailable: false, slots: [] },
      sunday: { isAvailable: false, slots: [] },
    },
    status: "active",
    bio: "",
  });

  // Format date for header
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(currentTime);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fetch cleaners
  const fetchCleaners = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/admin/cleaners");

      // The controller returns { success: true, cleaners: [...] }
      if (response.data?.success) {
        const cleanersData = response.data.cleaners || [];
        setCleaners(cleanersData);

        // Count pending cleaner approvals
        const pendingCount = cleanersData.filter(
          (c) => c.status === "pending"
        ).length;
        setPendingCleaners(pendingCount);
      } else {
        setError("Received an invalid response format from the server");
      }
    } catch (err) {
      console.error("Error fetching cleaners:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load cleaners. Please check your network connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleaners();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      fetchCleaners();
      setRefreshing(false);
    }, 1200);
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle availability changes
  const handleAvailabilityChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        },
      },
    }));
  };

  // Handle service selection
  const handleServiceToggle = (service) => {
    setFormData((prev) => {
      const currentServices = [...prev.services];
      if (currentServices.includes(service)) {
        return {
          ...prev,
          services: currentServices.filter((s) => s !== service),
        };
      } else {
        return { ...prev, services: [...currentServices, service] };
      }
    });
  };

  // Handle service area selection
  const handleServiceAreaToggle = (area) => {
    setFormData((prev) => {
      const currentAreas = [...prev.serviceAreas];
      if (currentAreas.includes(area)) {
        return {
          ...prev,
          serviceAreas: currentAreas.filter((a) => a !== area),
        };
      } else {
        return { ...prev, serviceAreas: [...currentAreas, area] };
      }
    });
  };

  // Add new cleaner
  const handleAddCleaner = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/admin/cleaners", formData);
      await fetchCleaners();
      setIsAddModalOpen(false);
      resetForm();
      showToast("Cleaner added successfully", "success");
    } catch (err) {
      console.error("Error adding cleaner:", err);
      showToast(
        err.response?.data?.message || "Failed to add cleaner",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update cleaner
  const handleUpdateCleaner = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/admin/cleaners/${selectedCleaner._id}`, formData);
      await fetchCleaners();
      setIsEditModalOpen(false);
      showToast("Cleaner updated successfully", "success");
    } catch (err) {
      console.error("Error updating cleaner:", err);
      showToast(
        err.response?.data?.message || "Failed to update cleaner",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit cleaner
  const handleEditClick = (cleaner) => {
    setSelectedCleaner(cleaner);
    setFormData({
      firstName: cleaner.firstName,
      lastName: cleaner.lastName,
      email: cleaner.email,
      phone: cleaner.phone || "",
      address: cleaner.address || "",
      serviceAreas: cleaner.serviceAreas || [],
      services: cleaner.services || [],
      rate: cleaner.rate || "",
      availability: cleaner.availability || {
        monday: { isAvailable: false, slots: [] },
        tuesday: { isAvailable: false, slots: [] },
        wednesday: { isAvailable: false, slots: [] },
        thursday: { isAvailable: false, slots: [] },
        friday: { isAvailable: false, slots: [] },
        saturday: { isAvailable: false, slots: [] },
        sunday: { isAvailable: false, slots: [] },
      },
      status: cleaner.status || "active",
      bio: cleaner.bio || "",
    });
    setIsEditModalOpen(true);
  };

  // View cleaner details
  const handleViewClick = (cleaner) => {
    setSelectedCleaner(cleaner);
    setIsViewModalOpen(true);
  };

  // Toggle cleaner status
  const handleToggleStatus = async (cleaner) => {
    setLoading(true);

    try {
      const newStatus = cleaner.status === "active" ? "inactive" : "active";
      await api.put(`/admin/cleaners/${cleaner._id}/status`, {
        status: newStatus,
      });
      await fetchCleaners();
      showToast(
        `Cleaner ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
        "success"
      );
    } catch (err) {
      console.error("Error toggling cleaner status:", err);
      showToast(
        err.response?.data?.message || "Failed to update status",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Approve cleaner
  const handleApproveCleaner = async (cleaner) => {
    setLoading(true);

    try {
      await api.put(`/admin/cleaners/${cleaner._id}/approve`);
      await fetchCleaners();
      showToast("Cleaner approved successfully", "success");
    } catch (err) {
      console.error("Error approving cleaner:", err);
      showToast(
        err.response?.data?.message || "Failed to approve cleaner",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete cleaner
  const handleDeleteCleaner = async (cleanerId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this cleaner? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      await api.delete(`/admin/cleaners/${cleanerId}`);
      await fetchCleaners();
      showToast("Cleaner deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting cleaner:", err);
      showToast(
        err.response?.data?.message || "Failed to delete cleaner",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      serviceAreas: [],
      services: [],
      rate: "",
      availability: {
        monday: { isAvailable: false, slots: [] },
        tuesday: { isAvailable: false, slots: [] },
        wednesday: { isAvailable: false, slots: [] },
        thursday: { isAvailable: false, slots: [] },
        friday: { isAvailable: false, slots: [] },
        saturday: { isAvailable: false, slots: [] },
        sunday: { isAvailable: false, slots: [] },
      },
      status: "active",
      bio: "",
    });
  };

  // Export cleaners data as CSV
  const handleExportData = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Status",
      "Rating",
      "Jobs Completed",
      "Hourly Rate",
    ].join(",");

    const rows = filteredCleaners.map((cleaner) =>
      [
        cleaner._id || "",
        cleaner.firstName || "",
        cleaner.lastName || "",
        cleaner.email || "",
        cleaner.phone || "",
        cleaner.status || "",
        cleaner.rating || "0",
        cleaner.jobsCompleted || "0",
        cleaner.rate || "0",
      ].join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    const fileName = `cleaners_export_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Handle sort
  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  // Filter cleaners based on search, status, and rating
  const filteredCleaners = cleaners.filter((cleaner) => {
    const matchesSearch =
      cleaner.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cleaner.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cleaner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cleaner._id?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || cleaner.status === filterStatus;

    const matchesRating =
      filterRating === "all" ||
      (filterRating === "4plus" && (cleaner.rating || 0) >= 4) ||
      (filterRating === "3plus" && (cleaner.rating || 0) >= 3);

    return matchesSearch && matchesStatus && matchesRating;
  });

  // Sort cleaners
  const sortedCleaners = [...filteredCleaners].sort((a, b) => {
    if (sortConfig.key === "name") {
      const aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
    if (!a[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (!b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Pagination
  const cleanersPerPage = 8;
  const totalPages = Math.max(
    1,
    Math.ceil(sortedCleaners.length / cleanersPerPage)
  );
  const currentCleaners = sortedCleaners.slice(
    (currentPage - 1) * cleanersPerPage,
    currentPage * cleanersPerPage
  );

  // Go to page
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  // Service options
  const serviceOptions = [
    "Regular Cleaning",
    "Deep Cleaning",
    "Move-in/Move-out Cleaning",
    "Office Cleaning",
    "Window Cleaning",
    "Post-Construction Cleaning",
    "Eco-Friendly Cleaning",
  ];

  // Service area options
  const serviceAreaOptions = [
    "North Berlin",
    "South Berlin",
    "East Berlin",
    "West Berlin",
    "Central Berlin",
    "Potsdam",
    "Brandenburg",
  ];

  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let bgColor = "";
    switch (status) {
      case "active":
        bgColor = "bg-green-100 text-green-800";
        break;
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        break;
      case "inactive":
        bgColor = "bg-red-100 text-red-800";
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800";
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  // Render rating stars
  const renderRatingStars = (rating = 0, size = 5) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-${size} w-${size} ${
              i < Math.floor(rating)
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          {rating ? rating.toFixed(1) : "N/A"}
        </span>
      </div>
    );
  };

  // Render loading state
  if (loading && !cleaners.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render error state
  if (error && !refreshing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-sm"
      >
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">
              Error Loading Cleaners
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-red-700 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200 inline-flex items-center"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="pb-10">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg shadow-md p-6 mb-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-5">
          <svg
            width="300"
            height="150"
            viewBox="0 0 52 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.5,21.5h49.251c0,0-20.865-17.472-37.958-5.433C-4.303,28.108,1.5,21.5,1.5,21.5z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Cleaner Management</h1>
            <div className="flex items-center mt-2 text-teal-100">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>{formattedDate}</span>
              <span className="mx-2">•</span>
              <Clock className="h-4 w-4 mr-2" />
              <span>{formattedTime}</span>
            </div>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              {pendingCleaners > 0 && (
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-md flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="font-medium">
                    {pendingCleaners} pending approvals
                  </span>
                </div>
              )}

              <button
                onClick={handleRefresh}
                className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 flex items-center justify-center"
              >
                <RefreshCw
                  className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search cleaners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Ratings</option>
            <option value="4plus">4+ Stars</option>
            <option value="3plus">3+ Stars</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>

          {/* Add Button */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <Plus size={18} className="mr-2" />
            Add Cleaner
          </button>
        </div>
      </motion.div>

      {/* Cleaners Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
      >
        {currentCleaners.map((cleaner) => (
          <div
            key={cleaner._id}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-4px]"
          >
            {/* Cleaner Header */}
            <div className="p-4 border-b flex items-center">
              <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                {cleaner.profileImage ? (
                  <img
                    src={cleaner.profileImage}
                    alt={`${cleaner.firstName} ${cleaner.lastName}`}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-teal-600 font-medium text-lg">
                    {cleaner.firstName?.[0]}
                    {cleaner.lastName?.[0]}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold">
                  {cleaner.firstName} {cleaner.lastName}
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="mr-2">
                    ID: {cleaner._id?.substring(0, 8) || "N/A"}
                  </span>
                  {renderStatusBadge(cleaner.status)}
                </div>
              </div>
            </div>

            {/* Cleaner Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-gray-500 mr-2" />
                <span className="truncate">{cleaner.email}</span>
              </div>

              {cleaner.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{cleaner.phone}</span>
                </div>
              )}

              <div className="flex items-center">
                {renderRatingStars(cleaner.rating, 4)}
                <span className="ml-2 text-xs text-gray-500">
                  ({cleaner.reviewCount || 0} reviews)
                </span>
              </div>

              <div className="flex items-center text-sm">
                <BarChart2 className="h-4 w-4 text-gray-500 mr-2" />
                <span>{cleaner.jobsCompleted || 0} jobs completed</span>
              </div>

              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                <span>
                  {cleaner.rate ? `€${cleaner.rate}/hr` : "Rate not set"}
                </span>
              </div>

              {cleaner.services && cleaner.services.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {cleaner.services.slice(0, 2).map((service) => (
                    <span
                      key={service}
                      className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {service}
                    </span>
                  ))}
                  {cleaner.services.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                      +{cleaner.services.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="p-4 border-t flex justify-between">
              <div>
                {cleaner.status === "pending" && (
                  <button
                    onClick={() => handleApproveCleaner(cleaner)}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
                  >
                    <Check size={12} className="inline mr-1" />
                    Approve
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewClick(cleaner)}
                  className="p-1 text-gray-500 hover:text-teal-600"
                >
                  <User size={18} />
                </button>
                <button
                  onClick={() => handleEditClick(cleaner)}
                  className="p-1 text-gray-500 hover:text-teal-600"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleToggleStatus(cleaner)}
                  className="p-1 text-gray-500 hover:text-teal-600"
                >
                  {cleaner.status === "active" ? (
                    <UserX size={18} />
                  ) : (
                    <UserCheck size={18} />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteCleaner(cleaner._id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {currentCleaners.length === 0 && (
          <div className="col-span-4 bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <div className="flex flex-col items-center">
              <Users size={48} className="text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-500">
                No cleaners found
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {searchQuery || filterStatus !== "all" || filterRating !== "all"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Start by adding your first cleaner to the platform."}
              </p>
              {(searchQuery ||
                filterStatus !== "all" ||
                filterRating !== "all") && (
                <button
                  className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                    setFilterRating("all");
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center border border-gray-100"
        >
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">
              {Math.min(
                (currentPage - 1) * cleanersPerPage + 1,
                sortedCleaners.length
              )}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(currentPage * cleanersPerPage, sortedCleaners.length)}
            </span>{" "}
            of <span className="font-medium">{sortedCleaners.length}</span>{" "}
            cleaners
          </div>

          <div className="flex space-x-1">
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToPage(idx + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  currentPage === idx + 1
                    ? "bg-teal-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Add Cleaner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Add New Cleaner</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleAddCleaner}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address*
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Hourly Rate (€)
                    </label>
                    <input
                      type="number"
                      name="rate"
                      id="rate"
                      value={formData.rate}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Services Offered
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceOptions.map((service) => (
                        <div key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`service-${service}`}
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label
                            htmlFor={`service-${service}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Areas
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceAreaOptions.map((area) => (
                        <div key={area} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`area-${area}`}
                            checked={formData.serviceAreas.includes(area)}
                            onChange={() => handleServiceAreaToggle(area)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label
                            htmlFor={`area-${area}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {area}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Cleaner"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Cleaner Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Edit Cleaner</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleUpdateCleaner}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address*
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="rate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Hourly Rate (€)
                    </label>
                    <input
                      type="number"
                      name="rate"
                      id="rate"
                      value={formData.rate}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Services Offered
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceOptions.map((service) => (
                        <div key={service} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`service-${service}`}
                            checked={formData.services.includes(service)}
                            onChange={() => handleServiceToggle(service)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label
                            htmlFor={`service-${service}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service Areas
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {serviceAreaOptions.map((area) => (
                        <div key={area} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`area-${area}`}
                            checked={formData.serviceAreas.includes(area)}
                            onChange={() => handleServiceAreaToggle(area)}
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <label
                            htmlFor={`area-${area}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {area}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      id="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleFormChange}
                      className="block w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Update Cleaner"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Cleaner Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Cleaner Profile</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                  {selectedCleaner?.profileImage ? (
                    <img
                      src={selectedCleaner.profileImage}
                      alt={`${selectedCleaner.firstName} ${selectedCleaner.lastName}`}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-teal-600 font-medium text-xl">
                      {selectedCleaner?.firstName?.[0]}
                      {selectedCleaner?.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCleaner?.firstName} {selectedCleaner?.lastName}
                  </h2>
                  <div className="flex items-center mt-1">
                    {renderStatusBadge(selectedCleaner?.status)}
                    <span className="ml-2 text-gray-500">
                      ID: {selectedCleaner?._id?.substring(0, 8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Contact Information
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-500 mr-2" />
                      <span>{selectedCleaner?.email}</span>
                    </li>
                    {selectedCleaner?.phone && (
                      <li className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-500 mr-2" />
                        <span>{selectedCleaner.phone}</span>
                      </li>
                    )}
                    {selectedCleaner?.address && (
                      <li className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                        <span>{selectedCleaner.address}</span>
                      </li>
                    )}
                  </ul>

                  <h4 className="font-medium text-gray-700 mb-3 mt-6">
                    Performance
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>
                        {selectedCleaner?.rating
                          ? `${selectedCleaner.rating.toFixed(1)} (${
                              selectedCleaner.reviewCount || 0
                            } reviews)`
                          : "No ratings yet"}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <BarChart2 className="h-5 w-5 text-gray-500 mr-2" />
                      <span>
                        {selectedCleaner?.jobsCompleted || 0} jobs completed
                      </span>
                    </li>
                    <li className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                      <span>
                        {selectedCleaner?.rate
                          ? `€${selectedCleaner.rate}/hour`
                          : "Rate not set"}
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Services</h4>
                  {selectedCleaner?.services &&
                  selectedCleaner.services.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedCleaner.services.map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-6">
                      No services specified
                    </p>
                  )}

                  <h4 className="font-medium text-gray-700 mb-3">
                    Service Areas
                  </h4>
                  {selectedCleaner?.serviceAreas &&
                  selectedCleaner.serviceAreas.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedCleaner.serviceAreas.map((area) => (
                        <span
                          key={area}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-6">
                      No service areas specified
                    </p>
                  )}

                  <h4 className="font-medium text-gray-700 mb-3">Bio</h4>
                  {selectedCleaner?.bio ? (
                    <p className="text-sm text-gray-700">
                      {selectedCleaner.bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">No bio provided</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-between">
              <div>
                {selectedCleaner?.status === "pending" && (
                  <button
                    onClick={() => {
                      handleApproveCleaner(selectedCleaner);
                      setIsViewModalOpen(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Check size={16} className="mr-1" />
                    Approve Cleaner
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditClick(selectedCleaner);
                  }}
                >
                  <Edit size={16} className="mr-1" />
                  Edit Cleaner
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CleanerManagement;
