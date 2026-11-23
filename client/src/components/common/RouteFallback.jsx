import React from 'react';
import './RouteFallback.css';

export const RouteFallback = ({ label = 'Loading page…' }) => (
  <div className="route-fallback" role="status" aria-live="polite" aria-label={label}>
    <div className="route-fallback-bar" />
    <div className="route-fallback-inner">
      <div className="skeleton-line skeleton-wide" />
      <div className="skeleton-line skeleton-mid" />
      <div className="skeleton-cards">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    </div>
  </div>
);
