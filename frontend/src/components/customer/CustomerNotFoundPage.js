import React from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Home, 
  Calendar, 
  MapPin, 
  CreditCard, 
  ChevronRight,
  Star
} from "lucide-react";

const CustomerNotFoundPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-blue-50 p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Page Not Found</h3>
          </div>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-12 h-12 text-blue-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            This page doesn't exist
          </h1>
          
          <p className="text-gray-600 text-center max-w-md mb-8">
            The page you're looking for could not be found. It might have been moved or you may have mistyped the URL.
          </p>
          
          <Link
            to="/customer/dashboard"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors mb-8"
          >
            Go to Your Dashboard
          </Link>
          
          <div className="w-full max-w-md">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Quick Navigation
            </h4>
            
            <div className="grid gap-3">
              <Link
                to="/customer/dashboard"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Dashboard</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                to="/customer/bookings"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Your Bookings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                to="/customer/addresses"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Saved Addresses</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                to="/customer/payment-methods"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Payment Methods</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                to="/booking"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-teal-50 hover:bg-teal-100"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">Book a New Cleaning</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerNotFoundPage;