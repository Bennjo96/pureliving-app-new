// frontend/src/components/admin/AnalyticsPanel.js
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Clock,
  FileText,
  RefreshCw,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  Award,
  ThumbsDown,
  Slash,
  Filter,
  ChevronDown,
  ChevronUp,
  Search,
  Home,
} from "lucide-react";
import { adminService, handleApiError } from "../../api/api";
import { format, subDays, subMonths } from "date-fns";

const AnalyticsPanel = () => {
  // State management
  const [timeframe, setTimeframe] = useState("week");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [customRange, setCustomRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [viewPeriod, setViewPeriod] = useState("month");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);

  // Real-time data synchronization
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchAnalytics();
        setLastRefreshed(new Date());
      }, 60000); // Refresh every 60 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeframe, customRange, showCustomRange]);
  
  // Set appropriate date range when timeframe changes
  useEffect(() => {
    if (timeframe === "today") {
      setCustomRange({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd")
      });
    } else if (timeframe === "week") {
      setCustomRange({
        startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd")
      });
    } else if (timeframe === "month") {
      setCustomRange({
        startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd")
      });
    } else if (timeframe === "quarter") {
      setCustomRange({
        startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd")
      });
    } else if (timeframe === "year") {
      setCustomRange({
        startDate: format(subMonths(new Date(), 12), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd")
      });
    }
  }, [timeframe]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics();
  }, [timeframe, customRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      let params = { timeframe };
      
      // Add custom date range if selected
      if ((timeframe === "custom" || showCustomRange) && customRange.startDate && customRange.endDate) {
        params.startDate = customRange.startDate;
        params.endDate = customRange.endDate;
      }
      
      // Add comparison flag if enabled
      if (compareWithPrevious) {
        params.comparePrevious = true;
      }
      
      // Add currently active tab for optimization
      params.tab = activeTab;
      
      const response = await adminService.getAnalytics(params);
      
      setStats(response.data || {
        overview: {
          totalRevenue: 0,
          platformCommission: 0,
          payoutsToCleaners: 0,
          pendingPayments: 0,
          activeUsers: 0,
          completedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
          averageRating: 0,
          newCustomers: 0,
          newCleaners: 0,
          totalCleaners: 0,
          topRatedCleaners: 0,
          underperformingCleaners: 0,
          inactiveUsers: 0,
          cancellationRate: 0,
          revenueLost: 0,
          commonCancelReason: '',
          totalServices: 0,
          mostPopularService: '',
          avgServiceDuration: '0h',
          avgServicePrice: 0
        },
        revenue: [],
        bookings: [],
        userGrowth: [],
        cleanerPerformance: [],
        serviceTypes: [],
        cancellationReasons: [],
        peakBookingTimes: [],
        alerts: [],
        userRatio: null,
        customerActivity: null,
        cleanerActivity: null,
        cleanerRatings: [],
        cleanerWorkload: [],
        serviceRevenue: [],
        servicePerformance: [],
        cancellationTrends: [],
        frequentCancellers: []
      });

      setError(null);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      console.error("Error fetching analytics:", apiError);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    try {
      setExportLoading(true);
      
      let params = { 
        timeframe,
        format: exportFormat,
        tab: activeTab // Export data for the currently active tab
      };
      
      if ((timeframe === "custom" || showCustomRange) && customRange.startDate && customRange.endDate) {
        params.startDate = customRange.startDate;
        params.endDate = customRange.endDate;
      }
      
      // Special handling for PDF format
      if (exportFormat === 'pdf') {
        await generatePdfReport();
        setExportLoading(false);
        return;
      }
      
      const response = await adminService.exportAnalytics(params);
      
      // Create download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-export-${activeTab}-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      const apiError = handleApiError(err);
      setError(`Export failed: ${apiError.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Safe fallback for missing data
  const overview = stats?.overview || {
    totalRevenue: 0,
    platformCommission: 0,
    payoutsToCleaners: 0,
    pendingPayments: 0,
    activeUsers: 0,
    completedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    averageRating: 0,
    newCustomers: 0,
    newCleaners: 0,
  };

  // Format revenue for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Format numbers with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  // Format percentage
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate percentages for change indicators
  const getChangeDisplay = (current, previous) => {
    if (!previous) return { change: "N/A", changeType: "neutral" };
    
    const changePercent = ((current - previous) / previous) * 100;
    
    return {
      change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
      changeType: changePercent >= 0 ? "increase" : "decrease"
    };
  };

  // Prepare data for comparison views
  const comparativeData = useMemo(() => {
    if (!stats) return null;
    
    return {
      revenue: {
        current: stats.overview?.totalRevenue || 0,
        previous: stats.overview?.previousTotalRevenue || 0,
        ...getChangeDisplay(
          stats.overview?.totalRevenue || 0, 
          stats.overview?.previousTotalRevenue || 0
        )
      },
      bookings: {
        current: stats.overview?.completedBookings || 0,
        previous: stats.overview?.previousCompletedBookings || 0,
        ...getChangeDisplay(
          stats.overview?.completedBookings || 0, 
          stats.overview?.previousCompletedBookings || 0
        )
      },
      users: {
        current: stats.overview?.activeUsers || 0,
        previous: stats.overview?.previousActiveUsers || 0,
        ...getChangeDisplay(
          stats.overview?.activeUsers || 0, 
          stats.overview?.previousActiveUsers || 0
        )
      }
    };
  }, [stats]);

  // Component for individual stat cards
  const StatCard = ({ title, value, icon: Icon, change, changeType, onClick }) => (
    <div 
      className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md border border-gray-100 hover:translate-y-[-2px] cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {change && (
            <div className="flex items-center mt-2">
              {changeType === "increase" ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : changeType === "decrease" ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : null}
              <p className={`text-sm ${
                changeType === "increase" ? "text-green-500" : 
                changeType === "decrease" ? "text-red-500" : "text-gray-500"
              }`}>
                {change}
              </p>
            </div>
          )}
        </div>
        <div className="bg-teal-100 p-3 rounded-full">
          <Icon className="h-6 w-6 text-teal-600" />
        </div>
      </div>
    </div>
  );

  // Tab navigation buttons
  const TabButton = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 rounded-md ${
        active ? "bg-teal-600 text-white" : "hover:bg-gray-50"
      }`}
    >
      <Icon className="h-5 w-5 mr-2" />
      <span>{label}</span>
    </button>
  );

  // Alert component for insights
  const AlertBox = ({ title, message, type }) => (
    <div className={`p-4 rounded-lg mb-4 flex items-start border ${
      type === "warning" ? "bg-amber-50 text-amber-800 border-amber-200" :
      type === "danger" ? "bg-red-50 text-red-800 border-red-200" :
      type === "success" ? "bg-green-50 text-green-800 border-green-200" :
      "bg-blue-50 text-blue-800 border-blue-200"
    }`}>
      <AlertTriangle className={`h-5 w-5 mr-2 flex-shrink-0 ${
        type === "warning" ? "text-amber-500" :
        type === "danger" ? "text-red-500" :
        type === "success" ? "text-green-500" :
        "text-blue-500"
      }`} />
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );

  // Custom pie chart for service types
  const renderServiceTypesChart = () => {
    if (!stats?.serviceTypes || stats.serviceTypes.length === 0) {
      return <p className="text-gray-500">No service type data available.</p>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={stats.serviceTypes}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {stats.serviceTypes.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Custom component for top cleaners
  const CleanerPerformanceTable = () => {
    if (!stats?.cleanerPerformance || stats.cleanerPerformance.length === 0) {
      return <p className="text-gray-500">No cleaner performance data available.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cleaner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed Jobs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.cleanerPerformance.map((cleaner, index) => (
              <tr key={`cleaner-${index}`} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                      {cleaner.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{cleaner.name}</div>
                      <div className="text-sm text-gray-500">{cleaner.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cleaner.completedJobs}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-900">{cleaner.rating.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        cleaner.rating >= 4.5 ? 'bg-green-500' :
                        cleaner.rating >= 4.0 ? 'bg-green-400' :
                        cleaner.rating >= 3.5 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`} 
                      style={{ width: `${(cleaner.rating / 5) * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <button className="text-teal-600 hover:text-teal-800 px-2 py-1 rounded hover:bg-teal-50 transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Custom component for cancellation reasons
  const CancellationChart = () => {
    if (!stats?.cancellationReasons || stats.cancellationReasons.length === 0) {
      return <p className="text-gray-500">No cancellation data available.</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={stats.cancellationReasons}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="reason" width={80} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Generate PDF report - using the real backend
  const generatePdfReport = async () => {
    try {
      setExportLoading(true);
      
      const params = { 
        timeframe,
        format: 'pdf',
        tabs: [activeTab] // Export only active tab or all tabs
      };
      
      if ((timeframe === "custom" || showCustomRange) && customRange.startDate && customRange.endDate) {
        params.startDate = customRange.startDate;
        params.endDate = customRange.endDate;
      }
      
      const response = await adminService.exportAnalytics(params);
      
      // Create download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      const apiError = handleApiError(err);
      setError(`PDF export failed: ${apiError.message}`);
    } finally {
      setExportLoading(false);
    }
  };

  // Render loading state
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Render error state
  if (error && !stats) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 shadow-sm"
      >
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium mb-1">Error Loading Analytics</h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={fetchAnalytics}
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
          <svg width="300" height="150" viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5,21.5h49.251c0,0-20.865-17.472-37.958-5.433C-4.303,28.108,1.5,21.5,1.5,21.5z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-teal-100 mt-1">
              Monitor platform performance, revenue, and user metrics
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              <p className="text-teal-100 text-sm">
                Last refreshed: {format(lastRefreshed, 'MMM d, yyyy HH:mm:ss')}
              </p>
              <button
                onClick={() => {
                  fetchAnalytics();
                  setLastRefreshed(new Date());
                }}
                className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 flex items-center justify-center"
                aria-label="Refresh data"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search - Could be added in the future */}
          <div className="relative flex-grow">
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Timeframe:</span>
              <select
                id="timeframe"
                aria-label="Select timeframe"
                value={timeframe}
                onChange={(e) => {
                  setTimeframe(e.target.value);
                  setShowCustomRange(e.target.value === "custom");
                }}
                className="rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowCustomRange(!showCustomRange)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              showCustomRange 
                ? 'bg-teal-50 text-teal-600 border-teal-200' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} className="mr-2" />
            Date Filters
            {showCustomRange ? (
              <ChevronUp size={16} className="ml-2" />
            ) : (
              <ChevronDown size={16} className="ml-2" />
            )}
          </button>
          
          {/* Export Button */}
          <div className="flex">
            <select
              id="export"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="rounded-l-md border border-r-0 border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
            >
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              onClick={handleExportData}
              disabled={exportLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none"
            >
              {exportLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </button>
          </div>
          
          {/* Auto-refresh and compare toggles */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <input 
                type="checkbox" 
                id="autoRefresh" 
                checked={autoRefresh} 
                onChange={() => setAutoRefresh(!autoRefresh)}
                className="mr-2"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">Auto-refresh</label>
            </div>
            
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <input 
                type="checkbox" 
                id="compareWithPrevious" 
                checked={compareWithPrevious} 
                onChange={() => setCompareWithPrevious(!compareWithPrevious)}
                className="mr-2"
              />
              <label htmlFor="compareWithPrevious" className="text-sm text-gray-700">Compare with previous</label>
            </div>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showCustomRange && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={customRange.startDate}
                onChange={(e) => setCustomRange({...customRange, startDate: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={customRange.endDate}
                onChange={(e) => setCustomRange({...customRange, endDate: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                min={customRange.startDate}
              />
            </div>
          </div>
        )}
      </motion.div>
      
      {error && !loading && <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

      {/* Tab navigation for different analytics sections */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
      >
        <div className="overflow-x-auto">
          <div className="flex p-2 space-x-1">
            <TabButton id="overview" label="Overview" icon={FileText} active={activeTab === 'overview'} />
            <TabButton id="revenue" label="Revenue" icon={DollarSign} active={activeTab === 'revenue'} />
            <TabButton id="bookings" label="Bookings" icon={Calendar} active={activeTab === 'bookings'} />
            <TabButton id="users" label="Users" icon={Users} active={activeTab === 'users'} />
            <TabButton id="cleaners" label="Cleaners" icon={UserCheck} active={activeTab === 'cleaners'} />
            <TabButton id="services" label="Services" icon={Award} active={activeTab === 'services'} />
            <TabButton id="cancellations" label="Cancellations" icon={Slash} active={activeTab === 'cancellations'} />
          </div>
        </div>
      </motion.div>

      {loading && stats ? (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
        </div>
      ) : stats ? (
        <>
          {/* Automated Insights Panel */}
          {stats.alerts && stats.alerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold mb-3">Insights & Alerts</h3>
              <div className="space-y-3">
                {stats.alerts.map((alert, index) => (
                  <AlertBox
                    key={`alert-${index}`}
                    title={alert.title}
                    message={alert.message}
                    type={alert.type}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <StatCard 
                  title="Total Revenue" 
                  value={formatCurrency(overview.totalRevenue)} 
                  icon={DollarSign} 
                  change={comparativeData?.revenue.change} 
                  changeType={comparativeData?.revenue.changeType}
                  onClick={() => setActiveTab('revenue')}
                />
                <StatCard 
                  title="Active Users" 
                  value={overview.activeUsers} 
                  icon={Users} 
                  change={comparativeData?.users.change} 
                  changeType={comparativeData?.users.changeType}
                  onClick={() => setActiveTab('users')}
                />
                <StatCard 
                  title="Completed Bookings" 
                  value={overview.completedBookings} 
                  icon={Calendar} 
                  change={comparativeData?.bookings.change} 
                  changeType={comparativeData?.bookings.changeType}
                  onClick={() => setActiveTab('bookings')}
                />
                <StatCard 
                  title="Average Rating" 
                  value={overview.averageRating.toFixed(1)} 
                  icon={Star} 
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
                  {stats.revenue?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.revenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stroke="#0d9488" fill="#0d948833" activeDot={{ r: 8 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No revenue data available.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Booking Statistics</h3>
                  {stats.bookings?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.bookings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" name="Completed" fill="#0d9488" />
                        <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                        <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No booking data available.</p>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Revenue Tab Content */}
          {activeTab === 'revenue' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <StatCard 
                  title="Total Revenue" 
                  value={formatCurrency(overview.totalRevenue)} 
                  icon={DollarSign} 
                  change={comparativeData?.revenue.change} 
                  changeType={comparativeData?.revenue.changeType}
                />
                <StatCard 
                  title="Platform Commission" 
                  value={formatCurrency(overview.platformCommission)} 
                  icon={DollarSign}
                />
                <StatCard 
                  title="Payouts to Cleaners" 
                  value={formatCurrency(overview.payoutsToCleaners)} 
                  icon={DollarSign}
                />
                <StatCard 
                  title="Pending Payments" 
                  value={formatCurrency(overview.pendingPayments)} 
                  icon={Clock}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                  {stats.revenue?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={stats.revenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(value)]} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Total Revenue" stroke="#0d9488" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="commission" name="Platform Commission" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="payouts" name="Cleaners Payout" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No revenue data available.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Top Revenue Sources</h3>
                    {stats.serviceTypes?.length > 0 ? renderServiceTypesChart() : (
                      <p className="text-gray-500">No revenue source data available.</p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Day of Week</h3>
                    {stats.peakBookingTimes?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.peakBookingTimes}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                          <Bar dataKey="revenue" fill="#0d9488" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500">No peak revenue data available.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Bookings Tab Content */}
          {activeTab === 'bookings' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <StatCard 
                  title="Total Bookings" 
                  value={overview.completedBookings + overview.pendingBookings + overview.cancelledBookings} 
                  icon={Calendar}
                />
                <StatCard 
                  title="Completed Bookings" 
                  value={overview.completedBookings} 
                  icon={Calendar}
                  change={comparativeData?.bookings.change}
                  changeType={comparativeData?.bookings.changeType}
                />
                <StatCard 
                  title="Pending Bookings" 
                  value={overview.pendingBookings} 
                  icon={Clock}
                />
                <StatCard 
                  title="Cancelled Bookings" 
                  value={overview.cancelledBookings} 
                  icon={Slash}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Booking Trends</h3>
                  {stats.bookings?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stats.bookings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="completed" name="Completed" stroke="#0d9488" fill="#0d9488" activeDot={{ r: 8 }} />
                        <Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" fill="#f59e0b33" activeDot={{ r: 8 }} />
                        <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke="#ef4444" fill="#ef444433" activeDot={{ r: 8 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No booking trend data available.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Peak Booking Times</h3>
                  {stats.peakBookingTimes?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.peakBookingTimes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bookings" name="Number of Bookings" fill="#0d9488" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No peak booking time data available.</p>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm mt-6 border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Service Type Breakdown</h3>
                  {stats.serviceTypes?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={stats.serviceTypes}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Bookings" fill="#0d9488" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No service type data available.</p>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <StatCard 
                  title="Active Users" 
                  value={overview.activeUsers} 
                  icon={Users}
                  change={comparativeData?.users.change}
                  changeType={comparativeData?.users.changeType}
                />
                <StatCard 
                  title="New Customers" 
                  value={overview.newCustomers} 
                  icon={UserCheck}
                />
                <StatCard 
                  title="New Cleaners" 
                  value={overview.newCleaners} 
                  icon={UserCheck}
                />
                <StatCard 
                  title="Inactive Users" 
                  value={overview.inactiveUsers || 0} 
                  icon={UserX}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">User Growth Trends</h3>
                  {stats.userGrowth?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="customers" name="Customers" stroke="#0d9488" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="cleaners" name="Cleaners" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No user growth data available.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Customer vs Cleaner Ratio</h3>
                  {stats.userRatio ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Customers', value: stats.userRatio.customers },
                            { name: 'Cleaners', value: stats.userRatio.cleaners }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#0d9488" />
                          <Cell fill="#6366f1" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No user ratio data available.</p>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100"
              >
                <h3 className="text-lg font-semibold mb-4">Active vs Inactive Users</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Customers</h4>
                    <div className="bg-gray-200 rounded-full h-4 w-full">
                      <div 
                        className="bg-teal-500 h-4 rounded-full" 
                        style={{ width: `${stats.customerActivity?.activePercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Active: {stats.customerActivity?.active || 0} ({stats.customerActivity?.activePercentage || 0}%)</span>
                      <span>Inactive: {stats.customerActivity?.inactive || 0} ({100 - (stats.customerActivity?.activePercentage || 0)}%)</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Cleaners</h4>
                    <div className="bg-gray-200 rounded-full h-4 w-full">
                      <div 
                        className="bg-indigo-500 h-4 rounded-full" 
                        style={{ width: `${stats.cleanerActivity?.activePercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm">
                      <span>Active: {stats.cleanerActivity?.active || 0} ({stats.cleanerActivity?.activePercentage || 0}%)</span>
                      <span>Inactive: {stats.cleanerActivity?.inactive || 0} ({100 - (stats.cleanerActivity?.activePercentage || 0)}%)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Cleaners Tab Content */}
          {activeTab === 'cleaners' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <StatCard 
                  title="Total Cleaners" 
                  value={overview.totalCleaners || 0} 
                  icon={UserCheck}
                />
                <StatCard 
                  title="Average Rating" 
                  value={overview.averageRating.toFixed(1)} 
                  icon={Star}
                />
                <StatCard 
                  title="Top Rated Cleaners" 
                  value={overview.topRatedCleaners || 0} 
                  icon={Award}
                />
                <StatCard 
                  title="Underperforming Cleaners" 
                  value={overview.underperformingCleaners || 0} 
                  icon={ThumbsDown}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-100"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h3 className="text-lg font-semibold">Top Performing Cleaners</h3>
                  <div className="mt-2 md:mt-0">
                    <select 
                      className="rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
                      defaultValue="bookings"
                    >
                      <option value="bookings">By Bookings</option>
                      <option value="ratings">By Ratings</option>
                      <option value="revenue">By Revenue</option>
                    </select>
                  </div>
                </div>
                <CleanerPerformanceTable />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Cleaner Rating Distribution</h3>
                  {stats.cleanerRatings?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.cleanerRatings}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="rating" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Number of Cleaners" fill="#0d9488" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No cleaner rating data available.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Cleaner Workload</h3>
                  {stats.cleanerWorkload?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.cleanerWorkload}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#0d9488" />
                          <Cell fill="#22d3ee" />
                          <Cell fill="#a5f3fc" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} cleaners`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No cleaner workload data available.</p>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* Services Tab Content */}
          {activeTab === 'services' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <StatCard 
                  title="Total Services" 
                  value={overview.totalServices || 0} 
                  icon={Home}
                />
                <StatCard 
                  title="Most Popular Service" 
                  value={overview.mostPopularService || 'N/A'} 
                  icon={Award}
                />
                <StatCard 
                  title="Average Service Duration" 
                  value={overview.avgServiceDuration || '0h'} 
                  icon={Clock}
                />
                <StatCard 
                  title="Average Service Price" 
                  value={formatCurrency(overview.avgServicePrice || 0)} 
                  icon={DollarSign}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Service Popularity</h3>
                  {stats.serviceTypes?.length > 0 ? renderServiceTypesChart() : (
                    <p className="text-gray-500">No service popularity data available.</p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Service Revenue Distribution</h3>
                  {stats.serviceRevenue?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.serviceRevenue}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="revenue"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.serviceRevenue.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 30 + 180}, 70%, 50%)`} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No service revenue data available.</p>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-100"
              >
                <h3 className="text-lg font-semibold mb-4">Service Performance Over Time</h3>
                {stats.servicePerformance?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={stats.servicePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [value, name.split('_').join(' ')]} />
                      <Legend formatter={(value) => value.split('_').join(' ')} />
                      {stats.serviceTypes?.map((service, index) => (
                        <Line 
                          key={`service-${index}`}
                          type="monotone" 
                          dataKey={service.name.split(' ').join('_')} 
                          stroke={`hsl(${index * 30 + 180}, 70%, 50%)`} 
                          strokeWidth={2} 
                          activeDot={{ r: 8 }} 
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500">No service performance data available.</p>
                )}
              </motion.div>
            </>
          )}

          {/* Cancellations Tab Content */}
          {activeTab === 'cancellations' && (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <StatCard 
                  title="Total Cancellations" 
                  value={overview.cancelledBookings} 
                  icon={Slash}
                />
                <StatCard 
                  title="Cancellation Rate" 
                  value={`${overview.cancellationRate || 0}%`} 
                  icon={ThumbsDown}
                />
                <StatCard 
                  title="Revenue Lost" 
                  value={formatCurrency(overview.revenueLost || 0)} 
                  icon={DollarSign}
                />
                <StatCard 
                  title="Most Common Reason" 
                  value={overview.commonCancelReason || 'N/A'} 
                  icon={AlertTriangle}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Cancellation Reasons</h3>
                  <CancellationChart />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Cancellation Trends</h3>
                  {stats.cancellationTrends?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.cancellationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="count" name="Cancellations" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="rate" name="Rate (%)" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">No cancellation trend data available.</p>
                  )}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-100"
              >
                <h3 className="text-lg font-semibold mb-4">Users with Frequent Cancellations</h3>
                {stats.frequentCancellers?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cancellations
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Cancellation
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.frequentCancellers.map((user, index) => (
                          <tr key={`user-${index}`} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium">
                                  {user.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.type === 'Customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {user.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">{user.cancellations}</div>
                              <div className="text-xs text-gray-500">{user.cancellationRate}% of bookings</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.lastCancellation}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <button className="text-teal-600 hover:text-teal-800 px-2 py-1 rounded hover:bg-teal-50 transition-colors">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No frequent cancellation data available.</p>
                )}
              </motion.div>
            </>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <FileText size={48} className="text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-500">No analytics data available</h3>
            <p className="text-gray-500 text-sm mt-1">
              There's currently no data to analyze. Try changing the timeframe or come back later.
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              onClick={fetchAnalytics}
            >
              <RefreshCw className="inline-block mr-1 h-4 w-4" /> Refresh Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
