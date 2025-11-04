import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Edit, Check, X } from 'lucide-react';

const EditableField = ({ value, onSave, icon }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2">
      {icon}
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border-b border-teal-600 focus:outline-none focus:border-teal-700 bg-transparent"
          />
          <button
            onClick={handleSave}
            className="text-teal-600 hover:text-teal-700"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-teal-600"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

EditableField.propTypes = {
  value: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  icon: PropTypes.element.isRequired
};

export default EditableField;