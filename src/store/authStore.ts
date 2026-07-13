import { create } from "zustand";

import type {
  AuthSession,
  AuthUser,
} from "../types/auth.type";

import { tokenStorage } from "../utils/token";
import { authService } from "../services/authService";

const USER_KEY = "authUser";

const getUserFromStorage =
    (): AuthUser | null => {
      try {
        const userString =
            localStorage.getItem(USER_KEY);

        if (!userString) {
          return null;
        }

        return JSON.parse(
            userString,
        ) as AuthUser;
      } catch {
        localStorage.removeItem(USER_KEY);
        return null;
      }
    };

const initialAccessToken =
    tokenStorage.getAccessToken();

const initialRefreshToken =
    tokenStorage.getRefreshToken();

const initialUser =
    getUserFromStorage();

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

  clearSession: () => void;

  logout: () => Promise<void>;

  logoutAll: () => Promise<void>;
}

export const useAuthStore =
    create<AuthState>((set) => ({
      accessToken: initialAccessToken,
      refreshToken: initialRefreshToken,
      user: initialUser,

      isAuthenticated: Boolean(
          initialAccessToken &&
          initialRefreshToken &&
          initialUser,
      ),

      loggingOut: false,

      setSession: (session) => {
        tokenStorage.setTokens(
            session.accessToken,
            session.refreshToken,
        );

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(session.user),
        );

        set({
          accessToken:
          session.accessToken,

          refreshToken:
          session.refreshToken,

          user: session.user,

          isAuthenticated: true,
        });
      },

      updateAccessToken: (
          accessToken,
      ) => {
        tokenStorage.setAccessToken(
            accessToken,
        );

        set({
          accessToken,
        });
      },

      clearSession: () => {
        tokenStorage.clear();

        localStorage.removeItem(
            USER_KEY,
        );

        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          loggingOut: false,
        });
      },

      logout: async () => {
        set({
          loggingOut: true,
        });

        try {
          await authService.logout();
        } finally {
          tokenStorage.clear();

          localStorage.removeItem(
              USER_KEY,
          );

          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            loggingOut: false,
          });
        }
      },

      logoutAll: async () => {
        set({
          loggingOut: true,
        });

        try {
          await authService.logoutAll();
        } finally {
          tokenStorage.clear();

          localStorage.removeItem(
              USER_KEY,
          );

          set({
            accessToken: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            loggingOut: false,
          });
        }
      },
    }));