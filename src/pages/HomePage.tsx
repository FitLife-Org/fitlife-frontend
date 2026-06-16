import { Navigate } from "react-router-dom";
import { ROUTES } from "../config/routes";
import { useAuthStore } from "../store/authStore";

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return <Navigate to={isAuthenticated ? ROUTES.MEMBER_HOME : ROUTES.LOGIN} replace />;
}
