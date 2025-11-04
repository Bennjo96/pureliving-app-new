import React from 'react';
import { Gift } from 'lucide-react';

const BookingAddons = ({ onToggleAddon, addons }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Gift className="mr-2 text-teal-600" size={20} />
        Enhance Your Service
      </h3>
      
      <p className="text-gray-600 mb-6 text-sm">
        Add these popular extras to make your cleaning experience even better
      </p>
      
      <div className="space-y-3">
        {addons.map((addon) => (
          <div 
            key={addon.id} 
            className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
          >
            <div className="flex items-start">
              <div className="bg-teal-100 p-2 rounded-lg mr-3">
                <addon.icon className="text-teal-600" size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-800">{addon.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{addon.description}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="text-teal-600 font-medium mr-3">+€{addon.price.toFixed(2)}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={addon.selected}
                  onChange={() => onToggleAddon(addon.id)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingAddons;