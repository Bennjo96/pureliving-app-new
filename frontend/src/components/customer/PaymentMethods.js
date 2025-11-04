// src/components/customer/PaymentMethods.js
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { CreditCard, Plus, Trash, Edit, Check } from 'lucide-react';

const PaymentMethods = () => {
  const { t } = useTranslation();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white pb-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 mb-6 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white">
          <h1 className="text-2xl font-bold">
            {t("Payment Methods")}
          </h1>
          <button
            onClick={openModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white text-teal-600 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("Add Payment Method")}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        // Loading state
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-3 text-gray-500 font-medium">{t("Loading payment methods...")}</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        // Empty state with improved design
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto h-16 w-16 text-gray-300 bg-gray-50 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t("No payment methods")}</h3>
            <p className="mt-2 text-gray-500">
              {t("Add a credit card to make the checkout process faster and easier.")}
            </p>
            <div className="mt-6">
              <button
                onClick={openModal}
                className="inline-flex items-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Add Payment Method")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Card list - this would be populated with actual data
        <div className="space-y-4">
          {/* Sample payment method card - you would map over your payment methods */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2.5 rounded-lg mr-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Visa •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/2025</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                {t("Default")}
              </span>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                {t("Use for next booking")}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Payment Method Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {t("Add Payment Method")}
                  </h3>
                  <button 
                    onClick={closeModal} 
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">{t("Card Number")}</label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  {/* Expiration Date and CVC in one row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiration" className="block text-sm font-medium text-gray-700">{t("Expiration Date")}</label>
                      <input
                        type="text"
                        id="expiration"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        placeholder="MM / YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">{t("CVC")}</label>
                      <input
                        type="text"
                        id="cvc"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  
                  {/* Card Holder Name */}
                  <div>
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700">{t("Cardholder Name")}</label>
                    <input
                      type="text"
                      id="cardHolder"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  {/* Default payment method checkbox */}
                  <div className="flex items-center">
                    <input
                      id="defaultPayment"
                      name="defaultPayment"
                      type="checkbox"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="defaultPayment" className="ml-2 block text-sm text-gray-700">
                      {t("Set as default payment method")}
                    </label>
                  </div>
                  
                  <div className="sm:flex sm:flex-row-reverse pt-4">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={closeModal}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {t("Save Payment Method")}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={closeModal}
                    >
                      {t("Cancel")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;