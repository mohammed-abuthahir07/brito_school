import React, { useEffect, useRef, useState } from 'react';
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
  IconChevronLeft,
  IconChevronRight,
} from '../../components/common/Icons';
import './FacilitiesPage.css';

const SLIDE_MS = 5000;

const YOUTH_WINGS = [
  {
    tag: 'National Cadet Corps (NCC)',
    title: 'NCC Unit — 4(TN) Engr Coy NCC',
    image: nccImg,
    alt: 'NCC Cadets 4(TN) Engr Coy',
    paragraphs: [
      <>
        The NCC unit of St. Britto Higher Secondary School, Madurai, plays a cornerstone role in cultivating discipline, national unity, and leadership among youth. Operating under the expert mentorship of <strong>4(TN) Engr Coy NCC</strong>, cadets actively participate in social service campaigns, flood relief assistance, drill competitions, and ceremonial guard-of-honor presentations.
      </>,
    ],
    meta: (
      <>
        <strong>Unit Information:</strong> Total Strength: 100 Cadets • Troop No: 355 • Motto: <em>“Unity and Discipline”</em> • Troop Commander: <strong>P. Paul Peter Arulanathan</strong>.
      </>
    ),
  },
  {
    tag: 'Bharat Scouts Movement',
    title: 'Scout Movement — St. Britto Troop',
    image: scoutsImg,
    alt: 'Bharat Scouts Movement',
    paragraphs: [
      'More than 100 Scout boys actively engage in the Bharat Scout Movement. Founded globally in 1907 by Lt. Gen. Robert Baden-Powell, scouting instills self-reliance, moral integrity, environmental care, and first-aid readiness. Regular training sessions are conducted every Friday during the 8th period.',
      <>
        Living by the motto <em>"Helping Others"</em>, Scouts arrive before 8:30 a.m. each morning to guide students orderly to classrooms. At noon, they supervise lunch hall cleanliness, assist school visitors, and lead march-pasts on Republic Day and Sports Day.
      </>,
    ],
    meta: (
      <>
        <strong>Honors & Coordination:</strong> Intensive preparation for <strong>Tritiya Sopan</strong> & the prestigious <strong>Rajya Puraskar</strong> Governor's Award. Coordinated by <strong>Mr. S. Ponraj</strong>, Graduate Teacher.
      </>
    ),
  },
  {
    tag: 'School Band Troupe',
    title: 'St. Britto Band Troupe (Estd. 1994)',
    image: bandImg,
    alt: 'Britto Band Troupe',
    paragraphs: [
      <>
        Founded in <strong>1994</strong>, the Britto Band Troupe inaugurates major school functions with musical grandeur and rhythmic majesty. Welcoming eminent dignitaries, leading march-past contingents, and adding solemn glory to celebrations are the central mission of this beloved ensemble.
      </>,
    ],
    meta: (
      <>
        <strong>Band Master History</strong>
        <ul className="club-meta-list">
          <li>1994–1999: Teacher Mr. A. Stanislaus Justin</li>
          <li>1999–2008: Teacher Mr. A. Louis Amalraj</li>
          <li>2008–2017: Teacher Mr. M. S. Ackle Britto</li>
          <li>2017–Present: Teacher <strong>Mr. K. Jayaseelan</strong></li>
        </ul>
      </>
    ),
  },
  {
    tag: 'Athletic Wings',
    title: 'Sports, Basketball & Football',
    image: sportsImg,
    alt: 'Sports and Football Tournament',
    paragraphs: [
      'Our athletic department nurtures championship basketball squads, football teams, and track athletes. Renowned for capturing 3rd place in the State-Level Chief Minister\'s Trophy (₹3,00,000 cash prize), our athletic programs build team camaraderie, physical stamina, and competitive sportsmanship.',
    ],
    meta: (
      <>
        <strong>Coaching Regimen:</strong> Supervised daily by Physical Directors, conducting morning stamina workouts, tactical strategy, and inter-school matches.
      </>
    ),
  },
];

