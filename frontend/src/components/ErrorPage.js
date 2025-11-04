// src/components/ErrorPage.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * ErrorPage component
 * Displays error information with options to navigate back or home
 * @param {string} title - Error title
 * @param {string} message - Error message
 * @param {boolean} showContactSupport - Whether to show contact support option
 */
const ErrorPage = ({ 
  title = "Something went wrong", 
  message = "We're sorry, but we encountered an unexpected error.", 
  showContactSupport = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Error icon */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
          <svg 
            className="h-12 w-12 text-red-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        
        {/* Error content */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="group relative w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go Back
          </button>
          
          <Link
            to="/"
            className="group relative w-full sm:w-auto flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return Home
          </Link>
        </div>
        
        {/* Support link */}
        {showContactSupport && (
          <div className="text-sm text-gray-500 mt-8">
            <span>Need help? </span>
            <Link to="/contact" className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact our support team
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;