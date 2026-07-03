import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { useAuthStore } from "../../store/authStore";
import { tokenStorage } from "../../utils/token";

type StoredAuthUser = {
    id?: number;
    username?: string;
    email?: string;
    fullName?: string;
    role?: string;
    roles?: string[];
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

export default function ProtectedRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const storeUser = useAuthStore((state) => state.user) as StoredAuthUser | null;

    const token = tokenStorage.get();
    const user = storeUser || getStoredUser();

    if (!token || (!isAuthenticated && !user)) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <Outlet />;
}