import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Zap,
  Sun,
  Moon,
  Filter,
  ArrowRight,
  X,
  Calendar,
  Lock,
  Unlock,
  ExternalLink,
  Info,
} from "lucide-react";
import { cleanerService } from "../../api/api";
import LoadingSpinner from "../common/LoadingSpinner";

const CleanerCalendar = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "all",
  });
  const [selectedDayJobs, setSelectedDayJobs] = useState([]);
  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isBlockingTime, setIsBlockingTime] = useState(false);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [showCalendarSyncModal, setShowCalendarSyncModal] = useState(false);
  const [weeklyView, setWeeklyView] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const filterPanelRef = useRef(null);

  const jobStatusStyles = {
    pending: {
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: <Moon className="w-4 h-4" />,
    },
    confirmed: {
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    in_progress: {
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: <Zap className="w-4 h-4 animate-pulse" />,
    },
    completed: {
      color: "text-green-600",
      bg: "bg-green-50",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    cancelled: {
      color: "text-red-600",
      bg: "bg-red-50",
      icon: <AlertCircle className="w-4 h-4" />,
    },
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Calendar setup and job fetching
useEffect(() => {
  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      let startDate, endDate;

      if (viewMode === "month") {
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );
      } else if (viewMode === "week") {
        const firstDayOfWeek = new Date(currentDate);
        const day = currentDate.getDay();
        const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
        firstDayOfWeek.setDate(diff);
        startDate = new Date(firstDayOfWeek);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
        endDate = lastDayOfWeek;
      } else {
        // Day view
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const response = await cleanerService.getJobs({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      // Make sure to set jobs as an array from the correct response structure
      const jobsData = response.data?.data || [];
      setJobs(jobsData);

      try {
        // Also fetch blocked times (in a separate try/catch to prevent jobs from failing if this fails)
        const blockedResponse = await cleanerService.getBlockedTimes({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        setBlockedTimes(blockedResponse.data || []);
      } catch (blockError) {
        console.error("Error fetching blocked times:", blockError);
        setBlockedTimes([]);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load calendar data");
      // Ensure jobs is always an array even on error
      setJobs([]);
      setBlockedTimes([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchJobs();
}, [currentDate, viewMode]);

  // Generate days for month view
  useEffect(() => {
    if (viewMode === "month") {
      const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const totalDaysToShow = 42;

        const days = [];
        for (let i = daysFromPrevMonth; i > 0; i--) {
          const prevMonthDate = new Date(
            year,
            month - 1,
            lastDayOfMonth - i + 1
          );
          days.push({
            date: prevMonthDate,
            isCurrentMonth: false,
            isBlocked: isDateBlocked(prevMonthDate),
          });
        }
        for (let i = 1; i <= lastDayOfMonth; i++) {
          const currentMonthDate = new Date(year, month, i);
          days.push({
            date: currentMonthDate,
            isCurrentMonth: true,
            isBlocked: isDateBlocked(currentMonthDate),
          });
        }
        for (let i = 1; days.length < totalDaysToShow; i++) {
          const nextMonthDate = new Date(year, month + 1, i);
          days.push({
            date: nextMonthDate,
            isCurrentMonth: false,
            isBlocked: isDateBlocked(nextMonthDate),
          });
        }
        setCalendarDays(days);
      };
      generateCalendarDays();
    } else if (viewMode === "week") {
      generateWeekView();
    }
  }, [currentDate, viewMode, blockedTimes]);

  // Generate weekly view
  const generateWeekView = () => {
    const firstDayOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    firstDayOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        isBlocked: isDateBlocked(date),
        hours: generateHoursForDay(date),
      });
    }
    setWeeklyView(days);
  };

  // Generate hours for day view (8am-8pm)
  const generateHoursForDay = (date) => {
    const hours = [];
    for (let i = 8; i <= 20; i++) {
      const hourDate = new Date(date);
      hourDate.setHours(i, 0, 0, 0);
      hours.push({
        time: hourDate,
        isBlocked: isTimeBlocked(hourDate),
      });
    }
    return hours;
  };

  // Check if a date is blocked
  const isDateBlocked = (date) => {
    return blockedTimes.some((blockedTime) => {
      const blockStart = new Date(blockedTime.startTime);
      const blockEnd = new Date(blockedTime.endTime);
      return date >= blockStart && date <= blockEnd && blockedTime.fullDay;
    });
  };

  // Check if a specific time is blocked
  const isTimeBlocked = (time) => {
    return blockedTimes.some((blockedTime) => {
      const blockStart = new Date(blockedTime.startTime);
      const blockEnd = new Date(blockedTime.endTime);
      return time >= blockStart && time <= blockEnd;
    });
  };

  // Filtered jobs based on selected filters
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      filters.status === "all" || job.status === filters.status;
    const matchesService =
      filters.serviceType === "all" || job.serviceType === filters.serviceType;
    return matchesStatus && matchesService;
  });

  // Handle quick actions on jobs
  const handleQuickAction = async (jobId, action) => {
    try {
      await cleanerService.updateJobStatus(jobId, action);
      setJobs((prev) =>
        prev.map((job) => (job.id === jobId ? { ...job, status: action } : job))
      );

      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob((prev) => ({ ...prev, status: action }));
      }
    } catch (err) {
      setError("Failed to update job status");
    }
  };

  // Date helper functions
  const isToday = (date) => date.toDateString() === new Date().toDateString();
  const isSelected = (date) =>
    date.toDateString() === selectedDate.toDateString();

  // Get jobs for a specific day
  const getJobsForDay = (date) =>
    filteredJobs.filter(
      (job) => new Date(job.scheduledAt).toDateString() === date.toDateString()
    );

  // Get jobs for a specific hour
  const getJobsForHour = (date) => {
    const hour = date.getHours();
    return filteredJobs.filter((job) => {
      const jobTime = new Date(job.scheduledAt);
      return (
        jobTime.toDateString() === date.toDateString() &&
        jobTime.getHours() === hour
      );
    });
  };

  // Update selected day jobs when date or jobs change
  useEffect(() => {
    const dayJobs = getJobsForDay(selectedDate);
    setSelectedDayJobs(
      dayJobs.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    );
  }, [selectedDate, filteredJobs]);

  // Handle click on a job to show details modal
  const handleJobClick = (job) => {
    setSelectedJob(job);
    setShowJobDetailModal(true);
  };

  // Handle clicking outside filter panel to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target)
      ) {
        setShowFilterPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle quick block functionality
  const handleQuickBlock = async (date, fullDay = true) => {
    try {
      let startTime, endTime;

      if (fullDay) {
        startTime = new Date(date);
        startTime.setHours(0, 0, 0, 0);
        endTime = new Date(date);
        endTime.setHours(23, 59, 59, 999);
      } else {
        startTime = new Date(date);
        endTime = new Date(date);
        endTime.setHours(endTime.getHours() + 1);
      }

      await cleanerService.blockTime({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        fullDay,
        reason: "Unavailable",
      });

      setBlockedTimes((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          fullDay,
          reason: "Unavailable",
        },
      ]);

      setIsBlockingTime(false);
    } catch (err) {
      setError("Failed to block time");
    }
  };

  // Handle navigation between time periods
  const handleNavigate = (direction) => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + direction,
          1
        )
      );
    } else if (viewMode === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + direction * 7);
      setCurrentDate(newDate);
    } else {
      // day view
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + direction);
      setCurrentDate(newDate);
    }
  };

  // Toggle view mode between month, week, day
  const toggleViewMode = (mode) => {
    setViewMode(mode);
    if (mode === "week") {
      generateWeekView();
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {dayLabels.map((day) => (
        <div
          key={day}
          className="text-center text-sm font-medium text-gray-500 p-2"
        >
          {day}
        </div>
      ))}

      {calendarDays.map((day, index) => (
        <div
          key={index}
          onClick={() => setSelectedDate(day.date)}
          className={`p-2 min-h-[120px] border rounded-lg transition-all relative cursor-pointer
            ${
              day.isCurrentMonth
                ? "border-gray-200"
                : "border-gray-100 bg-gray-50"
            }
            ${isSelected(day.date) ? "border-teal-600 bg-teal-50" : ""}
            ${isToday(day.date) ? "border-blue-200 bg-blue-50" : ""}
            ${day.isBlocked ? "bg-red-50 border-red-200" : ""}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-sm ${
                isToday(day.date) ? "text-blue-600 font-bold" : ""
              }`}
            >
              {day.date.getDate()}
            </span>

            {isBlockingTime && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickBlock(day.date);
                }}
                className="text-xs p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {day.isBlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-70 rounded-lg">
                <div className="text-red-600 font-medium flex items-center">
                  <Lock className="w-4 h-4 mr-1" />
                  <span>Blocked</span>
                </div>
              </div>
            )}

            {getJobsForDay(day.date)
              .slice(0, 3)
              .map((job) => (
                <div
                  key={job.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobClick(job);
                  }}
                  className={`p-1 text-xs rounded ${
                    jobStatusStyles[job.status].bg
                  } hover:brightness-95 cursor-pointer`}
                >
                  <div className="flex items-center gap-1">
                    {jobStatusStyles[job.status].icon}
                    <span className="truncate">{job.serviceType}</span>
                  </div>
                </div>
              ))}

            {getJobsForDay(day.date).length > 3 && (
              <div className="text-xs text-center text-gray-500 mt-1">
                +{getJobsForDay(day.date).length - 3} more
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderWeekView = () => (
    <div>
      <div className="grid grid-cols-8 border-b">
        <div className="p-2 text-sm font-medium text-gray-500 border-r"></div>
        {weeklyView.map((day, idx) => (
          <div
            key={idx}
            className={`p-2 text-center text-sm font-medium ${
              isToday(day.date) ? "bg-blue-50 text-blue-600" : "text-gray-700"
            }`}
          >
            <div>
              {day.date.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <div>{day.date.getDate()}</div>
          </div>
        ))}
      </div>

      {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => (
        <div key={hour} className="grid grid-cols-8 border-b min-h-[80px]">
          <div className="p-2 text-xs text-gray-500 border-r flex items-start">
            {hour}:00
          </div>

          {weeklyView.map((day, idx) => {
            const timeSlot = day.hours.find((h) => h.time.getHours() === hour);
            const hourJobs = getJobsForHour(timeSlot.time);

            return (
              <div
                key={idx}
                className={`relative p-1 border-r ${
                  timeSlot.isBlocked ? "bg-red-50" : ""
                }`}
              >
                {timeSlot.isBlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-70">
                    <div className="text-red-600 text-xs flex items-center">
                      <Lock className="w-3 h-3 mr-1" />
                      <span>Blocked</span>
                    </div>
                  </div>
                )}

                {hourJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    className={`text-xs p-1 mb-1 rounded ${
                      jobStatusStyles[job.status].bg
                    } hover:brightness-95 cursor-pointer`}
                  >
                    <div className="flex items-center gap-1">
                      {jobStatusStyles[job.status].icon}
                      <span className="truncate">{job.serviceType}</span>
                    </div>
                  </div>
                ))}

                {isBlockingTime && !timeSlot.isBlocked && (
                  <button
                    onClick={() => handleQuickBlock(timeSlot.time, false)}
                    className="absolute top-1 right-1 text-xs p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Lock className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Schedule
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your cleaning appointments and availability
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Today
              </button>
              <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleViewMode("month")}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === "month"
                      ? "bg-teal-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => toggleViewMode("week")}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === "week"
                      ? "bg-teal-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => toggleViewMode("day")}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === "day"
                      ? "bg-teal-600 text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Day
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsBlockingTime(!isBlockingTime)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2
                  ${
                    isBlockingTime
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {isBlockingTime ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {isBlockingTime ? "Cancel" : "Block Time"}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>

                {showFilterPanel && (
                  <div
                    ref={filterPanelRef}
                    className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-10 w-64"
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Status
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={filters.status}
                          onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                          }
                        >
                          <option value="all">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Service Type
                        </label>
                        <select
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={filters.serviceType}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              serviceType: e.target.value,
                            })
                          }
                        >
                          <option value="all">All Services</option>
                          <option value="regular">Regular Cleaning</option>
                          <option value="deep">Deep Cleaning</option>
                          <option value="window">Window Cleaning</option>
                          <option value="carpet">Carpet Cleaning</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCalendarSyncModal(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
              >
                <Calendar className="w-4 h-4" />
                Sync
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {viewMode === "month" &&
                currentDate.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}
              {viewMode === "week" && (
                <>
                  {weeklyView.length > 0
                    ? weeklyView[0].date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                  {" - "}
                  {weeklyView.length > 0
                    ? weeklyView[6].date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </>
              )}
              {viewMode === "day" &&
                currentDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleNavigate(-1)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => handleNavigate(1)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && (
            <div className="space-y-2">
              {Array.from({ length: 13 }, (_, i) => i + 8).map((hour) => {
                const timeSlot = new Date(selectedDate);
                timeSlot.setHours(hour, 0, 0, 0);
                const hourJobs = getJobsForHour(timeSlot);
                const isBlocked = isTimeBlocked(timeSlot);

                return (
                  <div
                    key={hour}
                    className={`p-3 border rounded-lg ${
                      isBlocked ? "bg-red-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-700">
                        {timeSlot.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -
                        {(() => {
                          const endTime = new Date(timeSlot);
                          endTime.setHours(hour + 1, 0, 0, 0);
                          return endTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        })()}
                      </div>

                      {isBlockingTime && !isBlocked && (
                        <button
                          onClick={() => handleQuickBlock(timeSlot, false)}
                          className="text-xs p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                        >
                          <Lock className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {isBlocked ? (
                      <div className="text-sm text-red-600 flex items-center">
                        <Lock className="w-4 h-4 mr-1" />
                        <span>Blocked</span>
                      </div>
                    ) : hourJobs.length > 0 ? (
                      <div className="space-y-2">
                        {hourJobs.map((job) => (
                          <div
                            key={job.id}
                            onClick={() => handleJobClick(job)}
                            className={`p-2 rounded-lg ${
                              jobStatusStyles[job.status].bg
                            } hover:brightness-95 cursor-pointer`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium">
                                {job.serviceType}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  jobStatusStyles[job.status].color
                                }`}
                              >
                                {job.status}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-3 h-3 mr-1" />
                              {job.clientName}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        No appointments
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {selectedDayJobs.length} appointments scheduled
          </p>
        </div>

        <div className="p-6">
          {selectedDayJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Sun className="h-12 w-12 mx-auto mb-3" />
              <p>No appointments scheduled for this day</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayJobs.map((job) => (
                <div
                  key={job.id}
                  className={`p-4 rounded-lg ${
                    jobStatusStyles[job.status].bg
                  } hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3
                        className={`font-medium ${
                          jobStatusStyles[job.status].color
                        }`}
                      >
                        {job.serviceType}
                      </h3>
                      <p className="text-sm text-gray-600">{job.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          jobStatusStyles[job.status].color
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        {new Date(job.scheduledAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                      <span>
                        {new Date(job.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {job.status === "confirmed" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAction(job.id, "in_progress");
                        }}
                        className="text-xs px-3 py-1 bg-teal-600 text-white rounded-full hover:bg-teal-700"
                      >
                        Start Job
                      </button>
                    )}
                    {job.status === "in_progress" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickAction(job.id, "completed");
                        }}
                        className="text-xs px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700"
                      >
                        Complete Job
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/cleaner/jobs/${job.id}`);
                      }}
                      className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {showJobDetailModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">Job Details</h2>
                <button onClick={() => setShowJobDetailModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedJob.serviceType}
                    <span
                      className={`ml-2 text-sm px-2 py-0.5 rounded-full ${
                        jobStatusStyles[selectedJob.status].color
                      }`}
                    >
                      {selectedJob.status}
                    </span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Date & Time
                      </label>
                      <div className="font-medium flex items-center">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        {new Date(selectedJob.scheduledAt).toLocaleDateString(
                          undefined,
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                      <div className="font-medium flex items-center mt-1">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        {new Date(selectedJob.scheduledAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                        <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                        {new Date(selectedJob.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Location
                      </label>
                      <div className="font-medium flex items-start">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          {selectedJob.location}
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(
                              selectedJob.location
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-700 text-sm flex items-center mt-1"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open in Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Client Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Name
                      </label>
                      <div className="font-medium flex items-center">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        {selectedJob.clientName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-500 mb-1">
                        Special Instructions
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {selectedJob.instructions ||
                          "No special instructions provided."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedJob.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleQuickAction(selectedJob.id, "confirmed")
                        }
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        Accept Job
                      </button>
                      <button
                        onClick={() =>
                          handleQuickAction(selectedJob.id, "cancelled")
                        }
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Decline Job
                      </button>
                    </>
                  )}

                  {selectedJob.status === "confirmed" && (
                    <button
                      onClick={() =>
                        handleQuickAction(selectedJob.id, "in_progress")
                      }
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Start Job
                    </button>
                  )}

                  {selectedJob.status === "in_progress" && (
                    <button
                      onClick={() =>
                        handleQuickAction(selectedJob.id, "completed")
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Complete Job
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/cleaner/jobs/${selectedJob.id}`)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Sync Modal */}
      {showCalendarSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">Sync Calendar</h2>
                <button onClick={() => setShowCalendarSyncModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Sync your cleaning job schedule with your personal
                    calendar to stay organized and never miss an appointment.
                  </p>
                </div>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
                        G
                      </div>
                      <span>Google Calendar</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                        O
                      </div>
                      <span>Outlook Calendar</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white mr-3">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>iCal File (Apple Calendar)</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowCalendarSyncModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanerCalendar;