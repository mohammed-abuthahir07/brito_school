import React, { useEffect, useState } from 'react';
import { publicService } from '../../services/publicService';
import { IconBell } from '../common/Icons';
import './AnnouncementTicker.css';

export const AnnouncementTicker = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    publicService
      .getAnnouncements({ limit: 10 }, { signal: controller.signal })
      .then((res) => {
        if (res.success && Array.isArray(res.announcements)) {
          setAnnouncements(res.announcements);
        }
      })
      .catch(() => {
        // Ticker is non-critical; hide quietly on failure.
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (loading || announcements.length === 0) {
    return null;
  }

  // Ensure plenty of announcement items so the ticker immediately fills
  // any screen width and seamlessly loops forever without blank gaps.
  const minItems = 6;
  const repeatMultiplier = Math.max(1, Math.ceil(minItems / announcements.length));
  const repeatedItems = Array.from({ length: repeatMultiplier }).flatMap(() => announcements);

  return (
    <aside className="ticker-bar" aria-label="School Announcements Ticker">
      <div className="ticker-inner">
        <div className="ticker-label">
          <IconBell size={14} />
          <span>School Announcements</span>
        </div>
        <div className="ticker-track-container">
          <div className="ticker-track">
            {repeatedItems.map((item, idx) => (
              <span key={`t1-${item.id || idx}-${idx}`} className="ticker-item">
                <span className="ticker-badge">{item.category || 'General'}</span>
                <span className="ticker-title">{item.title}:</span>
                <span className="ticker-content">{item.content}</span>
                <span className="ticker-separator">✦</span>
              </span>
            ))}
          </div>
          <div className="ticker-track ticker-track-clone" aria-hidden="true">
            {repeatedItems.map((item, idx) => (
              <span key={`t2-${item.id || idx}-${idx}`} className="ticker-item">
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
