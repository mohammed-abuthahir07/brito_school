import React, { useEffect, useRef, useState } from 'react';
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
import groundImg from '../../assets/Infrastracture/Ground.jpg';
import sideviewImg from '../../assets/Infrastracture/Schoolsideview.jpg';
import studentsImg from '../../assets/School/students.jpg';
import stateLevImg from '../../assets/Achievements/StateLev.png';
import thiruImg from '../../assets/thiru.webp';
import { publicService } from '../../services/publicService';
import { API_BASE_URL } from '../../services/api';
import { isAbortError } from '../../utils/userFacingError';
import { useDailyKural } from '../../context/DailyKuralContext';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RetryPanel } from '../../components/common/RetryPanel';
import {
  IconCalendar,
  IconDownload,
  IconExternalLink,
  IconSparkles,
  IconChevronRight,
  IconChevronLeft,
  IconBookOpen,
  IconEye,
} from '../../components/common/Icons';
import './HomePage.css';

const LEADERS = [
  {
    role: 'Correspondent',
    name: 'Rev. Fr. Louis A.',
    subtitle: 'A Visionary Leader – An Innovative Thinker – A Spiritual Guide',
    quote: '“Leadership is not about authority; it is about vision, inspiration and transformation.”',
    image: corresImg,
    alt: 'Rev. Fr. Louis A. - Correspondent',
    paragraphs: [
      'Rev. Fr. Louis A is a visionary leader and dedicated priest committed to the academic, moral and spiritual development of students. With his progressive vision, he has worked towards increasing student strength and enhancing the quality of education at St. Britto Hr. Sec. School, Madurai.  His notable initiatives include introducing smart board facilities for the Middle, High and Higher Secondary sections, special cursive writing classes and innovative reading sessions with the guidance of experts. He takes an active role in academic improvement through regular classroom visits, monitoring teaching practices and assessing students’ learning progress. He provides continuous guidance and motivation to teachers, encouraging effective teaching strategies and quality classroom instruction. Through regular interaction with students, he identifies their learning needs, inspires them to overcome challenges and motivates them to achieve their fullest potential.',
    ],  
  },
  {
    role: 'Headmaster',
    name: 'Rev. Fr. Maria Arul Selvam',
    subtitle: 'M.A., B.Ed. • A visionary leader • A committed teacher • A beacon of light',
    quote: '“A true leader inspires others to dream more, learn more and achieve more.”',
    image: headmasterImg,
    alt: 'Rev. Fr. Maria Arul Selvam - Headmaster',
    paragraphs: [
      '“Be perfect, therefore, as your heavenly Father is perfect.”',
      'Rev. Fr. Maria Arul Selvam is a devoted educational leader whose path demonstrates commitment, tenacity, and an unwavering love of learning. In 2015, he started working at St. Britto Hr Sec. School as a Post Graduate Assistant (PG Assistant). In 2023, he received a promotion to Assistant Headmaster (AHM) in recognition of his leadership abilities and devotion to the teaching profession. He assumed the role of Headmaster in 2025 after years of outstanding service and administrative expertise. As the headmaster of St. Britto Hr. Sec. School in Madurai, he feels that education encompasses both the formation and the acquisition of information. He motivates teachers to strive for excellence, encourages innovative teaching practices and inspires students to develop confidence, responsibility and respect for others.',
    ],
  },
  {
    role: 'School Manager',
    name: 'Most Rev. Dr. Antonysamy Savarimuthu',
    subtitle: 'Metropolitan Archbishop of the Roman Catholic Archdiocese of Madurai',
    image: managerImg,
    alt: 'Most Rev. Dr. Antonysamy Savarimuthu - Manager',
    paragraphs: [
      'The Metropolitan Archbishop of the Roman Catholic Archdiocese of Madurai, Most Rev. Dr. Antonysamy Savarimuthu serves as the Manager of the school.He, as the Manager, designs the policy decisions, oversees the implementation of the archdiocesan educational policies and presides over the board meetings of the Education Council.Being the Manager he safeguards the religious character, values of the church and the national integrity imparted in the minds of the youth who are catered in our school.Under his visionary guidance and pastoral leadership, the institution remains steadfast in its commitment to holistic education, blending academic rigor with moral and spiritual formation. He actively encourages innovation in teaching methodologies, infrastructural growth, and inclusive outreach so that students from all walks of life receive equal opportunities to excel. Through his unwavering support, the school continues to nurture compassionate, disciplined, and socially responsible citizens dedicated to serving both God and the nation.',
    ],
  },
];

