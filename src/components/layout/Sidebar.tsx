import {
    BarChart,
    Bot,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    Dumbbell,
    Flame,
    Gauge,
    HeartPulse,
    Home,
    Package,
    Receipt,
    Settings,
    ShieldCheck,
    UserRound,
    Users,
    Utensils,
    WalletCards,
    type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import type { Role } from "../../types/common.type";

type MenuItemType = {
    label: string;
    path?: string;
    icon: LucideIcon;
    roles: Role[];
    children?: {
        label: string;
        path: string;
    }[];
};

const menuItems: MenuItemType[] = [
    // MEMBER
    { label: "Dashboard", path: ROUTES.MEMBER_HOME, icon: Home, roles: ["ROLE_MEMBER"] },
    { label: "Giáo án", path: ROUTES.MEMBER_WORKOUTS, icon: Dumbbell, roles: ["ROLE_MEMBER"] },
    { label: "Dinh dưỡng", path: ROUTES.MEMBER_NUTRITION, icon: Utensils, roles: ["ROLE_MEMBER"] },
    { label: "Gói tập", path: ROUTES.MEMBER_PACKAGES, icon: Package, roles: ["ROLE_MEMBER"] },
    { label: "Lịch tập", path: ROUTES.MEMBER_BOOKING, icon: CalendarDays, roles: ["ROLE_MEMBER"] },
    { label: "Chỉ số cơ thể", path: ROUTES.MEMBER_BODY_METRICS, icon: HeartPulse, roles: ["ROLE_MEMBER"] },
    { label: "AI Fitness", path: ROUTES.MEMBER_AI, icon: Bot, roles: ["ROLE_MEMBER"] },
    { label: "Thanh toán", path: ROUTES.MEMBER_PAYMENT, icon: WalletCards, roles: ["ROLE_MEMBER"] },
    { label: "Hồ sơ", path: ROUTES.MEMBER_PROFILE, icon: UserRound, roles: ["ROLE_MEMBER"] },

    // ADMIN
    { label: "Tổng quan", path: ROUTES.ADMIN_DASHBOARD, icon: Gauge, roles: ["ROLE_ADMIN"] },
    { label: "Tài khoản", path: ROUTES.ADMIN_USERS, icon: ShieldCheck, roles: ["ROLE_ADMIN"] },
    { label: "Hội viên", path: ROUTES.ADMIN_MEMBERS, icon: Users, roles: ["ROLE_ADMIN"] },
    { label: "Gói tập", path: ROUTES.ADMIN_PACKAGES, icon: Package, roles: ["ROLE_ADMIN"] },
    { label: "Huấn luyện viên", path: ROUTES.ADMIN_TRAINERS, icon: UserRound, roles: ["ROLE_ADMIN"] },
    { label: "Trang thiết bị", path: ROUTES.ADMIN_EQUIPMENT, icon: Dumbbell, roles: ["ROLE_ADMIN", "ROLE_STAFF"] },
    { label: "Hóa đơn", path: ROUTES.ADMIN_INVOICES, icon: Receipt, roles: ["ROLE_ADMIN"] },
    { label: "Báo cáo", path: ROUTES.ADMIN_REPORTS, icon: BarChart, roles: ["ROLE_ADMIN"] },

    // STAFF
    { label: "Check-in", path: ROUTES.STAFF_CHECKIN, icon: ClipboardCheck, roles: ["ROLE_STAFF", "ROLE_ADMIN"] },
    { label: "Hỗ trợ gói tập", path: ROUTES.STAFF_SUBSCRIPTION_SUPPORT, icon: ShieldCheck, roles: ["ROLE_STAFF", "ROLE_ADMIN"] },
    { label: "Quản lý thanh toán", path: ROUTES.ADMIN_PAYMENTS, icon: WalletCards, roles: ["ROLE_ADMIN", "ROLE_STAFF"] },

    // TRAINER
    { label: "Lịch PT", path: ROUTES.TRAINER_SCHEDULE, icon: CalendarDays, roles: ["ROLE_TRAINER", "ROLE_ADMIN"] },
    { label: "Hội viên của tôi", path: ROUTES.TRAINER_MEMBERS, icon: Users, roles: ["ROLE_TRAINER", "ROLE_ADMIN"] },
    { label: "Theo dõi bài tập", path: ROUTES.TRAINER_WORKOUT_TRACKING, icon: Flame, roles: ["ROLE_TRAINER", "ROLE_ADMIN"] },

    // COMMON
    {
        label: "Cài đặt",
        path: ROUTES.COMMON_SETTINGS,
        icon: Settings,
        roles: ["ROLE_MEMBER", "ROLE_ADMIN", "ROLE_STAFF", "ROLE_TRAINER"],
    },
];

export default function Sidebar() {
    const user = useAuthStore((state) => state.user);
    const sidebarOpen = useUiStore((state) => state.sidebarOpen);
    const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

    const userRoles = user?.roles ?? [];
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleMenu = (label: string) => {
        setExpandedMenus((previous) => ({
            ...previous,
            [label]: !previous[label],
        }));
    };

    return (
        <aside
            inert={isMobile && !sidebarOpen ? true : undefined}
            className={`${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-slate-900 bg-slate-950 shadow-2xl transition-transform duration-500 ease-out lg:static lg:translate-x-0 lg:shadow-none`}
        >
            <div className="flex h-28 shrink-0 items-center gap-4 px-8">
                <img
                    src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                    alt="FitLife Logo"
                    className="w-25"
                />

                <div>
                    <p className="text-3xl font-black uppercase italic tracking-tighter text-white">
                        FitLife
                    </p>
                    <p className="text-xs font-bold uppercase tracking-widest text-fit-primary">
                        No Pain No Gain
                    </p>
                </div>
            </div>

            <nav className="scrollbar-hide flex-1 space-y-2 overflow-y-auto px-4 py-4">
                {menuItems
                    .filter((item) =>
                        item.roles.some((role) => userRoles.includes(role)),
                    )
                    .map((item) => {
                        const Icon = item.icon;
                        const hasChildren = Boolean(item.children?.length);
                        const isExpanded = expandedMenus[item.label];
                        const isChildActive =
                            hasChildren &&
                            item.children?.some((child) => location.pathname === child.path);

                        if (hasChildren) {
                            return (
                                <div key={item.label} className="space-y-1">
                                    <button
                                        type="button"
                                        onClick={() => toggleMenu(item.label)}
                                        className={`group relative flex w-full items-center justify-between overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 ease-out ${
                                            isChildActive || isExpanded
                                                ? "bg-fit-primary/10 text-fit-primary shadow-[inset_4px_0_0_0_#10b981]"
                                                : "text-slate-400 hover:translate-x-2 hover:bg-slate-900 hover:text-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Icon
                                                className={`h-5 w-5 transition-transform duration-300 ${
                                                    isChildActive || isExpanded
                                                        ? "scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                                        : "group-hover:scale-110"
                                                }`}
                                            />
                                            <span className="relative z-10">{item.label}</span>
                                        </div>

                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}

                                        {(isChildActive || isExpanded) && (
                                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-fit-primary/20 to-transparent opacity-50" />
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="space-y-1 py-1 pl-12 pr-4">
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
                                    `group relative flex items-center gap-4 overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 ease-out ${
                                        isActive
                                            ? "bg-fit-primary/10 text-fit-primary shadow-[inset_4px_0_0_0_#10b981]"
                                            : "text-slate-400 hover:translate-x-2 hover:bg-slate-900 hover:text-white"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className={`h-5 w-5 transition-transform duration-300 ${
                                                isActive
                                                    ? "scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                                                    : "group-hover:scale-110"
                                            }`}
                                        />
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
                <div className="pointer-events-none absolute -top-6 left-0 h-6 w-full bg-gradient-to-t from-slate-950 to-transparent" />

                <div className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]">
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
                            </svg>
                        </div>

                        <div>
                            <p className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-sm font-black uppercase tracking-tight text-transparent">
                                Gói Premium
                            </p>
                            <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-slate-400">
                                Mở khóa toàn bộ tính năng
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="relative z-10 mt-5 w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
                    >
                        Nâng cấp ngay
                    </button>
                </div>
            </div>
        </aside>
    );
}
