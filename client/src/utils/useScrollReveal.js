import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const revealElement = (el, observer) => {
  if (!el || el.classList.contains('reveal-visible')) return;
  el.classList.add('reveal-visible');
  observer?.unobserve(el);
};

const isInOrNearViewport = (el) => {
  const rect = el.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewHeight && rect.bottom > 0;
};

/**
 * useScrollReveal
 * Reveals `.reveal-init` elements as they enter the viewport.
 * Elements already on screen (especially the first section under a page hero
 * on mobile) are shown immediately so the first paint is not a blank gap.
 */
export const useScrollReveal = (dependency = null) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const nodes = () => document.querySelectorAll('.reveal-init:not(.reveal-visible)');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      nodes().forEach((el) => el.classList.add('reveal-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target, obs);
          }
        });
      },
      {
        root: null,
        rootMargin: '80px 0px 80px 0px',
        threshold: 0.01,
      }
    );

    const attach = () => {
      nodes().forEach((el) => {
        if (isInOrNearViewport(el)) {
          revealElement(el, observer);
        } else {
          observer.observe(el);
        }
      });
    };

    attach();
    const frame = window.requestAnimationFrame(attach);
    const timer = window.setTimeout(attach, 150);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [dependency, pathname]);
};
