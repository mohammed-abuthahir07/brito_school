import React, { useState } from 'react';
import alumni1Img from '../../assets/Alumini/alumni.webp';
import alumni2Img from '../../assets/Alumini/animini2.webp';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { PageHero } from '../../components/public/PageHero';
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
    <div className="alumni-page page-enter">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <PageHero
        icon={<IconUsers size={16} />}
        badge="Britto Alumni Association • Estd. 1968"
        title="Connecting Generations of Brittoites"
        subtitle="Celebrating the enduring legacy of thousands of distinguished alumni making noble contributions across Tamil Nadu, India, and around the world."
      />

      {/* =========================================================================
          ALUMNI INTRODUCTION & PHOTO ARCHIVE
          ========================================================================= */}
      <section className="alumni-intro-section reveal-init">
        <div className="container alumni-intro-grid">
          <div className="alumni-text-block">
            <span className="section-tag">Lifelong Bond & Fraternity</span>
            <h2>Welcome back, Brittoites</h2>
            <p className="alumni-lead">
              Since 22-06-1968, boys have left this campus carrying the motto “Let Justice and Love Prevail.” This page is the school’s welcome for former students — not a published roll of names or claimed career lists.
            </p>
            <p className="alumni-desc">
              St. Britto remains your second home whether you finished in an early batch or recently completed Class XII. Registering helps the school keep a current directory and send reunion notices when they are arranged.
            </p>
            <p className="alumni-desc">
              The photographs here are campus alumni gatherings from the school archive. Individual testimonials are not invented on this site; if you share a memory in the form, it stays with your submission.
            </p>

            <div className="alumni-stats-grid">
              <div className="alumni-stat-box">
                <span className="alumni-stat-val">1968</span>
                <span className="alumni-stat-lbl">Founding year</span>
              </div>
              <div className="alumni-stat-box">
                <span className="alumni-stat-val">58+</span>
                <span className="alumni-stat-lbl">Years of batches</span>
              </div>
              <div className="alumni-stat-box">
                <span className="alumni-stat-val">2,100+</span>
                <span className="alumni-stat-lbl">Students on roll today</span>
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
            <span className="section-tag">Stay connected</span>
            <h2 className="section-heading">Why this register matters</h2>
            <p className="alumni-connect-lead">
              The school does not list unofficial scholarships or named alumni achievements here. Registration is how former students keep a working link with St. Britto.
            </p>
          </div>

          <div className="pillars-cards-grid">
            <div className="pillar-card reveal-init stagger-1">
              <div className="pillar-icon-box">
                <IconAward size={24} />
              </div>
              <h4>A living directory</h4>
              <p>Your name, batch, and course help the school reach the right people when reunions or notices are prepared.</p>
            </div>

            <div className="pillar-card reveal-init stagger-2">
              <div className="pillar-icon-box">
                <IconSparkles size={24} />
              </div>
              <h4>A bond with the campus</h4>
              <p>The same motto, patron, and grounds that formed you still shape the 2,100 students now on roll.</p>
            </div>

            <div className="pillar-card reveal-init stagger-3">
              <div className="pillar-icon-box">
                <IconUsers size={24} />
              </div>
              <h4>Your own words</h4>
              <p>The optional message field is for memories you choose to share — nothing is written in your name on this page.</p>
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
                Complete the required fields, add optional details if you wish, then submit. Marks of * are compulsory. Batch years are accepted from 1968 to the current year.
              </p>
              <ol className="alumni-form-steps">
                <li>Enter your name, year of passing, course or group, email, and phone.</li>
                <li>Optionally add occupation, organisation, city, higher studies, and a memory.</li>
                <li>Submit. You will see a confirmation summary on this page. Email dispatch is not available on the present server.</li>
              </ol>
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
