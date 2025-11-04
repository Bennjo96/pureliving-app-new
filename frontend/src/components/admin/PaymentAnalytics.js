// frontend/src/components/admin/PaymentAnalytics.js
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  DollarSign,
  CreditCard,
  Wallet,
  ArrowUpCircle,
  Calendar,
  ArrowDownCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Users,
  Download,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronsUp,
  ChevronsDown,
  Tag,
  Search,
  PiggyBank,
  CreditCard as CardIcon,
} from "lucide-react";
import { adminService, handleApiError } from "../../api/api";
import { format, subDays, subMonths, parseISO } from "date-fns";

const PaymentAnalytics = () => {
  // State management
  const [timeframe, setTimeframe] = useState("month");
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [exportFormat, setExportFormat] = useState("csv");
  const [exportLoading, setExportLoading] = useState(false);
  const [customRange, setCustomRange] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [payoutStatus, setPayoutStatus] = useState("all");
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);

  // Set date range when timeframe changes
  useEffect(() => {
    if (timeframe === "week") {
      setCustomRange({
        startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
      });
    } else if (timeframe === "month") {
      setCustomRange({
        startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
      });
    } else if (timeframe === "quarter") {
      setCustomRange({
        startDate: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
      });
    } else if (timeframe === "year") {
      setCustomRange({
        startDate: format(subMonths(new Date(), 12), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [timeframe]);

  // Initial data fetch
  useEffect(() => {
    fetchPaymentAnalytics();
  }, [timeframe, selectedPaymentMethod, payoutStatus, customRange]);

  const fetchPaymentAnalytics = async () => {
    try {
      setLoading(true);
      let params = {
        timeframe,
        paymentMethod:
          selectedPaymentMethod !== "all" ? selectedPaymentMethod : undefined,
        payoutStatus: payoutStatus !== "all" ? payoutStatus : undefined,
        startDate: customRange.startDate,
        endDate: customRange.endDate,
        tab: activeTab,
        comparePrevious: compareWithPrevious,
      };
      const response = await adminService.getPaymentAnalytics(params);
      setPaymentData(response.data || getDefaultPaymentData());
      setError(null);
      setLastRefreshed(new Date());
    } catch (error) {
      setPaymentData(getDefaultPaymentData());
      const apiError = handleApiError(error);
      setError(apiError.message);
      console.error("Error fetching payment analytics:", apiError);
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
        paymentMethod:
          selectedPaymentMethod !== "all" ? selectedPaymentMethod : undefined,
        payoutStatus: payoutStatus !== "all" ? payoutStatus : undefined,
        startDate: customRange.startDate,
        endDate: customRange.endDate,
        format: exportFormat,
        tab: activeTab,
      };
      const response = await adminService.exportPaymentAnalytics(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `payment-analytics-${activeTab}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.${exportFormat}`
      );
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

  // Default data to avoid undefined errors
  const getDefaultPaymentData = () => ({
    overview: {
      totalRevenue: 0,
      previousTotalRevenue: 0,
      commissionEarnings: 0,
      previousCommissionEarnings: 0,
      totalPayouts: 0,
      previousTotalPayouts: 0,
      pendingPayouts: 0,
      previousPendingPayouts: 0,
      failedPayments: 0,
      previousFailedPayments: 0,
      totalRefunds: 0,
      previousTotalRefunds: 0,
      avgTicketSize: 0,
      previousAvgTicketSize: 0,
      vatAmount: 0,
      previousVatAmount: 0,
    },
    revenueByMethod: [],
    revenueByService: [],
    transactionHistory: [],
    pendingPayouts: [],
    completedPayouts: [],
    topEarningCleaners: [],
    refundsByReason: [],
    failedPaymentsByReason: [],
    taxSummary: {
      vatCollected: 0,
      vatRate: 19,
      netRevenue: 0,
      grossRevenue: 0,
      invoicesGenerated: 0,
    },
    forecasts: {
      nextMonth: 0,
      nextQuarter: 0,
      trend: "stable",
    },
    alerts: [],
  });

  // Calculate change percentages for stats cards
  const getChangeData = (current, previous) => {
    if (!previous || previous === 0)
      return { change: "N/A", changeType: "neutral" };
    const changePercent = ((current - previous) / previous) * 100;
    return {
      change: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}%`,
      changeType: changePercent >= 0 ? "increase" : "decrease",
    };
  };

  // Payment Stats Card Component
  const PaymentStatCard = ({ title, value, icon: Icon, current, previous }) => {
    const { change, changeType } = getChangeData(current, previous);
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all hover:shadow-md hover:translate-y-[-2px]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {change !== "N/A" && (
              <div className="flex items-center mt-2">
                {changeType === "increase" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : changeType === "decrease" ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <p
                  className={`text-sm ${
                    changeType === "increase"
                      ? "text-green-500"
                      : changeType === "decrease"
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
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
  };

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

  // Alert component
  const AlertBox = ({ title, message, type }) => (
    <div
      className={`p-4 rounded-lg mb-4 flex items-start border ${
        type === "warning"
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : type === "danger"
          ? "bg-red-50 text-red-800 border-red-200"
          : "bg-blue-50 text-blue-800 border-blue-200"
      }`}
    >
      <AlertTriangle
        className={`h-5 w-5 mr-2 flex-shrink-0 ${
          type === "warning"
            ? "text-amber-500"
            : type === "danger"
            ? "text-red-500"
            : "text-blue-500"
        }`}
      />
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Memoized data to avoid unnecessary re-renders
  const revenueByMethod = useMemo(
    () => paymentData?.revenueByMethod || [],
    [paymentData?.revenueByMethod]
  );
  const revenueByService = useMemo(
    () => paymentData?.revenueByService || [],
    [paymentData?.revenueByService]
  );
  const transactionHistory = useMemo(
    () => paymentData?.transactionHistory || [],
    [paymentData?.transactionHistory]
  );
  const failedPaymentsByReason = useMemo(
    () => paymentData?.failedPaymentsByReason || [],
    [paymentData?.failedPaymentsByReason]
  );
  const refundsByReason = useMemo(
    () => paymentData?.refundsByReason || [],
    [paymentData?.refundsByReason]
  );
  const topEarningCleaners = useMemo(
    () => paymentData?.topEarningCleaners || [],
    [paymentData?.topEarningCleaners]
  );
  const alerts = useMemo(
    () => paymentData?.alerts || [],
    [paymentData?.alerts]
  );

  // Loading Indicator
  if (loading && !paymentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Error State
  if (error && !paymentData) {
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
              Error Loading Payment Analytics
            </h3>
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={fetchPaymentAnalytics}
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
            <h1 className="text-2xl font-bold">Payment Analytics</h1>
            <p className="text-teal-100 mt-1">
              Track platform financials, revenue trends, and payment insights
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-4">
              <p className="text-teal-100 text-sm">
                Last refreshed: {format(lastRefreshed, "MMM d, yyyy HH:mm:ss")}
              </p>
              <button
                onClick={fetchPaymentAnalytics}
                className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 flex items-center justify-center"
                aria-label="Refresh data"
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
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
          {/* Timeframe selector */}
          <div className="relative flex-grow">
            <div className="flex items-center">
              <span className="text-gray-700 mr-2">Timeframe:</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>

          {/* Payment method filter */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="rounded-md border-gray-300 focus:border-teal-500 focus:ring focus:ring-teal-200"
            >
              <option value="all">All Payment Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="sofort">Sofort</option>
              <option value="sepa">SEPA</option>
            </select>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              showFilters
                ? "bg-teal-50 text-teal-600 border-teal-200"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Filter size={18} className="mr-2" />
            More Filters
            {showFilters ? (
              <ChevronUp size={16} className="ml-2" />
            ) : (
              <ChevronDown size={16} className="ml-2" />
            )}
          </button>

          {/* Export Button */}
          <div className="flex">
            <select
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

          {/* Compare toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
            <input
              type="checkbox"
              id="compareWithPrevious"
              checked={compareWithPrevious}
              onChange={() => setCompareWithPrevious(!compareWithPrevious)}
              className="mr-2"
            />
            <label
              htmlFor="compareWithPrevious"
              className="text-sm text-gray-700"
            >
              Compare periods
            </label>
          </div>
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range */}
            {timeframe === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={customRange.startDate}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        startDate: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min={customRange.startDate}
                  />
                </div>
              </>
            )}
            {/* Payout Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payout Status
              </label>
              <select
                value={payoutStatus}
                onChange={(e) => setPayoutStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, ID or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 pl-9 border border-gray-300 rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {error && !loading && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Tab navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100"
      >
        <div className="overflow-x-auto">
          <div className="flex p-2 space-x-1">
            <TabButton
              id="overview"
              label="Overview"
              icon={FileText}
              active={activeTab === "overview"}
            />
            <TabButton
              id="revenue"
              label="Revenue"
              icon={DollarSign}
              active={activeTab === "revenue"}
            />
            <TabButton
              id="payouts"
              label="Payouts"
              icon={Wallet}
              active={activeTab === "payouts"}
            />
            <TabButton
              id="refunds"
              label="Refunds"
              icon={ArrowDownCircle}
              active={activeTab === "refunds"}
            />
            <TabButton
              id="failed"
              label="Failed Payments"
              icon={AlertCircle}
              active={activeTab === "failed"}
            />
            <TabButton
              id="tax"
              label="Tax & VAT"
              icon={Tag}
              active={activeTab === "tax"}
            />
          </div>
        </div>
      </motion.div>

      {loading && paymentData ? (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
        </div>
      ) : paymentData ? (
        <>
          {/* Alerts panel */}
          {alerts && alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold mb-3">Payment Alerts</h3>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
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
          {activeTab === "overview" && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <PaymentStatCard
                  title="Total Revenue"
                  value={formatCurrency(
                    paymentData?.overview?.totalRevenue || 0
                  )}
                  icon={DollarSign}
                  current={paymentData?.overview?.totalRevenue || 0}
                  previous={paymentData?.overview?.previousTotalRevenue || 0}
                />
                <PaymentStatCard
                  title="Commission Earnings"
                  value={formatCurrency(
                    paymentData?.overview?.commissionEarnings || 0
                  )}
                  icon={PiggyBank}
                  current={paymentData?.overview?.commissionEarnings || 0}
                  previous={
                    paymentData?.overview?.previousCommissionEarnings || 0
                  }
                />
                <PaymentStatCard
                  title="Total Payouts"
                  value={formatCurrency(
                    paymentData?.overview?.totalPayouts || 0
                  )}
                  icon={Wallet}
                  current={paymentData?.overview?.totalPayouts || 0}
                  previous={paymentData?.overview?.previousTotalPayouts || 0}
                />
                <PaymentStatCard
                  title="Average Booking Value"
                  value={formatCurrency(
                    paymentData?.overview?.avgTicketSize || 0
                  )}
                  icon={CreditCard}
                  current={paymentData?.overview?.avgTicketSize || 0}
                  previous={paymentData?.overview?.previousAvgTicketSize || 0}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
                  {transactionHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={transactionHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Revenue",
                          ]}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          name="Revenue"
                          stroke="#0d9488"
                          fill="#0d948833"
                          activeDot={{ r: 8 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">
                      No revenue trend data available.
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4">
                    Revenue by Payment Method
                  </h3>
                  {revenueByMethod.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenueByMethod}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#0d9488"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {revenueByMethod.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${index * 30 + 180}, 70%, 50%)`}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
                            "Revenue",
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500">
                      No payment method data available.
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 mt-8"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Top Earning Cleaners
                    </h3>
                    <span className="text-sm text-gray-500">
                      For{" "}
                      {timeframe === "week"
                        ? "the last 7 days"
                        : timeframe === "month"
                        ? "the last 30 days"
                        : timeframe === "quarter"
                        ? "the last 3 months"
                        : "the last year"}
                    </span>
                  </div>
                  {topEarningCleaners.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {/* Fixed header: removed duplicate tag */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cleaner
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Completed Bookings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Earnings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Commission Paid
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pending Payout
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {topEarningCleaners.map((cleaner, index) => (
                            <tr
                              key={`cleaner-${index}`}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {cleaner.name.charAt(0)}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {cleaner.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {cleaner.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {cleaner.completedBookings}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency(cleaner.totalEarnings)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatCurrency(cleaner.commissionPaid)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ({(cleaner.commissionRate * 100).toFixed(1)}%)
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {formatCurrency(cleaner.pendingPayout)}
                                </div>
                                {cleaner.payoutDate && (
                                  <div className="text-xs text-gray-500">
                                    Due: {cleaner.payoutDate}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      No cleaner earnings data available.
                    </p>
                  )}
                </div>
              </motion.div>
            </>
          )}

          {/* (Other tabs for Payouts, Refunds, Failed Payments, and Tax & VAT would follow a similar pattern.) */}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <DollarSign size={48} className="text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-500">
              No payment analytics data available
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              There's currently no data to analyze. Try changing the timeframe
              or come back later.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              onClick={fetchPaymentAnalytics}
            >
              <RefreshCw className="inline-block mr-1 h-4 w-4" /> Refresh Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentAnalytics;
