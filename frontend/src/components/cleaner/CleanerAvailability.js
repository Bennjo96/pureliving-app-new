// src/components/cleaner/CleanerAvailability.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Calendar as CalendarIcon,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  X,
  Info,
  Trash2,
  Loader,
  ChevronUp,
  ChevronDown,
  Edit,
  Calendar,
} from "lucide-react";
import { cleanerService } from "../../api/api";
import LoadingSpinner from "../common/LoadingSpinner";

const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// Create time slots with proper formatting
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    slots.push(`${hour}:00`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

const CleanerAvailability = () => {
  const { t } = useTranslation();
  const [availability, setAvailability] = useState(null);
  const [originalAvailability, setOriginalAvailability] = useState(null);
  const [timeOff, setTimeOff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showNewTimeOff, setShowNewTimeOff] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeDay, setActiveDay] = useState(null);
  const [newTimeOff, setNewTimeOff] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        const response = await cleanerService.getAvailability();
        
        // Ensure we have entries for all weekdays
        const availabilityData = response.data.weeklySchedule || [];
        const completeAvailability = weekdays.map(day => {
          const existingDay = availabilityData.find(d => d.day === day);
          return existingDay || { day, available: false, slots: [] };
        });
        
        setAvailability(completeAvailability);
        setOriginalAvailability(JSON.parse(JSON.stringify(completeAvailability))); // Deep copy
        setTimeOff(response.data.timeOff || []);
        setError(null);
        
        // Set the first available day as active
        if (!activeDay) {
          const firstAvailableDay = completeAvailability.find(d => d.available);
          setActiveDay(firstAvailableDay ? firstAvailableDay.day : 'monday');
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError(
          "Could not load your availability settings. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    if (originalAvailability && availability) {
      const hasChanges = JSON.stringify(originalAvailability) !== JSON.stringify(availability);
      setHasUnsavedChanges(hasChanges);
    }
  }, [availability, originalAvailability]);

  // Handle slot toggle
  const toggleSlot = (day, slot) => {
    const updatedAvailability = [...availability];
    const dayIndex = updatedAvailability.findIndex((d) => d.day === day);

    if (dayIndex >= 0) {
      const currentSlots = [...updatedAvailability[dayIndex].slots];
      const slotIndex = currentSlots.indexOf(slot);

      if (slotIndex >= 0) {
        // Remove slot
        currentSlots.splice(slotIndex, 1);
      } else {
        // Add slot
        currentSlots.push(slot);
        currentSlots.sort();
      }

      updatedAvailability[dayIndex].slots = currentSlots;
    } else {
      // Day not found, add new entry
      updatedAvailability.push({
        day,
        available: true,
        slots: [slot],
      });
    }

    setAvailability(updatedAvailability);
  };

  // Toggle day availability
  const toggleDayAvailability = (day) => {
    const updatedAvailability = [...availability];
    const dayIndex = updatedAvailability.findIndex((d) => d.day === day);

    if (dayIndex >= 0) {
      const newAvailable = !updatedAvailability[dayIndex].available;
      updatedAvailability[dayIndex].available = newAvailable;
      
      // Clear slots if day is set to unavailable
      if (!newAvailable) {
        updatedAvailability[dayIndex].slots = [];
      }
    } else {
      updatedAvailability.push({
        day,
        available: true,
        slots: [],
      });
    }

    setAvailability(updatedAvailability);
  };

  // Check if a slot is selected
  const isSlotSelected = (day, slot) => {
    const dayData = availability?.find((d) => d.day === day);
    return dayData?.available && dayData.slots.includes(slot);
  };

  // Check if a day is available
  const isDayAvailable = (day) => {
    const dayData = availability?.find((d) => d.day === day);
    return dayData?.available;
  };

  // Quick actions to set common time patterns
  const setCommonTimePattern = (pattern) => {
    if (!activeDay) return;
    
    const updatedAvailability = [...availability];
    const dayIndex = updatedAvailability.findIndex((d) => d.day === activeDay);
    
    if (dayIndex < 0) return;
    
    let newSlots = [];
    
    switch(pattern) {
      case 'morning':
        newSlots = ['8:00', '9:00', '10:00', '11:00', '12:00'];
        break;
      case 'afternoon':
        newSlots = ['13:00', '14:00', '15:00', '16:00', '17:00'];
        break;
      case 'evening':
        newSlots = ['17:00', '18:00', '19:00', '20:00'];
        break;
      case 'fullDay':
        newSlots = timeSlots.slice();
        break;
      case 'clear':
        newSlots = [];
        break;
      default:
        return;
    }
    
    updatedAvailability[dayIndex].slots = newSlots;
    setAvailability(updatedAvailability);
  };

  // Apply one day's schedule to other days
  const copyScheduleToOtherDays = (fromDay, toDays) => {
    const dayData = availability.find(d => d.day === fromDay);
    if (!dayData) return;
    
    const updatedAvailability = [...availability];
    
    toDays.forEach(toDay => {
      const targetDayIndex = updatedAvailability.findIndex(d => d.day === toDay);
      if (targetDayIndex >= 0) {
        updatedAvailability[targetDayIndex].available = dayData.available;
        updatedAvailability[targetDayIndex].slots = [...dayData.slots];
      }
    });
    
    setAvailability(updatedAvailability);
  };

  // Copy schedule to all weekdays
  const copyToWeekdays = (fromDay) => {
    copyScheduleToOtherDays(fromDay, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  };

  // Copy schedule to weekend
  const copyToWeekend = (fromDay) => {
    copyScheduleToOtherDays(fromDay, ['saturday', 'sunday']);
  };

  // Copy schedule to all days
  const copyToAllDays = (fromDay) => {
    copyScheduleToOtherDays(fromDay, weekdays.filter(day => day !== fromDay));
  };

  // Save availability
  const saveAvailability = async () => {
    try {
      setIsSaving(true);
      await cleanerService.updateAvailability({ weeklySchedule: availability });
      setSuccessMessage("Your availability has been updated successfully");
      setOriginalAvailability(JSON.parse(JSON.stringify(availability))); // Update original
      setHasUnsavedChanges(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving availability:", err);
      setError("Failed to save your availability. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Request time off
  const requestTimeOff = async () => {
    try {
      setIsSaving(true);
      await cleanerService.requestTimeOff(newTimeOff);
      // Refresh time off data
      const response = await cleanerService.getAvailability();
      setTimeOff(response.data.timeOff || []);
      setShowNewTimeOff(false);
      setNewTimeOff({ startDate: "", endDate: "", reason: "" });
      setSuccessMessage("Your time off request has been submitted");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error requesting time off:", err);
      setError("Failed to submit your time off request. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel time off
  const cancelTimeOff = async (timeOffId) => {
    try {
      setIsSaving(true);
      await cleanerService.cancelTimeOff(timeOffId);
      // Remove from state
      setTimeOff(timeOff.filter((item) => item.id !== timeOffId));
      setSuccessMessage("Your time off has been cancelled");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error cancelling time off:", err);
      setError("Failed to cancel your time off. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Format dates for display
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // If same day, only show one date
    if (start.toDateString() === end.toDateString()) {
      return new Date(startDate).toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    
    return `${new Date(startDate).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    })} - ${new Date(endDate).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    })}`;
  };

  // Get total days for time off
  const getTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Format the day name for display
  const formatDayName = (day) => {
    return t(day).charAt(0).toUpperCase() + t(day).slice(1);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("My Availability")}
          </h1>
          <p className="text-gray-600">
            {t("Manage your working hours and time off requests")}
          </p>
        </div>
        
        {hasUnsavedChanges && (
          <div className="mt-4 md:mt-0">
            <button
              onClick={saveAvailability}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSaving ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  {t("Saving...")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> {t("Save Changes")}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6 flex items-center shadow-sm"
          >
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 flex items-center shadow-sm"
          >
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Weekly Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-teal-600" />
                {t("Weekly Schedule")}
              </h2>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-700 text-sm">
                    {t("Set your recurring weekly availability below. This schedule will repeat every week.")}
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    {t("For one-time absences, use the Time Off section.")}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Day selector tabs */}
            <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2 mb-4 -mx-2 px-2">
              {weekdays.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-shrink-0 px-5 py-2.5 mr-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 
                    ${activeDay === day
                      ? "bg-teal-600 text-white shadow-sm"
                      : isDayAvailable(day)
                        ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  <span className="font-medium">{formatDayName(day)}</span>
                </button>
              ))}
            </div>
            
            {/* Active Day Settings */}
            {activeDay && (
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <h3 className="font-medium text-lg text-gray-800">{formatDayName(activeDay)}</h3>
                    <div className="ml-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={isDayAvailable(activeDay)}
                          onChange={() => toggleDayAvailability(activeDay)}
                          className="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-gray-700 font-medium">
                          {t("Available")}
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <button className="text-gray-500 hover:text-gray-700 focus:outline-none flex items-center text-sm">
                      <Edit className="h-4 w-4 mr-1" />
                      {t("Copy Schedule")}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <button 
                        onClick={() => copyToWeekdays(activeDay)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t("Copy to all weekdays")}
                      </button>
                      <button 
                        onClick={() => copyToWeekend(activeDay)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t("Copy to weekend")}
                      </button>
                      <button 
                        onClick={() => copyToAllDays(activeDay)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t("Copy to all days")}
                      </button>
                    </div>
                  </div>
                </div>
                
                {isDayAvailable(activeDay) ? (
                  <>
                    {/* Quick time patterns */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">{t("Quick select")}</div>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => setCommonTimePattern('morning')}
                          className="px-3 py-1.5 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          {t("Morning")} (8-12)
                        </button>
                        <button 
                          onClick={() => setCommonTimePattern('afternoon')}
                          className="px-3 py-1.5 text-xs rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          {t("Afternoon")} (13-17)
                        </button>
                        <button 
                          onClick={() => setCommonTimePattern('evening')}
                          className="px-3 py-1.5 text-xs rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          {t("Evening")} (17-20)
                        </button>
                        <button 
                          onClick={() => setCommonTimePattern('fullDay')}
                          className="px-3 py-1.5 text-xs rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        >
                          {t("Full day")}
                        </button>
                        <button 
                          onClick={() => setCommonTimePattern('clear')}
                          className="px-3 py-1.5 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {t("Clear all")}
                        </button>
                      </div>
                    </div>
                    
                    {/* Time slots */}
                    <div>
                      <div className="text-sm text-gray-500 mb-2">{t("Select available hours")}</div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => toggleSlot(activeDay, slot)}
                            className={`py-2 px-3 rounded-md text-sm transition-colors text-center
                              ${
                                isSlotSelected(activeDay, slot)
                                  ? "bg-teal-100 text-teal-800 border border-teal-200 font-medium"
                                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                              }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <p className="text-gray-500">{t("Not available on")} {formatDayName(activeDay)}</p>
                    <p className="text-gray-400 text-sm mt-1">{t("Toggle availability to add working hours")}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Save button at bottom */}
            {hasUnsavedChanges && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveAvailability}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader className="animate-spin h-4 w-4 mr-2" />
                      {t("Saving...")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> {t("Save Changes")}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Time Off section */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                {t("Time Off")}
              </h2>
              <button
                onClick={() => setShowNewTimeOff(true)}
                className="inline-flex items-center px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm shadow-sm"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" /> {t("Request")}
              </button>
            </div>

            {/* New Time Off Form */}
            <AnimatePresence>
              {showNewTimeOff && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-800">
                      {t("New Time Off Request")}
                    </h3>
                    <button
                      onClick={() => setShowNewTimeOff(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Start Date")} *
                      </label>
                      <input
                        type="date"
                        value={newTimeOff.startDate}
                        onChange={(e) =>
                          setNewTimeOff({ ...newTimeOff, startDate: e.target.value })
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("End Date")} *
                      </label>
                      <input
                        type="date"
                        value={newTimeOff.endDate}
                        onChange={(e) =>
                          setNewTimeOff({ ...newTimeOff, endDate: e.target.value })
                        }
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        min={
                          newTimeOff.startDate ||
                          new Date().toISOString().split("T")[0]
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Reason")} ({t("optional")})
                      </label>
                      <textarea
                        value={newTimeOff.reason}
                        onChange={(e) =>
                          setNewTimeOff({ ...newTimeOff, reason: e.target.value })
                        }
                        rows="3"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                        placeholder={t("Brief explanation for your time off request")}
                      ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowNewTimeOff(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        {t("Cancel")}
                      </button>
                      <button
                        onClick={requestTimeOff}
                        disabled={
                          !newTimeOff.startDate || !newTimeOff.endDate || isSaving
                        }
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? t("Submitting...") : t("Submit Request")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Time Off List */}
            {timeOff.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-gray-600">{t("No time off scheduled")}</p>
                <p className="text-sm mt-1">
                  {t("Use the Request button to schedule time off")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {timeOff.map((item) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.id}
                    className={`rounded-lg p-4 border ${
                      item.status === "approved"
                        ? "bg-green-50 border-green-200"
                        : item.status === "pending"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-800">
                          {formatDateRange(item.startDate, item.endDate)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getTotalDays(item.startDate, item.endDate)} {t("days")}
                        </div>
                        {item.reason && (
                          <div className="text-sm text-gray-600 mt-2 bg-white bg-opacity-50 p-2 rounded-md">
                            {item.reason}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${
                                      item.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : item.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                        >
                          {t(item.status)}
                        </div>
                        
                        {item.status === "pending" && (
                          <button
                            onClick={() => cancelTimeOff(item.id)}
                            className="mt-3 text-xs text-gray-600 hover:text-red-600 transition-colors flex items-center"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            {t("Cancel")}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanerAvailability;