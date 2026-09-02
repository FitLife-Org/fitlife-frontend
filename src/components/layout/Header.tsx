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

import { notificationService } from "../../services/notificationService";
import { NotificationDto } from "../../types/notification.type";

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

  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const accountMenuRef =
      useRef<HTMLDivElement>(
          null,
      );
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.readStatus).length;

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
  };

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
      
      if (
          notificationMenuRef.current &&
          !notificationMenuRef.current.contains(
              event.target as Node,
          )
      ) {
        setNotificationMenuOpen(false);
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

  const getProfileRoute = (): string => {
    if (user?.roles.includes("ROLE_MEMBER")) {
      return ROUTES.MEMBER_PROFILE;
    }
    if (user?.roles.includes("ROLE_ADMIN")) {
      return ROUTES.ADMIN_PROFILE;
    }
    if (user?.roles.includes("ROLE_STAFF")) {
      return ROUTES.STAFF_PROFILE;
    }
    if (user?.roles.includes("ROLE_TRAINER")) {
      return ROUTES.TRAINER_PROFILE;
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
            <div className="relative" ref={notificationMenuRef}>
              <button
                  type="button"
                  onClick={() => {
                    setNotificationMenuOpen((open) => !open);
                    setAccountMenuOpen(false);
                  }}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-fit-primary"
                  aria-label="Thông báo"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {notificationMenuOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <h3 className="font-bold text-slate-900">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-fit-primary hover:text-blue-700"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {loadingNotifs ? (
                      <div className="p-4 text-center text-sm text-slate-500">Đang tải...</div>
                    ) : notifications.length > 0 ? (
                      <div className="flex flex-col">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleMarkAsRead(notif.id)}
                            className={`cursor-pointer border-b border-slate-50 p-4 transition-colors hover:bg-slate-50 ${!notif.readStatus ? 'bg-blue-50/50' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${!notif.readStatus ? 'bg-fit-primary' : 'bg-transparent'}`}></div>
                              <div>
                                <p className={`text-sm ${!notif.readStatus ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                  {notif.title}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                  {notif.content}
                                </p>
                                <p className="mt-2 text-xs font-medium text-slate-400">
                                  {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500">
                        Chưa có thông báo nào
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-100 p-2">
                    <button className="w-full rounded-xl py-2 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      Xem tất cả
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
                ref={
                  accountMenuRef
                }
                className="relative"
            >
              <button
                  type="button"
                  onClick={() => {
                      setAccountMenuOpen((open) => !open);
                      setNotificationMenuOpen(false);
                  }}
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