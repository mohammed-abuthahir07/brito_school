import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import entranceImg from '../../assets/School/Entrence.jpg';
import managerImg from '../../assets/Manager/manager.png';
import corresImg from '../../assets/Corresponent/corres.jpg';
import headmasterImg from '../../assets/Headmaster/image.png';
import britoImg from '../../assets/Brito/brito.jpeg';
import britoPortraitImg from '../../assets/Brito/img4.jpg';
import independenceImg from '../../assets/School/independenceday.jpg';
import prayerImg from '../../assets/School/prayers.jpg';
import classroomImg from '../../assets/School/classrooms.jpg';
import basketballImg from '../../assets/Sports/basketball.jpg';
import nccImg from '../../assets/NCC/ncc.jpeg';
import bandImg from '../../assets/Band/Band.jpeg';
import thiruImg from '../../assets/thiru.webp';
import { publicService } from '../../services/publicService';
import { API_BASE_URL } from '../../services/api';
import { useDailyKural } from '../../context/DailyKuralContext';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  IconCalendar,
  IconDownload,
  IconExternalLink,
  IconSparkles,
  IconChevronRight,
  IconBookOpen,
  IconEye,
} from '../../components/common/Icons';
import './HomePage.css';

export const HomePage = () => {
  const [calendars, setCalendars] = useState([]);
  const [calendarsLoading, setCalendarsLoading] = useState(true);
  const { kural, loading: kuralLoading, openModal } = useDailyKural();

  useScrollReveal(calendars.length);

  useEffect(() => {
    publicService.getCalendars()
      .then((res) => {
        if (res.success && Array.isArray(res.calendars)) {
          setCalendars(res.calendars);
        }
      })
      .catch((err) => {
        console.warn('Could not load calendars:', err.message);
      })
      .finally(() => {
        setCalendarsLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      {/* =========================================================================
          SECTION 1: HERO & HISTORICAL FOUNDATION
          ========================================================================= */}
      <section
        className="hero-history-section"
        style={{ backgroundImage: `url(${entranceImg})` }}
        aria-label="History and Introduction of St. Britto Higher Secondary School"
      >
        <div className="hero-history-overlay" />
        <div className="hero-history-content animate-fade-in">
          <div className="hero-badge">
            <IconSparkles size={16} />
            <span>ESTD. 22-06-1968 • TEMPLE OF LEARNING & VIRTUE</span>
          </div>

          <h1 className="hero-title">
            St. Britto Higher<br />Secondary School
          </h1>

          <div className="hero-motto-callout">
            “Let Justice and Love Prevail”
          </div>

          <div className="hero-history-copy">
            <p className="hero-history-text">
              This temple of learning, which considers education and discipline as its two eyes, was established on <strong>22-06-1968</strong> through the visionary zeal of the former Archbishop of Madurai, <strong>Most Rev. Dr. Justin Diraviam</strong>.
            </p>

            <p className="hero-history-text">
              Over more than five decades of academic stewardship, St. Britto has flourished under the providential guidance of Most Rev. Dr. G. Casimir S.J., Most Rev. Dr. M. Arockiasamy, Most Rev. Dr. Peter Fernando, Most Rev. Dr. Antony Pappusamy, and presently under the pastoral leadership of <strong>Most Rev. Dr. Antonysamy Savarimuthu</strong>.
            </p>

            <p className="hero-history-text">
              Though founded primarily for Catholic students, the institution opens its gates unconditionally to scholars of every religion, caste, and creed. Out of <strong>2,100 students</strong> studying within our portals, over 1,800 represent diverse backgrounds, uniting under an ethos of human dignity, mutual respect, and peaceful brotherhood.
            </p>
          </div>

          <div className="hero-cta-group">
            <Link to="/about" className="hero-cta-primary">
              Explore History & Achievements
              <IconChevronRight size={18} />
            </Link>
            <Link to="/facilities" className="hero-cta-ghost">
              Campus Facilities & Clubs
            </Link>
            <Link to="/gallery" className="hero-cta-ghost">
              Photo Gallery
            </Link>
          </div>

          <div className="hero-stats-strip">
            <div className="hero-stat-item">
              <span className="hero-stat-number">2,100+</span>
              <span className="hero-stat-label">Active Students</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">58+</span>
              <span className="hero-stat-label">Years of Eminence</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">11+</span>
              <span className="hero-stat-label">Student Wings & Clubs</span>
            </div>
            <div className="hero-stat-item">
              <span className="hero-stat-number">100%</span>
              <span className="hero-stat-label">Board Exam Rigor</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: DEDICATED "TODAY'S THIRUKKURAL" SECTION
          ========================================================================= */}
      <section className="home-kural-section reveal-init" aria-label="Today's Thirukkural">
        <div className="container">
          <div className="home-kural-card">
            <div className="home-kural-header">
              <div className="home-kural-badge">
                <IconBookOpen size={18} />
                <span>TODAY'S THIRUKKURAL • இன்றைய திருக்குறள்</span>
              </div>
              {kural && kural.kural_number && (
                <span className="kural-num-pill">குறள் எண்: {kural.kural_number}</span>
              )}
            </div>

            {kuralLoading ? (
              <div style={{ padding: '2rem 0' }}>
                <LoadingSpinner text="Retrieving today's sacred Thirukkural verse..." />
              </div>
            ) : kural ? (
              <div className="home-kural-content">
                <div className="home-kural-main-grid">
                  <div className="home-kural-verses-col">
                    <div className="home-kural-tamil-box">
                      <p className="home-kural-tamil-text">{kural.tamil_text}</p>
                    </div>

                    <div className="home-kural-details-grid">
                      <div className="home-kural-detail-card">
                        <span className="kural-sublabel">English Translation</span>
                        <p className="kural-translation-text">"{kural.english_meaning}"</p>
                      </div>

                      {kural.explanation && (
                        <div className="home-kural-detail-card">
                          <span className="kural-sublabel">Verse Meaning & Context • விளக்கம்</span>
                          <p className="kural-explanation-text">{kural.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="home-kural-portrait-col">
                    <div className="home-kural-portrait-frame">
                      <img
                        src={thiruImg}
                        alt="Ayyan Thiruvalluvar"
                        className="home-kural-portrait-img"
                        loading="lazy"
                      />
                      <div className="home-kural-portrait-tag">
                        <span>அய்யன் திருவள்ளுவர்</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="home-kural-footer-row">
                  <span className="home-kural-subtext">
                    Daily moral philosophy inspiring righteous character, discipline, and compassion at St. Britto.
                  </span>
                  <button
                    type="button"
                    className="home-kural-popup-btn"
                    onClick={openModal}
                  >
                    <IconEye size={17} />
                    <span>View in Popup Dialog</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="home-kural-empty">
                <p>Today's Thirukkural will be updated shortly by the school administrator.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PATRON SAINT — SAINT ARULANANDAR (ST. BRITTO)
          ========================================================================= */}
      <section className="patron-section reveal-init" aria-label="Patron Saint of St. Britto">
        <div className="container">
          <div className="patron-card">
            <div className="patron-image-col">
              <img
                src={britoImg}
                alt="Saint Arulanandar (St. Britto) Patron of the School"
                loading="lazy"
                className="patron-main-img"
              />
              <div className="patron-secondary-frame">
                <img
                  src={britoPortraitImg}
                  alt="Historic depiction of Saint John de Britto"
                  loading="lazy"
                  className="patron-sub-img"
                />
              </div>
            </div>

            <div className="patron-content-col">
              <span className="section-tag">Patron of the Institution</span>
              <h2 className="section-heading">Saint Arulanandar (St. Britto)</h2>
              <div className="patron-dates">
                <span>01-03-1647 — 04-02-1693 • Lisbon to Oriyur</span>
              </div>

              <p className="patron-text">
                Born in Lisbon, Portugal, on <strong>01-03-1647</strong>, St. Britto excelled in love, devotion, and steadfast discipline from early youth. Ordained a Jesuit priest in 1673, he sailed to India that very year with selfless apostolic dedication.
              </p>

              <p className="patron-text">
                From 1679 to 1693, he laboured tirelessly across Tamil Nadu, particularly in the arid Ramanathapuram region, championing the downtrodden and winning an everlasting sanctuary in the hearts of the common folk. He achieved martyrdom at Oriyur on <strong>04-02-1693</strong>, venerated forever as the <em>Saint of Marava Country</em>.
              </p>

              <div className="patron-quote">
                “Though born in a Western land, he gave his life for the Christian values of justice, love, duty, peace, human dignity, and sacrifice. We who study under his patronage strive daily to reflect this spirit and defend human dignity.”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: SCHOOL ADMINISTRATION & LEADERSHIP PROFILES
          ========================================================================= */}
      <section className="leadership-section reveal-init" aria-label="School Leadership Profiles">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Guiding Lights</span>
            <h2 className="section-heading">School Administration & Leadership</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Visionary educational leaders dedicated to character formation, academic distinction, and servant leadership.
            </p>
          </div>

          <div className="leadership-grid">
            {/* MANAGER */}
            <article className="leader-card reveal-init stagger-1">
              <div className="leader-image-wrapper">
                <img
                  src={managerImg}
                  alt="Most Rev. Dr. Antonysamy Savarimuthu - Manager"
                  className="leader-image"
                  loading="lazy"
                />
                <span className="leader-role-badge">School Manager</span>
              </div>
              <div className="leader-content">
                <h3 className="leader-name">Most Rev. Dr. Antonysamy Savarimuthu</h3>
                <div className="leader-subtitle">Metropolitan Archbishop of Madurai</div>
                <div className="leader-quote">
                  “Safeguarding religious character, gospel values, and national integrity in the hearts and minds of youth.”
                </div>
                <p className="leader-desc">
                  The Metropolitan Archbishop of the Roman Catholic Archdiocese of Madurai serves ex-officio as the Manager of St. Britto. He formulates macro policy decisions, steers archdiocesan educational objectives, and presides over the Archdiocesan Education Council.
                </p>
              </div>
            </article>

            {/* CORRESPONDENT */}
            <article className="leader-card reveal-init stagger-2">
              <div className="leader-image-wrapper">
                <img
                  src={corresImg}
                  alt="Rev. Fr. Louis A. - Correspondent"
                  className="leader-image"
                  loading="lazy"
                />
                <span className="leader-role-badge">Correspondent</span>
              </div>
              <div className="leader-content">
                <h3 className="leader-name">Rev. Fr. Louis A.</h3>
                <div className="leader-subtitle">Visionary Leader • Innovative Thinker • Spiritual Guide</div>
                <div className="leader-quote">
                  “Leadership is not about authority; it is about vision, inspiration, and transformation.”
                </div>
                <p className="leader-desc">
                  Rev. Fr. Louis A. is a dedicated priest spearheading holistic academic and infrastructural advancement. Notable accomplishments include installing smart digital classrooms for Middle, High, and Higher Secondary wings, cursive handwriting classes, and expert reading modules while fostering 100% board examination targets.
                </p>
                <div className="discrepancy-notice" title="Document Note">
                  *Historical narrative notes Rev. Fr. A. Joyce; current operational Correspondent is Rev. Fr. Louis A.
                </div>
              </div>
            </article>

            {/* HEADMASTER */}
            <article className="leader-card reveal-init stagger-3">
              <div className="leader-image-wrapper">
                <img
                  src={headmasterImg}
                  alt="Rev. Fr. Maria Arul Selvam - Headmaster"
                  className="leader-image"
                  loading="lazy"
                />
                <span className="leader-role-badge">Headmaster</span>
              </div>
              <div className="leader-content">
                <h3 className="leader-name">Rev. Fr. Maria Arul Selvam</h3>
                <div className="leader-subtitle">M.A., B.Ed. • Committed Teacher & Beacon of Light</div>
                <div className="leader-quote">
                  “Be perfect, therefore, as your heavenly Father is perfect.”
                </div>
                <p className="leader-desc">
                  Joined St. Britto in 2015 as Post Graduate Assistant, promoted in 2023 to Assistant Headmaster (AHM), and assumed the office of Headmaster in 2025. Guided by Gospel virtues, he champions educational innovation, classroom discipline, and nurturing civic leaders.
                </p>
                <div className="discrepancy-notice" title="Document Note">
                  *Historical text records Rev. Fr. D. Maria Arul Selvam; personal profile lists Rev. Fr. Maria Arul Selvam, M.A., B.Ed.
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: CAMPUS VIBRANCY & STUDENT LIFE HIGHLIGHTS
          ========================================================================= */}
      <section className="campus-vibrancy-section reveal-init" aria-label="Campus Life Highlights">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Campus Life</span>
            <h2 className="section-heading">Vibrant Student Life at St. Britto</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Where rigorous classroom instruction seamlessly unites with moral formation, athletic triumph, and patriotic service.
            </p>
          </div>

          <div className="vibrancy-mosaic-grid">
            <div className="vibrancy-card reveal-init stagger-1">
              <div className="vibrancy-img-frame">
                <img src={classroomImg} alt="Smart Digital Classrooms" loading="lazy" />
              </div>
              <div className="vibrancy-card-body">
                <span className="vibrancy-tag">Academic Excellence</span>
                <h4>Smart Digital Classrooms</h4>
                <p>Equipped with modern multimedia digital boards enabling immersive visual learning across sciences and languages.</p>
              </div>
            </div>

            <div className="vibrancy-card reveal-init stagger-2">
              <div className="vibrancy-img-frame">
                <img src={basketballImg} alt="Athletic Sports and Basketball" loading="lazy" />
              </div>
              <div className="vibrancy-card-body">
                <span className="vibrancy-tag">State-Level Champions</span>
                <h4>Sports & CM Trophy Basketball</h4>
                <p>3rd Place State-Level Champions with ₹3,00,000 in government awards, cultivating resilience and team spirit.</p>
              </div>
            </div>

            <div className="vibrancy-card reveal-init stagger-3">
              <div className="vibrancy-img-frame">
                <img src={nccImg} alt="NCC 4(TN) Engr Coy" loading="lazy" />
              </div>
              <div className="vibrancy-card-body">
                <span className="vibrancy-tag">Cadet Corps</span>
                <h4>NCC Unit — 4(TN) Engr Coy</h4>
                <p>Troop No: 355 with 100 disciplined cadets actively engaging in drills, national integration, and civic duty.</p>
              </div>
            </div>

            <div className="vibrancy-card reveal-init stagger-4">
              <div className="vibrancy-img-frame">
                <img src={bandImg} alt="Britto Band Troupe" loading="lazy" />
              </div>
              <div className="vibrancy-card-body">
                <span className="vibrancy-tag">Musical Majesty</span>
                <h4>St. Britto Band Troupe (Estd. 1994)</h4>
                <p>Leading ceremonial march-pasts, official parades, and festive school inaugurations with rhythmic majesty.</p>
              </div>
            </div>

            <div className="vibrancy-card reveal-init stagger-5">
              <div className="vibrancy-img-frame">
                <img src={independenceImg} alt="Independence Day Parade" loading="lazy" />
              </div>
              <div className="vibrancy-card-body">
                <span className="vibrancy-tag">Patriotism & Culture</span>
                <h4>National Observances & Parades</h4>
                <p>Ceremonial flag hoisting, march-pasts, and cultural presentations celebrating our national unity and secular heritage.</p>
              </div>
            </div>

            <div className="vibrancy-card reveal-init stagger-6">
              <div className="vibrancy-img-frame">
                <img src={prayerImg} alt="Spiritual Assembly and Prayers" loading="lazy" />
              </div>
              <div className="vibrancy-card-body">
                <span className="vibrancy-tag">Moral Formation</span>
                <h4>Spiritual Reflection & Ethics</h4>
                <p>Cultivating inter-religious brotherhood, character building, and peaceful reflection: <em>“Silence is the greatest weapon.”</em></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: OFFICIAL SCHOOL ACADEMIC CALENDAR
          ========================================================================= */}
      <section className="calendar-section reveal-init" aria-label="School Academic Calendar">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Academic Schedule</span>
            <h2 className="section-heading">Official School Academic Calendar</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Access and download authentic academic year schedules, examination dates, and official institutional announcements.
            </p>
          </div>

          {calendarsLoading ? (
            <LoadingSpinner text="Retrieving academic calendar schedules..." />
          ) : calendars.length === 0 ? (
            <EmptyState
              icon={<IconCalendar size={32} />}
              title="No Calendar Uploaded Yet"
              description="The school administration will publish the updated academic calendar soon. Please check back later."
            />
          ) : (
            <div className={`calendar-grid ${calendars.length === 1 ? 'single-calendar-grid' : ''}`}>
              {calendars.map((cal) => {
                const fileUrl = cal.file_url?.startsWith('http')
                  ? cal.file_url
                  : `${API_BASE_URL}${cal.file_url || `/uploads/calendars/${cal.file_path}`}`;

                return (
                  <div key={cal.id} className={`calendar-card reveal-init ${calendars.length === 1 ? 'featured-calendar-card' : ''}`}>
                    <div className="calendar-header-row">
                      <div className="calendar-icon-box">
                        <IconCalendar size={calendars.length === 1 ? 28 : 24} />
                      </div>
                      <div>
                        <h3 className="calendar-title">{cal.title}</h3>
                      </div>
                    </div>

                    <p className="calendar-desc">
                      {cal.description || 'Official academic year schedule and institutional events.'}
                    </p>

                    {cal.created_at && (
                      <div className="calendar-date">
                        Published on: {new Date(cal.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}

                    <div className="calendar-actions">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <IconExternalLink size={16} />
                        <span>View File</span>
                      </a>
                      <a
                        href={fileUrl}
                        download
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <IconDownload size={16} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: INSTITUTIONAL PILLARS & PORTAL NAVIGATION
          ========================================================================= */}
      <section className="home-portals-section reveal-init">
        <div className="container">
          <div className="portals-banner">
            <div className="portals-text">
              <span className="section-tag" style={{ color: 'var(--sandal-300)' }}>Join Our Mission</span>
              <h2 style={{ color: '#ffffff', fontSize: '2.1rem', margin: '0.4rem 0 0.8rem', fontWeight: 800 }}>
                A Vibrant Community of Learning & Fellowship
              </h2>
              <p style={{ color: 'var(--sandal-100)', maxWidth: '650px', fontSize: '1.02rem', lineHeight: 1.7 }}>
                Explore our detailed institutional history, inspect our 11+ co-curricular wings, connect with our proud global alumni, or browse our event photo archives.
              </p>
            </div>

            <div className="portals-links-row">
              <Link to="/about" className="portal-pill-btn">
                <span>About Us & Milestones</span>
                <IconChevronRight size={16} />
              </Link>
              <Link to="/facilities" className="portal-pill-btn">
                <span>Campus Facilities & Clubs</span>
                <IconChevronRight size={16} />
              </Link>
              <Link to="/alumni" className="portal-pill-btn">
                <span>Alumni Registration</span>
                <IconChevronRight size={16} />
              </Link>
              <Link to="/gallery" className="portal-pill-btn">
                <span>School Photo Archives</span>
                <IconChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
