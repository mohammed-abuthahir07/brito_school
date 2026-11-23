import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import schoolLogo from '../../assets/Logo/Schoollogo.jpg';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { IconArrowLeft } from '../../components/common/Icons';
import './ForgotPasswordPage.css';

export const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // Step 1: Email -> Step 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type, message }

  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setAlert({ type: 'danger', message: 'Please provide a valid registered email address.' });
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.forgotPassword(email.trim());
      setAlert({
        type: 'success',
        message: res.message || 'If an account exists for this email, an OTP has been dispatched.',
      });
      setStep(2);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to dispatch password reset OTP.' });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!otp.trim()) {
      setAlert({ type: 'danger', message: 'Please enter the 6-digit OTP code received.' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setAlert({ type: 'danger', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ type: 'danger', message: 'New password and Confirm Password do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      setAlert({
        type: 'success',
        message: res.message || 'Password reset successfully! Redirecting to login...',
      });

      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Invalid or expired OTP code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page-root">
      <div className="forgot-card">
        <div className="forgot-card-header">
          <img src={schoolLogo} alt="Logo" className="login-logo" />
          <h1 className="login-title">Password Recovery</h1>
          <p className="login-subtitle">St. Britto Administrator Account</p>

          <div className="forgot-step-indicator">
            <div className={`step-bubble ${step >= 1 ? 'active' : ''}`}>
              <span className="step-num">1</span>
              <span>Email Verification</span>
            </div>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>→</span>
            <div className={`step-bubble ${step === 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span>OTP & Reset</span>
            </div>
          </div>
        </div>

        <div className="forgot-card-body">
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Enter your registered administrator email address. We will transmit a secure 6-digit one-time password (OTP) valid for 2 minutes.
              </p>

              <div className="form-group">
                <label htmlFor="forgotEmail" className="form-label">
                  Registered Administrator Email
                </label>
                <input
                  id="forgotEmail"
                  type="email"
                  className="form-input"
                  placeholder="admin@britoschool.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
                Send Reset OTP Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Sent to: <strong>{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ fontSize: '0.82rem', color: 'var(--brown-700)', fontWeight: 600 }}
                >
                  Change Email
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="resetOtp" className="form-label">
                  6-Digit OTP Code
                </label>
                <input
                  id="resetOtp"
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  New Password (min 6 characters)
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-input"
                  placeholder="Enter new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
                Save New Password & Log In
              </Button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link to="/admin/login" className="login-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <IconArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
