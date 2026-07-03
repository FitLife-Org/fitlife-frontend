import { create } from "zustand";
import type { AuthSession, AuthUser } from "../types/auth.type";
import { tokenStorage } from "../utils/token";

const USER_KEY = "authUser";

const getUserFromStorage = (): AuthUser | null => {
  try {
    const userStr = localStorage.getItem(USER_KEY);

    if (!userStr) {
      return null;
    }

    return JSON.parse(userStr) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

const initialToken = tokenStorage.get();
const initialUser = getUserFromStorage();

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken && initialUser),

  setSession: (session) => {
    tokenStorage.set(session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));

    set({
      token: session.token,
      user: session.user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));