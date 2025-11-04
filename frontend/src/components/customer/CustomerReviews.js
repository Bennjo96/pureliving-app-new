// src/components/customer/CustomerReviews.js
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Star, ExternalLink } from 'lucide-react';

const CustomerReviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="bg-white pb-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 mb-6 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white">
          <div>
            <h1 className="text-2xl font-bold">
              {t("My Reviews")}
            </h1>
            <p className="text-teal-100 mt-1">
              {t("Reviews you've left for our cleaning services")}
            </p>
          </div>
          
          {/* This button could link to Trustpilot in the future */}
          <a
            href="#"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white text-teal-600 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            {t("View All Reviews")}
          </a>
        </div>
      </div>
      
      {isLoading ? (
        // Loading state
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-3 text-gray-500 font-medium">{t("Loading reviews...")}</p>
        </div>
      ) : reviews.length === 0 ? (
        // Empty state
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto h-16 w-16 text-gray-300 bg-gray-50 rounded-full flex items-center justify-center">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t("No reviews yet")}</h3>
            <p className="mt-2 text-gray-500">
              {t("After your cleaning service is completed, you'll be able to share your feedback and rate your experience.")}
            </p>
            <div className="mt-6">
              <a 
                href="#" 
                className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center"
              >
                {t("View upcoming services")}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      ) : (
        // This would show the list of reviews the customer has left
        // You can implement this when needed or when integrating with Trustpilot
        <div className="space-y-4">
          {/* Example review card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Regular Cleaning Service</h3>
              <span className="text-sm text-gray-500">March 15, 2023</span>
            </div>
            
            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="h-5 w-5 text-yellow-400 fill-current" 
                />
              ))}
            </div>
            
            <p className="text-gray-600 text-sm">
              "The cleaning service was excellent. Very thorough and professional. Would definitely use again!"
            </p>
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Service by: <span className="font-medium">Maria Johnson</span>
              </span>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t("Edit Review")}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Trustpilot Branding (optional for future integration) */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-100 text-center">
        <p className="text-sm text-gray-500 mb-2">
          {t("Reviews are powered by")}
        </p>
        <div className="flex justify-center">
          {/* Placeholder for Trustpilot logo */}
          <div className="bg-[#00b67a] text-white font-bold px-2 py-1 rounded inline-flex items-center">
            <Star className="h-4 w-4 mr-1 fill-current" />
            <span>Trustpilot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;