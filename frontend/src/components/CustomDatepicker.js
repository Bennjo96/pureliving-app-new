import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDatepicker = () => {
    const [startDate, setStartDate] = useState(new Date());

    const setToday = () => {
        setStartDate(new Date()); // Sets the date to today
    };

    const clearDate = () => {
        setStartDate(null); // Clears the date
    };

    return (
        <div>
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                inline
            />
            <div className="flex justify-center space-x-2 mt-4">
                <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={setToday}
                >
                    Today
                </button>
                <button 
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    onClick={clearDate}
                >
                    Clear
                </button>
            </div>
        </div>
    );
};

export default CustomDatepicker;
