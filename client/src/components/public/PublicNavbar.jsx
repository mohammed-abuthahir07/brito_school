import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import schoolLogo from '../../assets/Logo/Schoollogo.jpg';
import {
  IconMenu,
  IconX,
  IconHome,
  IconInfo,
  IconBuilding,
  IconGraduationCap,
  IconImage,
} from '../common/Icons';
import './PublicNavbar.css';

export const PublicNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: IconHome },
    { to: '/about', label: 'About Us', icon: IconInfo },
    { to: '/facilities', label: 'Facilities', icon: IconBuilding },
    { to: '/alumni', label: 'Alumni', icon: IconGraduationCap },
    { to: '/gallery', label: 'Gallery', icon: IconImage },
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
            <span className="school-motto">நீதியும் அன்பும் மேலோங்கட்டும்</span>
          </div>
        </Link>

        <nav className="desktop-nav" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const NavIcon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <NavIcon size={16} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open mobile menu"
        >
          <IconMenu size={26} />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <aside className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img src={schoolLogo} alt="St. Britto Higher Secondary School Logo" />
            <span>St. Britto School</span>
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
          {navLinks.map((link) => {
            const NavIcon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeDrawer}
              >
                <NavIcon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="mobile-drawer-note">
          <p className="mobile-drawer-motto">“Let Justice and Love Prevail”</p>
          <p>St. Britto Higher Secondary School</p>
          <p>Madurai – 625 016 • Estd. 22-06-1968</p>
        </div>
      </aside>
    </header>
  );
};
