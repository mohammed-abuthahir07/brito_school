import React, { useEffect, useState } from 'react';
import { publicService } from '../../services/publicService';
import { API_BASE_URL } from '../../services/api';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { Button } from '../../components/common/Button';
import {
  IconImage,
  IconEye,
  IconX,
  IconRefresh,
  IconChevronRight,
  IconChevronLeft,
} from '../../components/common/Icons';
import './GalleryPage.css';

export const GalleryPage = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useScrollReveal(galleries.length);

  const fetchGalleries = () => {
    setLoading(true);
    setError(null);
    publicService.getGalleries()
      .then((res) => {
        if (res.success && Array.isArray(res.galleries)) {
          setGalleries(res.galleries);
        } else {
          setGalleries([]);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load gallery images from the server.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  // Handle ESC and Arrow keys for lightbox
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % galleries.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + galleries.length) % galleries.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [activeIndex, galleries.length]);

  const getImageSrc = (item) => {
    if (!item) return '';
    const rawPath = item.image_path || item.file_url || '';
    if (rawPath.startsWith('http')) return rawPath;
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const currentItem = activeIndex !== null ? galleries[activeIndex] : null;

  return (
    <div className="gallery-page">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="gallery-hero">
        <div className="container">
          <span className="hero-badge animate-fade-in" style={{ backgroundColor: 'rgba(216, 195, 165, 0.2)', borderColor: 'var(--sandal-300)', color: 'var(--sandal-100)' }}>
            <IconImage size={16} />
            HISTORICAL & CONTEMPORARY ARCHIVES
          </span>
          <h1 className="gallery-hero-title animate-fade-in-up">School Moments & Visual Archives</h1>
          <p className="gallery-hero-subtitle animate-fade-in-up">
            A dynamic visual chronicle of institutional ceremonies, sports championships, cadet marches, prayer assemblies, and jubilant student milestones.
          </p>
        </div>
      </section>

      {/* =========================================================================
          GALLERY CONTENT SECTION
          ========================================================================= */}
      <section className="gallery-content-section reveal-init">
        <div className="container">
          {/* Status Bar */}
          <div className="gallery-status-bar">
            <div className="gallery-count-badge">
              <IconImage size={20} style={{ color: 'var(--brown-700)' }} />
              <span>
                Displaying <strong>{galleries.length}</strong> photo memories
              </span>
              <span className="gallery-capacity-pill">Backend Capacity: 30 Max</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<IconRefresh size={16} />}
              onClick={fetchGalleries}
              disabled={loading}
            >
              Refresh Gallery
            </Button>
          </div>

          {error && (
            <Alert
              type="danger"
              title="Gallery Loading Failed"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {loading ? (
            <div style={{ padding: '4rem 0' }}>
              <LoadingSpinner text="Retrieving high-resolution school photographs..." />
            </div>
          ) : galleries.length === 0 ? (
            <EmptyState
              icon={<IconImage size={36} />}
              title="No Gallery Photographs Uploaded Yet"
              description="The school administration will publish new gallery photographs soon. Real-time uploads from the admin portal will automatically display here."
              action={
                <Button variant="primary" size="sm" onClick={fetchGalleries}>
                  Check Again
                </Button>
              }
            />
          ) : (
            <div className="gallery-grid">
              {galleries.map((item, index) => (
                <article
                  key={item.id}
                  className="gallery-card reveal-init"
                  onClick={() => setActiveIndex(index)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View photo: ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                >
                  <div className="gallery-card-img-wrapper">
                    <img
                      src={getImageSrc(item)}
                      alt={item.title || 'School photo memory'}
                      className="gallery-card-img"
                      loading="lazy"
                    />
                    <div className="gallery-card-overlay">
                      <span className="gallery-view-pill">
                        <IconEye size={16} />
                        <span>Enlarge Photo</span>
                      </span>
                    </div>
                  </div>
                  <div className="gallery-card-body">
                    <h3 className="gallery-card-title">{item.title}</h3>
                    {item.description && (
                      <p className="gallery-card-desc">{item.description}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          LIGHTBOX MODAL
          ========================================================================= */}
      {currentItem && (
        <div
          className="lightbox-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={currentItem.title}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveIndex(null);
          }}
        >
          <div className="lightbox-content">
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setActiveIndex(null)}
              aria-label="Close image lightbox"
            >
              <IconX size={22} />
            </button>

            {galleries.length > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-nav-btn prev"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + galleries.length) % galleries.length)}
                  aria-label="Previous image"
                >
                  <IconChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  className="lightbox-nav-btn next"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % galleries.length)}
                  aria-label="Next image"
                >
                  <IconChevronRight size={24} />
                </button>
              </>
            )}

            <div className="lightbox-image-container">
              <img
                src={getImageSrc(currentItem)}
                alt={currentItem.title}
                className="lightbox-img"
              />
            </div>

            <div className="lightbox-caption">
              <div className="lightbox-counter">
                {activeIndex + 1} of {galleries.length}
              </div>
              <h3 className="lightbox-title">{currentItem.title}</h3>
              {currentItem.description && (
                <p className="lightbox-desc">{currentItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
