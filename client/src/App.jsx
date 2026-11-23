import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NavigationHandler } from './components/common/NavigationHandler';

// Public Layout & Pages
import { PublicLayout } from './components/public/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { FacilitiesPage } from './pages/public/FacilitiesPage';
import { AlumniPage } from './pages/public/AlumniPage';
import { GalleryPage } from './pages/public/GalleryPage';

// Admin Layout & Pages
import { LoginPage } from './pages/admin/LoginPage';
import { ForgotPasswordPage } from './pages/admin/ForgotPasswordPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardPage } from './pages/admin/DashboardPage';
import { AnnouncementsAdminPage } from './pages/admin/AnnouncementsAdminPage';
import { CalendarsAdminPage } from './pages/admin/CalendarsAdminPage';
import { GalleriesAdminPage } from './pages/admin/GalleriesAdminPage';
import { ThirukkuralAdminPage } from './pages/admin/ThirukkuralAdminPage';
import { ProfileAdminPage } from './pages/admin/ProfileAdminPage';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavigationHandler />
        <Routes>
          {/* Public Website Routes (5 Pages) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/alumni" element={<AlumniPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
          </Route>

          {/* Admin Authentication Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Admin Panel Routes (8 Pages Total) */}
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

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
