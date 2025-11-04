import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Calendar, 
  CreditCard, 
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  AlertCircle,
  ArrowUpRight,
  User,
  Search,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Sample data for the earnings chart
const mockEarningsData = [
  { month: 'Jan', amount: 0 },
  { month: 'Feb', amount: 0 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 0 },
  { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 },
  { month: 'Jul', amount: 150 },
  { month: 'Aug', amount: 350 },
  { month: 'Sep', amount: 800 },
  { month: 'Oct', amount: 1200 },
  { month: 'Nov', amount: 1000 },
  { month: 'Dec', amount: 0 }
];

// Sample data for a future implementation
const mockEarningsHistory = [
  {
    id: 'job-1',
    date: '2023-11-15',
    jobType: 'Regular Cleaning',
    clientName: 'Anna Schmidt',
    location: 'Berlin',
    amount: 80.00,
    status: 'paid',
    serviceDuration: '3 hours'
  },
  {
    id: 'job-2',
    date: '2023-11-10',
    jobType: 'Deep Cleaning',
    clientName: 'Mark Weber',
    location: 'Berlin',
    amount: 120.00,
    status: 'paid',
    serviceDuration: '5 hours'
  },
  {
    id: 'job-3',
    date: '2023-11-05',
    jobType: 'Regular Cleaning',
    clientName: 'Sarah Müller',
    location: 'Berlin',
    amount: 80.00,
    status: 'paid',
    serviceDuration: '3 hours'
  },
  {
    id: 'job-4',
    date: '2023-10-28',
    jobType: 'Move-Out Cleaning',
    clientName: 'Thomas Becker',
    location: 'Berlin',
    amount: 150.00,
    status: 'paid',
    serviceDuration: '6 hours'
  },
  {
    id: 'job-5',
    date: '2023-10-20',
    jobType: 'Regular Cleaning',
    clientName: 'Julia Fischer',
    location: 'Berlin',
    amount: 80.00,
    status: 'pending',
    serviceDuration: '3 hours'
  }
];

