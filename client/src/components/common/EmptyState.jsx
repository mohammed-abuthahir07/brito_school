import React from 'react';
import './EmptyState.css';

export const EmptyState = ({
  icon,
  title = 'No Records Found',
  description = 'There are currently no items to display.',
  action = null,
}) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};
