import apiClient from "./apiClient";
import type { ApiResponse, PageResult } from "../types/common.type";
import type { User } from "../types/user.type";

export const userService = {
  async getUsers(): Promise<PageResult<User> | User[]> {
    const response = await apiClient.get<ApiResponse<PageResult<User> | User[]>>("/users");
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/users/me");
    return response.data.data;
  },
};
