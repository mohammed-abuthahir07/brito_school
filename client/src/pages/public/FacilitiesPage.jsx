import React, { useEffect, useRef, useState } from 'react';
import groundImg from '../../assets/Infrastracture/Ground.jpg';
import sideviewImg from '../../assets/Infrastracture/Schoolsideview.jpg';
import classroomImg from '../../assets/School/classrooms.jpg';
import officeImg from '../../assets/School/office.avif';
import prayerImg from '../../assets/School/prayers.jpg';
import studentsImg from '../../assets/School/students.jpg';
import footballImg from '../../assets/Sports/Football.jpg';
import hockeyImg from '../../assets/Sports/Hocky.jpg';
import nccImg from '../../assets/NCC/ncc.jpeg';
import scoutsImg from '../../assets/Scouts/Scouts.jpg';
import bandImg from '../../assets/Band/Band.jpeg';
import jrcImg from '../../assets/JRC/JRC-Cadets.png';
import nssImg from '../../assets/NSS/nss.jpg';
import basketballImg from '../../assets/Sports/basketball.png';
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
      'The NCC unit of St. Britto Higher Secondary School, Madurai, plays a cornerstone role in cultivating discipline, national unity, and leadership among youth. Operating under the expert mentorship of 4(TN) Engr Coy NCC, cadets actively participate in social service campaigns, flood relief assistance, drill competitions, and ceremonial guard-of-honour presentations.',
      'Regular weekly parades, physical fitness sessions, and drill practices are conducted on the school grounds to build endurance, focus, and teamwork. Cadets actively attend Combined Annual Training Camps (CATC) and specialized engineering camps, where they receive hands-on training in map reading, field craft, disaster management, and weapon handling. Cadets are systematically trained and mentored to appear for and excel in the NCC “A” Certificate examination.',
    ],
    points: [
      'Swachh Bharat cleanliness drives and tree plantation',
      'Blood donation awareness, traffic control, and anti-drug rallies',
    ],
  },
  {
    tag: 'Bharat Scouts Movement',
    title: 'Scout Movement — St. Britto Troop',
    image: scoutsImg,
    alt: 'Bharat Scouts Movement',
    paragraphs: [
      'At our school, more than 100 Scout boys actively participate in the Bharat Scout Movement. They receive systematic and regular training to develop their skills, discipline, leadership qualities, and character.',
      'The Bharat Scouts and Guides is a worldwide youth movement established to promote the physical, mental, and spiritual development of young people. It was founded in 1907 in England by Lieutenant General Robert Baden-Powell.',
      'The movement is a voluntary organization that nurtures good character, a spirit of service, discipline, leadership, and responsibility among students. Its primary objective is to develop young people into responsible and ideal citizens. Through practical training, students learn to help others, protect the environment, and build self-confidence.',
      'The Scout Movement at our school is successfully guided and coordinated by Mr. S. Ponraj, Graduate Teacher, St. Britto Higher Secondary School, Madurai – 16.',
    ],
  },
  {
    tag: 'School Band Troupe',
    title: 'St. Britto Band Troupe (Estd. 1994)',
    image: bandImg,
    alt: 'Britto Band Troupe',
    paragraphs: [
      'The St. Britto Band Troupe was started in the year 1994 and has been functioning wonderfully until today. Our school band plays a primary role in grandly kicking off all the functions held at the school.',
      'The main objective of the Britto Band Troupe is to welcome special guests during events and entertain them. Our Britto Band Troupe takes the lead and adds grandeur to all functions and parade events held at the school.',
      'From the time the Britto Band Troupe was founded, the following teachers have served as secretaries and guided the troupe wonderfully:',
    ],
    points: [
      '1994–1999: Teacher Mr. A. Carlos Justin',
      '1999–2008: Teacher Mr. A. Louis Amalraj',
      '2008–2017: Teacher Mr. M. S. Agnel Cretus',
      '2017–present: Teacher Mr. K. Jeyaseelan has been serving as the secretary of the Britto Band Troupe and leading it wonderfully',
    ],
  },
];

