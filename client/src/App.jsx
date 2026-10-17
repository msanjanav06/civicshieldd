import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import ReportHazardPage from './pages/ReportHazardPage';
import IncidentFeedPage from './pages/IncidentFeedPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import CitizenTrackingPage from './pages/CitizenTrackingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CrewDashboardPage from './pages/CrewDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/report" element={<ReportHazardPage />} />
                <Route path="/incidents" element={<IncidentFeedPage />} />
                <Route path="/incidents/:id" element={<IncidentDetailPage />} />
                <Route path="/track" element={<CitizenTrackingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Authenticated Citizen / Any User */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Field Crew Portal */}
                <Route
                  path="/crew"
                  element={
                    <ProtectedRoute allowedRoles={['crew', 'admin']}>
                      <CrewDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Municipal Admin Operations Center */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
