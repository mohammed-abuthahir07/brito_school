import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { isAbortError } from '../../utils/userFacingError';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RetryPanel } from '../../components/common/RetryPanel';
import schoolLogo from '../../assets/Logo/SchoolLogo.jpg';
import './ProfileAdminPage.css';

export const ProfileAdminPage = () => {
  const { setAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [alert, setAlert] = useState(null);
  const redirectTimer = useRef(null);

  const [formData, setFormData] = useState({
    full_name: '',
    alternative_email: '',
    phone_primary: '',
    phone_secondary: '',
    School_location: '',
  });

  const fetchProfile = (signal) => {
    setLoading(true);
    setLoadError(null);
    adminService
      .getProfile({ signal })
      .then((res) => {
        if (res.success && res.profile) {
          setProfile(res.profile);
          setFormData({
            full_name: res.profile.full_name || '',
            alternative_email: res.profile.alternative_email || '',
            phone_primary: res.profile.phone_primary || '',
            phone_secondary: res.profile.phone_secondary || '',
            School_location: res.profile.School_location || '',
          });
        } else {
          setLoadError('Profile details could not be loaded.');
        }
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setLoadError(err.message || 'Failed to fetch administrator profile.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal);
    return () => {
      controller.abort();
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving || redirecting) return;
    setAlert(null);

    if (formData.alternative_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alternative_email.trim())) {
      setAlert({ type: 'danger', message: 'Please enter a valid alternative email address.' });
      return;
    }

    setSaving(true);
    try {
      const res = await adminService.updateProfile(formData);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setAdmin((prev) => {
          const next = { ...prev, full_name: res.profile.full_name };
          try {
            localStorage.setItem('brito_admin_info', JSON.stringify(next));
          } catch {
            /* ignore quota */
          }
          return next;
        });
        setRedirecting(true);
        setAlert({
          type: 'success',
          message: 'Profile details saved successfully. Opening the dashboard…',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        redirectTimer.current = window.setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving administrator profile..." />;
  }

  if (loadError && !profile) {
    return (
      <div className="admin-page-container">
        <RetryPanel message={loadError} onRetry={() => fetchProfile()} />
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="profile-page-grid">
        {/* Left Column: Summary Card */}
        <div className="profile-card">
          <div className="profile-summary-header">
            <div className="profile-avatar-circle">
              <img src={schoolLogo} alt="St. Britto school emblem" />
            </div>
            <h2 className="profile-admin-name">{profile?.full_name || 'School Administrator'}</h2>
            <div className="profile-role-tag">Primary Administrator</div>
          </div>

          <div className="profile-quick-details">
            <div className="profile-detail-row">
              <span className="detail-label">Login Account Email</span>
              <span className="detail-val">{profile?.email || 'admin@britoschool.com'}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">Registered Mobile</span>
              <span className="detail-val">{profile?.mobile_number || 'Not specified'}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">Location Campus</span>
              <span className="detail-val">{profile?.School_location || 'Madurai, Tamil Nadu'}</span>
            </div>

            <div className="profile-detail-row">
              <span className="detail-label">Last Updated</span>
              <span className="detail-val" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleString('en-IN') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="profile-card">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown-900)' }}>
              Edit Administrative Contact Information
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Update display names, alternate communication channels, and campus location.
            </p>
          </div>

          <form onSubmit={handleSave} className="profile-form" noValidate>
            <div className="form-group">
              <label htmlFor="adminFullNameInput" className="form-label">
                Administrator Full Name
              </label>
              <input
                id="adminFullNameInput"
                name="full_name"
                type="text"
                className="form-input"
                placeholder="e.g. School Administrator / Father Headmaster"
                value={formData.full_name}
                onChange={handleChange}
                disabled={saving || redirecting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminAltEmailInput" className="form-label">
                Alternative Email Address
              </label>
              <input
                id="adminAltEmailInput"
                name="alternative_email"
                type="email"
                className="form-input"
                placeholder="e.g. altadmin@britoschool.com"
                value={formData.alternative_email}
                onChange={handleChange}
                disabled={saving || redirecting}
              />
            </div>

            <div className="profile-form-grid">
              <div className="form-group">
                <label htmlFor="adminPhonePrimaryInput" className="form-label">
                  Primary Contact Phone
                </label>
                <input
                  id="adminPhonePrimaryInput"
                  name="phone_primary"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210"
                value={formData.phone_primary}
                onChange={handleChange}
                disabled={saving || redirecting}
              />
              </div>

              <div className="form-group">
                <label htmlFor="adminPhoneSecondaryInput" className="form-label">
                  Secondary Emergency Phone
                </label>
                <input
                  id="adminPhoneSecondaryInput"
                  name="phone_secondary"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543211"
                value={formData.phone_secondary}
                onChange={handleChange}
                disabled={saving || redirecting}
              />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adminSchoolLocationInput" className="form-label">
                School Campus Location
              </label>
              <input
                id="adminSchoolLocationInput"
                name="School_location"
                type="text"
                className="form-input"
                placeholder="e.g. Madurai, Tamil Nadu"
                value={formData.School_location}
                onChange={handleChange}
                disabled={saving || redirecting}
              />
            </div>

            <div className="profile-form-actions">
              <Button type="submit" variant="primary" size="md" loading={saving || redirecting}>
                {redirecting ? 'Opening dashboard…' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
