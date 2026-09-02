import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute() {
    const location = useLocation();

    const isAuthenticated =
        useAuthStore(
            (state) =>
                state.isAuthenticated,
        );

    const user =
        useAuthStore(
            (state) => state.user,
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
                    from: `${location.pathname}${location.search}`,
                }}
            />
        );
    }

    return <Outlet />;
}