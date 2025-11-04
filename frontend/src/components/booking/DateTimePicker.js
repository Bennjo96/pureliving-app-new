import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

const DateTimePicker = ({ onSelectDateTime }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  // Generate next 14 days for selection
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Available time slots - could come from API based on cleaner availability
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  
  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }).format(date);
  };
  
  // When both date and time are selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      onSelectDateTime({ date: selectedDate, time: selectedTime });
    }
  }, [selectedDate, selectedTime, onSelectDateTime]);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-2 text-teal-600" size={20} />
        Select Date & Time
      </h3>
      
      {/* Date Selection */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Available Dates</h4>
        <div className="flex overflow-x-auto pb-4 scrollbar-hide space-x-3">
          {generateDates().map((date, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              className={`flex-shrink-0 p-3 rounded-lg text-center min-w-[85px] border transition-colors
                        ${selectedDate && selectedDate.toDateString() === date.toDateString() 
                        ? 'bg-teal-600 text-white border-teal-600' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'}`}
              onClick={() => setSelectedDate(date)}
            >
              <div className="font-bold">{date.getDate()}</div>
              <div className="text-xs uppercase">{
                new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date)
              }</div>
              <div className="text-xs mt-1">{
                new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
              }</div>
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Time Selection - Only show if date is selected */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="font-medium text-gray-700 mb-3">Available Times for {formatDate(selectedDate)}</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {timeSlots.map((time, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                className={`py-2 px-3 rounded-lg border text-center transition-colors
                          ${selectedTime === time 
                          ? 'bg-teal-600 text-white border-teal-600' 
                          : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
      
      {selectedDate && selectedTime && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-3 bg-teal-50 rounded-lg text-teal-700 flex items-center"
        >
          <CheckCircle size={18} className="mr-2" />
          <span>You selected: {formatDate(selectedDate)} at {selectedTime}</span>
        </motion.div>
      )}
    </div>
  );
};

export default DateTimePicker;