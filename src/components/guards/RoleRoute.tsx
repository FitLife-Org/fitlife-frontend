import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import type { Role } from "../../types/common.type";

interface RoleRouteProps {
  roles: Role[];
  children: ReactNode;
}

export default function RoleRoute({ roles, children }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "MEMBER";

  if (!roles.includes(role)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}
