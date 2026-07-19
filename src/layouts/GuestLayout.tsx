import GuestHeader from "./GuestHeader";
import GuestFooter from "./GuestFooter";

interface GuestLayoutProps {
  children: React.ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-fit-bg flex flex-col font-sans selection:bg-fit-primary/20 selection:text-fit-primary">
      <GuestHeader />
      <main className="flex-1">
        {children}
      </main>
      <GuestFooter />
    </div>
  );
}
