import {
    BarChart,
    Bot,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Dumbbell,
    FileText,
    Flame,
    Gauge,
    HeartPulse,
    Home,
    Package,
    QrCode,
    Receipt,
    ScanLine,
    Settings,
    ShieldCheck,
    User,
    UserRound,
    Users,
    Utensils,
    WalletCards,
    type LucideIcon,
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    NavLink,
    useLocation,
} from "react-router-dom";

import {
    ROUTES,
} from "../../config/routes";

import {
    useAuthStore,
} from "../../store/authStore";

import {
    useUiStore,
} from "../../store/uiStore";

import type {
    Role,
} from "../../types/common.type";

// =====================================================
// TYPES
// =====================================================

interface MenuChild {
    label: string;
    path: string;
}

interface MenuItem {
    label: string;
    path?: string;
    icon: LucideIcon;
    roles: readonly Role[];
    children?: readonly MenuChild[];
}

// =====================================================
// HELPERS
// =====================================================

function getMenuItemKey(
    item: MenuItem,
): string {
    return (
        item.path ??
        item.children
            ?.map(
                (child) =>
                    child.path,
            )
            .join("|") ??
        item.label
    );
}

function isPathActive(
    currentPath: string,
    targetPath: string,
): boolean {
    if (
        currentPath ===
        targetPath
    ) {
        return true;
    }

    return currentPath.startsWith(
        `${targetPath}/`,
    );
}

// =====================================================
// MENU CONFIG
// =====================================================

