import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import schoolLogo from '../../assets/Logo/Schoollogo.jpg';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { IconEye, IconEyeOff } from '../../components/common/Icons';
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
    <div className="login-page-root">
      <div className="login-card">
        <div className="login-card-header">
          <img src={schoolLogo} alt="Logo" className="login-logo" />
          <h1 className="login-title">Administrator Portal</h1>
          <p className="login-subtitle">St. Britto Higher Secondary School, Madurai</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form-body" noValidate>
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
            <label htmlFor="loginPassword" className="form-label">
              Password
            </label>
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

          <div className="login-links-row">
            <Link to="/admin/forgot-password" className="login-link">
              Forgot Password?
            </Link>
            <Link to="/" className="login-link" style={{ color: 'var(--text-muted)' }}>
              ← Public Site
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Sign In to Dashboard
          </Button>
        </form>

        <div className="login-footer-note">
          Protected administrative system. Single administrator account only.
        </div>
      </div>
    </div>
  );
};
