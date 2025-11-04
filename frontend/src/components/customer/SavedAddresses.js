// src/components/customer/SavedAddresses.js
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { 
  MapPin, 
  Plus, 
  Home, 
  Briefcase, 
  Heart, 
  MoreVertical, 
  Edit, 
  Trash, 
  X, 
  Check,
  Star
} from 'lucide-react';

const SavedAddresses = () => {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sample address categories
  const addressTypes = [
    { id: 'home', label: t('Home'), icon: Home },
    { id: 'work', label: t('Work'), icon: Briefcase },
    { id: 'other', label: t('Other'), icon: Heart }
  ];

  const openAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  // This would be connected to your API to add the address
  const handleAddAddress = (event) => {
    event.preventDefault();
    // Process form data and add address
    closeAddressModal();
  };

  return (
    <div className="bg-white pb-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 mb-6 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white">
          <h1 className="text-2xl font-bold">
            {t("Saved Addresses")}
          </h1>
          <button
            onClick={openAddressModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white text-teal-600 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            {t("Add New Address")}
          </button>
        </div>
      </div>
      
      {isLoading ? (
        // Loading state
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-3 text-gray-500 font-medium">{t("Loading addresses...")}</p>
        </div>
      ) : addresses.length === 0 ? (
        // Empty state with improved design
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center max-w-md mx-auto">
            <div className="mx-auto h-16 w-16 text-gray-300 bg-gray-50 rounded-full flex items-center justify-center">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">{t("No saved addresses")}</h3>
            <p className="mt-2 text-gray-500">
              {t("Save your home, work, or other addresses to make booking services faster and easier.")}
            </p>
            <div className="mt-6">
              <button
                onClick={openAddressModal}
                className="inline-flex items-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Add Your First Address")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Address cards - this will be populated when you integrate with API
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* This is a sample address card - you'll map over your actual addresses */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="absolute top-2 right-2">
              <div className="relative">
                <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                  <MoreVertical className="h-5 w-5" />
                </button>
                
                {/* Dropdown menu for edit/delete - would be controlled by state */}
                <div className="hidden absolute right-0 mt-1 w-40 bg-white rounded-md shadow-md z-10 border border-gray-100">
                  <div className="py-1">
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Edit className="h-4 w-4 mr-2 text-gray-500" />
                      {t("Edit")}
                    </button>
                    <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      <Trash className="h-4 w-4 mr-2 text-red-500" />
                      {t("Delete")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Default address badge */}
            <div className="absolute top-2 left-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                {t("Default")}
              </span>
            </div>
            
            <div className="pt-8 px-4 pb-4">
              <div className="flex items-start mb-3">
                <div className="bg-teal-100 p-2 rounded-lg mr-3">
                  <Home className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{t("Home")}</h3>
                  <p className="text-sm text-gray-500">
                    123 Main Street, Apt 5
                  </p>
                  <p className="text-sm text-gray-500">
                    New York, NY 10001
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  {t("Edit")}
                </button>
                <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  {t("Use This Address")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeAddressModal}></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {t("Add New Address")}
                  </h3>
                  <button 
                    onClick={closeAddressModal} 
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleAddAddress} className="mt-4">
                  {/* Address Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("Address Type")}</label>
                    <div className="flex space-x-3">
                      {addressTypes.map(type => (
                        <label key={type.id} className="flex-1">
                          <input 
                            type="radio" 
                            name="addressType" 
                            value={type.id} 
                            className="sr-only" 
                            defaultChecked={type.id === 'home'} 
                          />
                          <div className="cursor-pointer flex flex-col items-center p-3 border border-gray-200 rounded-lg peer-checked:border-teal-500 peer-checked:bg-teal-50 hover:bg-gray-50">
                            <type.icon className="h-5 w-5 text-gray-500" />
                            <span className="mt-1 text-sm text-gray-500">{type.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Street Address */}
                  <div className="mb-4">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("Street Address")}
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      className="focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  
                  {/* Apartment, Suite, etc. */}
                  <div className="mb-4">
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("Apartment, Suite, etc.")} <span className="text-gray-500">{t("(optional)")}</span>
                    </label>
                    <input
                      type="text"
                      id="unit"
                      name="unit"
                      className="focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Apt 1A"
                    />
                  </div>
                  
                  {/* City, State, Zip */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("City")}
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        className="focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("Zip Code")}
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        className="focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Make Default */}
                  <div className="mt-2 mb-4">
                    <div className="flex items-center">
                      <input
                        id="defaultAddress"
                        name="defaultAddress"
                        type="checkbox"
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="defaultAddress" className="ml-2 block text-sm text-gray-700">
                        {t("Set as default address")}
                      </label>
                    </div>
                  </div>
                  
                  <div className="sm:flex sm:flex-row-reverse mt-5 gap-3">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {t("Save Address")}
                    </button>
                    <button
                      type="button"
                      onClick={closeAddressModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:w-auto sm:text-sm"
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

export default SavedAddresses;