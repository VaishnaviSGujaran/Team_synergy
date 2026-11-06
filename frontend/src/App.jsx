import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ReminderProvider } from "./context/ReminderContext";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ToastNotification from "./components/ToastNotification";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/PatientDashboard";
import MedicationsPage from "./pages/MedicationsPage";
import SchedulePage from "./pages/SchedulePage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CaregiverAccessPage from "./pages/CaregiverAccessPage";
import CaregiverDashboard from "./pages/CaregiverDashboard";
import ReminderSettingsPage from "./pages/ReminderSettingsPage";
import AdminDashboard from "./pages/AdminDashboard";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "caregiver") {
      return <Navigate to="/caregiver-dashboard" replace />;
    } else if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
      <ToastNotification />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReminderProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <AuthenticatedLayout>
                    <PatientDashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/medications"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <AuthenticatedLayout>
                    <MedicationsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <AuthenticatedLayout>
                    <SchedulePage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <AuthenticatedLayout>
                    <HistoryPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <AuthenticatedLayout>
                    <AnalyticsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/caregivers"
              element={
                <ProtectedRoute allowedRoles={["patient", "admin"]}>
                  <AuthenticatedLayout>
                    <CaregiverAccessPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Caregiver Portal */}
            <Route
              path="/caregiver-dashboard"
              element={
                <ProtectedRoute allowedRoles={["caregiver", "admin"]}>
                  <AuthenticatedLayout>
                    <CaregiverDashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Command Center */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AuthenticatedLayout>
                    <AdminDashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Shared Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["patient", "caregiver", "admin"]}>
                  <AuthenticatedLayout>
                    <ReminderSettingsPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ReminderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
