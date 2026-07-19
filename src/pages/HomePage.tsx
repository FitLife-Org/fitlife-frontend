import GuestLayout from "../layouts/GuestLayout";
import LandingPage from "./guest/LandingPage";

export default function HomePage() {
  return (
    <GuestLayout>
      <LandingPage />
    </GuestLayout>
  );
}
