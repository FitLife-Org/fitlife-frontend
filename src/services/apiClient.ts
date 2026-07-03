import axios from "axios";
import { tokenStorage } from "../utils/token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();

  // Do not send token for authentication endpoints
  const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register') || config.url?.includes('/auth/google-login');

  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      console.error("API_ERROR:", {
        status,
        url: error.config?.url,
        data: error.response?.data,
      });

      if (status === 401) {
        tokenStorage.clear();
        localStorage.removeItem("authUser");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      if (status === 403) {
        if (!window.location.pathname.includes("/403")) {
          window.location.href = "/403";
        }
      }

      return Promise.reject(error);
    }
);

export default apiClient;