import type {
  ReactNode,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";

import type {
  Role,
} from "../../types/common.type";

interface RoleRouteProps {
  roles: Role[];
  children: ReactNode;
}

export default function RoleRoute({
                                    roles,
                                    children,
                                  }: RoleRouteProps) {
  const location = useLocation();

  const user = useAuthStore(
      (state) => state.user,
  );

  if (!user) {
    return (
        <Navigate
            to={ROUTES.LOGIN}
            replace
            state={{
              from: location.pathname,
            }}
        />
    );
  }

  const hasPermission = roles.some(
      (role) => user.roles.includes(role),
  );

  if (!hasPermission) {
    return (
        <Navigate
            to={ROUTES.FORBIDDEN}
            replace
        />
    );
  }

  return <>{children}</>;
}