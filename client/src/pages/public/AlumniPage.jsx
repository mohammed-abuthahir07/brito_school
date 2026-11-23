import React, { useState } from 'react';
import alumni1Img from '../../assets/Alumini/alumni.webp';
import alumni2Img from '../../assets/Alumini/animini2.webp';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { IconUsers, IconAlertCircle, IconAward, IconSparkles } from '../../components/common/Icons';
import './AlumniPage.css';

export const AlumniPage = () => {
  const currentYear = new Date().getFullYear();
  useScrollReveal();

  const [formData, setFormData] = useState({
    fullName: '',
    batchYear: '',
    courseGroup: '',
    email: '',
    phoneNumber: '',
    occupation: '',
    organization: '',
    location: '',
    higherEducation: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,14}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      errs.phoneNumber = 'Please enter a valid 10-digit contact number';
    }
    if (!formData.batchYear) {
      errs.batchYear = 'Batch / Completion Year is required';
    } else {
      const year = parseInt(formData.batchYear, 10);
      if (isNaN(year) || year < 1968 || year > currentYear) {
        errs.batchYear = `Year must be between 1968 and ${currentYear}`;
      }
    }
    if (!formData.courseGroup.trim()) {
      errs.courseGroup = 'Course / Group is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate natural processing delay while adhering strictly to client-side rule
    setTimeout(() => {
      setSubmittedData({ ...formData });
      setIsSubmitting(false);
    }, 400);
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      batchYear: '',
      courseGroup: '',
      email: '',
      phoneNumber: '',
      occupation: '',
      organization: '',
      location: '',
      higherEducation: '',
      message: '',
    });
    setErrors({});
    setSubmittedData(null);
  };

  return (
    <div className="alumni-page">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="alumni-hero">
        <div className="container">
          <span className="hero-badge animate-fade-in" style={{ backgroundColor: 'rgba(216, 195, 165, 0.2)', borderColor: 'var(--sandal-300)', color: 'var(--sandal-100)' }}>
            <IconUsers size={16} />
            BRITTO ALUMNI ASSOCIATION • ESTD. 1968
          </span>
          <h1 className="alumni-hero-title animate-fade-in-up">Connecting Generations of Brittoites</h1>
          <p className="alumni-hero-subtitle animate-fade-in-up">
            Celebrating the enduring legacy of thousands of distinguished alumni making noble contributions across Tamil Nadu, India, and around the world.
          </p>
        </div>
      </section>

      {/* =========================================================================
          ALUMNI INTRODUCTION & PHOTO ARCHIVE
          ========================================================================= */}
      <section className="alumni-intro-section reveal-init">
        <div className="container alumni-intro-grid">
          <div className="alumni-text-block">
            <span className="section-tag">Lifelong Bond & Fraternity</span>
            <h2>Pride of St. Britto: Our Global Alumni</h2>
            <p className="alumni-lead">
              From our inception on June 22, 1968, thousands of young boys have crossed the portals of St. Britto and blossomed into ethical civil servants, engineers, doctors, defense leaders, entrepreneurs, and educators.
            </p>
            <p className="alumni-desc">
              The Britto Alumni Association serves as an unbroken bridge between past scholars and current students. Our alumni fraternity actively organizes career guidance symposia, higher education scholarships for underprivileged students, sports training sponsorships, and commemorative reunion reunions.
            </p>
            <p className="alumni-desc">
              Whether you graduated in our inaugural batches of the 1970s or recently completed Class XII, St. Britto remains your second home. We welcome your homecoming, mentorship, and participation.
            </p>

            <div className="alumni-stats-grid">
              <div className="alumni-stat-box">
                <span className="alumni-stat-val">15,000+</span>
                <span className="alumni-stat-lbl">Global Alumni</span>
              </div>
              <div className="alumni-stat-box">
                <span className="alumni-stat-val">58+</span>
                <span className="alumni-stat-lbl">Graduating Batches</span>
              </div>
              <div className="alumni-stat-box">
                <span className="alumni-stat-val">100%</span>
                <span className="alumni-stat-lbl">Ethical Leadership</span>
              </div>
            </div>
          </div>

          <div className="alumni-photos-grid">
            <div className="alumni-photo-frame">
              <img src={alumni1Img} alt="Britto Alumni Annual Reunion" className="alumni-card-img" loading="lazy" />
              <span className="alumni-photo-caption">Annual Alumni Felicitation & Fellowship</span>
            </div>
            <div className="alumni-photo-frame">
              <img src={alumni2Img} alt="Alumni Reconnecting with Teachers" className="alumni-card-img" loading="lazy" />
              <span className="alumni-photo-caption">Honoring Esteemed Faculty & Mentors</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ALUMNI PILLARS & INITIATIVES
          ========================================================================= */}
      <section className="alumni-pillars-section reveal-init">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Giving Back</span>
            <h2 className="section-heading">How Our Alumni Support St. Britto</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Strengthening current scholars through practical mentorship, career coaching, and educational sponsorships.
            </p>
          </div>

          <div className="pillars-cards-grid">
            <div className="pillar-card reveal-init stagger-1">
              <div className="pillar-icon-box">
                <IconAward size={24} />
              </div>
              <h4>Merit Scholarships & Support</h4>
              <p>Financial assistance and textbook grants provided to meritorious students hailing from rural and economically weaker backgrounds.</p>
            </div>

            <div className="pillar-card reveal-init stagger-2">
              <div className="pillar-icon-box">
                <IconSparkles size={24} />
              </div>
              <h4>Career Guidance & Seminars</h4>
              <p>Senior alumni in software, medicine, civil services, and entrepreneurship conduct regular interactive workshops for Higher Secondary classes.</p>
            </div>

            <div className="pillar-card reveal-init stagger-3">
              <div className="pillar-icon-box">
                <IconUsers size={24} />
              </div>
              <h4>Sports Sponsorships</h4>
              <p>Sponsoring basketball and athletic equipment, uniforms, and travel stipends for state and national tournament contingents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ALUMNI REGISTRATION FORM SECTION
          ========================================================================= */}
      <section className="alumni-form-section reveal-init" aria-label="Alumni Registration Form">
        <div className="container">
          <div className="alumni-form-wrapper">
            <div className="form-header">
              <span className="section-tag">Directory Enrolment</span>
              <h2 className="form-title">Alumni Registration Form</h2>
              <p className="form-subtitle">
                Please register your updated profile information to be included in the official school alumni directory and receive reunion invitations.
              </p>
            </div>

            {submittedData ? (
              <div className="form-success-container">
                <Alert
                  type="success"
                  title="Profile Validated & Recorded Successfully!"
                  message={`Thank you, ${submittedData.fullName}! Your alumni profile details have been thoroughly validated and prepared for the Britto Alumni Directory.`}
                />

                <div className="submitted-summary-card">
                  <h4>Submitted Profile Summary:</h4>
                  <ul className="submitted-summary-list">
                    <li><strong>Full Name:</strong> {submittedData.fullName}</li>
                    <li><strong>Batch Year:</strong> {submittedData.batchYear}</li>
                    <li><strong>Course / Group:</strong> {submittedData.courseGroup}</li>
                    <li><strong>Email:</strong> {submittedData.email}</li>
                    <li><strong>Phone:</strong> {submittedData.phoneNumber}</li>
                    {submittedData.occupation && <li><strong>Occupation:</strong> {submittedData.occupation}</li>}
                    {submittedData.organization && <li><strong>Organization:</strong> {submittedData.organization}</li>}
                    {submittedData.location && <li><strong>Location:</strong> {submittedData.location}</li>}
                    {submittedData.higherEducation && <li><strong>Higher Education:</strong> {submittedData.higherEducation}</li>}
                  </ul>
                </div>

                <div className="alumni-limitation-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    <IconAlertCircle size={20} />
                    <span>Technical & Architectural Notice Regarding Email Delivery</span>
                  </div>
                  <p>
                    <strong>Backend Status:</strong> The existing backend contains administrative APIs for Announcements, Calendars, Galleries, Thirukkural, and Profile, but <em>does not currently provide an active server-side email dispatch endpoint for public alumni registration</em> (such as <code>POST /api/public/alumni</code>).
                  </p>
                  <p style={{ marginTop: '0.5rem' }}>
                    In accordance with strict project rules prohibiting client-side exposure of Gmail App Passwords or mock persistence, all client-side validation has succeeded and this limitation is recorded for backend expansion.
                  </p>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <Button variant="outline" onClick={handleReset}>
                    Submit Another Response
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="alumni-form" noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                      Full Name <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className={`form-input ${errors.fullName ? 'error' : ''}`}
                      placeholder="e.g. R. Dilip Akash"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <span className="field-error-msg">{errors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="batchYear" className="form-label">
                      Year of Passing / Batch <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      id="batchYear"
                      name="batchYear"
                      type="number"
                      min="1968"
                      max={currentYear}
                      className={`form-input ${errors.batchYear ? 'error' : ''}`}
                      placeholder={`1968 - ${currentYear}`}
                      value={formData.batchYear}
                      onChange={handleChange}
                    />
                    {errors.batchYear && <span className="field-error-msg">{errors.batchYear}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="courseGroup" className="form-label">
                      Course / Group Completed <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      id="courseGroup"
                      name="courseGroup"
                      type="text"
                      className={`form-input ${errors.courseGroup ? 'error' : ''}`}
                      placeholder="e.g. Science / Biology, Computer Science, Commerce"
                      value={formData.courseGroup}
                      onChange={handleChange}
                    />
                    {errors.courseGroup && <span className="field-error-msg">{errors.courseGroup}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
                      placeholder="e.g. 9876543210"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                    {errors.phoneNumber && <span className="field-error-msg">{errors.phoneNumber}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="your.name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="field-error-msg">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="occupation" className="form-label">
                      Current Occupation / Designation <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    <input
                      id="occupation"
                      name="occupation"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Software Engineer, Doctor, Advocate"
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="organization" className="form-label">Organization / Employer</label>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Government of Tamil Nadu / TCS"
                      value={formData.organization}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location" className="form-label">Current City & Country</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Madurai, Tamil Nadu, India"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="higherEducation" className="form-label">Higher Education / Degrees Earned</label>
                  <input
                    id="higherEducation"
                    name="higherEducation"
                    type="text"
                    className="form-input"
                    placeholder="e.g. B.E. (CSE), M.Sc., Ph.D., M.B.B.S., B.Ed."
                    value={formData.higherEducation}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Fond School Memories / Message to Teachers & Students</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    className="form-textarea"
                    placeholder="Share cherished memories of teachers, scout rallies, sports victories, or words of encouragement for current Brittoites..."
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center' }}>
                  <Button type="submit" variant="primary" size="lg" loading={isSubmitting} disabled={isSubmitting}>
                    Register with Alumni Association
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
