import { create } from "zustand";
import type { AuthSession, AuthUser } from "../types/auth.type";
import { tokenStorage } from "../utils/token";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: tokenStorage.get(),
  user: null,
  isAuthenticated: Boolean(tokenStorage.get()),
  setSession: (session) => {
    tokenStorage.set(session.token);
    set({
      token: session.token,
      user: session.user,
      isAuthenticated: true,
    });
  },
  logout: () => {
    tokenStorage.clear();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
