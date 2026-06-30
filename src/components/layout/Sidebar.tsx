import {
    Bot,
    CalendarDays,
    ClipboardCheck,
    Dumbbell,
    Gauge,
    HeartPulse,
    Home,
    Package,
    ShieldCheck,
    UserRound,
    Users,
    WalletCards,
    Settings,
    BarChart,
    Flame,
    Bell,
    ChevronDown,
    ChevronUp,
    type LucideIcon,
} from "lucide-react";
import {useState} from "react";
import {NavLink, useLocation} from "react-router-dom";
import {ROUTES} from "../../config/routes";
import {useAuthStore} from "../../store/authStore";
import {useUiStore} from "../../store/uiStore";
import type {Role} from "../../types/common.type";

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
    {label: "Dashboard", path: ROUTES.MEMBER_HOME, icon: Home, roles: ["ROLE_MEMBER"]},
    {label: "Gói tập", path: ROUTES.MEMBER_PACKAGES, icon: Package, roles: ["ROLE_MEMBER"]},
    {label: "Lịch tập", path: ROUTES.MEMBER_BOOKING, icon: CalendarDays, roles: ["ROLE_MEMBER"]},
    {label: "Chỉ số cơ thể", path: ROUTES.MEMBER_BODY_METRICS, icon: HeartPulse, roles: ["ROLE_MEMBER"]},
    {label: "AI Fitness", path: ROUTES.MEMBER_AI, icon: Bot, roles: ["ROLE_MEMBER"]},
    {label: "Thanh toán", path: ROUTES.MEMBER_PAYMENT, icon: WalletCards, roles: ["ROLE_MEMBER"]},
    {label: "Hồ sơ", path: ROUTES.MEMBER_PROFILE, icon: UserRound, roles: ["ROLE_MEMBER"]},

    // ADMIN
    {label: "Tổng quan", path: ROUTES.ADMIN_DASHBOARD, icon: Gauge, roles: ["ROLE_ADMIN"]},
    {label: "Tài khoản", path: ROUTES.ADMIN_USERS, icon: ShieldCheck, roles: ["ROLE_ADMIN"]},
    {label: "Hội viên", path: ROUTES.ADMIN_MEMBERS, icon: Users, roles: ["ROLE_ADMIN"]},
    {label: "Gói tập", path: ROUTES.ADMIN_PACKAGES, icon: Package, roles: ["ROLE_ADMIN"]},
    {label: "Huấn luyện viên", path: ROUTES.ADMIN_TRAINERS, icon: UserRound, roles: ["ROLE_ADMIN"]},
    {label: "Trang thiết bị", path: ROUTES.ADMIN_EQUIPMENT, icon: Dumbbell, roles: ["ROLE_ADMIN", "ROLE_STAFF"]},
    {label: "Báo cáo", path: ROUTES.ADMIN_REPORTS, icon: BarChart, roles: ["ROLE_ADMIN"]},

    // STAFF
    {label: "Check-in", path: ROUTES.STAFF_CHECKIN, icon: ClipboardCheck, roles: ["ROLE_STAFF", "ROLE_ADMIN"]},
    {label: "Tra cứu hội viên", path: ROUTES.STAFF_MEMBER_LOOKUP, icon: Users, roles: ["ROLE_STAFF", "ROLE_ADMIN"]},
    {
        label: "Hỗ trợ gói tập",
        path: ROUTES.STAFF_SUBSCRIPTION_SUPPORT,
        icon: ShieldCheck,
        roles: ["ROLE_STAFF", "ROLE_ADMIN"]
    },

    // PT
    {label: "Lịch PT", path: ROUTES.TRAINER_SCHEDULE, icon: CalendarDays, roles: ["ROLE_TRAINER", "ROLE_ADMIN"]},
    {label: "Hội viên của tôi", path: ROUTES.TRAINER_MEMBERS, icon: Users, roles: ["ROLE_TRAINER", "ROLE_ADMIN"]},
    {label: "Theo dõi bài tập", path: ROUTES.TRAINER_WORKOUT_TRACKING, icon: Flame, roles: ["ROLE_TRAINER", "ROLE_ADMIN"]},

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
    const location = useLocation();

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) => ({...prev, [label]: !prev[label]}));
    };


    return (
        <aside
            className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[280px] bg-slate-950 border-r border-slate-900 transition-transform duration-500 ease-out lg:static lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none`}>
            <div className="flex h-28 shrink-0 items-center gap-4 px-8">
                <div className="flex">
                    <img
                        src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                        alt="FitLife Logo" className=" w-25"/>
                </div>
                <div>
                    <p className="text-3xl font-black tracking-tighter text-white uppercase italic">FitLife</p>
                    <p className="text-xs font-bold tracking-widest text-fit-primary uppercase">No Pain No Gain</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4 scrollbar-hide">
              {menuItems
                  .filter((item) => item.roles.some((role) => userRoles.includes(role)))
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
                                            <Icon
                                                className={`h-5 w-5 transition-transform duration-300 ${isChildActive || isExpanded ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'group-hover:scale-110'}`}/>
                                            <span className="relative z-10">{item.label}</span>
                                        </div>
                                        {isExpanded ? <ChevronUp className="h-4 w-4"/> :
                                            <ChevronDown className="h-4 w-4"/>}
                                        {(isChildActive || isExpanded) && (
                                            <div
                                                className="absolute inset-0 z-0 bg-gradient-to-r from-fit-primary/20 to-transparent opacity-50"/>
                                        )}
                                    </button>

                                    {isExpanded && (
                                        <div className="pl-12 pr-4 py-1 space-y-1">
                                            {item.children?.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={({isActive}) =>
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
                                className={({isActive}) =>
                                    `group relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold uppercase tracking-wide transition-all duration-300 ease-out overflow-hidden ${
                                        isActive
                                            ? "bg-fit-primary/10 text-fit-primary shadow-[inset_4px_0_0_0_#10b981]"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-white hover:translate-x-2"
                                    }`
                                }
                            >
                                {({isActive}) => (
                                    <>
                                        <Icon
                                            className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'group-hover:scale-110'}`}/>
                                        <span className="relative z-10">{item.label}</span>
                                        {isActive && (
                                            <div
                                                className="absolute inset-0 z-0 bg-gradient-to-r from-fit-primary/20 to-transparent opacity-50"/>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
            </nav>

            <div className="relative mt-auto shrink-0 p-5">
                {/* Bóng mờ gradient che phần scroll của menu */}
                <div
                    className="pointer-events-none absolute -top-6 left-0 w-full h-6 bg-gradient-to-t from-slate-950 to-transparent"/>

                <div
                    className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 hover:border-amber-500/50 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]">
                    {/* Animated background glow */}
                    <div
                        className="absolute -inset-10 animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,rgba(245,158,11,0.1)_0deg,transparent_60deg,transparent_300deg,rgba(245,158,11,0.1)_360deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"/>

                    <div className="relative z-10 flex items-center gap-3">
                        <div
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                            </svg>
                        </div>
                        <div>
                            <p className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-sm font-black uppercase tracking-tight text-transparent">Gói
                                Premium</p>
                            <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-slate-400">Mở khóa toàn bộ
                                tính năng</p>
                        </div>
                    </div>
                    <button
                        className="relative z-10 mt-5 w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95"
                        type="button">
                        <span className="relative z-10">Nâng cấp ngay</span>
                        <div
                            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-in-out group-hover:animate-[shimmer_2s_infinite]"/>
                    </button>
                </div>
            </div>
        </aside>
    );
}
