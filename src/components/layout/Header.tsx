import {
  Bell,
  ChevronDown,
  FileText,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import ConfirmDialog from "../common/ConfirmDialog";

import {
  ROUTES,
} from "../../config/routes";

import {
  useAuthStore,
} from "../../store/authStore";

import {
  useUiStore,
} from "../../store/uiStore";

import {
  showAlert,
} from "../../utils/alert";

export default function Header() {
  const navigate =
      useNavigate();

  const user =
      useAuthStore(
          (state) =>
              state.user,
      );

  const logout =
      useAuthStore(
          (state) =>
              state.logout,
      );

  const loggingOut =
      useAuthStore(
          (state) =>
              state.loggingOut,
      );

  const toggleSidebar =
      useUiStore(
          (state) =>
              state.toggleSidebar,
      );

  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] = useState(false);

  const [
    logoutDialogOpen,
    setLogoutDialogOpen,
  ] = useState(false);

  const accountMenuRef =
      useRef<HTMLDivElement>(
          null,
      );

  useEffect(() => {
    const handleOutsideClick = (
        event: MouseEvent,
    ) => {
      if (
          accountMenuRef.current &&
          !accountMenuRef.current.contains(
              event.target as Node,
          )
      ) {
        setAccountMenuOpen(
            false,
        );
      }
    };

    document.addEventListener(
        "mousedown",
        handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
          "mousedown",
          handleOutsideClick,
      );
    };
  }, []);

  const getRoleLabel = (
      roles?: string[],
  ): string => {
    if (
        roles?.includes(
            "ROLE_ADMIN",
        )
    ) {
      return "Quản trị viên";
    }

    if (
        roles?.includes(
            "ROLE_STAFF",
        )
    ) {
      return "Nhân viên";
    }

    if (
        roles?.includes(
            "ROLE_TRAINER",
        )
    ) {
      return "Huấn luyện viên";
    }

    return "Hội viên";
  };

  const getProfileRoute =
      (): string => {
        if (
            user?.roles.includes(
                "ROLE_MEMBER",
            )
        ) {
          return ROUTES.MEMBER_PROFILE;
        }

        return ROUTES.COMMON_SETTINGS;
      };

  const navigateTo = (
      path: string,
  ) => {
    setAccountMenuOpen(
        false,
    );

    navigate(path);
  };

  const handleLogout =
      async (): Promise<void> => {
        try {
          await logout();

          setLogoutDialogOpen(
              false,
          );

          await showAlert.success(
              "Đăng xuất thành công",
              "Hẹn gặp lại bạn tại FitLife.",
          );
        } finally {
          navigate(
              ROUTES.LOGIN,
              {
                replace: true,
              },
          );
        }
      };

  return (
      <>
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/90 px-4 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-4">
            <button
                type="button"
                onClick={
                  toggleSidebar
                }
                className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="group relative hidden w-80 sm:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-fit-primary focus:bg-white focus:ring-4 focus:ring-fit-primary/10"
                  placeholder="Tìm kiếm..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-fit-primary"
                aria-label="Thông báo"
            >
              <Bell className="h-5 w-5" />
            </button>

            <div
                ref={
                  accountMenuRef
                }
                className="relative"
            >
              <button
                  type="button"
                  onClick={() =>
                      setAccountMenuOpen(
                          (open) =>
                              !open,
                      )
                  }
                  className="flex items-center gap-3 rounded-2xl p-1.5 pr-3 hover:bg-slate-100"
              >
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-fit-primarySoft text-fit-primary">
                  {user?.avatarUrl ? (
                      <img
                          src={
                            user.avatarUrl
                          }
                          alt={
                            user.fullName
                          }
                          className="h-full w-full object-cover"
                      />
                  ) : (
                      <UserRound className="h-5 w-5" />
                  )}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="max-w-44 truncate text-sm font-bold text-slate-900">
                    {user?.fullName ||
                        user?.email ||
                        "FitLife User"}
                  </p>

                  <p className="text-xs font-bold uppercase tracking-wider text-fit-primary">
                    {getRoleLabel(
                        user?.roles,
                    )}
                  </p>
                </div>

                <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
              </button>

              {accountMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                    <div className="border-b border-slate-100 px-3 py-3">
                      <p className="truncate font-black text-slate-900">
                        {
                          user?.fullName
                        }
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <button
                          type="button"
                          onClick={() =>
                              navigateTo(
                                  getProfileRoute(),
                              )
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <UserRound className="h-4 w-4" />
                        Hồ sơ cá nhân
                      </button>

                      {user?.roles.includes(
                          "ROLE_MEMBER",
                      ) && (
                          <button
                              type="button"
                              onClick={() =>
                                  navigateTo(
                                      ROUTES.MEMBER_INVOICES,
                                  )
                              }
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <FileText className="h-4 w-4" />
                            Hóa đơn của tôi
                          </button>
                      )}

                      <button
                          type="button"
                          onClick={() =>
                              navigateTo(
                                  ROUTES.COMMON_SETTINGS,
                              )
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Settings className="h-4 w-4" />
                        Cài đặt và bảo mật
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-2">
                      <button
                          type="button"
                          onClick={() => {
                            setAccountMenuOpen(
                                false,
                            );

                            setLogoutDialogOpen(
                                true,
                            );
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </header>

        <ConfirmDialog
            open={
              logoutDialogOpen
            }
            title="Xác nhận đăng xuất"
            message="Bạn có chắc muốn đăng xuất khỏi tài khoản FitLife hiện tại?"
            confirmText="Đăng xuất"
            loading={
              loggingOut
            }
            onConfirm={() =>
                void handleLogout()
            }
            onCancel={() => {
              if (
                  !loggingOut
              ) {
                setLogoutDialogOpen(
                    false,
                );
              }
            }}
        />
      </>
  );
}