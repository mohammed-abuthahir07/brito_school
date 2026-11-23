import React, { useEffect, useState } from 'react';
import { publicService } from '../../services/publicService';
import { API_BASE_URL } from '../../services/api';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Alert } from '../../components/common/Alert';
import { PageHero } from '../../components/public/PageHero';
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

  const getImageSrc = (item) => {
    if (!item) return '';
    const rawPath = item.image_path || item.file_url || '';
    if (rawPath.startsWith('http')) return rawPath;
    const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    return `${API_BASE_URL}${cleanPath}`;
  };

  const currentItem = activeIndex !== null ? galleries[activeIndex] : null;

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

  const openLightbox = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="gallery-page page-enter">
      <PageHero
        icon={<IconImage size={16} />}
        badge="School Photo Archives"
        title="School Moments & Visual Archives"
        subtitle="Photographs of campus life, ceremonies, sports and student activities — published by the school administration."
      />

      <section className="gallery-content-section reveal-init">
        <div className="container">
          <div className="gallery-intro">
            <span className="section-tag">Published gallery</span>
            <h2 className="section-heading">School photographs</h2>
            <p>
              Each picture, title and description is added from the staff gallery. When a new photo is published, it appears here in the same card layout.
            </p>
          </div>

          <div className="gallery-status-bar">
            <div className="gallery-count-badge">
              <IconImage size={20} />
              <span>
                Displaying <strong>{galleries.length}</strong> photo{galleries.length === 1 ? '' : 's'}
              </span>
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
            <div className="gallery-loading">
              <LoadingSpinner text="Retrieving school photographs..." />
            </div>
          ) : galleries.length === 0 ? (
            <EmptyState
              icon={<IconImage size={36} />}
              title="No photographs published yet"
              description="When the school administration uploads a photo with a title and description, it will appear in this gallery."
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
                  onClick={() => openLightbox(index)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View photo: ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openLightbox(index);
                    }
                  }}
                >
                  <div className="gallery-card-img-wrapper">
                    <img
                      src={getImageSrc(item)}
                      alt={item.title || 'School photograph'}
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
