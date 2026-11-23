import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { isAbortError } from '../../utils/userFacingError';
import { activityYears, monthlyGalleryActivity } from '../../utils/galleryActivity';
import { GalleryActivityChart } from '../../components/admin/GalleryActivityChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RetryPanel } from '../../components/common/RetryPanel';
import { Button } from '../../components/common/Button';
import {
  IconBell,
  IconCalendar,
  IconImage,
  IconBookOpen,
  IconChevronRight,
  IconRefresh,
  IconPlus,
} from '../../components/common/Icons';
import './DashboardPage.css';

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [chartYear, setChartYear] = useState(new Date().getFullYear());
  const [chartPlayKey, setChartPlayKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = (signal) => {
    const abortSignal = signal instanceof AbortSignal ? signal : undefined;
    setLoading(true);
    setError(null);
    Promise.all([
      adminService.getDashboard({ signal: abortSignal }),
      adminService.getGalleries({ signal: abortSignal }).catch((err) => {
        if (isAbortError(err)) throw err;
        return { success: false, galleries: [] };
      }),
    ])
      .then(([dashRes, galleryRes]) => {
        if (dashRes.success && dashRes.dashboard) {
          setDashboard(dashRes.dashboard);
        } else {
          setError('Dashboard data could not be read. Please try again.');
        }
        const list = Array.isArray(galleryRes?.galleries) ? galleryRes.galleries : [];
        setGalleryItems(list);
        const years = activityYears(list);
        if (years.length && !years.includes(new Date().getFullYear())) {
          setChartYear(years[0]);
        }
        setChartPlayKey(Date.now());
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        setError(err.message || 'Failed to fetch dashboard metrics.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboardData(controller.signal);
    return () => controller.abort();
  }, []);

  const availableYears = useMemo(() => activityYears(galleryItems), [galleryItems]);
  const monthStats = useMemo(
    () => monthlyGalleryActivity(galleryItems, Number(chartYear)),
    [galleryItems, chartYear],
  );
  const yearUploadTotal = monthStats.reduce((sum, row) => sum + row.uploads, 0);

  if (loading) {
    return <LoadingSpinner text="Aggregating school database metrics..." />;
  }

  if (error) {
    return (
      <div className="admin-page-container">
        <RetryPanel
          title="Dashboard unavailable"
          message={error}
          onRetry={() => fetchDashboardData()}
        />
      </div>
    );
  }

  const { announcements, calendars, galleries, thirukkural, generatedAt } = dashboard || {};

  return (
    <div className="dashboard-root page-enter">
      {/* Top Welcome Strip */}
      <div className="dashboard-top-row">
        <div className="dashboard-welcome">
          <h2>Welcome, Administrator</h2>
          <div className="dashboard-timestamp">
            Metrics aggregated at:{' '}
            {generatedAt ? new Date(generatedAt).toLocaleString('en-IN') : 'Real-time'}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<IconRefresh size={16} />}
          onClick={() => fetchDashboardData()}
        >
          Refresh Statistics
        </Button>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-cards-grid">
        {/* Card 1: Announcements */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <IconBell size={22} />
            </div>
            <Link to="/admin/announcements" className="stat-action-link">
              <span>Manage</span>
              <IconChevronRight size={14} />
            </Link>
          </div>
          <div className="stat-value">{announcements?.total ?? 0}</div>
          <div className="stat-label">Active Announcements</div>
          <div className="stat-badge green">
            Public Ticker Active
          </div>
        </div>

        {/* Card 2: Calendars */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <IconCalendar size={22} />
            </div>
            <Link to="/admin/calendars" className="stat-action-link">
              <span>Manage</span>
              <IconChevronRight size={14} />
            </Link>
          </div>
          <div className="stat-value">{calendars?.total ?? 0}</div>
          <div className="stat-label">Published Calendars</div>
          <div className="stat-badge green">
            PDF & Image Downloads
          </div>
        </div>

        {/* Card 3: Galleries */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <IconImage size={22} />
            </div>
            <Link to="/admin/galleries" className="stat-action-link">
              <span>Manage</span>
              <IconChevronRight size={14} />
            </Link>
          </div>
          <div className="stat-value">
            {galleries?.total ?? 0}
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)' }}> / 30</span>
          </div>
          <div className="stat-label">Gallery Photographs</div>
          <div className={`stat-badge ${(galleries?.total ?? 0) >= 30 ? 'gold' : 'green'}`}>
            {(galleries?.total ?? 0) >= 30 ? 'Maximum Capacity Reached' : `${30 - (galleries?.total ?? 0)} slots available`}
          </div>
        </div>

        {/* Card 4: Thirukkural */}
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box">
              <IconBookOpen size={22} />
            </div>
            <Link to="/admin/thirukkural" className="stat-action-link">
              <span>Manage</span>
              <IconChevronRight size={14} />
            </Link>
          </div>
          <div className="stat-value">{thirukkural?.total ?? 0}</div>
          <div className="stat-label">Thirukkural Verses</div>
          <div className="stat-badge green">
            Daily First-Visit Active
          </div>
        </div>
      </div>

      <section className="gallery-year-chart" aria-label="Gallery uploads by month">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Gallery Uploads · January to December</h3>
            <p className="chart-subtitle">
              {yearUploadTotal} photograph{yearUploadTotal === 1 ? '' : 's'} uploaded in {chartYear}. Click a month
              on the line for upload, update and delete counts.
            </p>
          </div>
          <label className="chart-year-field">
            <span>Year</span>
            <select
              value={chartYear}
              onChange={(event) => setChartYear(Number(event.target.value))}
              aria-label="Select gallery upload year"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
        <GalleryActivityChart
          key={`${chartYear}-${chartPlayKey}`}
          months={monthStats}
          year={chartYear}
        />
      </section>

      {/* Middle Details: Categories & Recent Activity */}
      <div className="dashboard-details-grid">
        {/* Panel 1: Announcement Categories */}
        <div className="dashboard-panel-card">
          <div className="panel-header">
            <h3 className="panel-title">Announcement Category Breakdown</h3>
            <Link to="/admin/announcements" className="stat-action-link">
              View All
            </Link>
          </div>

          {Array.isArray(announcements?.byCategory) && announcements.byCategory.length > 0 ? (
            <div className="category-pills-list">
              {announcements.byCategory.map((cat, idx) => (
                <div key={idx} className="category-pill-item">
                  <span className="category-name">{cat.category || 'General'}</span>
                  <span className="category-count">{cat.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              No category summaries recorded yet.
            </p>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Latest Announcement:</strong>
              <div style={{ marginTop: '0.35rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                {announcements?.latest ? announcements.latest.title : 'None published yet.'}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Recent Content Additions */}
        <div className="dashboard-panel-card">
          <div className="panel-header">
            <h3 className="panel-title">Latest Content State</h3>
          </div>

          <div className="recent-records-list">
            <div className="recent-record-item">
              <div className="record-meta-col">
                <span className="record-primary-title">
                  {calendars?.latest ? calendars.latest.title : 'No calendar published'}
                </span>
                <span className="record-secondary-info">Academic Calendar</span>
              </div>
              <Link to="/admin/calendars" className="stat-action-link">
                View
              </Link>
            </div>

            <div className="recent-record-item">
              <div className="record-meta-col">
                <span className="record-primary-title">
                  {galleries?.latest ? galleries.latest.title : 'No gallery photo uploaded'}
                </span>
                <span className="record-secondary-info">School Photo Memory</span>
              </div>
              <Link to="/admin/galleries" className="stat-action-link">
                View
              </Link>
            </div>

            <div className="recent-record-item">
              <div className="record-meta-col">
                <span className="record-primary-title">
                  {thirukkural?.latest ? `Kural ${thirukkural.latest.kural_number}` : 'No verse published'}
                </span>
                <span className="record-secondary-info">Daily Thirukkural</span>
              </div>
              <Link to="/admin/thirukkural" className="stat-action-link">
                View
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="quick-actions-bar">
        <div className="quick-actions-header">Quick Administrative Shortcuts</div>
        <div className="quick-buttons-row">
          <Link to="/admin/announcements" className="btn btn-secondary btn-sm">
            <IconPlus size={16} />
            <span>Post New Announcement</span>
          </Link>
          <Link to="/admin/calendars" className="btn btn-secondary btn-sm">
            <IconPlus size={16} />
            <span>Upload Calendar Schedule</span>
          </Link>
          <Link to="/admin/galleries" className="btn btn-secondary btn-sm">
            <IconPlus size={16} />
            <span>Upload Gallery Photo</span>
          </Link>
          <Link to="/admin/thirukkural" className="btn btn-secondary btn-sm">
            <IconPlus size={16} />
            <span>Publish Daily Kural</span>
          </Link>
          <Link to="/admin/profile" className="btn btn-outline btn-sm">
            <span>Edit Profile Info</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
