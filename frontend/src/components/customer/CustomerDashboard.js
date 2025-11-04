// src/components/customer/CustomerDashboard.js
import React from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  CreditCard, 
  MapPin,
  Clock,
  ChevronRight
} from 'lucide-react';

const CustomerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="pb-10 bg-white">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg shadow-md p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5">
          <svg width="300" height="150" viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5,21.5h49.251c0,0-20.865-17.472-37.958-5.433C-4.303,28.108,1.5,21.5,1.5,21.5z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold">
              {t("Hello, {{name}}", { name: user?.firstName || "Customer" })}
            </h1>
            <p className="text-teal-100 mt-1">
              {t("Welcome to your Customer Dashboard")}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link 
              to="/booking" 
              className="bg-white hover:bg-white/90 text-teal-600 transition-colors rounded-md px-4 py-2 text-center inline-block font-medium"
            >
              {t("Book a Cleaning")}
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">{t("Quick Actions")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link 
            to="/booking" 
            className="group bg-gradient-to-br from-teal-50 to-white hover:from-teal-100 hover:to-teal-50 border border-teal-100 rounded-xl p-4 transition-all duration-200 flex items-center"
          >
            <div className="p-3 bg-teal-100 group-hover:bg-teal-200 rounded-full mr-4 transition-colors duration-200">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">{t("Book a Service")}</p>
              <p className="text-sm text-gray-500">{t("Schedule a cleaning")}</p>
            </div>
          </Link>
          
          <Link 
            to="/customer/payment-methods" 
            className="group bg-gradient-to-br from-amber-50 to-white hover:from-amber-100 hover:to-amber-50 border border-amber-100 rounded-xl p-4 transition-all duration-200 flex items-center"
          >
            <div className="p-3 bg-amber-100 group-hover:bg-amber-200 rounded-full mr-4 transition-colors duration-200">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">{t("Payment Methods")}</p>
              <p className="text-sm text-gray-500">{t("Manage payments")}</p>
            </div>
          </Link>
          
          <Link 
            to="/customer/addresses" 
            className="group bg-gradient-to-br from-indigo-50 to-white hover:from-indigo-100 hover:to-indigo-50 border border-indigo-100 rounded-xl p-4 transition-all duration-200 flex items-center"
          >
            <div className="p-3 bg-indigo-100 group-hover:bg-indigo-200 rounded-full mr-4 transition-colors duration-200">
              <MapPin className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700">{t("Addresses")}</p>
              <p className="text-sm text-gray-500">{t("Manage locations")}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">{t("Your Upcoming Bookings")}</h2>
            <Link 
              to="/customer/bookings" 
              className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
            >
              {t("View all")}
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
        </div>

        <div className="text-center py-10 px-4">
          <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-700 font-medium">{t("No upcoming bookings")}</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            {t("You don't have any scheduled cleanings yet")}
          </p>
          <Link 
            to="/booking" 
            className="mt-4 inline-block text-sm bg-teal-500 hover:bg-teal-600 text-white font-medium px-5 py-2 rounded-md transition-colors"
          >
            {t("Book Now")}
          </Link>
        </div>
      </div>

      {/* Special Offers */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-100 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-bold text-gray-700">{t("Special Offer")}</h2>
            <p className="text-gray-600 mt-1">
              {t("Get 15% off your first cleaning service with code WELCOME15")}
            </p>
          </div>
          <Link 
            to="/booking?promo=WELCOME15" 
            className="bg-blue-500 hover:bg-blue-600 text-white transition-colors rounded-md px-4 py-2 text-center inline-block font-medium"
          >
            {t("Claim Offer")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;