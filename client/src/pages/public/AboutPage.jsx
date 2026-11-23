import React from 'react';
import classroomImg from '../../assets/School/classrooms.jpg';
import staffsImg from '../../assets/Staffs/img1.jpg';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { IconSparkles, IconCheck } from '../../components/common/Icons';
import './AboutPage.css';

export const AboutPage = () => {
  useScrollReveal();

  return (
    <div className="about-page">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="about-hero">
        <div className="container">
          <span className="hero-badge animate-fade-in" style={{ backgroundColor: 'rgba(216, 195, 165, 0.2)', borderColor: 'var(--sandal-300)', color: 'var(--sandal-100)' }}>
            <IconSparkles size={16} />
            ABOUT ST. BRITTO HR. SEC. SCHOOL
          </span>
          <h1 className="about-hero-title animate-fade-in-up">Legacy of Discipline, Character & Victory</h1>
          <p className="about-hero-subtitle animate-fade-in-up">
            Established on June 22, 1968, fostering academic prominence, athletic triumph, and civic responsibility under the timeless motto "Let Justice and Love Prevail".
          </p>
        </div>
      </section>

      {/* =========================================================================
          EDUCATIONAL VISION & CORE PHILOSOPHY
          ========================================================================= */}
      <section className="about-overview-section reveal-init">
        <div className="container overview-grid">
          <div className="overview-text-block">
            <span className="section-tag">Our Educational Vision</span>
            <h2>Two Eyes of Learning: Education and Discipline</h2>
            <p className="overview-lead">
              At St. Britto Higher Secondary School, education is not merely the acquisition of textbook knowledge; it is the holistic formation of character, moral conscience, and civic virtue.
            </p>
            <p className="overview-paragraph">
              Founded under the great vision of the former Archbishop of Madurai, <strong>Most Rev. Dr. Justin Diraviam</strong>, on <strong>22-06-1968</strong>, this institution was established to enlighten minds and transform hearts. Guided by Christian principles of selfless love and justice, it has nurtured thousands of young scholars over five decades.
            </p>
            <p className="overview-paragraph">
              With <strong>2,100 students</strong> on roll, our campus is a sanctuary of religious unity and human dignity. Students of all religions and communities receive equal care, brotherly love, and encouragement. Humanity and human dignity are celebrated daily through moral reflection, mutual service, and an enduring culture of peaceful resolution: <em>“Silence is the greatest weapon in the world.”</em>
            </p>

            <div className="vision-feature-pills">
              <div className="vision-pill">
                <IconCheck size={18} style={{ color: 'var(--brown-600)' }} />
                <span>Smart Multimedia Classrooms</span>
              </div>
              <div className="vision-pill">
                <IconCheck size={18} style={{ color: 'var(--brown-600)' }} />
                <span>State Championship Sports</span>
              </div>
              <div className="vision-pill">
                <IconCheck size={18} style={{ color: 'var(--brown-600)' }} />
                <span>NCC 4(TN) & Bharat Scouts</span>
              </div>
              <div className="vision-pill">
                <IconCheck size={18} style={{ color: 'var(--brown-600)' }} />
                <span>Character-First Mentorship</span>
              </div>
            </div>
          </div>

          <div className="overview-image-stack">
            <img
              src={classroomImg}
              alt="Classrooms at St. Britto"
              className="overview-main-img"
              loading="lazy"
            />
            <div className="overview-float-card">
              <div className="float-stat-number">2,100+</div>
              <div className="float-stat-label">Scholars Guided with Love & Justice</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FACULTY & PEDAGOGICAL STRENGTH
          ========================================================================= */}
      <section className="faculty-section reveal-init">
        <div className="container">
          <div className="faculty-grid">
            <div className="faculty-image-col">
              <img
                src={staffsImg}
                alt="Dedicated Teaching Faculty of St. Britto"
                className="faculty-img"
                loading="lazy"
              />
              <div className="faculty-badge">
                <span>Experienced • Compassionate • Dedicated</span>
              </div>
            </div>

            <div className="faculty-content-col">
              <span className="section-tag">Teaching Excellence</span>
              <h2 className="section-heading">Dedicated Educators & Mentors</h2>
              <p className="overview-paragraph">
                Our faculty consists of highly qualified, government-recognized Post Graduate Teachers, Graduate Teachers, Physical Directors, and non-teaching staff who look upon their vocation as a sacred duty.
              </p>
              <p className="overview-paragraph">
                Under the guidance of Rev. Fr. Correspondent and Rev. Fr. Headmaster, our educators consistently achieve near 100% pass percentages in Class X and Class XII Tamil Nadu State Board Examinations, providing remedial support for slower learners and advanced coaching for top performers.
              </p>
              <div className="congrats-box" style={{ marginTop: '1rem' }}>
                <strong>Pedagogical Creed:</strong>
                <br />
                “To educate a child is to kindle a flame, not merely to fill a vessel. At St. Britto, every student is known, respected, and encouraged to realize his full potential.”
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HISTORICAL MILESTONES TIMELINE
          ========================================================================= */}
      <section className="timeline-section reveal-init" aria-label="School Milestones Timeline">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Chronicle of Growth</span>
            <h2 className="section-heading">Five Decades of Institutional Milestones</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              From humble beginnings in 1968 to becoming one of Madurai's foremost higher secondary institutions.
            </p>
          </div>

          <div className="timeline-container">
            <div className="timeline-item reveal-init stagger-1">
              <div className="timeline-dot" />
              <div className="timeline-year">1968</div>
              <h3 className="timeline-title">Foundation of St. Britto School</h3>
              <p className="timeline-desc">
                Inaugurated on <strong>22-06-1968</strong> under the noble motto <em>‘Let Justice and Love Prevail’</em> through the vision of Most Rev. Dr. Justin Diraviam, former Archbishop of Madurai.
              </p>
            </div>

            <div className="timeline-item reveal-init stagger-2">
              <div className="timeline-dot" />
              <div className="timeline-year">1978</div>
              <h3 className="timeline-title">Upgrade to Higher Secondary Status</h3>
              <p className="timeline-desc">
                Upgraded to a Higher Secondary institution with specialized Science, Commerce, and Arts streams, providing a direct gateway to higher professional education for thousands of students.
              </p>
            </div>

            <div className="timeline-item reveal-init stagger-3">
              <div className="timeline-dot" />
              <div className="timeline-year">1994</div>
              <h3 className="timeline-title">Inauguration of the Britto Band Troupe</h3>
              <p className="timeline-desc">
                Founded under teacher Mr. A. Stanislaus Justin, the majestic school band troupe commenced its tradition of inaugurating ceremonial functions and leading march-pasts.
              </p>
            </div>

            <div className="timeline-item reveal-init stagger-4">
              <div className="timeline-dot" />
              <div className="timeline-year">2010 – 2020</div>
              <h3 className="timeline-title">Co-Curricular Expansion & NCC 4(TN)</h3>
              <p className="timeline-desc">
                Strengthening of the NCC 4(TN) Engr Coy unit, Bharat Scouts troop, Junior Red Cross, National Service Scheme, and sports coaching academies.
              </p>
            </div>

            <div className="timeline-item reveal-init stagger-5">
              <div className="timeline-dot" />
              <div className="timeline-year">2023 – Present</div>
              <h3 className="timeline-title">Smart Digital Pedagogy & State Triumphs</h3>
              <p className="timeline-desc">
                Installation of interactive smart classrooms, cursive handwriting programs, and state-level victory in the Chief Minister's Trophy Basketball Tournament (₹3,00,000 award).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
