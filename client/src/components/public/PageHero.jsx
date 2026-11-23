import React from 'react';
import entranceImg from '../../assets/School/Entrence.jpg';
import './PageHero.css';

export const PageHero = ({
  badge,
  icon,
  title,
  subtitle,
  backgroundImage = entranceImg,
  backgroundPosition = 'center 28%',
}) => {
  return (
    <section
      className="page-hero"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition,
      }}
      aria-label={title}
    >
      <div className="page-hero-overlay" />
      <div className="page-hero-content animate-fade-in">
        {badge && (
          <div className="hero-badge">
            {icon}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="page-hero-title">{title}</h1>
        {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
      </div>
    </section>
  );
};
