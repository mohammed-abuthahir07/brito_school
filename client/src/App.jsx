import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NavigationHandler } from './components/common/NavigationHandler';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { RouteFallback } from './components/common/RouteFallback';
import { PublicLayout } from './components/public/PublicLayout';
import { AdminLayout } from './components/admin/AdminLayout';

const HomePage = lazy(() =>
  import('./pages/public/HomePage').then((m) => ({ default: m.HomePage })),
);
const AboutPage = lazy(() =>
  import('./pages/public/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const FacilitiesPage = lazy(() =>
  import('./pages/public/FacilitiesPage').then((m) => ({ default: m.FacilitiesPage })),
);
const AlumniPage = lazy(() =>
  import('./pages/public/AlumniPage').then((m) => ({ default: m.AlumniPage })),
);
const GalleryPage = lazy(() =>
  import('./pages/public/GalleryPage').then((m) => ({ default: m.GalleryPage })),
);
const LoginPage = lazy(() =>
  import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('./pages/admin/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const DashboardPage = lazy(() =>
  import('./pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const AnnouncementsAdminPage = lazy(() =>
  import('./pages/admin/AnnouncementsAdminPage').then((m) => ({
    default: m.AnnouncementsAdminPage,
  })),
);
const CalendarsAdminPage = lazy(() =>
  import('./pages/admin/CalendarsAdminPage').then((m) => ({ default: m.CalendarsAdminPage })),
);
const GalleriesAdminPage = lazy(() =>
  import('./pages/admin/GalleriesAdminPage').then((m) => ({ default: m.GalleriesAdminPage })),
);
const ThirukkuralAdminPage = lazy(() =>
  import('./pages/admin/ThirukkuralAdminPage').then((m) => ({ default: m.ThirukkuralAdminPage })),
);
const ProfileAdminPage = lazy(() =>
  import('./pages/admin/ProfileAdminPage').then((m) => ({ default: m.ProfileAdminPage })),
);

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <NavigationHandler />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/facilities" element={<FacilitiesPage />} />
                <Route path="/alumni" element={<AlumniPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
              </Route>

              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="announcements" element={<AnnouncementsAdminPage />} />
                <Route path="calendars" element={<CalendarsAdminPage />} />
                <Route path="galleries" element={<GalleriesAdminPage />} />
                <Route path="thirukkural" element={<ThirukkuralAdminPage />} />
                <Route path="profile" element={<ProfileAdminPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
