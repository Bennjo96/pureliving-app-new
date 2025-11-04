// src/components/customer/CustomerBookings.js
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  User, 
  Search,
  ChevronRight
} from 'lucide-react';

const CustomerBookings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // We'll set up tabs that can be clicked to filter bookings
  const tabs = [
    { id: 'upcoming', label: t("Upcoming") },
    { id: 'completed', label: t("Completed") },
    { id: 'cancelled', label: t("Cancelled") }
  ];

  return (
    <div className="bg-white pb-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 mb-6 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white">
          <h1 className="text-2xl font-bold">
            {t("My Bookings")}
          </h1>
          <Link
            to="/booking"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white text-teal-600 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Calendar className="mr-2 h-5 w-5" />
            {t("Book New Service")}
          </Link>
        </div>
      </div>
      
      {/* Booking tabs with clean styling */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 font-medium text-sm border-b-2 transition-colors
                ${activeTab === tab.id 
                  ? 'border-teal-500 text-teal-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Optional search bar */}
      <div className="mb-6">
        <div className="relative rounded-md shadow-sm max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            placeholder={t("Search bookings...")}
          />
        </div>
      </div>
      
      {isLoading ? (
        // Loading state
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-3 text-gray-500 font-medium">{t("Loading bookings...")}</p>
        </div>
      ) : bookings.length === 0 ? (
        // Empty state with improved design
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto h-16 w-16 text-gray-300 bg-gray-50 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t("No bookings found")}</h3>
            <p className="mt-2 text-gray-500">
              {activeTab === 'upcoming' 
                ? t("You don't have any upcoming cleaning services scheduled.") 
                : activeTab === 'completed'
                ? t("You haven't completed any cleaning services yet.")
                : t("You don't have any cancelled bookings.")}
            </p>
            <div className="mt-6">
              <Link
                to="/booking"
                className="inline-flex items-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                {t("Book a Service")}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        // Booking list - this will be populated when you integrate with API
        <div className="space-y-4">
          {/* This is a placeholder for future booking data - you'll map over your actual bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      {t("Confirmed")}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      {t("Booking ID:")} BOOK12345
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-gray-900">
                    {t("Regular Cleaning")}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">€75.00</div>
                  <div className="text-sm text-gray-500">{t("Paid")}</div>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-4 bg-gray-50">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>May 15, 2023 • 10:00 AM</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>123 Main Street, Apt 5, City</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <User className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>Maria Johnson</span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <div>
                  <button className="mr-2 text-sm font-medium text-teal-600 hover:text-teal-500">
                    {t("Reschedule")}
                  </button>
                  <button className="text-sm font-medium text-red-600 hover:text-red-500">
                    {t("Cancel")}
                  </button>
                </div>
                
                <Link
                  to="/customer/bookings/BOOK12345"
                  className="text-sm font-medium text-teal-600 hover:text-teal-500 flex items-center"
                >
                  {t("View Details")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* This is a pagination component you can implement when needed */}
          <div className="flex items-center justify-center pt-4">
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
              {t("Previous")}
            </button>
            <span className="px-4 py-1 text-sm bg-white border-t border-b border-gray-300">
              {t("Page")} 1 {t("of")} 1
            </span>
            <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
              {t("Next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;