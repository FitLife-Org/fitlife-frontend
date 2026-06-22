import { Navigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import type { Role } from "../../types/common.type";

type RoleRouteProps = {
  roles: Role[];
  children: React.ReactNode;
};

export default function RoleRoute({ roles, children }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const hasPermission = roles.some((role) => user.roles.includes(role));

  if (!hasPermission) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}