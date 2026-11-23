import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * NavigationHandler
 * 1. Automatically scrolls to top (0, 0) on every route navigation.
 * 2. On browser refresh, guarantees reset of public routes to Home page ('/').
 */
export const NavigationHandler = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const hasCheckedRefresh = useRef(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (!hasCheckedRefresh.current) {
      hasCheckedRefresh.current = true;
      const navEntries = performance.getEntriesByType('navigation');
      const isReload =
        (navEntries.length > 0 && navEntries[0].type === 'reload') ||
        (window.performance && window.performance.navigation && window.performance.navigation.type === 1) ||
        sessionStorage.getItem('brito_reloaded') === 'true';

      sessionStorage.removeItem('brito_reloaded');

      if (isReload && pathname !== '/' && !pathname.startsWith('/admin')) {
        navigate('/', { replace: true });
      }
    }

    // Always reset scroll position to top on navigation/reload
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, navigate]);

  return null;
};
