import type { ReactNode } from "react";

import {
    Navigate,
    useLocation,
} from "react-router-dom";

import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";

import type { Role } from "../../types/common.type";

interface RoleRouteProps {
    roles: Role[];
    children: ReactNode;
}

export default function RoleRoute({
                                      roles,
                                      children,
                                  }: RoleRouteProps) {
    const location = useLocation();

    const isAuthenticated =
        useAuthStore(
            (state) =>
                state.isAuthenticated,
        );

    const user =
        useAuthStore(
            (state) =>
                state.user,
        );

    if (
        !isAuthenticated ||
        !user
    ) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                replace
                state={{
                    from:
                        `${location.pathname}${location.search}`,
                }}
            />
        );
    }

    const hasPermission =
        roles.some(
            (requiredRole) =>
                user.roles.includes(
                    requiredRole,
                ),
        );

    if (!hasPermission) {
        return (
            <Navigate
                to={ROUTES.FORBIDDEN}
                replace
                state={{
                    from:
                        `${location.pathname}${location.search}`,
                }}
            />
        );
    }

    return <>{children}</>;
}