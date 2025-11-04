import React from 'react';
import { useTranslation } from 'react-i18next';

const CalendarViewToggle = ({ viewMode, setViewMode }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex border border-gray-300 rounded-lg p-1">
      {['month', 'week', 'day'].map(view => (
        <button
          key={view}
          onClick={() => setViewMode(view)}
          className={`px-3 py-1 rounded-md text-sm ${
            viewMode === view 
              ? 'bg-teal-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t(`calendar.${view}`)}
        </button>
      ))}
    </div>
  );
};

export default CalendarViewToggle;