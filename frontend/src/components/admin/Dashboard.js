// src/components/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  Activity,
  Star,
  MoreHorizontal,
  User,
  UserCheck,
  UserX,
  PlusCircle,
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart2,
  CalendarDays,
  RefreshCw,
  Info,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../api/api';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeCleaners: 0,
    completionRate: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    pendingCleaners: 0,
    unresolved: 0
  });
  
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayouts, setRecentPayouts] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [newRegistrations, setNewRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  
  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Simulate pull to refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API refresh
    setTimeout(() => {
      fetchDashboardData();
      setRefreshing(false);
    }, 1200);
  };
  
  // Load dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real data from API
      const dashboardData = await adminService.getDashboard(timeframe);
      
      // Set the stats from the API response, with fallbacks
      setStats(dashboardData?.stats || {
        totalBookings: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        activeCleaners: 0,
        completionRate: 0,
        userGrowth: 0,
        revenueGrowth: 0,
        pendingCleaners: 0,
        unresolved: 0
      });
      setRecentBookings(dashboardData?.recentBookings || []);
      setRecentPayouts(dashboardData?.recentPayouts || []);
      setSystemAlerts(dashboardData?.systemAlerts || []);
      setNewRegistrations(dashboardData?.newRegistrations || []);
      setRevenueData(dashboardData?.revenueData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // You might want to show an error message to the user
    } finally {
      setLoading(false);
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  // Helper function to get status styles
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper function to get alert styles
  const getAlertStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
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
  
  // Use default values for stats to avoid undefined errors
  const totalBookings = stats?.totalBookings || 0;
  const pendingBookings = stats?.pendingBookings || 0;
  
  // Pie chart data for booking distribution - calculate completed bookings
  // Assume completed = total - pending (for now)
  const completedBookings = Math.max(0, totalBookings - pendingBookings);
  
  const bookingDistribution = [
    { name: "Completed", value: completedBookings || 25 },
    { name: "Pending", value: pendingBookings || 10 },
    { name: "Cancelled", value: 0 } // Set to 0 since we don't have this data yet
  ];
  
  const COLORS = ['#14b8a6', '#0ea5e9', '#8b5cf6'];
  
  return (
    <div className="pb-10">
      {/* Dashboard Header */}
      <div 
        className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg shadow-md p-6 mb-6 text-white relative overflow-hidden"
        style={{ 
          animation: 'fadeIn 0.3s ease-in-out',
          transform: 'translateY(0)',
          opacity: 1,
          transition: 'transform 0.3s, opacity 0.3s'
        }}
      >
        <div className="absolute top-0 right-0 opacity-5">
          <svg width="300" height="150" viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5,21.5h49.251c0,0-20.865-17.472-37.958-5.433C-4.303,28.108,1.5,21.5,1.5,21.5z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
                <span className="text-xs text-teal-100">Pending Actions</span>
                <span className="font-medium">
                  {(stats?.pendingBookings || 0) + (stats?.pendingCleaners || 0) + (stats?.unresolved || 0)} items need attention
                </span>
              </div>
              
              <div className="inline-flex rounded-md" role="group">
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-4 py-2 text-sm font-medium ${
                      timeframe === period 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                      } ${
                        period === 'week' ? 'rounded-l-md' : period === 'year' ? 'rounded-r-md' : ''
                      }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        {/* Total Bookings */}
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-4px]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Bookings
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800">
                {stats?.totalBookings || 0}
              </h3>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full 
                  ${(stats?.userGrowth || 0) >= 0 ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'}`}>
                  {(stats?.userGrowth || 0) >= 0 ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> 
                                        : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />}
                  {Math.abs(stats?.userGrowth || 0)}%
                </span>
                <span className="text-xs text-gray-500 ml-1.5">vs. last {timeframe}</span>
              </div>
            </div>
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/admin/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              {stats.pendingBookings} pending
            </span>
          </div>
        </div>
        
        {/* Total Users */}
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-4px]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Users
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800">
                {stats?.totalUsers || 0}
              </h3>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full 
                  ${(stats?.userGrowth || 0) >= 0 ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'}`}>
                  {(stats?.userGrowth || 0) >= 0 ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> 
                                        : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />}
                  {Math.abs(stats?.userGrowth || 0)}%
                </span>
                <span className="text-xs text-gray-500 ml-1.5">vs. last {timeframe}</span>
              </div>
            </div>
            <div className="bg-purple-100 p-2.5 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/admin/users" className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              {stats.activeCleaners} active cleaners
            </span>
          </div>
        </div>
        
        {/* Revenue */}
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-4px]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </h3>
              <div className="flex items-center mt-1">
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full 
                  ${(stats?.revenueGrowth || 0) >= 0 ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'}`}>
                  {(stats?.revenueGrowth || 0) >= 0 ? <ArrowUpRight className="inline h-3 w-3 mr-0.5" /> 
                                          : <ArrowDownRight className="inline h-3 w-3 mr-0.5" />}
                  {Math.abs(stats?.revenueGrowth || 0)}%
                </span>
                <span className="text-xs text-gray-500 ml-1.5">vs. last {timeframe}</span>
              </div>
            </div>
            <div className="bg-teal-100 p-2.5 rounded-lg">
              <DollarSign className="h-5 w-5 text-teal-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/admin/payments" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              Monthly: ${((stats?.totalRevenue || 0) / 12).toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div 
          className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 transition-all duration-200 hover:shadow-md hover:translate-y-[-4px]"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Completion Rate
              </p>
              <h3 className="text-2xl font-bold mt-1 text-gray-800">
                {stats?.completionRate || 0}%
              </h3>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full ${(stats?.completionRate || 0) >= 90 ? 'bg-green-500' : (stats?.completionRate || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'} mr-1.5`}></div>
                <p className="text-xs text-gray-500">
                  {stats?.pendingBookings || 0} pending bookings
                </p>
              </div>
            </div>
            <div className="bg-orange-100 p-2.5 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <Link to="/admin/analytics" className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center">
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
            
            <span className="text-xs text-gray-500">
              Target: 95%
            </span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link to="/admin/cleaners?filter=pending" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <UserCheck className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium">Approve Cleaners</p>
              <p className="text-sm text-gray-600">{stats?.pendingCleaners || 0} pending</p>
            </div>
          </Link>
          
          <Link to="/admin/bookings?filter=unassigned" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Calendar className="h-6 w-6 text-purple-600 mr-3" />
            <div>
              <p className="font-medium">Assign Bookings</p>
              <p className="text-sm text-gray-600">{stats?.pendingBookings || 0} unassigned</p>
            </div>
          </Link>
          
          <Link to="/admin/notifications" className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <Bell className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium">Send Notifications</p>
              <p className="text-sm text-gray-600">All users or specific group</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            style={{ 
              animation: 'fadeInUp 0.3s ease-in-out',
              animationDelay: '0.1s'
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Revenue Overview</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Track platform revenue over time
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
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64">
              {revenueData && revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={revenueData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 font-medium">No revenue data to display yet</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                      Revenue data will appear here as bookings are completed and processed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            style={{ 
              animation: 'fadeInUp 0.3s ease-in-out',
              animationDelay: '0.2s'
            }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Recent Bookings</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Latest service bookings on the platform
                </p>
              </div>
              <Link 
                to="/admin/bookings" 
                className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-100">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-700 font-medium">No recent bookings</p>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  New bookings will appear here as they are created on the platform.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking, index) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.service}</div>
                          <div className="text-xs text-gray-500">{booking.customer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          ${booking.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Recent Payouts */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            style={{ 
              animation: 'fadeInUp 0.3s ease-in-out',
              animationDelay: '0.3s'
            }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Recent Payouts</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Latest payments to cleaners
                </p>
              </div>
              <Link 
                to="/admin/payouts" 
                className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-0.5" />
              </Link>
            </div>

            {recentPayouts.length === 0 ? (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-100">
                <DollarSign className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-700 font-medium">No recent payouts</p>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Payments to cleaners will appear here once processed.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentPayouts.map((payout) => (
                  <div key={payout.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{payout.cleaner}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(payout.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">${payout.amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${payout.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Actions */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            style={{ 
              animation: 'fadeInUp 0.3s ease-in-out',
              animationDelay: '0.2s'
            }}
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800">Pending Actions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Items requiring your attention
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">{stats?.pendingCleaners || 0} pending cleaners</p>
                    <p className="text-xs text-gray-600 mt-0.5">Awaiting account approval</p>
                  </div>
                </div>
                <Link to="/admin/cleaners?filter=pending" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Review
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">{stats?.pendingBookings || 0} pending bookings</p>
                    <p className="text-xs text-gray-600 mt-0.5">Need assignment to cleaners</p>
                  </div>
                </div>
                <Link to="/admin/bookings?filter=pending" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Assign
                </Link>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">{stats?.unresolved || 0} unresolved issues</p>
                    <p className="text-xs text-gray-600 mt-0.5">Customer support tickets</p>
                  </div>
                </div>
                <Link to="/admin/support" className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Resolve
                </Link>
              </div>
            </div>
          </div>
          
          {/* Booking Distribution */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            style={{ 
              animation: 'fadeInUp 0.3s ease-in-out',
              animationDelay: '0.3s'
            }}
          >
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-800">Booking Distribution</h2>
              <p className="text-sm text-gray-500 mt-1">
                Overview of booking statuses
              </p>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                  >
                    {bookingDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        strokeWidth={index === activeIndex ? 2 : 1}
                        stroke={index === activeIndex ? '#fff' : '#fff'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} bookings`, name]}
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
          </div>
          
          {/* System Alerts */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            style={{ 
              animation: 'fadeInUp 0.3s ease-in-out',
              animationDelay: '0.4s'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">System Alerts</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Critical platform notifications
                </p>
              </div>
              <Link 
                to="/admin/alerts" 
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-3">
              {systemAlerts.length > 0 ? (
                systemAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 border rounded-lg ${getAlertStyles(alert.priority)}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        {alert.priority === 'high' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : alert.priority === 'medium' ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <Bell className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-2">
                        <h3 className="text-sm font-medium">{alert.title}</h3>
                        <p className="text-xs mt-1 text-gray-600">{alert.message}</p>
                        <p className="text-xs mt-1 text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <CheckCircle className="h-8 w-8 mb-2" />
                  <p>No active alerts</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Admin Tips */}
          <div 
            className="bg-gradient-to-b from-teal-50 to-white rounded-xl shadow-sm border border-teal-100 p-5"
            style={{ 
              animation: 'fadeInUp 0.3s ease-in-out',
              animationDelay: '0.5s'
            }}
          >
            <div className="flex items-start mb-4">
              <div className="bg-teal-100 rounded-lg p-2 mr-3 mt-1">
                <Info className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Admin Tips</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Recommendations for platform management
                </p>
              </div>
            </div>

            <div className="divide-y divide-teal-100">
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  Monitor cleaner ratings
                </h3>
                <p className="text-xs text-gray-600">
                  Regular reviews of cleaner performance maintain service quality.
                </p>
                <Link to="/admin/cleaners" className="mt-1 text-xs text-teal-700 font-medium inline-block">
                  Check ratings →
                </Link>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  Process payouts promptly
                </h3>
                <p className="text-xs text-gray-600">
                  Timely payments keep cleaners happy and improve retention.
                </p>
                <Link to="/admin/payouts" className="mt-1 text-xs text-teal-700 font-medium inline-block">
                  View pending payouts →
                </Link>
              </div>
              
              <div className="py-3">
                <h3 className="text-sm font-medium text-gray-800 mb-1">
                  Respond to support tickets
                </h3>
                <p className="text-xs text-gray-600">
                  Quick resolution of issues improves customer satisfaction.
                </p>
                <Link to="/admin/support" className="mt-1 text-xs text-teal-700 font-medium inline-block">
                  Check support tickets →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Registrations */}
      <div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-6"
        style={{ 
          animation: 'fadeInUp 0.3s ease-in-out',
          animationDelay: '0.4s'
        }}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">New Registrations</h2>
            <p className="text-sm text-gray-500 mt-1">
              Recently joined users and cleaners
            </p>
          </div>
          <div className="flex space-x-2">
            <Link to="/admin/users" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              All Users
            </Link>
            <span className="text-gray-300">|</span>
            <Link to="/admin/cleaners" className="text-sm font-medium text-teal-600 hover:text-teal-700">
              All Cleaners
            </Link>
          </div>
        </div>
        
        {newRegistrations.length === 0 ? (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-100">
            <User className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-700 font-medium">No recent registrations</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              New user and cleaner registrations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newRegistrations.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                      <User size={18} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(user.joined).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;