const SERVICE_WINGS = [
  {
    tag: 'JRC Wing',
    title: 'Junior Red Cross (JRC)',
    image: jrcImg,
    alt: 'Junior Red Cross Cadets',
    paragraphs: [
      'Cadets are formed in health awareness, disaster first-aid, sanitation, and humanitarian service — training that supports empathy and an immediate relief response in the school community.',
    ],
  },
  {
    tag: 'NSS Unit',
    title: 'National Service Scheme (NSS)',
    image: nssImg,
    alt: 'NSS Community Volunteers',
    paragraphs: [
      'Volunteers take part in rural literacy workshops, tree-planting, blood-donation awareness, and civic sanitation. The unit’s work is campus service, not a substitute for the detailed NCC and Scouts programmes above.',
    ],
  },
  {
    tag: 'RRC Movement',
    title: 'Red Ribbon Club (RRC)',
    image: rrcImg,
    alt: 'Red Ribbon Club',
    paragraphs: [
      'A youth health wing that promotes positive lifestyles, health awareness, peer counselling, and adolescent hygiene on campus.',
    ],
  },
];

const WingSlider = ({ items, ariaLabel }) => {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const touchX = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((current) => (current + 1) % items.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [items.length]);

  const goTo = (nextIndex) => {
    setIndex((nextIndex + items.length) % items.length);
  };

  const active = items[index];

  return (
    <div
      className="wing-carousel"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onPointerEnter={() => {
        pausedRef.current = true;
      }}
      onPointerLeave={() => {
        pausedRef.current = false;
      }}
      onTouchStart={(event) => {
        touchX.current = event.changedTouches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchX.current == null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (delta > 40) goTo(index - 1);
        if (delta < -40) goTo(index + 1);
      }}
    >
      <button
        type="button"
        className="wing-nav prev"
        onClick={() => goTo(index - 1)}
        aria-label={`Previous ${ariaLabel}`}
      >
        <IconChevronLeft size={22} />
      </button>

      <article className="wing-slide" key={active.tag} aria-live="polite">
        <div className="wing-slide-media">
          <img src={active.image} alt={active.alt} />
        </div>
        <div className="wing-slide-copy">
          <span className="wing-slide-tag">{active.tag}</span>
          <h3 className="wing-slide-title">{active.title}</h3>
          <div className="wing-slide-rule" aria-hidden="true" />
          {active.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex} className="wing-slide-desc">
              {paragraph}
            </p>
          ))}
          {active.meta ? <div className="club-meta-box">{active.meta}</div> : null}
        </div>
      </article>

      <button
        type="button"
        className="wing-nav next"
        onClick={() => goTo(index + 1)}
        aria-label={`Next ${ariaLabel}`}
      >
        <IconChevronRight size={22} />
      </button>

      <div className="wing-dots" role="tablist" aria-label={ariaLabel}>
        {items.map((item, itemIndex) => (
          <button
            key={item.tag}
            type="button"
            role="tab"
            className={`wing-dot${itemIndex === index ? ' is-active' : ''}`}
            aria-selected={itemIndex === index}
            aria-label={`Show ${item.title}`}
            onClick={() => goTo(itemIndex)}
          />
        ))}
      </div>
    </div>
  );
};

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
        backgroundImage={groundImg}
        backgroundPosition="center 45%"
      />

      {/* =========================================================================
          SECTION 1: SCHOOL INFRASTRUCTURE FACILITIES
          ========================================================================= */}
      <section className="infra-section reveal-init" aria-label="School Infrastructure">
        <div className="container">
          <div className="section-header-center">
            <span className="section-tag">Campus Amenities</span>
            <h2 className="section-heading">School Infrastructure Facilities</h2>
            <p className="facilities-section-lead">
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

          <WingSlider items={YOUTH_WINGS} ariaLabel="youth movement" />

          {/* =========================================================================
              SPORTS DEVELOPMENT & ATHLETIC ACHIEVEMENTS
              ========================================================================= */}
          <div className="achievements-gallery-block reveal-init">
            <div className="section-header-center">
              <span className="section-tag">Athletic Distinction</span>
              <h2 className="section-heading">Sports Development & Championships</h2>
              <p className="facilities-section-lead">
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

          <div className="section-header-center facilities-subhead">
            <span className="section-tag">Service Wings</span>
            <h2 className="section-heading">JRC, NSS &amp; Red Ribbon Club</h2>
          </div>

          <WingSlider items={SERVICE_WINGS} ariaLabel="service wing" />

          <div className="section-header-center facilities-subhead">
            <span className="section-tag">Campus Clubs</span>
            <h2 className="section-heading">Specialised Student Clubs</h2>
          </div>

          <div className="secondary-clubs-grid">
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
