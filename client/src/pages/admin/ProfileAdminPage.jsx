import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { IconUser } from '../../components/common/Icons';
import './ProfileAdminPage.css';

export const ProfileAdminPage = () => {
  const { setAdmin } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    alternative_email: '',
    phone_primary: '',
    phone_secondary: '',
    School_location: '',
  });

  const fetchProfile = () => {
    setLoading(true);
    adminService.getProfile()
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
        }
      })
      .catch((err) => {
        setAlert({ type: 'danger', message: err.message || 'Failed to fetch administrator profile.' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setAlert(null);

    setSaving(true);
    try {
      const res = await adminService.updateProfile(formData);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setAdmin((prev) => ({
          ...prev,
          full_name: res.profile.full_name,
        }));
        setAlert({ type: 'success', message: 'Profile details saved successfully!' });
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
              <IconUser size={38} />
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

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
              />
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" size="md" loading={saving}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
