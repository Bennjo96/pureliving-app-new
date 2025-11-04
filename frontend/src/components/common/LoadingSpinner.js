// src/components/common/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

/**
 * LoadingSpinner component
 * Displays a loading animation that can be used throughout the application
 * @param {string} size - 'small', 'medium', or 'large' to control spinner size
 * @param {string} color - Primary color for the spinner
 */
const LoadingSpinner = ({ size = 'medium', color = '#4F46E5' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  return (
    <div className="spinner-container">
      <div 
        className={`spinner ${sizeClasses[size]}`}
        style={{ borderTopColor: color }}
      ></div>
      <p className="spinner-text">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;