import { Navigate } from "react-router-dom";
import { ROUTES } from "../config/routes";
import { useAuthStore } from "../store/authStore";
import GuestLayout from "../components/layout/GuestLayout";
import LandingPage from "./guest/LandingPage";

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
     return <Navigate to={ROUTES.MEMBER_HOME} replace />;
  }
  
  return (
    <GuestLayout>
      <LandingPage />
    </GuestLayout>
  );
}
