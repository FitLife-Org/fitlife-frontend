import {
    Navigate,
    Outlet,
    useLocation,
} from "react-router-dom";

import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import { tokenStorage } from "../../utils/token";

export default function ProtectedRoute() {
    const location = useLocation();

    const user = useAuthStore(
        (state) => state.user,
    );

    const accessToken =
        tokenStorage.getAccessToken();

    if (!accessToken || !user) {
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

    return <Outlet />;
}