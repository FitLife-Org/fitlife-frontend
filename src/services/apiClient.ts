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

export default apiClient;