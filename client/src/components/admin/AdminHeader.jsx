import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { publicService } from '../../services/publicService';
import { IconMenu, IconUser } from '../common/Icons';
import './AdminHeader.css';

const HEALTH_CACHE_KEY = 'brito_api_health';
const HEALTH_TTL_MS = 30000;

function readCachedHealth() {
  try {
    const cached = sessionStorage.getItem(HEALTH_CACHE_KEY);
    if (!cached) return { known: false, ok: true };
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.at < HEALTH_TTL_MS) {
      return { known: true, ok: Boolean(parsed.ok) };
    }
  } catch {
    sessionStorage.removeItem(HEALTH_CACHE_KEY);
  }
  return { known: false, ok: true };
}

export const AdminHeader = ({ title = 'Administration', onToggleSidebar }) => {
  const { admin } = useAuth();
  const initialHealth = readCachedHealth();
  const [serverHealthy, setServerHealthy] = useState(initialHealth.ok);

  useEffect(() => {
    let cancelled = false;
    if (initialHealth.known) {
      return undefined;
    }

    publicService
      .checkHealth()
      .then((res) => {
        const ok = res.status === 'UP';
        if (!cancelled) setServerHealthy(ok);
        sessionStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({ ok, at: Date.now() }));
      })
      .catch(() => {
        if (!cancelled) setServerHealthy(false);
        sessionStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify({ ok: false, at: Date.now() }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="mobile-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
        >
          <IconMenu size={22} />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <div className={`health-pill ${serverHealthy ? 'connected' : 'checking'}`}>
          <span className="health-dot" />
          <span>{serverHealthy ? 'API Active' : 'API Checking'}</span>
        </div>

        <div className="admin-user-badge">
          <div className="admin-avatar-icon">
            <IconUser size={15} />
          </div>
          <span className="admin-user-email">{admin?.email || 'Administrator'}</span>
        </div>
      </div>
    </header>
  );
};
