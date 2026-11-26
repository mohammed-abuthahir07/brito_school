import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { publicService } from '../../services/publicService';
import { API_BASE_URL } from '../../services/api';
import { isAbortError } from '../../utils/userFacingError';
import { useScrollReveal } from '../../utils/useScrollReveal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RetryPanel } from '../../components/common/RetryPanel';
import { PageHero } from '../../components/public/PageHero';
import studentsImg from '../../assets/School/students.jpg';
import { Button } from '../../components/common/Button';
import { SafeImage } from '../../components/common/SafeImage';
import {
  IconImage,
  IconEye,
  IconX,
  IconChevronRight,
  IconChevronLeft,
} from '../../components/common/Icons';
import './GalleryPage.css';

const formatPhotoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const GalleryPage = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  useScrollReveal(galleries.length);

  const fetchGalleries = (signal) => {
    setLoading(true);
    setError(null);
    publicService
      .getGalleries({}, { signal })
      .then((res) => {
        if (res.success && Array.isArray(res.galleries)) {
          setGalleries(res.galleries);
        } else {
          setGalleries([]);
        }
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err.message || 'Failed to load gallery images from the server.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchGalleries(controller.signal);
    return () => controller.abort();
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
      document.body.style.overflow = '';
    };
  }, [activeIndex, galleries.length]);

  const openLightbox = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="gallery-page page-enter">
      <PageHero
        icon={<IconImage size={16} />}
        badge="Official School Gallery"
        title="School Gallery"
        subtitle="A curated archive of campus life, assemblies, sports, and student celebrations — published by the school administration."
        backgroundImage={studentsImg}
        backgroundPosition="center 40%"
      />

      <section className="gallery-content-section reveal-init">
        <div className="container">
          <div className="gallery-intro">
            <span className="section-tag">Photo archive</span>
            <h2 className="section-heading">Campus photographs</h2>
            <p>
              Every photograph on this page is uploaded from the school office. New pictures appear here as soon as they are published.
            </p>
            {!loading && galleries.length > 0 && (
              <p className="gallery-count">{galleries.length} photograph{galleries.length === 1 ? '' : 's'} in the archive</p>
            )}
          </div>

          {error && (
            <RetryPanel
              title="Gallery loading failed"
              message={error}
              onRetry={() => fetchGalleries()}
            />
          )}

          {loading ? (
            <div className="gallery-loading">
              <LoadingSpinner text="Opening the school gallery..." />
            </div>
          ) : galleries.length === 0 ? (
            <div className="gallery-awaiting">
              <h3>Photographs will appear here</h3>
              <p>
                The gallery is ready for official school photographs. When the administrator uploads a photo with a title, it will display in this album.
              </p>
              <div className="gallery-placeholder-grid" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="gallery-placeholder-frame">
                    <IconImage size={28} />
                    <span>Awaiting photo</span>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={() => fetchGalleries()}>
                Check for new photographs
              </Button>
            </div>
          ) : (
            <div className={`gallery-grid${galleries.length >= 3 ? ' has-feature' : ''}`}>
              {galleries.map((item, index) => {
                const dateLabel = formatPhotoDate(item.created_at || item.updated_at);
                return (
                  <article
                    key={item.id}
                    className="gallery-card reveal-init"
                    onClick={() => openLightbox(index)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View photo: ${item.title || 'School photograph'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openLightbox(index);
                      }
                    }}
                  >
                    <div className="gallery-card-img-wrapper">
                      <SafeImage
                        src={getImageSrc(item)}
                        alt={item.title || 'School photograph'}
                        className="gallery-card-img"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="gallery-card-caption">
                        <span className="gallery-view-pill">
                          <IconEye size={14} />
                          View
                        </span>
                        <h3 className="gallery-card-title">{item.title || 'School photograph'}</h3>
                        {dateLabel && <p className="gallery-card-date">{dateLabel}</p>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {currentItem &&
        createPortal(
          <div
            className="lightbox-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={currentItem.title || 'School photograph'}
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
                <SafeImage
                  src={getImageSrc(currentItem)}
                  alt={currentItem.title || 'School photograph'}
                  className="lightbox-img"
                />
              </div>

              <div className="lightbox-caption">
                <div className="lightbox-counter">
                  {activeIndex + 1} / {galleries.length}
                </div>
                <h3 className="lightbox-title">{currentItem.title || 'School photograph'}</h3>
                {currentItem.description && (
                  <p className="lightbox-desc">{currentItem.description}</p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
