import React from 'react';
import { IconAlertCircle, IconCheck, IconX } from './Icons';
import './Alert.css';

export const Alert = ({
  type = 'info',
  title = '',
  message,
  onClose = null,
  className = '',
}) => {
  if (!message) return null;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <IconCheck size={20} />;
      case 'danger':
      case 'error':
        return <IconAlertCircle size={20} />;
      case 'warning':
        return <IconAlertCircle size={20} />;
      default:
        return <IconAlertCircle size={20} />;
    }
  };

  const alertClass = type === 'error' ? 'danger' : type;

  return (
    <div className={`alert alert-${alertClass} ${className}`} role="alert">
      <div className="alert-icon">{renderIcon()}</div>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button type="button" className="alert-close" onClick={onClose} aria-label="Close alert">
          <IconX size={16} />
        </button>
      )}
    </div>
  );
};
