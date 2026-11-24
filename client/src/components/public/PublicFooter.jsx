import React from 'react';
import { Link } from 'react-router-dom';
import schoolLogo from '../../assets/Logo/Schoollogo.jpg';
import { IconMapPin, IconPhone, IconMail, IconLock } from '../common/Icons';
import './PublicFooter.css';

const CURRENT_YEAR = new Date().getFullYear();

export const PublicFooter = () => {
  const currentYear = CURRENT_YEAR;

  return (
    <footer className="public-footer">
      <div className="footer-top">
        <div className="container footer-grid">
          {/* Col 1: Brand & Motto */}
          <div className="footer-brand">
            <div className="footer-logo-row">
              <img src={schoolLogo} alt="St. Britto School Logo" className="footer-logo-img" />
              <div className="footer-school-title">St. Britto Hr. Sec. School</div>
            </div>
            <p className="footer-desc">
              Started on 22-06-1968 under the patronage of Saint Arulanandar (St. Britto). Nurturing young minds through knowledge, discipline, integrity, and humanity.
            </p>
            <div className="footer-motto-badge">
              “Let Justice and Love Prevail”
            </div>
          </div>

          <div className="footer-nav-pair">
            <div className="footer-nav-col">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links-list">
                <li><Link to="/" className="footer-link">Home</Link></li>
                <li><Link to="/about" className="footer-link">About Us & History</Link></li>
                <li><Link to="/facilities" className="footer-link">Facilities & Clubs</Link></li>
                <li><Link to="/alumni" className="footer-link">Alumni Network</Link></li>
                <li><Link to="/gallery" className="footer-link">Photo Gallery</Link></li>
              </ul>
            </div>

            <div className="footer-nav-col">
              <h4 className="footer-heading">Extracurricular</h4>
              <ul className="footer-links-list">
                <li><Link to="/facilities" className="footer-link">NCC Unit 4(TN)</Link></li>
                <li><Link to="/facilities" className="footer-link">Bharat Scouts Movement</Link></li>
                <li><Link to="/facilities" className="footer-link">Britto Band Troupe</Link></li>
                <li><Link to="/facilities" className="footer-link">Junior Red Cross (JRC)</Link></li>
                <li><Link to="/facilities" className="footer-link">Sports & Basketball</Link></li>
              </ul>
            </div>
          </div>

          {/* Col 4: Contact & Administration */}
          <div>
            <h4 className="footer-heading">Contact Information</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <IconMapPin size={18} className="footer-contact-icon" />
                <span>St. Britto Higher Secondary School, Madurai – 625 016, Tamil Nadu, India</span>
              </div>
              <div className="footer-contact-item">
                <IconPhone size={18} className="footer-contact-icon" />
                <span>Madurai Catholic Archdiocese Educational Council</span>
              </div>
              <div className="footer-contact-item">
                <IconMail size={18} className="footer-contact-icon" />
                <span>stbrittoschoolmadurai@gmail.com</span>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/admin/login" className="footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)' }}>
                  <IconLock size={15} />
                  <span>Administrator Portal</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <div>
            © {currentYear} St. Britto Higher Secondary School, Madurai – 16. All rights reserved.
          </div>
          <div style={{ fontStyle: 'italic' }}>
            “Silence is the greatest weapon in the world.”
          </div>
        </div>
      </div>
    </footer>
  );
};