const menuItems:
    readonly MenuItem[] = [

    // =====================================================
    // MEMBER
    // =====================================================

    {
        label: "Dashboard",
        path:
        ROUTES.MEMBER_HOME,
        icon:
        Home,
        roles: [
            "ROLE_MEMBER",
        ],
    },

    {
        label: "AI Fitness",
        path:
        ROUTES.MEMBER_AI,
        icon:
        Bot,
        roles: [
            "ROLE_MEMBER",
        ],
    },

    {
        label:
            "Chỉ số cơ thể",
        path:
        ROUTES.MEMBER_BODY_METRICS,
        icon:
        HeartPulse,
        roles: [
            "ROLE_MEMBER",
        ],
    },

    {
        label: "Giáo án",
        icon:
        Dumbbell,
        roles: [
            "ROLE_MEMBER",
        ],
        children: [
            {
                label:
                    "Tất cả giáo án",
                path:
                ROUTES.MEMBER_WORKOUTS,
            },
            {
                label:
                    "Tập hôm nay",
                path:
                ROUTES.MEMBER_WORKOUT_TODAY,
            },
        ],
    },

    {
        label:
            "Dinh dưỡng",
        icon:
        Utensils,
        roles: [
            "ROLE_MEMBER",
        ],
        children: [
            {
                label:
                    "Kế hoạch",
                path:
                ROUTES.MEMBER_NUTRITION,
            },
            {
                label:
                    "Hôm nay",
                path:
                ROUTES.MEMBER_NUTRITION_TODAY,
            },
        ],
    },

    {
        label:
            "Lịch tập",
        path:
        ROUTES.MEMBER_SCHEDULE,
        icon:
        CalendarDays,
        roles: [
            "ROLE_MEMBER",
        ],
    },

    {
        label:
            "Huấn luyện viên",
        path:
        ROUTES.MEMBER_BOOKING,
        icon:
        User,
        roles: [
            "ROLE_MEMBER",
        ],
    },

    {
        label:
            "Gói tập",
        icon:
        Package,
        roles: [
            "ROLE_MEMBER",
        ],
        children: [
            {
                label:
                    "Danh sách gói",
                path:
                ROUTES.MEMBER_PACKAGES,
            },
            {
                label:
                    "Gói của tôi",
                path:
                ROUTES.MEMBER_SUBSCRIPTION,
            },
        ],
    },

    {
        label:
            "Lịch sử Check-in",
        path:
        ROUTES.MEMBER_CHECKINS,
        icon:
        QrCode,
        roles: [
            "ROLE_MEMBER",
        ],
    },

    {
        label:
            "Tài chính",
        icon:
        WalletCards,
        roles: [
            "ROLE_MEMBER",
        ],
        children: [
            {
                label:
                    "Hóa đơn của tôi",
                path:
                ROUTES.MEMBER_INVOICES,
            },
            {
                label:
                    "Lịch sử thanh toán",
                path:
                ROUTES.MEMBER_PAYMENT,
            },
        ],
    },

    {
        label:
            "Hồ sơ",
        path:
        ROUTES.MEMBER_PROFILE,
        icon:
        UserRound,
        roles: [
            "ROLE_MEMBER",
        ],
    },

    // =====================================================
    // ADMIN
    // =====================================================

    {
        label:
            "Tổng quan",
        path:
        ROUTES.ADMIN_DASHBOARD,
        icon:
        Gauge,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "Tài khoản",
        path:
        ROUTES.ADMIN_USERS,
        icon:
        ShieldCheck,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "Hội viên",
        path:
        ROUTES.ADMIN_MEMBERS,
        icon:
        Users,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "Gói tập",
        path:
        ROUTES.ADMIN_PACKAGES,
        icon:
        Package,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "Huấn luyện viên",
        path:
        ROUTES.ADMIN_TRAINERS,
        icon:
        UserRound,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "Trang thiết bị",
        icon:
        Dumbbell,
        roles: [
            "ROLE_ADMIN",
            "ROLE_STAFF",
        ],
        children: [
            {
                label:
                    "Danh sách",
                path:
                ROUTES.ADMIN_EQUIPMENT,
            },
            {
                label:
                    "Lịch bảo trì",
                path:
                ROUTES.ADMIN_MAINTENANCE_SCHEDULES,
            },
        ],
    },

    // -----------------------------------------------------
    // ADMIN FINANCE
    // -----------------------------------------------------

    {
        label:
            "Tài chính",
        icon:
        Receipt,
        roles: [
            "ROLE_ADMIN",
        ],
        children: [
            {
                label:
                    "Hóa đơn",
                path:
                ROUTES.ADMIN_INVOICES,
            },
            {
                label:
                    "Đăng ký gói",
                path:
                ROUTES.ADMIN_SUBSCRIPTIONS,
            },
        ],
    },

    {
        label:
            "Báo cáo",
        path:
        ROUTES.ADMIN_REPORTS,
        icon:
        BarChart,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "AI Suggestion",
        path:
        ROUTES.ADMIN_AI_SUGGESTIONS,
        icon:
        Bot,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "Điểm danh & Ra vào",
        path:
        ROUTES.ADMIN_CHECKIN,
        icon:
        ScanLine,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    {
        label:
            "Hồ sơ",
        path:
        ROUTES.ADMIN_PROFILE,
        icon:
        UserRound,
        roles: [
            "ROLE_ADMIN",
        ],
    },

    // =====================================================
    // STAFF
    // =====================================================

    {
        label:
            "Điểm danh & Ra vào",
        path:
        ROUTES.STAFF_CHECKIN,
        icon:
        ScanLine,
        roles: [
            "ROLE_STAFF",
        ],
    },

    // -----------------------------------------------------
    // STAFF FINANCE
    // -----------------------------------------------------

    {
        label:
            "Tài chính",
        icon:
        Receipt,
        roles: [
            "ROLE_STAFF",
        ],
        children: [
            {
                label:
                    "Hóa đơn",
                path:
                ROUTES.STAFF_INVOICES,
            },
            {
                label:
                    "Đăng ký gói",
                path:
                ROUTES.STAFF_SUBSCRIPTION_SUPPORT,
            },
        ],
    },

    {
        label:
            "Hồ sơ",
        path:
        ROUTES.STAFF_PROFILE,
        icon:
        UserRound,
        roles: [
            "ROLE_STAFF",
        ],
    },

    // =====================================================
    // TRAINER
    // =====================================================

    {
        label:
            "Lịch PT",
        path:
        ROUTES.TRAINER_SCHEDULE,
        icon:
        CalendarDays,
        roles: [
            "ROLE_TRAINER",
        ],
    },

    {
        label:
            "Hội viên của tôi",
        path:
        ROUTES.TRAINER_MEMBERS,
        icon:
        Users,
        roles: [
            "ROLE_TRAINER",
        ],
    },

    {
        label:
            "Theo dõi bài tập",
        path:
        ROUTES.TRAINER_WORKOUT_TRACKING,
        icon:
        Flame,
        roles: [
            "ROLE_TRAINER",
        ],
    },

    {
        label:
            "Hồ sơ",
        path:
        ROUTES.TRAINER_PROFILE,
        icon:
        UserRound,
        roles: [
            "ROLE_TRAINER",
        ],
    },

    // =====================================================
    // COMMON
    // =====================================================

    {
        label:
            "Cài đặt",
        path:
        ROUTES.COMMON_SETTINGS,
        icon:
        Settings,
        roles: [
            "ROLE_MEMBER",
            "ROLE_ADMIN",
            "ROLE_STAFF",
            "ROLE_TRAINER",
        ],
    },
];

// =====================================================
// COMPONENT
// =====================================================

export default function Sidebar() {
    const user =
        useAuthStore(
            (state) =>
                state.user,
        );

    const sidebarOpen =
        useUiStore(
            (state) =>
                state.sidebarOpen,
        );

    const setSidebarOpen =
        useUiStore(
            (state) =>
                state.setSidebarOpen,
        );

    const location =
        useLocation();

    const userRoles =
        useMemo(
            () =>
                user?.roles ??
                [],
            [
                user?.roles,
            ],
        );

    const [
        expandedMenus,
        setExpandedMenus,
    ] =
        useState<
            Record<
                string,
                boolean
            >
        >({});

    const [
        isMobile,
        setIsMobile,
    ] =
        useState(() => {
            if (
                typeof window ===
                "undefined"
            ) {
                return false;
            }

            return (
                window.innerWidth <
                1024
            );
        });

    // =====================================================
    // VISIBLE MENUS
    // =====================================================

    const visibleMenuItems =
        useMemo(
            () =>
                menuItems.filter(
                    (item) =>
                        item.roles.some(
                            (role) =>
                                userRoles.includes(
                                    role,
                                ),
                        ),
                ),
            [
                userRoles,
            ],
        );

    // =====================================================
    // MOBILE
    // =====================================================

    useEffect(() => {
        const handleResize =
            () => {
                setIsMobile(
                    window.innerWidth <
                    1024,
                );
            };

        window.addEventListener(
            "resize",
            handleResize,
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize,
            );
        };
    }, []);

    // =====================================================
    // AUTO EXPAND ACTIVE PARENT
    // =====================================================

    useEffect(() => {
        const activeParents:
            Record<
                string,
                boolean
            > = {};

        visibleMenuItems.forEach(
            (item) => {
                if (
                    !item.children
                ) {
                    return;
                }

                const hasActiveChild =
                    item.children.some(
                        (child) =>
                            isPathActive(
                                location.pathname,
                                child.path,
                            ),
                    );

                if (
                    hasActiveChild
                ) {
                    activeParents[
                        getMenuItemKey(
                            item,
                        )
                        ] = true;
                }
            },
        );

        setExpandedMenus(
            activeParents,
        );
    }, [
        location.pathname,
        visibleMenuItems,
    ]);

    // =====================================================
    // ACTIONS
    // =====================================================

    const toggleMenu = (
        menuKey: string,
    ) => {
        setExpandedMenus(
            (previous) => ({
                ...previous,
                [menuKey]:
                    !previous[
                        menuKey
                        ],
            }),
        );
    };

    const handleNavigate =
        () => {
            if (
                isMobile
            ) {
                setSidebarOpen(
                    false,
                );
            }
        };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <aside
            inert={
                isMobile &&
                !sidebarOpen
                    ? true
                    : undefined
            }
            aria-hidden={
                isMobile &&
                !sidebarOpen
            }
            className={`
                fixed
                inset-y-0
                left-0
                z-40
                flex
                h-screen
                w-[280px]
                flex-col
                border-r
                border-slate-900
                bg-slate-950
                shadow-2xl
                transition-transform
                duration-300
                ease-out
                lg:translate-x-0
                lg:shadow-none

                ${
                sidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full"
            }
            `}
        >
            {/* =================================================
                BRAND
            ================================================= */}

            <div
                className="
                    flex
                    h-28
                    shrink-0
                    items-center
                    gap-4
                    px-8
                "
            >
                <img
                    src="https://res.cloudinary.com/duopgsqbv/image/upload/v1779720149/z7845595736939_488081c4d5d966b4de13e74e5d1ed1aa-removebg-preview_jnqo49.png"
                    alt="FitLife Logo"
                    className="
                        w-24
                        object-contain
                    "
                />

                <div>
                    <p
                        className="
                            text-3xl
                            font-black
                            uppercase
                            italic
                            tracking-tighter
                            text-white
                        "
                    >
                        FitLife
                    </p>

                    <p
                        className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-widest
                            text-fit-primary
                        "
                    >
                        No Pain No Gain
                    </p>
                </div>
            </div>

            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav
                className="
                    fit-scrollbar
                    flex-1
                    space-y-2
                    overflow-y-auto
                    px-4
                    py-4
                "
            >
                {visibleMenuItems.map(
                    (item) => {
                        const menuKey =
                            getMenuItemKey(
                                item,
                            );

                        const Icon =
                            item.icon;

                        const hasChildren =
                            Boolean(
                                item.children
                                    ?.length,
                            );

                        const isChildActive =
                            Boolean(
                                item.children?.some(
                                    (
                                        child,
                                    ) =>
                                        isPathActive(
                                            location.pathname,
                                            child.path,
                                        ),
                                ),
                            );

                        const isExpanded =
                            Boolean(
                                expandedMenus[
                                    menuKey
                                    ],
                            );

                        // =====================================
                        // PARENT MENU
                        // =====================================

                        if (
                            hasChildren
                        ) {
                            return (
                                <div
                                    key={
                                        menuKey
                                    }
                                    className="
                                        space-y-1
                                    "
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleMenu(
                                                menuKey,
                                            )
                                        }
                                        aria-expanded={
                                            isExpanded
                                        }
                                        className={`
                                            group
                                            relative
                                            flex
                                            w-full
                                            items-center
                                            justify-between
                                            overflow-hidden
                                            rounded-xl
                                            px-4
                                            py-3.5
                                            text-sm
                                            font-bold
                                            uppercase
                                            tracking-wide
                                            transition-all
                                            duration-200

                                            ${
                                            isChildActive ||
                                            isExpanded
                                                ? "bg-fit-primary/10 text-fit-primary shadow-[inset_4px_0_0_0_#10b981]"
                                                : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                        }
                                        `}
                                    >
                                        <div
                                            className="
                                                relative
                                                z-10
                                                flex
                                                items-center
                                                gap-4
                                            "
                                        >
                                            <Icon
                                                className={`
                                                    h-5
                                                    w-5
                                                    transition-transform

                                                    ${
                                                    isChildActive ||
                                                    isExpanded
                                                        ? "scale-110"
                                                        : "group-hover:scale-110"
                                                }
                                                `}
                                                aria-hidden="true"
                                            />

                                            <span>
                                                {
                                                    item.label
                                                }
                                            </span>
                                        </div>

                                        <span
                                            className="
                                                relative
                                                z-10
                                            "
                                        >
                                            {isExpanded ? (
                                                <ChevronUp
                                                    className="
                                                        h-4
                                                        w-4
                                                    "
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <ChevronDown
                                                    className="
                                                        h-4
                                                        w-4
                                                    "
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </span>

                                        {(isChildActive ||
                                            isExpanded) && (
                                            <div
                                                className="
                                                    absolute
                                                    inset-0
                                                    z-0
                                                    bg-gradient-to-r
                                                    from-fit-primary/20
                                                    to-transparent
                                                    opacity-50
                                                "
                                            />
                                        )}
                                    </button>

                                    {/* CHILDREN */}

                                    {isExpanded && (
                                        <div
                                            className="
                                                space-y-1
                                                py-1
                                                pl-12
                                                pr-4
                                            "
                                        >
                                            {item.children?.map(
                                                (
                                                    child,
                                                ) => {
                                                    const active =
                                                        isPathActive(
                                                            location.pathname,
                                                            child.path,
                                                        );

                                                    return (
                                                        <NavLink
                                                            key={
                                                                child.path
                                                            }
                                                            to={
                                                                child.path
                                                            }
                                                            onClick={
                                                                handleNavigate
                                                            }
                                                            className={`
                                                                block
                                                                rounded-lg
                                                                px-3
                                                                py-2.5
                                                                text-xs
                                                                font-bold
                                                                uppercase
                                                                tracking-wide
                                                                transition-colors

                                                                ${
                                                                active
                                                                    ? "bg-fit-primary/10 text-fit-primary"
                                                                    : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
                                                            }
                                                            `}
                                                        >
                                                            {
                                                                child.label
                                                            }
                                                        </NavLink>
                                                    );
                                                },
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // =====================================
                        // NORMAL MENU
                        // =====================================

                        if (
                            !item.path
                        ) {
                            return null;
                        }

                        const active =
                            isPathActive(
                                location.pathname,
                                item.path,
                            );

                        return (
                            <NavLink
                                key={`${item.label}-${item.path}`}
                                to={
                                    item.path
                                }
                                onClick={
                                    handleNavigate
                                }
                                className={`
                                    group
                                    relative
                                    flex
                                    items-center
                                    gap-4
                                    overflow-hidden
                                    rounded-xl
                                    px-4
                                    py-3.5
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-wide
                                    transition-all
                                    duration-200

                                    ${
                                    active
                                        ? "bg-fit-primary/10 text-fit-primary shadow-[inset_4px_0_0_0_#10b981]"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                                }
                                `}
                            >
                                <Icon
                                    className={`
                                        relative
                                        z-10
                                        h-5
                                        w-5
                                        transition-transform

                                        ${
                                        active
                                            ? "scale-110"
                                            : "group-hover:scale-110"
                                    }
                                    `}
                                    aria-hidden="true"
                                />

                                <span
                                    className="
                                        relative
                                        z-10
                                    "
                                >
                                    {
                                        item.label
                                    }
                                </span>

                                {active && (
                                    <div
                                        className="
                                            absolute
                                            inset-0
                                            z-0
                                            bg-gradient-to-r
                                            from-fit-primary/20
                                            to-transparent
                                            opacity-50
                                        "
                                    />
                                )}
                            </NavLink>
                        );
                    },
                )}
            </nav>

            {/* =================================================
                USER FOOTER
            ================================================= */}

            <div
                className="
                    relative
                    mt-auto
                    shrink-0
                    p-5
                "
            >
                <div
                    className="
                        pointer-events-none
                        absolute
                        -top-6
                        left-0
                        h-6
                        w-full
                        bg-gradient-to-t
                        from-slate-950
                        to-transparent
                    "
                />

                <div
                    className="
                        rounded-xl
                        border
                        border-slate-800
                        bg-slate-900/70
                        px-4
                        py-3
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-fit-primary/15
                                text-fit-primary
                            "
                        >
                            <FileText
                                className="
                                    h-4
                                    w-4
                                "
                                aria-hidden="true"
                            />
                        </div>

                        <div
                            className="
                                min-w-0
                            "
                        >
                            <p
                                className="
                                    truncate
                                    text-sm
                                    font-bold
                                    text-white
                                "
                            >
                                {user?.fullName ||
                                    "FitLife User"}
                            </p>

                            <p
                                className="
                                    truncate
                                    text-xs
                                    text-slate-500
                                "
                            >
                                {user?.email ||
                                    userRoles.join(
                                        ", ",
                                    )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}