const SERVICE_WINGS = [
  {
    tag: 'JRC Wing',
    title: 'Junior Red Cross (JRC)',
    image: jrcImg,
    alt: 'Junior Red Cross Cadets',
    paragraphs: [
      'The school-level student wing of the global Red Cross Society, known as the Junior Red Cross (JRC), has been functioning in our school since its very inception. This organization carries out various activities in our school, which are listed below.',
      'From June to February, training classes were held three times a month depending on the circumstances. In these sessions, discussions and explanations were provided on:',
    ],
    points: [
      'History of the movement',
      'Health and first-aid training',
      'Personal hygiene',
      'Environmental awareness',
      'Drug awareness and its consequences',
      'Self-discipline, public welfare, national integration, and international friendship',
    ],
    closing: [
      'All of these activities are being wonderfully implemented under the guidance of the School Correspondent Rev. Fr. A. Louis and Headmaster Rev. Fr. D. Maria Arulchelvan, by our school’s Graduate Science Teacher Mr. S. Sahaya Kumar, who serves as the school’s JRC Counsellor and the Madurai Educational District Joint Coordinator.',
    ],
  },
  {
    tag: 'NSS Unit',
    title: 'National Service Scheme (NSS)',
    image: nssImg,
    alt: 'NSS Community Volunteers',
    paragraphs: [
      'NSS volunteers support road safety each morning so students can arrive at school safely, organise medical camps on campus and during special camps, and run anti-drug awareness programmes with police officers and the Singapenn (Women’s Safety) wing.',
    ],
    points: [
      'Every morning, dedicated NSS volunteers assist with traffic regulation and road safety near the school entrance, ensuring that all students arrive at school safely and smoothly.',
      'Volunteers actively organize and assist in general medical check-up camps on campus as well as during annual special camps, helping provide essential healthcare support to students and local residents.',
      'Every year, a seven-day residential special camp is organized in a nearby adopted village, where students engage in community service, literacy drives, hygiene awareness, and rural development work.',
      'Volunteers regularly participate in campus cleaning drives, tree plantation programmes, and plastic-free initiatives to maintain a green and healthy school environment.',
    ],
  },
  {
    tag: 'RRC Movement',
    title: 'Red Ribbon Club (RRC)',
    image: rrcImg,
    alt: 'Red Ribbon Club',
    paragraphs: [
      'The Red Ribbon Club (RRC) is a voluntary organization formed to create awareness about HIV and AIDS among school students. This club has been actively functioning in our school to empower students with accurate health information and social responsibility.',
      'Throughout the academic year, regular awareness sessions and peer-education classes are conducted for students. In these sessions, discussions and guidance are provided on healthy living, adolescent health, prevention of infectious diseases, blood donation awareness, and avoiding high-risk behaviors and substance abuse.',
      'To engage students creatively, various competitions such as essay writing, drawing, elocution, and quizzes are organized on health and social awareness themes. The club also observes World AIDS Day every year on December 1st by organizing awareness rallies, human chains, and pledge-taking ceremonies to spread the message to the wider community.',
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

      <div className="wing-stage" aria-live="polite">
        {items.map((item, itemIndex) => (
          <article
            key={item.tag}
            className={`wing-slide${itemIndex === index ? ' is-active' : ''}`}
            aria-hidden={itemIndex !== index}
          >
            <div className="wing-slide-media">
              <img src={item.image} alt={item.alt} />
            </div>
            <div className="wing-slide-copy">
              <span className="wing-slide-tag">{item.tag}</span>
              <h3 className="wing-slide-title">{item.title}</h3>
              <div className="wing-slide-rule" aria-hidden="true" />
              <div className="wing-slide-text">
                {item.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="wing-slide-desc">
                    {paragraph}
                  </p>
                ))}
                {item.points?.length ? (
                  <ul className="wing-slide-list">
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
                {item.closing?.map((paragraph) => (
                  <p key={paragraph} className="wing-slide-desc">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

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

            <article className="infra-card reveal-init stagger-1">
              <div className="infra-img-wrapper">
                <img src={footballImg} alt="Football Field and Training" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Football Arena & Training</h3>
                <p className="infra-desc">
                  Full-sized dedicated football ground hosting inter-school tournaments, daily morning and evening tactical drills, team practice, and state-level coaching.
                </p>
              </div>
            </article>

            <article className="infra-card reveal-init stagger-2">
              <div className="infra-img-wrapper">
                <img src={basketballImg} alt="Basketball Court" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Basketball Court & Coaching</h3>
                <p className="infra-desc">
                  Regulation basketball court fostering agility, competitive team spirit, regular inter-school league championships, and specialized skills coaching.
                </p>
              </div>
            </article>

            <article className="infra-card reveal-init stagger-3">
              <div className="infra-img-wrapper">
                <img src={hockeyImg} alt="Hockey Ground and Practice" className="infra-img" loading="lazy" />
              </div>
              <div className="infra-body">
                <h3 className="infra-title">Hockey Ground & Practice Field</h3>
                <p className="infra-desc">
                  Spacious dedicated hockey practice field providing professional stick handling, endurance training, team coordination, and district tournament preparation.
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
