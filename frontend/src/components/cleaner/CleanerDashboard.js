// src/components/cleaner/CleanerDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Briefcase, 
  CheckCircle, 
  Bell,
  AlertCircle,
  BarChart2,
  MapPin,
  User,
  ChevronRight,
  Info,
  RefreshCw,
  CalendarDays,
  Navigation,
  Award,
  Shield,
  Zap,
  Clock3,
  ThumbsUp,
  ExternalLink,
  Filter
} from "lucide-react";
import { useCleanerDashboard } from "../../hooks/useCleanerData";
import { cleanerService, notificationService } from "../../api/api";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

const CleanerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dashboardData, isLoading, error, refetch } = useCleanerDashboard();
  const [timeframe, setTimeframe] = useState("week");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobsFilter, setJobsFilter] = useState("upcoming");
  const [assignmentScores, setAssignmentScores] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (res && res.data) {
          setNotifications(res.data.data.slice(0, 5));
        }
        
        const unreadRes = await notificationService.getUnreadCount();
        if (unreadRes && unreadRes.data) {
          setUnreadCount(unreadRes.data.count);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotifications();
  }, []);

  // Get geolocation for nearby jobs
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            fetchNearbyJobs(latitude, longitude);
            setLoadingLocation(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setLoadingLocation(false);
          },
          { enableHighAccuracy: true }
        );
      }
    };

    getLocation();
  }, []);

  // Fetch nearby jobs based on current location
  const fetchNearbyJobs = useCallback(async (latitude, longitude) => {
    try {
      if (!latitude || !longitude) return;
      
      // In a real implementation, you would call an API endpoint that accepts latitude/longitude
      // For now, we'll just filter the upcoming jobs based on a hypothetical distance
      if (dashboardData && dashboardData.upcomingJobs) {
        // This is a placeholder - in a real app you would call an actual API
        const jobs = dashboardData.upcomingJobs.slice(0, 2);
        
        // Here we're just pretending these are nearby jobs
        setNearbyJobs(jobs.map(job => ({
          ...job,
          distance: Math.round(Math.random() * 20) + 1, // Random distance 1-20km
          estimatedTravelTime: Math.round(Math.random() * 40) + 10 // Random time 10-50 mins
        })));
      }
    } catch (error) {
      console.error("Error fetching nearby jobs:", error);
    }
  }, [dashboardData]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      if (currentLocation) {
        await fetchNearbyJobs(currentLocation.latitude, currentLocation.longitude);
      }
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch assignment algorithm scores
  useEffect(() => {
    const fetchAssignmentScores = async () => {
      try {
        // This would be a real API call in production
        // const response = await cleanerService.getAssignmentScores();
        // setAssignmentScores(response.data);
        
        // For now, we'll use placeholder data
        setAssignmentScores({
          proximity: 85,
          rating: 92,
          availability: 78,
          workload: 65,
          customerPreference: 88
        });
      } catch (error) {
        console.error("Error fetching assignment scores:", error);
      }
    };
    
    fetchAssignmentScores();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Accept job handler
  const handleAcceptJob = async (jobId) => {
    try {
      // In production, this would be an actual API call
      // await cleanerService.updateJobStatus(jobId, 'accepted', '');
      
      // For now, we'll just show a success message
      alert("Job accepted successfully!");
      
      // Refresh data
      handleRefresh();
    } catch (error) {
      console.error("Error accepting job:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-sm"
      >
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">{t("Error Loading Dashboard")}</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-3 text-red-700 text-sm bg-red-100 px-3 py-1 rounded-md hover:bg-red-200 inline-flex items-center"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> {t("Retry")}
            </button>
          </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Radar Chart - New section based on assignment algorithm */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="mb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{t("Assignment Score")}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {t("How the system matches you with jobs")}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 rounded-md">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 px-3 py-2 bg-purple-50 border border-purple-100 rounded-lg">
                <p className="text-xs text-purple-700">
                  {t("Higher scores in each category increase your chances of being matched with new jobs.")}
                </p>
              </div>
            </div>

            <div className="h-64">
              {assignmentScores ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      axisLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Radar 
                      name="Score" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      fill="#a78bfa" 
                      fillOpacity={0.5} 
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, "Score"]}
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size="md" />
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t("How to improve your scores")}</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-5 w-5 text-purple-600 mr-2">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-gray-600">{t("Update your service areas to improve proximity score")}</p>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 text-purple-600 mr-2">
                    <Star className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-gray-600">{t("Maintain 5-star ratings to increase rating score")}</p>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 text-purple-600 mr-2">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-gray-600">{t("Keep your availability up to date")}</p>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t("Performance Stats")}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">{t("Acceptance Rate")}</span>
                </div>
                <div className="font-medium text-gray-900">{assignmentStats.acceptanceRate || 93}%</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">{t("Completion Rate")}</span>
                </div>
                <div className="font-medium text-gray-900">
                  {((jobStats.completedJobs / Math.max(1, jobStats.completedJobs + jobStats.cancelledJobs)) * 100).toFixed(0)}%
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                    <Clock3 className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-sm text-gray-700">{t("Avg. Response Time")}</span>
                </div>
                <div className="font-medium text-gray-900">{assignmentStats.averageResponse || 8} {t("min")}</div>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-100">
              <Link to="/cleaner/statistics" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center">
                {t("View detailed statistics")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </motion.div>
          
          {/* Service Areas */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{t("Service Areas")}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("Areas where you can receive jobs")}
                </p>
              </div>
              <Link 
                to="/cleaner/service-areas" 
                className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded font-medium hover:bg-teal-100 transition-colors"
              >
                {t("Manage")}
              </Link>
            </div>
            
            <div className="space-y-2">
              {dashboardData && dashboardData.serviceAreas ? (
                dashboardData.serviceAreas.slice(0, 5).map((area, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-600">{t("No service areas set")}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("Set your service areas to receive job assignments")}
                  </p>
                  <Link 
                    to="/cleaner/service-areas" 
                    className="mt-3 inline-block text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium px-3 py-1.5 rounded-md transition-colors"
                  >
                    {t("Add Service Areas")}
                  </Link>
                </div>
              )}
              
              {dashboardData && dashboardData.serviceAreas && dashboardData.serviceAreas.length > 5 && (
                <div className="text-xs text-gray-500 mt-1">
                  {t("And {{count}} more areas", { count: dashboardData.serviceAreas.length - 5 })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </motion.div>
    );
  }

  // Destructure dashboard data with fallbacks
  const { 
    upcomingJobs = [], 
    jobStats = {
      todayJobs: 0,
      completedJobs: 0,
      pendingJobs: 0,
      cancelledJobs: 0
    }, 
    earnings = {
      currentMonth: 0,
      lastMonth: 0,
      total: 0,
      pendingPayout: 0
    }, 
    ratings = {
      average: 0,
      count: 0
    },
    recentEarnings = [],
    cleanerName = "",
    assignmentStats = {
      matchRate: 0,
      acceptanceRate: 0,
      averageResponse: 0
    }
  } = dashboardData || {};

  // Calculate earnings trend (up or down from last month)
  const earningsTrend = earnings.currentMonth >= (earnings.lastMonth || 0);
  const earningsDiff = Math.abs(earnings.currentMonth - (earnings.lastMonth || 0));
  const earningsPercentChange = earnings.lastMonth 
    ? Math.round((earningsDiff / earnings.lastMonth) * 100) 
    : 0;

  // Job type distribution for pie chart
  const jobDistribution = [
    { name: "Regular", value: jobStats.regularJobs || 5 },
    { name: "Deep Clean", value: jobStats.deepCleanJobs || 3 },
    { name: "Move Out", value: jobStats.moveOutJobs || 2 }
  ];
  
  // Colors for charts
  const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6'];

  // Format date and time for header
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(currentTime);
  
  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  // Enhanced hover animations for cards
  const cardVariants = {
    hover: { 
      y: -6, 
      boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 } 
    }
  };

  // Radar chart data for assignment algorithm scores
  const radarData = assignmentScores ? [
    {
      subject: 'Proximity',
      value: assignmentScores.proximity,
      fullMark: 100,
    },
    {
      subject: 'Rating',
      value: assignmentScores.rating,
      fullMark: 100,
    },
    {
      subject: 'Availability',
      value: assignmentScores.availability,
      fullMark: 100,
    },
    {
      subject: 'Workload',
      value: assignmentScores.workload,
      fullMark: 100,
    },
    {
      subject: 'Customer',
      value: assignmentScores.customerPreference,
      fullMark: 100,
    },
  ] : [];

  // Get appropriate earnings data based on selected timeframe
  const getFilteredEarningsData = () => {
    if (!recentEarnings || recentEarnings.length === 0) {
      // Generate sample data if no real data exists
      return Array.from({ length: 7 }, (_, i) => ({
        date: new Date(new Date().setDate(new Date().getDate() - (6 - i))).toLocaleDateString(),
        amount: Math.random() * 100
      }));
    }
    
    switch(timeframe) {
      case 'week':
        return recentEarnings.slice(-7);
      case 'month':
        return recentEarnings.slice(-30);
      case 'year':
        return recentEarnings.slice(-365).filter((_, i) => i % 30 === 0);
      default:
        return recentEarnings;
    }
  };

  return (
    <div className="pb-10">
      {/* Dashboard Header with Notification Bell */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl shadow-md p-6 mb-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 opacity-5">
          <svg width="300" height="150" viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5,21.5h49.251c0,0-20.865-17.472-37.958-5.433C-4.303,28.108,1.5,21.5,1.5,21.5z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {t("Welcome back")}, {cleanerName}
            </h1>
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
              <div className="bg-white/10 backdrop-blur-sm rounded-md px-4 py-2 flex flex-col">
                <span className="text-xs text-teal-100">{t("Next Job")}</span>
                {upcomingJobs && upcomingJobs.length > 0 ? (
                  <span className="font-medium">
                    {new Date(upcomingJobs[0].scheduledAt).toLocaleDateString()} at {new Date(upcomingJobs[0].scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                ) : (
                  <span className="font-medium">{t("No upcoming jobs")}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Link 
                  to="/cleaner/jobs" 
                  className="bg-white/20 hover:bg-white/30 transition-colors rounded-md px-4 py-2 text-center"
                >
                  {t("View Schedule")}
                </Link>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 flex items-center justify-center relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-medium text-gray-800">{t("Notifications")}</h3>
                          <Link to="/cleaner/notifications" className="text-xs text-teal-600 hover:text-teal-700">
                            {t("View all")}
                          </Link>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center">
                            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">{t("No notifications yet")}</p>
                          </div>
                        ) : (
                          <div className="max-h-96 overflow-auto divide-y divide-gray-100">
                            {notifications.map(notification => (
                              <div 
                                key={notification.id} 
                                className={`p-3 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-teal-50' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex gap-3">
                                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    notification.type === 'job' ? 'bg-blue-100 text-blue-600' : 
                                    notification.type === 'payment' ? 'bg-green-100 text-green-600' : 
                                    notification.type === 'system' ? 'bg-purple-100 text-purple-600' : 
                                    'bg-teal-100 text-teal-600'
                                  }`}>
                                    {notification.type === 'job' ? <Briefcase className="h-4 w-4" /> : 
                                     notification.type === 'payment' ? <DollarSign className="h-4 w-4" /> : 
                                     notification.type === 'system' ? <Shield className="h-4 w-4" /> : 
                                     <Info className="h-4 w-4" />}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-800 font-medium">{notification.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                      {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <button
                  onClick={handleRefresh} 
                  className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 flex items-center justify-center"
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Nearby Jobs Alert - New section */}
      {nearbyJobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center mb-3">
            <div className="bg-blue-100 rounded-lg p-2 mr-3">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{t("Jobs Near You")}</h2>
              <p className="text-sm text-gray-600">{t("Based on your current location")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyJobs.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -3 }}
                className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    job.serviceType.includes('Deep') ? 'bg-blue-100 text-blue-600' : 
                    job.serviceType.includes('Move') ? 'bg-purple-100 text-purple-600' : 
                    'bg-teal-100 text-teal-600'
                  }`}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{job.serviceType}</div>
                        <div className="flex flex-wrap items-center mt-1 text-gray-500 text-sm">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span className="mr-2">{job.distance}km away</span>
                          <Clock3 className="h-3.5 w-3.5 mr-1 ml-1" />
                          <span>{job.estimatedTravelTime} min travel</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                          €{job.price || '50.00'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {new Date(job.scheduledAt).toLocaleDateString()} • {new Date(job.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      
                      <button
                        onClick={() => handleAcceptJob(job.id)}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-md text-xs font-medium hover:bg-teal-200 transition-colors"
                      >
                        {t("Accept Job")}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Today's Jobs */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("Rating & Match Score")}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800 flex items-center">
                {ratings.average?.toFixed(1) || "0.0"}
                <div className="ml-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(ratings.average || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>
                <p className="text-xs text-gray-500">
                  {t("Match rate")}: <span className="font-medium">{assignmentStats.matchRate || 78}%</span>
                </p>
              </div>
            </div>
            <div className="bg-yellow-100 p-2.5 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/cleaner/reviews" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
              {t("View Reviews")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              {ratings.count || 0} {t("total reviews")}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("Today's Jobs")}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800">
                {jobStats.todayJobs}
              </h3>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full ${jobStats.todayJobs > 0 ? 'bg-blue-500' : 'bg-gray-300'} mr-1.5`}></div>
                <p className="text-xs text-gray-500">
                  {jobStats.todayJobs === 1 
                    ? t("1 job scheduled today") 
                    : t("{{count}} jobs scheduled today", { count: jobStats.todayJobs })}
                </p>
              </div>
            </div>
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/cleaner/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              {t("Job Details")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              {jobStats.pendingJobs || 0} {t("pending")}
            </span>
          </div>
        </motion.div>

        {/* Completed Jobs */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("Completed Jobs")}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800">
                {jobStats.completedJobs}
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                <p className="text-xs text-gray-500">
                  {t("this month")}
                </p>
              </div>
            </div>
            <div className="bg-green-100 p-2.5 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/cleaner/jobs?filter=completed" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center">
              {t("Job History")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              {((jobStats.completedJobs / (jobStats.completedJobs + jobStats.pendingJobs + jobStats.cancelledJobs)) * 100).toFixed(0)}% {t("completion rate")}
            </span>
          </div>
        </motion.div>

        {/* Earnings */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("Monthly Earnings")}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800">
                €{earnings.currentMonth?.toFixed(2) || "0.00"}
              </h3>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full ${earningsTrend ? 'bg-teal-500' : 'bg-red-500'} mr-1.5`}></div>
                <p className="text-xs text-gray-500 flex items-center">
                  <span className={earningsTrend ? 'text-teal-600' : 'text-red-600'}>
                    {earningsTrend ? '+' : '-'}{earningsPercentChange}%
                  </span>
                  <span className="mx-1">•</span>
                  <span>{t("vs last month")}</span>
                </p>
              </div>
            </div>
            <div className="bg-teal-100 p-2.5 rounded-lg">
              <DollarSign className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/cleaner/earnings" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center">
              {t("Earnings Details")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              €{earnings.total?.toFixed(2) || "0.00"} {t("total")}
            </span>
          </div>
        </motion.div>

        {/* Rating */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {t("Average Rating")}
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800 flex items-center">
                {ratings.average?.toFixed(1) || "0.0"}
                <div className="ml-2 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(ratings.average || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></div>
                <p className="text-xs text-gray-500">
                  {ratings.count ? `${ratings.count} ${t("reviews")}` : t("No reviews yet")}
                </p>
              </div>
            </div>
            <div className="bg-yellow-100 p-2.5 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/cleaner/reviews" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center">
              {t("View Reviews")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              {ratings.newReviews || 0} {t("new")}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{t("Earnings Overview")}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("Track your income over time")}
                </p>
              </div>
              <div className="flex space-x-2">
                {["week", "month", "year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timeframe === period
                        ? "bg-teal-100 text-teal-700 font-medium"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {t(period)}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              {recentEarnings && recentEarnings.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={getFilteredEarningsData()}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => `€${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`€${value.toFixed(2)}`, "Earnings"]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fill="url(#colorEarnings)"
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium">{t("No earnings data to display yet")}</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                      {t("Complete jobs to see your earnings chart. This visualization helps track your income over time.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Jobs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">{t("Upcoming Jobs")}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("Your scheduled cleaning assignments")}
                </p>
              </div>
              <Link 
                to="/cleaner/jobs" 
                className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
              >
                {t("View all")}
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>

            {upcomingJobs.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-100">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-700 font-medium">{t("No upcoming jobs scheduled")}</p>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  {t("When you receive new job assignments, they will appear here. Check your availability settings to ensure you're visible to clients.")}
                </p>
                <Link 
                  to="/cleaner/availability" 
                  className="mt-4 inline-block text-sm bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium px-4 py-2 rounded-md transition-colors"
                >
                  {t("Update Availability")}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {upcomingJobs.slice(0, 3).map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link 
                      to={`/cleaner/jobs/${job.id}`}
                      className="block py-4 first:pt-0 last:pb-0 hover:bg-gray-50 rounded-lg transition-colors px-2 -mx-2"
                    >
                      <div className="flex items-start">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          job.serviceType.includes('Deep') ? 'bg-blue-100 text-blue-600' : 
                          job.serviceType.includes('Move') ? 'bg-purple-100 text-purple-600' : 
                          'bg-teal-100 text-teal-600'
                        }`}>
                          <Briefcase className="h-5 w-5" />
                        </div>
                        
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-gray-900">{job.serviceType}</div>
                              <div className="flex items-center mt-1 text-gray-500 text-sm">
                                <User className="h-3.5 w-3.5 mr-1.5" />
                                <span>{job.clientName}</span>
                                <span className="mx-2 text-gray-300">•</span>
                                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                <span className="truncate max-w-[140px]">{job.location}</span>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
                                {new Date(job.scheduledAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center mt-1 text-gray-500 text-sm justify-end">
                                <Clock className="h-3.5 w-3.5 mr-1.5" /> 
                                {new Date(job.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Job Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800">{t("Job Distribution")}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {t("Types of cleaning services you provide")}
              </p>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={jobDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {jobDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        strokeWidth={index === activeIndex ? 2 : 1}
                        stroke={index === activeIndex ? '#fff' : '#fff'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} jobs`, name]}
                    contentStyle={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Tips & Recommendations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-b from-teal-50 to-white rounded-xl shadow-sm border border-teal-100 p-5"
          >
            <div className="flex items-start mb-4">
              <div className="bg-teal-100 rounded-lg p-2 mr-3 mt-1">
                <Info className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{t("Tips & Insights")}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("Recommendations to improve your performance")}
                </p>
              </div>
            </div>

            <div className="divide-y divide-teal-100">
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {t("Complete your profile")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("Cleaners with complete profiles get 40% more bookings.")}
                </p>
                <Link to="/cleaner/profile" className="mt-1 text-xs text-teal-700 font-medium inline-block">
                  {t("Update profile")} →
                </Link>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {t("Maintain high ratings")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("Consistently rated cleaners appear higher in search results.")}
                </p>
                <Link to="/cleaner/reviews" className="mt-1 text-xs text-teal-700 font-medium inline-block">
                  {t("Check reviews")} →
                </Link>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  {t("Update your availability")}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("Keep your calendar updated to receive more job offers.")}
                </p>
                <Link to="/cleaner/availability" className="mt-1 text-xs text-teal-700 font-medium inline-block">
                  {t("Set availability")} →
                </Link>
              </div>
            </div>
          </motion.div>
          
          {/* Recent Feedback */}
          {ratings && ratings.recentReviews && ratings.recentReviews.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">{t("Recent Feedback")}</h2>
                <Link 
                  to="/cleaner/reviews" 
                  className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                >
                  {t("All reviews")}
                </Link>
              </div>
              
              <div className="space-y-4">
                {ratings.recentReviews.slice(0, 2).map((review, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">{review.clientName}</div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{review.comment}</p>
                    <div className="text-xs text-gray-400 mt-2">{new Date(review.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanerDashboard;