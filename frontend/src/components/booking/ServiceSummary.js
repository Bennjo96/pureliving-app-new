import React from 'react';
import { Info, MapPin, Star } from 'lucide-react';

const ServiceSummary = ({ service, location, dateTime, cleaner, subtotal }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Info className="mr-2 text-teal-600" size={20} />
        Booking Summary
      </h3>
      
      <div className="space-y-4">
        {service?.title && (
          <div className="flex justify-between pb-3 border-b">
            <div className="text-gray-600">Service Type</div>
            <div className="font-medium text-gray-800">{service.title}</div>
          </div>
        )}
        
        {location && (
          <div className="flex justify-between pb-3 border-b">
            <div className="text-gray-600">Location</div>
            <div className="font-medium text-gray-800 flex items-center">
              <MapPin size={16} className="text-teal-600 mr-1" />
              {location}
            </div>
          </div>
        )}
        
        {dateTime && (
          <div className="flex justify-between pb-3 border-b">
            <div className="text-gray-600">Date & Time</div>
            <div className="font-medium text-gray-800">
              {new Intl.DateTimeFormat('en-GB', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              }).format(dateTime.date)} at {dateTime.time}
            </div>
          </div>
        )}
        
        {cleaner && (
          <div className="flex justify-between pb-3 border-b">
            <div className="text-gray-600">Cleaner</div>
            <div className="font-medium text-gray-800 flex items-center">
              {cleaner.name}
              <div className="ml-2 flex items-center text-yellow-400">
                <Star size={14} fill="currentColor" />
                <span className="ml-1 text-gray-600">{cleaner.rating}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Pricing details */}
      {service?.price && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{service.title}</span>
            <span className="text-gray-800">€{service.price.toFixed(2)}</span>
          </div>
          
          {cleaner && service?.duration && (
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Cleaner hourly rate</span>
              <span className="text-gray-600">
                €{cleaner.hourlyRate} × {
                  service.duration.split('-')[1]?.trim().split(' ')[0] || '3'
                } hours
              </span>
            </div>
          )}
          
          <div className="flex justify-between pt-3 border-t mt-3">
            <span className="font-medium text-gray-700">Subtotal</span>
            <span className="font-bold text-gray-800">€{subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}
      
      {/* Promo code section */}
      <div className="mt-6 flex">
        <input
          type="text"
          placeholder="Promo Code"
          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button className="bg-teal-600 text-white px-4 py-2 rounded-r-lg hover:bg-teal-700 transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
};

export default ServiceSummary;