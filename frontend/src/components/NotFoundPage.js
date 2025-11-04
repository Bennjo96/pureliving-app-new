import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronRight } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8">
            The page you are looking for does not exist. It might have been moved or deleted.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 mb-4 w-full justify-center"
          >
            Return to Home Page
          </Link>
          
          <div className="mt-6 grid grid-cols-1 gap-3">
            <Link
              to="/services"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Our Services</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link
              to="/booking"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Book a Cleaning</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link
              to="/login"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">Login</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link
              to="/signup"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 bg-teal-50"
            >
              <span className="text-sm font-medium text-teal-700">Create an Account</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;