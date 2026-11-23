import React from 'react';
import { Outlet } from 'react-router-dom';
import { DailyKuralProvider } from '../../context/DailyKuralContext';
import { AnnouncementTicker } from './AnnouncementTicker';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { DailyKuralModal } from './DailyKuralModal';
import './PublicLayout.css';

export const PublicLayout = () => {
  return (
    <DailyKuralProvider>
      <div className="public-layout">
        <header className="public-sticky-header">
          <AnnouncementTicker />
          <PublicNavbar />
        </header>
        <main className="public-main-content">
          <Outlet />
        </main>
        <PublicFooter />
        <div className="developer-credit-bar">
          <span className="developer-credit-text">
            Developed by <strong className="dev-handle">@zayithtechnologies</strong>
          </span>
        </div>
        <DailyKuralModal />
      </div>
    </DailyKuralProvider>
  );
};
