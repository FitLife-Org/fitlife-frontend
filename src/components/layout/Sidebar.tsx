import { Bot, CalendarDays, ClipboardCheck, Dumbbell, Gauge, HeartPulse, Home, Package, ShieldCheck, UserRound, Users, WalletCards, Wrench, Zap, Settings, BarChart, Flame, Apple, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import type { Role } from "../../types/common.type";

type MenuItemType = {
  label: string;
  path?: string;
  icon: any;
  roles: Role[];
  children?: { label: string; path: string }[];
};

const menuItems: MenuItemType[] = [
 
  { label: "Dashboard", path: ROUTES.MEMBER_HOME, icon: Home, roles: ["MEMBER"] },
  { label: "Gói tập", path: ROUTES.MEMBER_PACKAGES, icon: Package, roles: ["MEMBER"] },
  { label: "Lịch tập", path: ROUTES.MEMBER_BOOKING, icon: CalendarDays, roles: ["MEMBER"] },
  { label: "Chỉ số cơ thể", path: ROUTES.MEMBER_BODY_METRICS, icon: HeartPulse, roles: ["MEMBER"] },
  { label: "AI Fitness", path: ROUTES.MEMBER_AI, icon: Bot, roles: ["MEMBER"] },
  { label: "Thanh toán", path: ROUTES.MEMBER_PAYMENT, icon: WalletCards, roles: ["MEMBER"] },
  { label: "Hồ sơ", path: ROUTES.MEMBER_PROFILE, icon: UserRound, roles: ["MEMBER"] },
  
  // ADMIN/STAFF/TRAINER Routes based on user screenshot
  { label: "Tổng quan", path: ROUTES.ADMIN_DASHBOARD, icon: Gauge, roles: ["ADMIN", "STAFF", "TRAINER"] },
  { label: "Hội viên", path: ROUTES.ADMIN_MEMBERS, icon: Users, roles: ["ADMIN"] },
  { label: "Gói tập", path: ROUTES.ADMIN_PACKAGES, icon: Package, roles: ["ADMIN"] },
  { label: "Lịch tập", path: "/admin/schedule", icon: CalendarDays, roles: ["ADMIN", "STAFF", "TRAINER"] },
  { label: "Huấn luyện viên", path: ROUTES.ADMIN_TRAINERS || "/admin/trainers", icon: UserRound, roles: ["ADMIN"] },
  { label: "Bài tập", path: "/admin/workouts", icon: Flame, roles: ["ADMIN", "TRAINER"] },
  { label: "Dinh dưỡng", path: "/admin/nutrition", icon: Apple, roles: ["ADMIN", "TRAINER"] },
  { 
    label: "Trang thiết bị", 
    icon: Dumbbell, 
    roles: ["ADMIN", "STAFF"],
    children: [
      { label: "Danh sách thiết bị", path: ROUTES.ADMIN_EQUIPMENT },
      { label: "Danh mục thiết bị", path: "/admin/equipment-categories" },
      { label: "Bảo trì & sửa chữa", path: "/admin/equipment-maintenance" },
      { label: "Kiểm kê", path: "/admin/equipment-inventory" },
    ]
  },
  { label: "Báo cáo", path: ROUTES.ADMIN_REPORTS || "/admin/reports", icon: BarChart, roles: ["ADMIN"] },
  { label: "Thông báo", path: "/admin/notifications", icon: Bell, roles: ["ADMIN", "STAFF", "TRAINER"] },
  { label: "Cài đặt", path: ROUTES.COMMON_SETTINGS, icon: Settings, roles: ["MEMBER", "ADMIN", "STAFF", "TRAINER"] },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const role = user?.role || "MEMBER";
  
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    "Trang thiết bị": true // Default expanded for equipment based on screenshot
  });
  
  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const location = useLocation();

  return (
    <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[280px] bg-slate-950 border-r border-slate-900 transition-transform duration-500 ease-out lg:static lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none`}>
      <div className="flex h-28 shrink-0 items-center gap-4 px-8">
        <div className="flex">
          <img src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png" alt="FitLife Logo" className=" w-25" />
        </div>
        <div>
          <p className="text-3xl font-black tracking-tighter text-white uppercase italic">FitLife</p>
          <p className="text-xs font-bold tracking-widest text-fit-primary uppercase">No Pain No Gain</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4 scrollbar-hide">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus[item.label];
            
            // Check if any child is active
            const isChildActive = hasChildren && item.children?.some(child => location.pathname === child.path);

            if (hasChildren) {
              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full group relative flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 ease-out overflow-hidden ${
                      isChildActive || isExpanded
                        ? "bg-fit-primary/10 text-fit-primary shadow-[inset_4px_0_0_0_#10b981]" 
                        : "text-slate-400 hover:bg-slate-900 hover:text-white hover:translate-x-2"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={`h-5 w-5 transition-transform duration-300 ${isChildActive || isExpanded ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'group-hover:scale-110'}`} />
                      <span className="relative z-10">{item.label}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {(isChildActive || isExpanded) && (
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-fit-primary/20 to-transparent opacity-50" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="pl-12 pr-4 py-1 space-y-1">
                      {item.children?.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `block rounded-lg px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                              isActive
                                ? "bg-fit-primary/10 text-fit-primary"
                                : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path!}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 ease-out overflow-hidden ${
                    isActive 
                      ? "bg-fit-primary/10 text-fit-primary shadow-[inset_4px_0_0_0_#10b981]" 
                      : "text-slate-400 hover:bg-slate-900 hover:text-white hover:translate-x-2"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'group-hover:scale-110'}`} />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-fit-primary/20 to-transparent opacity-50" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
      </nav>
      
     <div className="relative mt-auto shrink-0 p-5">
        {/* Bóng mờ gradient che phần scroll của menu */}
        <div className="pointer-events-none absolute -top-6 left-0 w-full h-6 bg-gradient-to-t from-slate-950 to-transparent" />
        
        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]">
          {/* Animated background glow */}
          <div className="absolute -inset-10 animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(245,158,11,0.1)_0deg,transparent_60deg,transparent_300deg,rgba(245,158,11,0.1)_360deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
            </div>
            <div>
              <p className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-sm font-black uppercase tracking-tight text-transparent">Gói Premium</p>
              <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-slate-400">Mở khóa toàn bộ tính năng</p>
            </div>
          </div>
          <button className="relative z-10 mt-5 w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95" type="button">
            <span className="relative z-10">Nâng cấp ngay</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
