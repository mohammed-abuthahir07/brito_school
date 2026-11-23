import React from 'react';
import groundImg from '../../assets/Infrastracture/Ground.jpg';
import sideviewImg from '../../assets/Infrastracture/Schoolsideview.jpg';
import classroomImg from '../../assets/School/classrooms.jpg';
import officeImg from '../../assets/School/office.avif';
import prayerImg from '../../assets/School/prayers.jpg';
import studentsImg from '../../assets/School/students.jpg';
import nccImg from '../../assets/NCC/ncc.jpeg';
import scoutsImg from '../../assets/Scouts/Scouts.jpg';
import bandImg from '../../assets/Band/Band.jpeg';
import sportsImg from '../../assets/Sports/Football.jpg';
import basketballImg from '../../assets/Sports/basketball.jpg';
import basketball1Img from '../../assets/Sports/basketball1.jpg';
import pricesImg from '../../assets/Sports/prices.jpg';
import sportDevImg from '../../assets/Achievements/SportDev.png';
import districtLevImg from '../../assets/Achievements/DistrictLevel.jpeg';
import stateLevImg from '../../assets/Achievements/StateLev.png';
import jrcImg from '../../assets/JRC/JRC-Cadets.jpg';
import nssImg from '../../assets/NSS/nss.jpg';
import nss1Img from '../../assets/NSS/nss1.png';
import rrcImg from '../../assets/RRC/rcc.jpg';
import independenceImg from '../../assets/School/independenceday.jpg';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { PageHero } from '../../components/public/PageHero';
import {
  IconBuilding,
  IconAward,
} from '../../components/common/Icons';
import './FacilitiesPage.css';

