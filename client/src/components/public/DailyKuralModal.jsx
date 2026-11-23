import React, { useEffect } from 'react';
import { useDailyKural } from '../../context/DailyKuralContext';
import { Button } from '../common/Button';
import { IconBookOpen, IconX } from '../common/Icons';
import thiruImg from '../../assets/thiru.webp';
import './DailyKuralModal.css';

export const DailyKuralModal = () => {
  const { kural, modalOpen, closeModal } = useDailyKural();

  // Close on Escape key press
  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, closeModal]);

  if (!modalOpen || !kural) return null;

  return (
    <div
      className="kural-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-kural-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="kural-card">
        <div className="kural-top-bar">
          <div className="kural-top-title">
            <IconBookOpen size={20} />
            <span id="daily-kural-title">Today's Thirukkural • இன்றைய திருக்குறள்</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {kural.kural_number && (
              <span className="kural-kural-badge">குறள் {kural.kural_number}</span>
            )}
            <button
              type="button"
              className="kural-close"
              onClick={closeModal}
              aria-label="Close daily Thirukkural"
            >
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div className="kural-body">
          <div className="kural-layout-grid">
            <div className="kural-content-col">
              <div className="kural-decorative-quote" aria-hidden="true">“</div>

              <div className="kural-tamil-box">
                <p className="kural-tamil-text">{kural.tamil_text}</p>
              </div>

              <div className="kural-meaning-box">
                <div className="kural-label">English Translation</div>
                <p className="kural-english-meaning">"{kural.english_meaning}"</p>
              </div>

              {kural.explanation && (
                <div className="kural-meaning-box">
                  <div className="kural-label">Explanation • விளக்கம்</div>
                  <p className="kural-explanation">{kural.explanation}</p>
                </div>
              )}
            </div>

            <div className="kural-portrait-col">
              <div className="kural-portrait-frame">
                <img
                  src={thiruImg}
                  alt="Ayyan Thiruvalluvar"
                  className="kural-portrait-img"
                  loading="lazy"
                />
                <div className="kural-portrait-tag">
                  <span>அய்யன் திருவள்ளுவர்</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="kural-footer">
          <Button variant="primary" size="md" onClick={closeModal}>
            Continue to School Website
          </Button>
        </div>
      </div>
    </div>
  );
};
