import React from 'react';
import { motion } from 'framer-motion';
import { User, CheckCircle, MessageSquare, Info, Star } from 'lucide-react';

const CleanerSelection = ({ cleaners, onSelectCleaner, selectedCleaner }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <User className="mr-2 text-teal-600" size={20} />
        Select Your Cleaner
      </h3>
      
      <div className="space-y-4">
        {cleaners.map((cleaner) => (
          <motion.div
            key={cleaner.id}
            whileHover={{ scale: 1.02 }}
            className={`border p-4 rounded-xl cursor-pointer transition-all
                      ${selectedCleaner?.id === cleaner.id 
                      ? 'border-teal-500 ring-1 ring-teal-500 shadow-md' 
                      : 'border-gray-200 hover:border-teal-200'}`}
            onClick={() => onSelectCleaner(cleaner)}
          >
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={cleaner.avatar} 
                  alt={cleaner.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" 
                />
                {cleaner.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 text-white p-1 rounded-full">
                    <CheckCircle size={14} />
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <h4 className="font-bold text-gray-800">{cleaner.name}</h4>
                  <span className="text-teal-600 font-bold">€{cleaner.hourlyRate}/hr</span>
                </div>
                
                <div className="flex items-center mt-1">
                  <div className="flex items-center text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14}
                        fill={i < Math.floor(cleaner.rating) ? "currentColor" : "none"}
                        stroke={i < Math.floor(cleaner.rating) ? "none" : "currentColor"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {cleaner.rating} ({cleaner.reviewCount} reviews)
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{cleaner.bio}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-600">
                <CheckCircle className="mr-1 text-teal-500" size={14} />
                <span>{cleaner.experience} years exp.</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CheckCircle className="mr-1 text-teal-500" size={14} />
                <span>{cleaner.jobsCompleted} jobs completed</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {selectedCleaner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 bg-gray-50 rounded-lg"
        >
          <h4 className="font-medium text-gray-800 mb-2">About {selectedCleaner.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{selectedCleaner.bio}</p>
          <div className="flex items-center">
            <button className="text-teal-600 text-sm font-medium mr-4 flex items-center">
              <MessageSquare size={16} className="mr-1" />
              Chat with {selectedCleaner.name.split(" ")[0]}
            </button>
            <button className="text-teal-600 text-sm font-medium flex items-center">
              <Info size={16} className="mr-1" />
              View Full Profile
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CleanerSelection;