import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className={`spinner-circle spinner-${size}`} role="status" aria-label="Loading" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};
