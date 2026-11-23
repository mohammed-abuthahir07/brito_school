import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import './AdminLayout.css';

const PAGE_TITLES = {
  '/admin/dashboard': 'Administrative Dashboard',
  '/admin/announcements': 'Announcement Management',
  '/admin/calendars': 'Academic Calendar Management',
  '/admin/galleries': 'Gallery Management (30 Max)',
  '/admin/thirukkural': 'Thirukkural Literature Management',
  '/admin/profile': 'Administrator Profile Settings',
};

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Administration';

  return (
    <div className="admin-layout-root">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className="sidebar-backdrop active"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="admin-main-wrapper">
        <AdminHeader
          title={currentTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="admin-content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