export const FacilitiesPage = () => {
  useScrollReveal();

  return (
    <div className="facilities-page page-enter">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <PageHero
        icon={<IconBuilding size={16} />}
        badge="Campus & Co-Curricular Excellence"
        title="Infrastructure & Student Wings"
        subtitle="State-of-the-art educational infrastructure paired with 11+ dynamic student wings fostering civic duty, physical stamina, leadership, and moral character."
      />

      {/* =========================================================================
          SECTION 1: SCHOOL INFRASTRUCTURE FACILITIES
          ========================================================================= */}
      <section className="infra-section reveal-init" aria-label="School Infrastructure">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Campus Amenities</span>
            <h2 className="section-heading">School Infrastructure Facilities</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Expansive play arenas, ventilated digital classrooms, administrative complexes, and tranquil prayer spaces.
            </p>
          </div>

          <div className="infra-grid">
            <article className="infra-card reveal-init stagger-1">
              <div className="infra-img-wrapper">
                <img src={groundImg} alt="Spacious School Grounds" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Spacious Athletic Grounds</h3>
                <p className="infra-desc">
                  Expansive open grounds equipped for football matches, basketball tourneys, volleyball, track and field meets, daily morning assemblies, and ceremonial cadet parades.
                </p>
              </div>
            </article>

            <article className="infra-card reveal-init stagger-2">
              <div className="infra-img-wrapper">
                <img src={classroomImg} alt="Smart Digital Classrooms" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Smart Digital Classrooms</h3>
                <p className="infra-desc">
                  Interactive smart board installations for Middle, High, and Higher Secondary divisions, cursive handwriting workshops, and multimedia visual pedagogy.
                </p>
              </div>
            </article>

            <article className="infra-card reveal-init stagger-3">
              <div className="infra-img-wrapper">
                <img src={sideviewImg} alt="Campus Building Architecture" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Academic Campus Architecture</h3>
                <p className="infra-desc">
                  Stately, multi-level academic blocks designed with wide breezeways, natural cross-ventilation, robust safety standards, and peaceful study environments.
                </p>
              </div>
            </article>

            <article className="infra-card reveal-init stagger-4">
              <div className="infra-img-wrapper">
                <img src={officeImg} alt="Administrative Office" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Administrative Office</h3>
                <p className="infra-desc">
                  Centralized administrative office coordinating student admissions, institutional records, examination schedules, fee management, and parent communication.
                </p>
              </div>
            </article>

            <article className="infra-card reveal-init stagger-5">
              <div className="infra-img-wrapper">
                <img src={prayerImg} alt="Prayer Hall & Assembly" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Prayer Hall & Spiritual Assembly</h3>
                <p className="infra-desc">
                  Dedicated spiritual sanctuary fostering ethical reflection, moral contemplation, inter-religious harmony, and inner peace for scholars of all faiths.
                </p>
              </div>
            </article>

            <article className="infra-card reveal-init stagger-6">
              <div className="infra-img-wrapper">
                <img src={studentsImg} alt="United Student Body" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">United Student Community</h3>
                <p className="infra-desc">
                  A united fraternity of 2,100 young boys growing together in human dignity, mutual respect, teamwork, and lifelong fellowship.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: PRIMARY CO-CURRICULAR WINGS (NCC, SCOUTS, BAND, SPORTS)
          ========================================================================= */}
      <section className="clubs-section reveal-init" aria-label="Student Wings and Clubs">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Youth Movements</span>
            <h2 className="section-heading">Clubs & Co-Curricular Student Wings</h2>
            <p className="facilities-clubs-lead">
              Eleven specialised wings: NCC 4(TN) Engr Coy, Bharat Scouts, Britto Band, Sports, Junior Red Cross, NSS, Red Ribbon Club, YCS &amp; YSM, Anti-Drug Club, Finance Club, and Cultural activities.
            </p>
          </div>

          {/* 1. NCC */}
          <article className="club-feature-card reveal-init">
            <div className="club-img-col">
              <img src={nccImg} alt="NCC Cadets 4(TN) Engr Coy" className="club-feature-img" loading="lazy" />
            </div>
            <div className="club-content-col">
              <span className="club-tag">National Cadet Corps (NCC)</span>
              <h3 className="club-title">NCC Unit — 4(TN) Engr Coy NCC</h3>
              <p className="club-desc">
                The NCC unit of St. Britto Higher Secondary School, Madurai, plays a cornerstone role in cultivating discipline, national unity, and leadership among youth. Operating under the expert mentorship of <strong>4(TN) Engr Coy NCC</strong>, cadets actively participate in social service campaigns, flood relief assistance, drill competitions, and ceremonial guard-of-honor presentations.
              </p>
              <div className="club-meta-box">
                <strong>Unit Information:</strong> Total Strength: 100 Cadets • Troop No: 355 • Motto: <em>“Unity and Discipline”</em> • Troop Commander: <strong>P. Paul Peter Arulanathan</strong>.
              </div>
            </div>
          </article>

          {/* 2. BHARAT SCOUTS */}
          <article className="club-feature-card reverse reveal-init">
            <div className="club-img-col">
              <img src={scoutsImg} alt="Bharat Scouts Movement" className="club-feature-img" loading="lazy" />
            </div>
            <div className="club-content-col">
              <span className="club-tag">Bharat Scouts Movement</span>
              <h3 className="club-title">Scout Movement — St. Britto Troop</h3>
              <p className="club-desc">
                More than 100 Scout boys actively engage in the Bharat Scout Movement. Founded globally in 1907 by Lt. Gen. Robert Baden-Powell, scouting instills self-reliance, moral integrity, environmental care, and first-aid readiness. Regular training sessions are conducted every Friday during the 8th period.
              </p>
              <p className="club-desc">
                Living by the motto <em>"Helping Others"</em>, Scouts arrive before 8:30 a.m. each morning to guide students orderly to classrooms. At noon, they supervise lunch hall cleanliness, assist school visitors, and lead march-pasts on Republic Day and Sports Day.
              </p>
              <div className="club-meta-box">
                <strong>Honors & Coordination:</strong> Intensive preparation for <strong>Tritiya Sopan</strong> & the prestigious <strong>Rajya Puraskar</strong> Governor's Award. Coordinated by <strong>Mr. S. Ponraj</strong>, Graduate Teacher.
              </div>
            </div>
          </article>

          {/* 3. BRITTO BAND TROUPE */}
          <article className="club-feature-card reveal-init">
            <div className="club-img-col">
              <img src={bandImg} alt="Britto Band Troupe" className="club-feature-img" loading="lazy" />
            </div>
            <div className="club-content-col">
              <span className="club-tag">School Band Troupe</span>
              <h3 className="club-title">St. Britto Band Troupe (Estd. 1994)</h3>
              <p className="club-desc">
                Founded in <strong>1994</strong>, the Britto Band Troupe inaugurates major school functions with musical grandeur and rhythmic majesty. Welcoming eminent dignitaries, leading march-past contingents, and adding solemn glory to celebrations are the central mission of this beloved ensemble.
              </p>
              <div className="club-meta-box">
                <strong>Band Master History:</strong>
                <br />
                • 1994–1999: Teacher Mr. A. Stanislaus Justin
                <br />
                • 1999–2008: Teacher Mr. A. Louis Amalraj
                <br />
                • 2008–2017: Teacher Mr. M. S. Ackle Britto
                <br />
                • 2017–Present: Teacher <strong>Mr. K. Jayaseelan</strong>
              </div>
            </div>
          </article>

          {/* 4. SPORTS DEPARTMENT */}
          <article className="club-feature-card reverse reveal-init">
            <div className="club-img-col">
              <img src={sportsImg} alt="Sports and Football Tournament" className="club-feature-img" loading="lazy" />
            </div>
            <div className="club-content-col">
              <span className="club-tag">Athletic Wings</span>
              <h3 className="club-title">Sports, Basketball & Football</h3>
              <p className="club-desc">
                Our athletic department nurtures championship basketball squads, football teams, and track athletes. Renowned for capturing 3rd place in the State-Level Chief Minister's Trophy (₹3,00,000 cash prize), our athletic programs build team camaraderie, physical stamina, and competitive sportsmanship.
              </p>
              <div className="club-meta-box">
                <strong>Coaching Regimen:</strong> Supervised daily by Physical Directors, conducting morning stamina workouts, tactical strategy, and inter-school matches.
              </div>
            </div>
          </article>

          {/* =========================================================================
              MAJOR SPORTS ACHIEVEMENT: CM TROPHY STATE LEVEL BASKETBALL
              ========================================================================= */}
          <div className="facilities-spotlight-block reveal-init" aria-label="Major Sports Achievement">
            <div className="spotlight-card">
              <div>
                <div className="spotlight-badge">
                  <IconAward size={18} />
                  <span>State Level Triumph • 3rd Place</span>
                </div>
                <h3 className="spotlight-title">
                  State-Level Chief Minister's Trophy Basketball Tournament
                </h3>
                <p className="spotlight-desc">
                  In an extraordinary showcase of athletic stamina, team synergy, and competitive discipline, students from the Madurai district participated in the prestigious <strong>State-Level Chief Minister's Trophy Basketball Tournament</strong> held in Coimbatore and proudly captured <strong>Third Place at the State Level</strong>.
                </p>

                <div className="trophy-pills-row">
                  <div className="trophy-pill">
                    <span style={{ color: 'var(--brown-700)' }}>🏆</span>
                    <span>State 3rd Place Honor</span>
                  </div>
                  <div className="trophy-pill">
                    <span style={{ color: 'var(--brown-700)' }}>💰</span>
                    <span>Total Cash Prize: ₹3,00,000</span>
                  </div>
                  <div className="trophy-pill">
                    <span style={{ color: 'var(--brown-700)' }}>🎖️</span>
                    <span>12 Players (₹25,000 each)</span>
                  </div>
                  <div className="trophy-pill highlighted">
                    <span>⭐</span>
                    <span><strong>R. Dilip Akash</strong> (St. Britto): ₹25,000 Award</span>
                  </div>
                </div>

                <div className="congrats-box">
                  <strong>School's Heartfelt Congratulations:</strong>
                  <br />
                  On behalf of our school's Rev. Father Correspondent, Rev. Father Headmaster, teachers, Physical Director, physical education teachers, and staff, we extend our most heartfelt congratulations to our champion student <strong>R. Dilip Akash</strong> and the victorious team for bringing laurels to St. Britto and Madurai district!
                </div>
              </div>

              <div className="spotlight-image-grid">
                <img
                  src={stateLevImg}
                  alt="State Level Award Presentation"
                  className="spotlight-img"
                  loading="lazy"
                />
                <img
                  src={pricesImg}
                  alt="CM Trophy Award Prize Distribution"
                  className="spotlight-img"
                  loading="lazy"
                />
                <img
                  src={basketballImg}
                  alt="Basketball team action"
                  className="spotlight-img"
                  loading="lazy"
                />
                <img
                  src={basketball1Img}
                  alt="Basketball court practice"
                  className="spotlight-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              SPORTS DEVELOPMENT & ATHLETIC ACHIEVEMENTS
              ========================================================================= */}
          <div className="achievements-gallery-block reveal-init" style={{ marginTop: '3.5rem', marginBottom: '3.5rem' }}>
            <div className="section-header-center">
              <span className="section-tag">Athletic Distinction</span>
              <h2 className="section-heading">Sports Development & Championships</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                St. Britto has consistently dominated inter-school, zonal, district, and state athletic meets across basketball, football, and track and field.
              </p>
            </div>

            <div className="achievements-grid">
              <article className="achievement-card reveal-init stagger-1">
                <img
                  src={sportDevImg}
                  alt="Sports Development Program and Team Felicitation"
                  className="achievement-img"
                  loading="lazy"
                />
                <div className="achievement-card-body">
                  <span className="vibrancy-tag">Comprehensive Training</span>
                  <h3 className="achievement-card-title">Sports Development Initiatives</h3>
                  <p className="achievement-card-text">
                    Daily specialized morning and evening coaching sessions overseen by qualified Physical Directors, emphasizing physical endurance, agility, and fair play.
                  </p>
                </div>
              </article>

              <article className="achievement-card reveal-init stagger-2">
                <img
                  src={districtLevImg}
                  alt="District Level Sports Accolades"
                  className="achievement-img"
                  loading="lazy"
                />
                <div className="achievement-card-body">
                  <span className="vibrancy-tag">District Tournaments</span>
                  <h3 className="achievement-card-title">District Level Trophies & Medals</h3>
                  <p className="achievement-card-text">
                    Consistently securing top ranks in Madurai Revenue District athletic meets, inter-school tournaments, and zonal athletic championships.
                  </p>
                </div>
              </article>

              <article className="achievement-card reveal-init stagger-3">
                <img
                  src={stateLevImg}
                  alt="State Level Commendation"
                  className="achievement-img"
                  loading="lazy"
                />
                <div className="achievement-card-body">
                  <span className="vibrancy-tag">State Prominence</span>
                  <h3 className="achievement-card-title">State Level Felicitations</h3>
                  <p className="achievement-card-text">
                    Representing Madurai district at Tamil Nadu state-level championships, earning cash prizes, government merit awards, and sports quota certificates.
                  </p>
                </div>
              </article>
            </div>
          </div>

          {/* =========================================================================
              SECTION 3: SERVICE WINGS (JRC, NSS, RRC)
              ========================================================================= */}
          <article className="club-feature-card reveal-init">
            <div className="club-img-col">
              <img src={jrcImg} alt="Junior Red Cross Cadets" className="club-feature-img" loading="lazy" />
            </div>
            <div className="club-content-col">
              <span className="club-tag">JRC Wing</span>
              <h3 className="club-title">Junior Red Cross (JRC)</h3>
              <p className="club-desc">
                Cadets are formed in health awareness, disaster first-aid, sanitation, and humanitarian service — training that supports empathy and an immediate relief response in the school community.
              </p>
            </div>
          </article>

          <article className="club-feature-card reverse reveal-init">
            <div className="club-img-col">
              <img src={nssImg} alt="NSS Community Volunteers" className="club-feature-img" loading="lazy" />
            </div>
            <div className="club-content-col">
              <span className="club-tag">NSS Unit</span>
              <h3 className="club-title">National Service Scheme (NSS)</h3>
              <p className="club-desc">
                Volunteers take part in rural literacy workshops, tree-planting, blood-donation awareness, and civic sanitation. The unit’s work is campus service, not a substitute for the detailed NCC and Scouts programmes above.
              </p>
            </div>
          </article>

          <article className="club-feature-card reveal-init">
            <div className="club-img-col">
              <img src={rrcImg} alt="Red Ribbon Club" className="club-feature-img" loading="lazy" />
            </div>
            <div className="club-content-col">
              <span className="club-tag">RRC Movement</span>
              <h3 className="club-title">Red Ribbon Club (RRC)</h3>
              <p className="club-desc">
                A youth health wing that promotes positive lifestyles, health awareness, peer counselling, and adolescent hygiene on campus.
              </p>
            </div>
          </article>

          {/* =========================================================================
              SECTION 4: SPECIALIZED STUDENT CLUBS
              ========================================================================= */}
          <div className="secondary-clubs-grid" style={{ marginTop: '2.5rem' }}>
            <article className="secondary-club-card reveal-init stagger-1">
              <div className="secondary-club-img-wrap">
                <img src={prayerImg} alt="YCS and YSM student gathering" className="secondary-club-img" loading="lazy" />
              </div>
              <div className="secondary-club-body">
                <h4 className="secondary-club-title">YCS & YSM</h4>
                <p className="secondary-club-desc">
                  Young Christian Students / Young Students Movement encourages analytical social awareness, moral leadership, self-reflection, and compassionate civic engagement.
                </p>
              </div>
            </article>

            <article className="secondary-club-card reveal-init stagger-2">
              <div className="secondary-club-img-wrap">
                <img src={nss1Img} alt="Anti-Drug Club campus awareness" className="secondary-club-img" loading="lazy" />
              </div>
              <div className="secondary-club-body">
                <h4 className="secondary-club-title">Anti-Drug Club</h4>
                <p className="secondary-club-desc">
                  Active campus campaigns, informative seminars, and peer-to-peer dialogues promoting drug-free campuses, mental fitness, and wholesome lifestyle choices.
                </p>
              </div>
            </article>

            <article className="secondary-club-card reveal-init stagger-3">
              <div className="secondary-club-img-wrap">
                <img src={officeImg} alt="Finance Club academic work" className="secondary-club-img" loading="lazy" />
              </div>
              <div className="secondary-club-body">
                <h4 className="secondary-club-title">Finance Club</h4>
                <p className="secondary-club-desc">
                  Empowering secondary students with foundational financial literacy, savings disciplines, family budgeting ethics, and modern economic awareness.
                </p>
              </div>
            </article>

            <article className="secondary-club-card reveal-init stagger-4">
              <div className="secondary-club-img-wrap">
                <img src={independenceImg} alt="Cultural activities and arts on campus" className="secondary-club-img" loading="lazy" />
              </div>
              <div className="secondary-club-body">
                <h4 className="secondary-club-title">Cultural Activities & Arts</h4>
                <p className="secondary-club-desc">
                  Annual theatrical productions, classical and folk music performances, Tamil literary debates, oratorical championships, and celebratory carnivals.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};
