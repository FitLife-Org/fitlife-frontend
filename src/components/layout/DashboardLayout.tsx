import type { ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useUiStore } from "../../store/uiStore";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <div className="fit-page lg:flex">
      {sidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" type="button" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 px-4 pb-8 sm:px-6 lg:px-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
