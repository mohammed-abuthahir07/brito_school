import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import schoolLogo from '../../assets/Logo/Schoollogo.jpg';
import { useAuth } from '../../context/AuthContext';
import { IconMenu, IconX, IconLock } from '../common/Icons';
import './PublicNavbar.css';

export const PublicNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/facilities', label: 'Facilities' },
    { to: '/alumni', label: 'Alumni' },
    { to: '/gallery', label: 'Gallery' },
  ];

  const closeDrawer = () => setMobileOpen(false);

  return (
    <header className="public-header">
      <div className="container navbar-container">
        <Link to="/" className="school-brand" onClick={closeDrawer}>
          <img
            src={schoolLogo}
            alt="St. Britto Higher Secondary School Logo"
            className="school-logo-img"
          />
          <div className="school-brand-text">
            <span className="school-name">St. Britto Hr. Sec. School</span>
            <span className="school-location">Madurai – 625 016, Tamil Nadu</span>
            <span className="school-motto">“Let Justice and Love Prevail”</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}

          <Link
            to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className="btn btn-outline btn-sm nav-admin-btn"
          >
            <IconLock size={15} />
            <span>{isAuthenticated ? 'Admin Panel' : 'Staff Login'}</span>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open mobile menu"
        >
          <IconMenu size={26} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={schoolLogo} alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '50%' }} />
            <span style={{ fontWeight: 700, color: 'var(--brown-800)', fontSize: '0.95rem' }}>St. Britto School</span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={closeDrawer}
            aria-label="Close mobile menu"
          >
            <IconX size={22} />
          </button>
        </div>

        <nav className="mobile-drawer-links" aria-label="Mobile Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeDrawer}
            >
              {link.label}
            </NavLink>
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0.5rem 0' }} />

          <Link
            to={isAuthenticated ? '/admin/dashboard' : '/admin/login'}
            className="btn btn-primary btn-md"
            onClick={closeDrawer}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <IconLock size={16} />
            <span>{isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}</span>
          </Link>
        </nav>
      </aside>
    </header>
  );
};
