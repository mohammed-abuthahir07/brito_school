import { useEffect } from 'react';

/**
 * useScrollReveal
 * Automatically attaches an IntersectionObserver to any elements with `.reveal-init`
 * inside the given container ref or the entire document.
 * Elements smoothly transition into view when scrolled into view.
 */
export const useScrollReveal = (dependency = null) => {
  useEffect(() => {
    // If user prefers reduced motion, make all elements visible immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal-init').forEach((el) => {
        el.classList.add('reveal-visible');
      });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-init').forEach((el) => {
        el.classList.add('reveal-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.12,
      }
    );

    const elements = document.querySelectorAll('.reveal-init:not(.reveal-visible)');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [dependency]);
};
