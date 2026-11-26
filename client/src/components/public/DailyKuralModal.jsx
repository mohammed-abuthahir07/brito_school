import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDailyKural } from '../../context/DailyKuralContext';
import { IconBookOpen, IconX } from '../common/Icons';
import thiruImg from '../../assets/thiru.webp';
import './DailyKuralModal.css';

export const DailyKuralModal = () => {
  const { kural, modalOpen, closeModal } = useDailyKural();

  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalOpen, closeModal]);

  if (!modalOpen || !kural) return null;

  return createPortal(
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
        <header className="kural-top-bar">
          <div className="kural-top-title">
            <IconBookOpen size={18} />
            <div>
              <span id="daily-kural-title" className="kural-title-en">Today’s Thirukkural</span>
              <span className="kural-title-ta">இன்றைய திருக்குறள்</span>
            </div>
          </div>
          <div className="kural-top-actions">
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
        </header>

        <div className="kural-body">
          <div className="kural-portrait-strip">
            <img
              src={thiruImg}
              alt="Ayyan Thiruvalluvar"
              className="kural-portrait-img"
            />
            <div className="kural-portrait-tag">
              <span>அய்யன் திருவள்ளுவர்</span>
              <small>Thiruvalluvar</small>
            </div>
          </div>

          <p className="kural-tamil-text">{kural.tamil_text}</p>

          <div className="kural-meaning-box">
            <h3 className="kural-label">English translation</h3>
            <p className="kural-english-meaning">“{kural.english_meaning}”</p>
          </div>

          {kural.explanation && (
            <div className="kural-meaning-box">
              <h3 className="kural-label">விளக்கம் • Meaning</h3>
              <p className="kural-explanation">{kural.explanation}</p>
            </div>
          )}
        </div>

        <footer className="kural-footer">
          <button type="button" className="kural-continue-btn" onClick={closeModal}>
            Continue to School Website
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};