const LEADER_SLIDE_MS = 5000;

const calendarFileMeta = (fileUrl = '') => {
  const ext = (fileUrl.split('?')[0].split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') return { label: 'PDF', kind: 'Document' };
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return { label: ext.toUpperCase(), kind: 'Image' };
  if (['doc', 'docx'].includes(ext)) return { label: 'DOC', kind: 'Document' };
  return { label: 'FILE', kind: 'Attachment' };
};

export const HomePage = () => {
  const [calendars, setCalendars] = useState([]);
  const [calendarsLoading, setCalendarsLoading] = useState(true);
  const [calendarsError, setCalendarsError] = useState(null);
  const [leaderIndex, setLeaderIndex] = useState(0);
  const leaderPausedRef = useRef(false);
  const leaderTouchX = useRef(null);
  const { kural, loading: kuralLoading, openModal } = useDailyKural();

  useScrollReveal(calendars.length);

  useEffect(() => {
    const controller = new AbortController();
    publicService
      .getCalendars({}, { signal: controller.signal })
      .then((res) => {
        if (res.success && Array.isArray(res.calendars)) {
          setCalendars(res.calendars);
          setCalendarsError(null);
        }
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setCalendarsError('The academic calendar could not be loaded right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCalendarsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = window.setInterval(() => {
      if (leaderPausedRef.current) return;
      setLeaderIndex((current) => (current + 1) % LEADERS.length);
    }, LEADER_SLIDE_MS);
    return () => window.clearInterval(timer);
  }, []);

  const pauseLeaders = () => {
    leaderPausedRef.current = true;
  };

  const resumeLeaders = () => {
    leaderPausedRef.current = false;
  };

  const goToLeader = (nextIndex) => {
    setLeaderIndex((nextIndex + LEADERS.length) % LEADERS.length);
  };

  return (
    <div className="home-page page-enter">
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

          {/* <div className="hero-motto-callout">
           Good Morning !!!
          </div> */}

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
              <span className="hero-stat-number">50+</span>
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
          SECTION 2: PATRON SAINT — SAINT ARULANANDAR (ST. BRITTO)
          ========================================================================= */}
      <section className="home-creed-section reveal-init" aria-label="School motto and values">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Motto &amp; Values</span>
            <h2 className="section-heading">What This Temple of Learning Stands For</h2>
          </div>
          <div className="home-creed-grid">
            <article className="home-creed-card reveal-init stagger-1">
              <h3>Let Justice and Love Prevail</h3>
              <p>The school motto, adopted at the foundation on 22-06-1968, still measures discipline, fairness, and brotherhood on campus.</p>
            </article>
            <article className="home-creed-card reveal-init stagger-2">
              <h3>Education and Discipline</h3>
              <p>St. Britto regards education and discipline as its two eyes — academic work joined to character, moral conscience, and civic virtue.</p>
            </article>
            <article className="home-creed-card reveal-init stagger-3">
              <h3>Silence is the Greatest Weapon</h3>
              <p>Peaceful resolution and human dignity are practised among 2,100 students of every religion, caste, and creed.</p>
            </article>
          </div>
        </div>
      </section>

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
        </div>

          <div
            className="leadership-carousel"
            onMouseEnter={pauseLeaders}
            onMouseLeave={resumeLeaders}
            onPointerEnter={pauseLeaders}
            onPointerLeave={resumeLeaders}
            onTouchStart={(event) => {
              leaderTouchX.current = event.changedTouches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (leaderTouchX.current == null) return;
              const delta = event.changedTouches[0].clientX - leaderTouchX.current;
              leaderTouchX.current = null;
              if (delta > 40) goToLeader(leaderIndex - 1);
              if (delta < -40) goToLeader(leaderIndex + 1);
            }}
          >
            <button
              type="button"
              className="leadership-nav prev"
              onClick={() => goToLeader(leaderIndex - 1)}
              aria-label="Previous leader"
            >
              <IconChevronLeft size={22} />
            </button>

            <div className="leadership-stage" aria-live="polite">
              {LEADERS.map((leader, index) => (
                <article
                  key={leader.role}
                  className={`leadership-slide${index === leaderIndex ? ' is-active' : ''}`}
                  aria-hidden={index !== leaderIndex}
                >
                  <div className="leadership-slide-media">
                    <img src={leader.image} alt={leader.alt} />
                  </div>
                  <div className="leadership-slide-copy">
                    <span className="leadership-slide-tag">{leader.role}</span>
                    <h3 className="leadership-slide-name">{leader.name}</h3>
                    <div className="leadership-slide-rule" aria-hidden="true" />
                    <p className="leadership-slide-subtitle">{leader.subtitle}</p>
                    <blockquote className={`leadership-slide-quote${leader.quote ? '' : ' is-empty'}`}>
                      {leader.quote || '\u00a0'}
                    </blockquote>
                    <div className="leadership-slide-text">
                      {leader.paragraphs.map((text) => (
                        <p key={text} className="leadership-slide-desc">{text}</p>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="leadership-nav next"
              onClick={() => goToLeader(leaderIndex + 1)}
              aria-label="Next leader"
            >
              <IconChevronRight size={22} />
            </button>

            <div className="leadership-dots" role="tablist" aria-label="Leadership slides">
              {LEADERS.map((leader, index) => (
                <button
                  key={leader.role}
                  type="button"
                  role="tab"
                  className={`leadership-dot${index === leaderIndex ? ' is-active' : ''}`}
                  aria-selected={index === leaderIndex}
                  aria-label={`Show ${leader.name}`}
                  onClick={() => goToLeader(index)}
                />
              ))}
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
      <section className="home-setting-section reveal-init" aria-label="Campus infrastructure highlights">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Campus Setting</span>
            <h2 className="section-heading">Grounds, Blocks &amp; Student Community</h2>
            <p className="home-setting-lead">
              The Madurai campus combines open athletic grounds, multi-level academic blocks, and a united student body of 2,100 boys. Full facility notes live on the Facilities page.
            </p>
          </div>
          <div className="home-setting-grid">
            <article className="home-setting-card reveal-init stagger-1">
              <img src={groundImg} alt="School athletic grounds" loading="lazy" />
              <div>
                <h3>Athletic grounds</h3>
                <p>Open grounds used for football, basketball, volleyball, track meets, morning assembly, and cadet parades.</p>
              </div>
            </article>
            <article className="home-setting-card reveal-init stagger-2">
              <img src={sideviewImg} alt="Academic campus buildings" loading="lazy" />
              <div>
                <h3>Academic blocks</h3>
                <p>Multi-level classroom buildings with wide breezeways, serving Middle, High, and Higher Secondary wings with smart boards.</p>
              </div>
            </article>
            <article className="home-setting-card reveal-init stagger-3">
              <img src={studentsImg} alt="Students of St. Britto" loading="lazy" />
              <div>
                <h3>Student community</h3>
                <p>More than 1,800 of the 2,100 students come from diverse religious and community backgrounds, studying under one motto.</p>
              </div>
            </article>
            <article className="home-setting-card reveal-init stagger-4">
              <img src={stateLevImg} alt="State-level sports recognition" loading="lazy" />
              <div>
                <h3>Athletic distinction</h3>
                <p>Third place at the State-Level Chief Minister’s Trophy basketball tournament, with a government award of ₹3,00,000.</p>
              </div>
            </article>
          </div>
          <div className="home-setting-cta">
            <Link to="/facilities" className="hero-cta-primary">
              View all facilities &amp; clubs
              <IconChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-kural-section reveal-init" aria-label="Today's Thirukkural">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">
              <IconBookOpen size={14} />
              Today’s Thirukkural • இன்றைய திருக்குறள்
            </span>
            {kural && kural.kural_number && (
              <p className="home-kural-number">குறள் எண் {kural.kural_number}</p>
            )}
          </div>

          {kuralLoading ? (
            <div className="home-kural-loading">
              <LoadingSpinner text="Retrieving today's sacred Thirukkural verse..." />
            </div>
          ) : kural ? (
            <div className="home-kural-layout">
              <aside className="home-kural-portrait-col">
                <div className="home-kural-portrait-frame">
                  <img
                    src={thiruImg}
                    alt="Ayyan Thiruvalluvar"
                    className="home-kural-portrait-img"
                    loading="lazy"
                  />
                  <div className="home-kural-portrait-tag">
                    <span>அய்யன் திருவள்ளுவர்</span>
                    <small>Thiruvalluvar</small>
                  </div>
                </div>
              </aside>

              <div className="home-kural-body">
                <blockquote className="home-kural-couplet">
                  <p className="home-kural-tamil-text">{kural.tamil_text}</p>
                </blockquote>

                <div className="home-kural-readings">
                  <div className="home-kural-reading">
                    <h3 className="kural-sublabel">English translation</h3>
                    <p className="kural-translation-text">“{kural.english_meaning}”</p>
                  </div>
                  {kural.explanation && (
                    <div className="home-kural-reading">
                      <h3 className="kural-sublabel">விளக்கம் • Meaning</h3>
                      <p className="kural-explanation-text">{kural.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="home-kural-empty">
              <p>Today's Thirukkural will be updated shortly by the school administrator.</p>
            </div>
          )}

          {kural && (
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
                <span>Open full reading</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="calendar-section reveal-init" aria-label="School Academic Calendar">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Academic Schedule</span>
            <h2 className="section-heading">Official School Academic Calendar</h2>
            <p className="calendar-section-lead">
              Access and download authentic academic year schedules, examination dates, and official institutional announcements.
            </p>
          </div>

          {calendarsLoading ? (
            <LoadingSpinner text="Retrieving academic calendar schedules..." />
          ) : calendarsError ? (
            <RetryPanel
              title="Calendar unavailable"
              message={calendarsError}
              onRetry={() => {
                setCalendarsLoading(true);
                publicService
                  .getCalendars()
                  .then((res) => {
                    if (res.success && Array.isArray(res.calendars)) {
                      setCalendars(res.calendars);
                      setCalendarsError(null);
                    }
                  })
                  .catch((err) => {
                    if (isAbortError(err)) return;
                    setCalendarsError('The academic calendar could not be loaded right now.');
                  })
                  .finally(() => setCalendarsLoading(false));
              }}
            />
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
                const fileMeta = calendarFileMeta(fileUrl);
                const publishedOn = cal.created_at
                  ? new Date(cal.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : null;

                return (
                  <article
                    key={cal.id}
                    className={`calendar-card reveal-init ${calendars.length === 1 ? 'featured-calendar-card' : ''}`}
                  >
                    <div className="calendar-doc-preview" aria-hidden="true">
                      <div className="calendar-doc-sheet">
                        <span className="calendar-doc-ribbon">{fileMeta.label}</span>
                        <div className="calendar-doc-icon">
                          <IconCalendar size={28} />
                        </div>
                        <span className="calendar-doc-filename">Academic Calendar</span>
                        <span className="calendar-doc-lines" />
                      </div>
                    </div>

                    <div className="calendar-card-body">
                      <span className="calendar-kicker">Official institutional release</span>
                      <h3 className="calendar-title">{cal.title}</h3>
                      <p className="calendar-desc">
                        {cal.description || 'Official academic year schedule and institutional events.'}
                      </p>

                      <ul className="calendar-meta">
                        {publishedOn && <li>Published {publishedOn}</li>}
                        <li>{fileMeta.kind} · {fileMeta.label}</li>
                        <li>For students &amp; parents</li>
                      </ul>

                      <div className="calendar-actions">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          <IconExternalLink size={16} />
                          <span>View document</span>
                        </a>
                        <a
                          href={fileUrl}
                          download
                          className="btn btn-secondary"
                        >
                          <IconDownload size={16} />
                          <span>Download</span>
                        </a>
                      </div>
                    </div>
                  </article>
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
