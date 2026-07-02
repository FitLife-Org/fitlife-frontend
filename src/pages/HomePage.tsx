import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import GuestLayout from "../components/layout/GuestLayout";
import LandingPage from "./guest/LandingPage";
import { getRedirectPathByRoles } from "../utils/authRedirect";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated && user) {
     return <Navigate to={getRedirectPathByRoles(user.roles)} replace />;
  }
  
  return (
    <GuestLayout>
      <LandingPage />
    </GuestLayout>
  );
}
