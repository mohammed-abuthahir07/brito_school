import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { publicService } from '../../services/publicService';
import { IconMenu, IconUser } from '../common/Icons';
import './AdminHeader.css';

export const AdminHeader = ({ title = 'Administration', onToggleSidebar }) => {
  const { admin } = useAuth();
  const [serverHealthy, setServerHealthy] = useState(true);

  useEffect(() => {
    publicService.checkHealth()
      .then((res) => {
        setServerHealthy(res.status === 'UP');
      })
      .catch(() => {
        setServerHealthy(false);
      });
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="mobile-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <IconMenu size={22} />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <div className={`health-pill ${serverHealthy ? 'connected' : 'checking'}`}>
          <span className="health-dot" />
          <span>{serverHealthy ? 'API Active' : 'API Checking'}</span>
        </div>

        <div className="admin-user-badge">
          <div className="admin-avatar-icon">
            <IconUser size={15} />
          </div>
          <span className="admin-user-email">{admin?.email || 'admin@britoschool.com'}</span>
        </div>
      </div>
    </header>
  );
};
