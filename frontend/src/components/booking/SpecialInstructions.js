import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const SpecialInstructions = ({ onAddInstructions }) => {
  const [instructions, setInstructions] = useState('');
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <MessageSquare className="mr-2 text-teal-600" size={20} />
        Special Instructions
      </h3>
      
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px]"
        placeholder="Add any special instructions for your cleaner here..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      ></textarea>
      
      <div className="flex justify-end mt-3">
        <button
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          onClick={() => onAddInstructions(instructions)}
        >
          Save Instructions
        </button>
      </div>
    </div>
  );
};

export default SpecialInstructions;