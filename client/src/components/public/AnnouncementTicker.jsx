import React, { useEffect, useState } from 'react';
import { publicService } from '../../services/publicService';
import { IconBell } from '../common/Icons';
import './AnnouncementTicker.css';

export const AnnouncementTicker = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    publicService.getAnnouncements({ limit: 10 })
      .then((res) => {
        if (mounted && res.success && Array.isArray(res.announcements)) {
          setAnnouncements(res.announcements);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch announcements for ticker:', err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || announcements.length === 0) {
    return null;
  }

  return (
    <aside className="ticker-bar" aria-label="School Announcements Ticker">
      <div className="ticker-inner">
        <div className="ticker-label">
          <IconBell size={14} />
          <span>Announcements</span>
        </div>
        <div className="ticker-track-container">
          <div className="ticker-track">
            {announcements.map((item, idx) => (
              <span key={item.id || idx} className="ticker-item">
                <span className="ticker-badge">{item.category || 'General'}</span>
                <span className="ticker-title">{item.title}:</span>
                <span className="ticker-content">{item.content}</span>
                <span className="ticker-separator">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
