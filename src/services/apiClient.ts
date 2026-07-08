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
    // Basic JWT validation: A JWT must have exactly 3 parts separated by 2 periods
    if (typeof token === 'string' && token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Invalid token format, clear it
      tokenStorage.clear();
      localStorage.removeItem("authUser");
      if (typeof window !== 'undefined' && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
  }

  return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const data = error.response?.data;

      console.error("API_ERROR:", {
        status,
        url: error.config?.url,
        data,
      });

      // Handle 401 or backend 500 MalformedJwtException
      const isJwtError = status === 500 && data && typeof data.message === 'string' && data.message.includes('JWT');
      
      const isPublicEndpoint = error.config?.url?.includes('/public/');

      if ((status === 401 || isJwtError) && !isPublicEndpoint) {
        tokenStorage.clear();
        localStorage.removeItem("authUser");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      if (status === 403) {
        // Do not redirect to 403 if the request was for a public endpoint
        if (!isPublicEndpoint && !window.location.pathname.includes("/403")) {
          window.location.href = "/403";
        }
      }

      return Promise.reject(error);
    }
);

export default apiClient;