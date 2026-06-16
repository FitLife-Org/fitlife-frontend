import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import Button from "../common/Button";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="flex h-20 items-center justify-between bg-fit-bg px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" type="button" onClick={toggleSidebar} aria-label="Mở menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden w-80 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="h-11 w-full rounded-2xl border border-fit-border bg-white pl-9 pr-3 text-sm outline-none shadow-soft focus:border-fit-primary focus:ring-2 focus:ring-emerald-100" placeholder="Tìm kiếm" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full bg-white p-3 text-slate-600 shadow-soft" type="button" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 rounded-full bg-fit-danger px-1.5 text-[10px] font-bold text-white">3</span>
        </button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{user?.fullName || user?.username || "FitLife User"}</p>
          <p className="text-xs font-semibold text-fit-primary">{user?.role === "ADMIN" ? "Quản trị viên" : "Thành viên Premium"}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <UserRound className="h-5 w-5" />
        </div>
        <ChevronDown className="hidden h-5 w-5 text-slate-500 sm:block" />
        <Button type="button" variant="ghost" onClick={logout} aria-label="Đăng xuất" className="min-h-10 px-3 py-2">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
