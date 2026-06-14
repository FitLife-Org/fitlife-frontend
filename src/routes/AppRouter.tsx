import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AuthPage from '../pages/auth/AuthPage';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Profile from '../pages/profile/Profile';
import Packages from '../pages/package/Packages';
import PaymentResult from '../pages/package/PaymentResult';
import AiWorkout from '../pages/member/AiWorkout.jsx';
import MyWorkout from '../pages/member/MyWorkout.jsx';
import Dashboard from '../pages/admin/Dashboard.jsx';
import AdminGymPackage from '../pages/admin/AdminGymPackage';
import AdminMember from '../pages/admin/AdminMember.jsx';

interface RouteGuardProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: RouteGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}

function PublicRoute({ children }: RouteGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/me" replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
}

export default function AppRouter() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={(
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          )}
        />
        <Route
          path="/register"
          element={(
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          )}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/me' : '/login'} replace />}
        />

        <Route
          path="/me"
          element={(
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/members/me"
          element={(
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/packages"
          element={(
            <ProtectedRoute>
              <Packages />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/ai-pt"
          element={(
            <ProtectedRoute>
              <AiWorkout />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/my-workout"
          element={(
            <ProtectedRoute>
              <MyWorkout />
            </ProtectedRoute>
          )}
        />
        <Route path="/payment-result" element={<PaymentResult />} />

        <Route
          path="/admin/packages"
          element={(
            <ProtectedRoute>
              <AdminGymPackage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/members"
          element={(
            <ProtectedRoute>
              <AdminMember />
            </ProtectedRoute>
          )}
        />

        <Route
          path="/admin"
          element={(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

