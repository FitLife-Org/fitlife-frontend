import { create } from "zustand";

import type {
    AuthSession,
    AuthUser,
} from "../types/auth.type";

import { authService } from "../services/authService";
import { tokenStorage } from "../utils/token";

const AUTH_USER_KEY =
    "fitlife.authUser";

const LEGACY_AUTH_USER_KEY =
    "authUser";

function canUseStorage(): boolean {
    return (
        typeof window !== "undefined" &&
        typeof window.localStorage !==
        "undefined" &&
        typeof window.sessionStorage !==
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

function parseStoredUser(
    storedUser: string | null,
): AuthUser | null {
    if (!storedUser) {
        return null;
    }

    try {
        const parsed: unknown =
            JSON.parse(storedUser);

        return isAuthUser(parsed)
            ? parsed
            : null;
    } catch {
        return null;
    }
}

function getUserFromStorage():
    AuthUser | null {
    if (!canUseStorage()) {
        return null;
    }

    const localUser =
        parseStoredUser(
            window.localStorage.getItem(
                AUTH_USER_KEY,
            ),
        );

    if (localUser) {
        return localUser;
    }

    const sessionUser =
        parseStoredUser(
            window.sessionStorage.getItem(
                AUTH_USER_KEY,
            ),
        );

    if (sessionUser) {
        return sessionUser;
    }

    const legacyUser =
        parseStoredUser(
            window.localStorage.getItem(
                LEGACY_AUTH_USER_KEY,
            ),
        );

    if (legacyUser) {
        /*
         * User cũ nằm localStorage,
         * migrate thành phiên Remember Me.
         */
        window.localStorage.setItem(
            AUTH_USER_KEY,
            JSON.stringify(
                legacyUser,
            ),
        );

        window.localStorage.removeItem(
            LEGACY_AUTH_USER_KEY,
        );

        return legacyUser;
    }

    removeStoredUser();

    return null;
}

function saveUser(
    user: AuthUser,
    rememberMe: boolean,
): void {
    if (!canUseStorage()) {
        return;
    }

    removeStoredUser();

    const storage = rememberMe
        ? window.localStorage
        : window.sessionStorage;

    storage.setItem(
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

    window.sessionStorage.removeItem(
        AUTH_USER_KEY,
    );

    window.localStorage.removeItem(
        LEGACY_AUTH_USER_KEY,
    );

    window.sessionStorage.removeItem(
        LEGACY_AUTH_USER_KEY,
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
        rememberMe?: boolean,
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
                rememberMe = false,
            ) => {
                tokenStorage.setTokens(
                    session.accessToken,
                    session.refreshToken,
                    rememberMe,
                );

                saveUser(
                    session.user,
                    rememberMe,
                );

                set({
                    accessToken:
                    session.accessToken,

                    refreshToken:
                    session.refreshToken,

                    user:
                    session.user,

                    isAuthenticated:
                        true,

                    loggingOut:
                        false,
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
                saveUser(
                    user,
                    tokenStorage.isRemembered(),
                );

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
                     * Logout local vẫn phải chạy
                     * khi backend không phản hồi.
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