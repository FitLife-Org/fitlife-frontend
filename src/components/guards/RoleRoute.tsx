import { Navigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import { tokenStorage } from "../../utils/token";
import type { Role } from "../../types/common.type";

type RoleRouteProps = {
  roles: Role[];
  children: React.ReactNode;
};

type StoredAuthUser = {
  id?: number;
  username?: string;
  email?: string;
  fullName?: string;
  role?: Role;
  roles?: Role[];
  authorities?: Role[];
};

const getStoredUser = (): StoredAuthUser | null => {
  const rawUser = localStorage.getItem("authUser");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as StoredAuthUser;
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
};

const getUserRoles = (user: StoredAuthUser | null): Role[] => {
  if (!user) {
    return [];
  }

  if (Array.isArray(user.roles)) {
    return user.roles;
  }

  if (Array.isArray(user.authorities)) {
    return user.authorities;
  }

  if (user.role) {
    return [user.role];
  }

  return [];
};

export default function RoleRoute({ roles, children }: RoleRouteProps) {
  const storeUser = useAuthStore((state) => state.user) as StoredAuthUser | null;

  const token = tokenStorage.get();
  const user = storeUser || getStoredUser();

  if (!token || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const userRoles = getUserRoles(user);
  const hasPermission = roles.some((role) => userRoles.includes(role));

  if (!hasPermission) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}