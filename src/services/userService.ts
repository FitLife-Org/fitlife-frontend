import apiClient from "./apiClient";
import type { ApiResponse, PageResult } from "../types/common.type";
import type { User, AdminUserCreateRequest, AdminUserUpdateRequest } from "../types/user.type";

export const userService = {
  async getUsers(params?: any): Promise<PageResult<User>> {
    const apiParams = { ...params };
    if (typeof apiParams.page === "number" && apiParams.page > 0) {
      apiParams.page = apiParams.page - 1;
    }
    
    const response = await apiClient.get<ApiResponse<any>>("/admin/users", { params: apiParams });
    const pageData = response.data.data;
    
    if (!pageData) {
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        page: params?.page || 1,
        size: params?.size || 10
      };
    }
    
    return {
      items: (pageData.content || []).map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone,
        roles: u.roles || ["ROLE_MEMBER"],
        status: u.status
      })),
      totalItems: pageData.totalElements || 0,
      totalPages: pageData.totalPages || 0,
      page: (pageData.page !== undefined ? pageData.page + 1 : (params?.page || 1)),
      size: pageData.size || 10
    };
  },


  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/users/${id}`);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles || ["ROLE_MEMBER"],
      status: u.status
    };
  },


  async createUser(data: AdminUserCreateRequest): Promise<User> {
    const response = await apiClient.post<ApiResponse<any>>("/admin/users", data);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles || ["ROLE_MEMBER"],
      status: u.status
    };
  },


  async updateUser(id: number, data: AdminUserUpdateRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<any>>(`/admin/users/${id}`, data);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles || ["ROLE_MEMBER"],
      status: u.status
    };
  },


  async updateUserStatus(id: number, status: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/status`, { status });
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles || ["ROLE_MEMBER"],
      status: u.status
    };
  },


  async updateUserRoles(id: number, roleCodes: string[]): Promise<User> {
    const response = await apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/roles`, { roleCodes });
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles || ["ROLE_MEMBER"],
      status: u.status
    };
  },


  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<any>>("/users/me");
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles || ["ROLE_MEMBER"],
      status: u.status
    };
  },


  async updateCurrentUser(data: any): Promise<User> {
    const response = await apiClient.put<ApiResponse<any>>("/users/me", data);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.memberCode || "",
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: ["ROLE_MEMBER"],
      status: u.status
    };
  },

  // USER-09: Đổi mật khẩu
  async changePassword(data: any): Promise<void> {
    await apiClient.put<ApiResponse<void>>("/users/me/change-password", data);
  },
};


