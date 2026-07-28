import { create } from "zustand";

import type {
    AuthSession,
    AuthUser,
} from "../types/auth.type";

import { authService } from "../services/authService";
import { tokenStorage } from "../utils/token";

const AUTH_USER_KEY =
    "fitlife.authUser";

function canUseStorage(): boolean {
    return (
        typeof window !== "undefined" &&
        typeof window.localStorage !==
        "undefined"
    );
}

function isAuthUser(
    value: unknown,
): value is AuthUser {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return false;
    }

    const candidate =
        value as Partial<AuthUser>;

    return (
        typeof candidate.userId ===
        "number" &&
        typeof candidate.email ===
        "string" &&
        typeof candidate.fullName ===
        "string" &&
        Array.isArray(candidate.roles)
    );
}

function getUserFromStorage():
    AuthUser | null {
    if (!canUseStorage()) {
        return null;
    }

    try {
        const storedUser =
            window.localStorage.getItem(
                AUTH_USER_KEY,
            ) ??
            window.localStorage.getItem(
                "authUser",
            );

        if (!storedUser) {
            return null;
        }

        const parsedUser: unknown =
            JSON.parse(storedUser);

        if (!isAuthUser(parsedUser)) {
            throw new Error(
                "Invalid auth user.",
            );
        }

        /*
         * Migrate key cũ.
         */
        window.localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify(
                parsedUser,
            ),
        );

        window.localStorage.removeItem(
            "authUser",
        );

        return parsedUser;
    } catch {
        window.localStorage.removeItem(
            AUTH_USER_KEY,
        );

        window.localStorage.removeItem(
            "authUser",
        );

        return null;
    }
}

function saveUser(
    user: AuthUser,
): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user),
    );
}

function removeStoredUser(): void {
    if (!canUseStorage()) {
        return;
    }

    window.localStorage.removeItem(
        AUTH_USER_KEY,
    );

    window.localStorage.removeItem(
        "authUser",
    );
}

const initialAccessToken =
    tokenStorage.getAccessToken();

const initialRefreshToken =
    tokenStorage.getRefreshToken();

const initialUser =
    getUserFromStorage();

const hasCompleteInitialSession =
    Boolean(
        initialAccessToken &&
        initialRefreshToken &&
        initialUser,
    );

if (!hasCompleteInitialSession) {
    tokenStorage.clear();
    removeStoredUser();
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    loggingOut: boolean;

    setSession: (
        session: AuthSession,
    ) => void;

    updateAccessToken: (
        accessToken: string,
    ) => void;

    updateUser: (
        user: AuthUser,
    ) => void;

    clearSession: () => void;

    logout: () => Promise<void>;

    logoutAll: () => Promise<void>;
}

export const useAuthStore =
    create<AuthState>(
        (set, get) => ({
            accessToken:
                hasCompleteInitialSession
                    ? initialAccessToken
                    : null,

            refreshToken:
                hasCompleteInitialSession
                    ? initialRefreshToken
                    : null,

            user:
                hasCompleteInitialSession
                    ? initialUser
                    : null,

            isAuthenticated:
            hasCompleteInitialSession,

            loggingOut: false,

            setSession: (
                session: AuthSession,
            ) => {
                tokenStorage.setTokens(
                    session.accessToken,
                    session.refreshToken,
                );

                saveUser(
                    session.user,
                );

                set({
                    accessToken:
                    session.accessToken,
                    refreshToken:
                    session.refreshToken,
                    user: session.user,
                    isAuthenticated: true,
                    loggingOut: false,
                });
            },

            updateAccessToken: (
                accessToken: string,
            ) => {
                tokenStorage.setAccessToken(
                    accessToken,
                );

                set({
                    accessToken,
                });
            },

            updateUser: (
                user: AuthUser,
            ) => {
                saveUser(user);

                set({
                    user,
                });
            },

            clearSession: () => {
                tokenStorage.clear();
                removeStoredUser();

                set({
                    accessToken: null,
                    refreshToken: null,
                    user: null,
                    isAuthenticated: false,
                    loggingOut: false,
                });
            },

            logout: async () => {
                if (get().loggingOut) {
                    return;
                }

                set({
                    loggingOut: true,
                });

                try {
                    await authService.logout();
                } catch {
                    /*
                     * Logout local vẫn phải chạy kể cả backend
                     * không phản hồi hoặc token đã hết hạn.
                     */
                } finally {
                    get().clearSession();
                }
            },

            logoutAll: async () => {
                if (get().loggingOut) {
                    return;
                }

                set({
                    loggingOut: true,
                });

                try {
                    await authService.logoutAll();
                } catch {
                    /*
                     * Vẫn xóa session local.
                     */
                } finally {
                    get().clearSession();
                }
            },
        }),
    );

if (
    typeof window !== "undefined"
) {
    window.addEventListener(
        "fitlife:session-cleared",
        () => {
            useAuthStore
                .getState()
                .clearSession();
        },
    );
}