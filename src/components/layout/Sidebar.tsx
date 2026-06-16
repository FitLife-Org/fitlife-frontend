import { Bot, CalendarDays, ClipboardCheck, Dumbbell, Gauge, HeartPulse, Home, Package, ShieldCheck, UserRound, Users, WalletCards, Wrench } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import type { Role } from "../../types/common.type";

const menuItems: Array<{ label: string; path: string; icon: typeof Home; roles: Role[] }> = [
  { label: "Dashboard", path: ROUTES.MEMBER_HOME, icon: Home, roles: ["MEMBER"] },
  { label: "Gói tập", path: ROUTES.MEMBER_PACKAGES, icon: Package, roles: ["MEMBER"] },
  { label: "Lịch tập", path: ROUTES.MEMBER_BOOKING, icon: CalendarDays, roles: ["MEMBER"] },
  { label: "Chỉ số cơ thể", path: ROUTES.MEMBER_BODY_METRICS, icon: HeartPulse, roles: ["MEMBER"] },
  { label: "AI Fitness", path: ROUTES.MEMBER_AI, icon: Bot, roles: ["MEMBER"] },
  { label: "Thanh toán", path: ROUTES.MEMBER_PAYMENT, icon: WalletCards, roles: ["MEMBER"] },
  { label: "Hồ sơ", path: ROUTES.MEMBER_PROFILE, icon: UserRound, roles: ["MEMBER"] },
  { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD, icon: Gauge, roles: ["ADMIN", "STAFF", "TRAINER"] },
  { label: "Thành viên", path: ROUTES.ADMIN_MEMBERS, icon: ShieldCheck, roles: ["ADMIN"] },
  { label: "Quản lý gói", path: ROUTES.ADMIN_PACKAGES, icon: Package, roles: ["ADMIN"] },
  { label: "Thiết bị", path: ROUTES.ADMIN_EQUIPMENT, icon: Wrench, roles: ["ADMIN", "STAFF"] },
  { label: "Check-in", path: ROUTES.STAFF_CHECKIN, icon: ClipboardCheck, roles: ["STAFF", "ADMIN"] },
  { label: "Lịch trainer", path: ROUTES.TRAINER_SCHEDULE, icon: CalendarDays, roles: ["TRAINER", "ADMIN"] },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const role = user?.role || "MEMBER";

  return (
    <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[260px] border-r border-fit-border bg-white transition lg:static lg:translate-x-0`}>
      <div className="flex h-28 items-center gap-3 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fit-primarySoft text-fit-primary">
          <Dumbbell className="h-7 w-7" />
        </div>
        <div>
          <p className="text-3xl font-black text-fit-primary">FitLife</p>
          <p className="text-xs font-medium text-fit-muted">Sống khỏe mỗi ngày</p>
        </div>
      </div>

      <nav className="space-y-2 px-3">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-semibold transition ${
                    isActive ? "bg-fit-primarySoft text-fit-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
      </nav>
      <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-fit-border bg-white p-4 shadow-soft">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fit-primary text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-fit-text">Nâng cấp gói</p>
            <p className="mt-1 text-xs text-fit-muted">Mở khóa tính năng cao cấp.</p>
          </div>
        </div>
        <button className="mt-4 w-full rounded-xl bg-fit-primary py-3 text-sm font-bold text-white hover:bg-fit-primaryHover" type="button">
          Nâng cấp ngay
        </button>
      </div>
    </aside>
  );
}
