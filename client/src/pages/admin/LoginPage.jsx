import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import schoolLogo from '../../assets/Logo/Schoollogo.jpg';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import {
  IconEye,
  IconEyeOff,
  IconX,
  IconLock,
  IconArrowLeft,
} from '../../components/common/Icons';
import './LoginPage.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="login-fullscreen-root">
      {/* Prominent X Close Button to Return to Home Page */}
      <Link
        to="/"
        className="login-close-corner-btn"
        aria-label="Return to Home page"
        title="Return to Home page"
      >
        <IconX size={22} />
      </Link>

      {/* Left Showcase Panel: Institutional Heritage & Full-Height Branding */}
      <div className="login-showcase-panel">
        <div className="login-showcase-overlay" />
        <div className="login-showcase-content">
          <div className="login-showcase-brand">
            <img src={schoolLogo} alt="St. Britto School Logo" className="login-showcase-logo" />
            <div className="login-showcase-titles">
              <span className="login-school-name">St. Britto Hr. Sec. School</span>
              <span className="login-school-loc">Madurai – 625 016, Tamil Nadu</span>
            </div>
          </div>

          <div className="login-showcase-motto-badge">
            “Let Justice and Love Prevail”
          </div>

          <div className="login-showcase-hero-text">
            <h2>Institutional Administration Portal</h2>
            <p>
              Dedicated management interface for academic calendar releases, student gallery archives, daily Thirukkural reflections, and institutional announcements.
            </p>
          </div>

          <div className="login-showcase-stats">
            <div className="login-stat-chip">
              <strong>1968</strong>
              <span>Estd. Year</span>
            </div>
            <div className="login-stat-chip">
              <strong>2,100+</strong>
              <span>Scholars</span>
            </div>
            <div className="login-stat-chip">
              <strong>Archdiocese</strong>
              <span>Madurai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel: Full-Height Clean Administrative Form */}
      <div className="login-form-panel">
        <div className="login-form-wrapper">
          <div className="login-mobile-brand">
            <img src={schoolLogo} alt="Logo" className="login-mobile-logo" />
            <div>
              <div className="login-mobile-school-title">St. Britto Hr. Sec. School</div>
              <div className="login-mobile-school-subtitle">Administrator Portal</div>
            </div>
          </div>

          <div className="login-form-header">
            <div className="login-badge-pill">
              <IconLock size={14} />
              <span>Admin Security Portal</span>
            </div>
            <h1 className="login-heading">Sign In to Dashboard</h1>
            <p className="login-desc">
              Please enter your authorized administrative email and password to manage the school website.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-full-form" noValidate>
            {errorMsg && (
              <Alert
                type="danger"
                message={errorMsg}
                onClose={() => setErrorMsg('')}
              />
            )}

            <div className="form-group">
              <label htmlFor="loginEmail" className="form-label">
                Admin Email Address
              </label>
              <div className="password-input-wrapper">
                <input
                  id="loginEmail"
                  type="email"
                  className="form-input"
                  placeholder="admin@britoschool.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="loginPassword" className="form-label">
                  Password
                </label>
                <Link to="/admin/forgot-password" className="login-forgot-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="login-action-btn"
            >
              Sign In to Dashboard
            </Button>

            <div className="login-nav-return-row">
              <Link to="/" className="login-return-home-link">
                <IconArrowLeft size={16} />
                <span>Return to School Website</span>
              </Link>
            </div>
          </form>

          <div className="login-security-notice">
            <span>🔒 Protected administrative system. Authorized school personnel only.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
