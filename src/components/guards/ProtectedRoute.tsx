import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
