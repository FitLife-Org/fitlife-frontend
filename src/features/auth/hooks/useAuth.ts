import { useAuthStore } from "../../../context/authStore";

export function useAuth() {
  return useAuthStore();
}
