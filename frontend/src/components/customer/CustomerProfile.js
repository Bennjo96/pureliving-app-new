// src/components/customer/CustomerProfile.js
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Save } from 'lucide-react';

const CustomerProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Set up form state - initialize from user context but don't use dummy data
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Toggle edit mode
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle profile update logic here
    setIsEditing(false);
  };

  return (
    <div className="bg-white pb-6">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 mb-6 rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-white">
          <h1 className="text-2xl font-bold">
            {t("Your Profile")}
          </h1>
          <button
            onClick={toggleEdit}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white text-teal-600 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            {isEditing ? t("Cancel") : t("Edit Profile")}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Avatar and basic info */}
          <div className="px-6 py-6 flex flex-col sm:flex-row items-center">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-teal-50 flex items-center justify-center mb-4 sm:mb-0">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user?.firstName} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <User className="h-12 w-12 text-teal-300" />
              )}
            </div>
            <div className="ml-0 sm:ml-6 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : t("Your Name")}
              </h2>
              {user?.createdAt && (
                <p className="text-gray-500">
                  {t("Customer since")} {new Date(user.createdAt).toLocaleDateString()}
                </p>
              )}
              {isEditing && (
                <button 
                  type="button"
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t("Change Profile Picture")}
                </button>
              )}
            </div>
          </div>
          
          {/* Profile fields */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {t("First name")}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md
                      ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {t("Last name")}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md
                      ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t("Email address")}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`pl-10 shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md
                      ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t("Phone number")}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`pl-10 shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md
                      ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          {isEditing && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={toggleEdit}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {t("Save Changes")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;