const CleanerEarnings = () => {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState('6m'); // Options: 1m, 3m, 6m, 1y, all
  const [isPaymentExpanded, setIsPaymentExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, paid, pending
  const [searchTerm, setSearchTerm] = useState('');
  
  // Placeholder for future implementation
  const earningsSummary = {
    currentMonth: 0,
    lastMonth: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    trend: '+0%',
    nextPayment: '2023-12-15',
    nextPaymentAmount: 0,
  };
  
  // Should be replaced with actual data in a real implementation
  const showMockData = true;
  const useEarningsData = showMockData ? mockEarningsHistory : [];
  
  // Filter earnings history based on active tab and search term
  const filteredEarnings = useEarningsData.filter(item => {
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'paid' && item.status === 'paid') ||
                      (activeTab === 'pending' && item.status === 'pending');
                      
    const matchesSearch = searchTerm === '' || 
                         item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.jobType.toLowerCase().includes(searchTerm.toLowerCase());
                         
    return matchesTab && matchesSearch;
  });
  
  // Get chart data based on timeframe
  const getChartData = () => {
    switch(timeframe) {
      case '1m':
        return mockEarningsData.slice(-1);
      case '3m':
        return mockEarningsData.slice(-3);
      case '6m':
        return mockEarningsData.slice(-6);
      case '1y':
      default:
        return mockEarningsData;
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Section with Visual Enhancement */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 p-8 text-white shadow-lg">
        <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-white opacity-10"></div>
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white opacity-10"></div>
        
        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">{t("My Earnings")}</h1>
          <p className="text-teal-100">{t("Track your earnings and payment history")}</p>
          
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-teal-100 text-sm">{t("This Month")}</p>
              <div className="flex items-center mt-1">
                <h3 className="text-2xl font-bold">€{earningsSummary.currentMonth.toFixed(2)}</h3>
                {earningsSummary.trend !== '+0%' && (
                  <span className="ml-2 flex items-center text-xs font-medium text-teal-100">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {earningsSummary.trend}
                  </span>
                )}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-teal-100 text-sm">{t("Pending Payments")}</p>
              <div className="flex items-center mt-1">
                <h3 className="text-2xl font-bold">€{earningsSummary.pendingPayments.toFixed(2)}</h3>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-teal-100 text-sm">{t("Total Earnings")}</p>
              <div className="flex items-center mt-1">
                <h3 className="text-2xl font-bold">€{earningsSummary.totalEarnings.toFixed(2)}</h3>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <p className="text-teal-100 text-sm">{t("Next Payment")}</p>
              <div className="flex items-center mt-1">
                <h3 className="text-2xl font-bold">€{earningsSummary.nextPaymentAmount.toFixed(2)}</h3>
              </div>
              <p className="text-xs text-teal-100 mt-1">
                {formatDate(earningsSummary.nextPayment)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Earnings Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{t("Earnings Trend")}</h2>
                  <p className="text-gray-600 text-sm mt-1">{t("Your earnings over time")}</p>
                </div>
                
                <div className="flex space-x-2">
                  {["1m", "3m", "6m", "1y"].map((period) => (
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
            </div>
            
            <div className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
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
                      labelFormatter={(label) => `${label}`}
                      contentStyle={{ 
                        borderRadius: '8px', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                        border: 'none'
                      }}
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
              </div>
            </div>
          </div>

          {/* Earnings History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{t("Earnings History")}</h2>
                  <p className="text-gray-600 text-sm mt-1">{t("Detailed breakdown of completed jobs")}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t("Search client or job type")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Export button */}
                  <button className="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    {t("Export")}
                  </button>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-4 mt-6 border-b border-gray-100">
                {[
                  { id: 'all', label: t('All Jobs') },
                  { id: 'paid', label: t('Paid') },
                  { id: 'pending', label: t('Pending') }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-teal-600 border-b-2 border-teal-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredEarnings.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto max-w-md">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">{t("No earnings found")}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchTerm 
                      ? t("No jobs match your search. Try different terms or clear filters.")
                      : t("Complete jobs will appear here with payment details.")}
                  </p>
                  
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 text-sm text-teal-600 font-medium hover:text-teal-700"
                    >
                      {t("Clear search")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("Date")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("Client")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("Service")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("Amount")}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("Status")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEarnings.map((earning) => (
                      <tr key={earning.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(earning.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{earning.clientName}</div>
                              <div className="text-xs text-gray-500">{earning.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{earning.jobType}</div>
                          <div className="text-xs text-gray-400">{earning.serviceDuration}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €{earning.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${earning.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {t(earning.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination placeholder for future implementation */}
            {filteredEarnings.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {t("Showing {{count}} entries", { count: filteredEarnings.length })}
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                    {t("Previous")}
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50">
                    {t("Next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          {/* Payment Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 border-b border-gray-100 flex justify-between items-center cursor-pointer"
              onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
            >
              <h2 className="text-xl font-semibold text-gray-900">{t("Payment Information")}</h2>
              <button className="text-gray-400 hover:text-gray-600">
                {isPaymentExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {isPaymentExpanded && (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{t("Payment Schedule")}</h3>
                    <p className="text-gray-500 text-sm">
                      {t("Payment processed on the 15th of each month")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <CreditCard className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{t("Payment Method")}</h3>
                    <p className="text-gray-500 text-sm">
                      {t("Bank Transfer (SEPA)")}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="font-medium text-gray-800 mb-3">{t("Banking Information")}</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div className="text-gray-500">{t("Account Holder")}:</div>
                      <div className="text-gray-900 font-medium">John Smith</div>
                      
                      <div className="text-gray-500">{t("IBAN")}:</div>
                      <div className="text-gray-900 font-medium">DE••••••••••••••••••89</div>
                      
                      <div className="text-gray-500">{t("Bank")}:</div>
                      <div className="text-gray-900 font-medium">Deutsche Bank</div>
                    </div>
                    
                    <button className="mt-4 w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-medium">
                      {t("Update Banking Information")}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Tax Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">{t("Tax Information")}</h2>
            </div>
            
            <div className="p-6">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md mb-6">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-amber-700 text-sm font-medium">{t("Tax Reminder")}</p>
                    <p className="text-amber-600 text-sm mt-1">
                      {t("You're responsible for reporting your income and paying applicable taxes.")}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <a 
                  href="#" 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-teal-600 mr-3" />
                    <div>
                      <h3 className="text-gray-800 font-medium">{t("Annual Income Statement")}</h3>
                      <p className="text-gray-500 text-sm">{t("Download for tax filing")}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Download className="h-5 w-5 text-teal-600 mr-3" />
                    <div>
                      <h3 className="text-gray-800 font-medium">{t("Monthly Statements")}</h3>
                      <p className="text-gray-500 text-sm">{t("Download monthly earnings reports")}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </a>
              </div>
            </div>
          </div>
          
          {/* Help Resources */}
          <div className="bg-teal-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{t("Need Help?")}</h3>
            
            <div className="space-y-3">
              <a href="#" className="flex items-center text-teal-700 hover:text-teal-800">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                <span className="text-sm">{t("Understanding your payments")}</span>
              </a>
              
              <a href="#" className="flex items-center text-teal-700 hover:text-teal-800">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                <span className="text-sm">{t("Tax guidelines for cleaners")}</span>
              </a>
              
              <a href="#" className="flex items-center text-teal-700 hover:text-teal-800">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                <span className="text-sm">{t("Contact support about payments")}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanerEarnings;