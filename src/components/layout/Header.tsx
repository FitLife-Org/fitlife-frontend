import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import Button from "../common/Button";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-md transition-all lg:px-8">
      <div className="flex items-center gap-4">
        <button className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 active:scale-95 lg:hidden" type="button" onClick={toggleSidebar} aria-label="Mở menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative hidden w-80 sm:block group">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-fit-primary" />
          <input className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition-all duration-300 focus:w-[400px] focus:border-fit-primary focus:bg-white focus:ring-4 focus:ring-fit-primary/10" placeholder="Tìm kiếm khoá học, PT..." />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-fit-primary hover:text-fit-primary hover:shadow-sm active:scale-95" type="button" aria-label="Thông báo">
          <Bell className="h-5 w-5 transition-transform group-hover:origin-top group-hover:animate-swing" />
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[9px] font-bold text-white">3</span>
        </button>
        
        <div className="hidden h-8 w-[1px] bg-slate-200 sm:block" />
        
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-slate-900">{user?.fullName || user?.username || "FitLife User"}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-fit-primary">{user?.role === "ADMIN" ? "Quản trị viên" : "Premium"}</p>
        </div>
        
        <div className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-fit-primarySoft to-emerald-100 text-fit-primary shadow-inner transition-transform hover:scale-105 active:scale-95 border border-white">
          <UserRound className="h-5 w-5" />
        </div>
        
        <ChevronDown className="hidden h-4 w-4 cursor-pointer text-slate-400 transition-colors hover:text-slate-800 sm:block" />
        
        <Button type="button" variant="ghost" onClick={logout} aria-label="Đăng xuất" className="ml-2 group min-h-11 rounded-xl px-3 hover:bg-rose-50 hover:text-rose-600 transition-all">
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        </Button>
      </div>
    </header>
  );
}
