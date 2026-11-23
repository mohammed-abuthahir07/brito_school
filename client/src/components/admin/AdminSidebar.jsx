import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import schoolLogo from '../../assets/Logo/Schoollogo.jpg';
import { useAuth } from '../../context/AuthContext';
import {
  IconDashboard,
  IconBell,
  IconCalendar,
  IconImage,
  IconBookOpen,
  IconUser,
  IconLogOut,
  IconExternalLink,
  IconX,
} from '../common/Icons';
import './AdminSidebar.css';

export const AdminSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <IconDashboard size={20} /> },
    { to: '/admin/announcements', label: 'Announcements', icon: <IconBell size={20} /> },
    { to: '/admin/calendars', label: 'Calendars', icon: <IconCalendar size={20} /> },
    { to: '/admin/galleries', label: 'Gallery (Max 30)', icon: <IconImage size={20} /> },
    { to: '/admin/thirukkural', label: 'Thirukkural', icon: <IconBookOpen size={20} /> },
    { to: '/admin/profile', label: 'Admin Profile', icon: <IconUser size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`} aria-label="Admin Navigation Sidebar">
      <div className="admin-sidebar-header">
        <img src={schoolLogo} alt="Logo" className="admin-logo-img" />
        <div className="admin-brand-info">
          <span className="admin-brand-name">St. Britto Portal</span>
          <span className="admin-brand-badge">Administrative Suite</span>
        </div>
        {isOpen && (
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            style={{ marginLeft: 'auto', color: '#fff' }}
            aria-label="Close sidebar"
          >
            <IconX size={20} />
          </button>
        )}
      </div>

      <nav className="admin-nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-footer-btn" target="_blank" rel="noopener noreferrer">
          <IconExternalLink size={18} />
          <span>View Public Site</span>
        </Link>
        <button type="button" className="admin-footer-btn admin-logout-btn" onClick={handleLogout}>
          <IconLogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
