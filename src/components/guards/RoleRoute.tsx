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
    roles: readonly Role[];
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

    const returnUrl =
        `${location.pathname}${location.search}`;

    if (
        !isAuthenticated ||
        !user
    ) {
        return (
            <Navigate
                to={ROUTES.LOGIN}
                replace
                state={{
                    from: returnUrl,
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
                    from: returnUrl,
                }}
            />
        );
    }

    return <>{children}</>;
}