import apiClient from "./apiClient";
import type { ApiResponse, PageResult } from "../types/common.type";
import type { User } from "../types/user.type";

export const userService = {
  // USER-01: Admin xem danh sách tài khoản
  async getUsers(params?: any): Promise<PageResult<User>> {
    // Map page from 1-based (frontend) to 0-based (Spring Boot backend)
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
        role: (u.roles && u.roles.length > 0) ? u.roles[0] : "ROLE_MEMBER",
        status: u.status
      })),
      totalItems: pageData.totalElements || 0,
      totalPages: pageData.totalPages || 0,
      page: (pageData.page !== undefined ? pageData.page + 1 : (params?.page || 1)),
      size: pageData.size || 10
    };
  },

  // USER-02: Xem chi tiết tài khoản
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<any>>(`/admin/users/${id}`);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: (u.roles && u.roles.length > 0) ? u.roles[0] : "ROLE_MEMBER",
      status: u.status
    };
  },

  // USER-03: Admin tạo tài khoản nội bộ
  async createUser(data: any): Promise<User> {
    const response = await apiClient.post<ApiResponse<any>>("/admin/users", data);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: (u.roles && u.roles.length > 0) ? u.roles[0] : "ROLE_MEMBER",
      status: u.status
    };
  },

  // USER-04: Cập nhật thông tin tài khoản
  async updateUser(id: number, data: any): Promise<User> {
    const response = await apiClient.put<ApiResponse<any>>(`/admin/users/${id}`, data);
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: (u.roles && u.roles.length > 0) ? u.roles[0] : "ROLE_MEMBER",
      status: u.status
    };
  },

  // USER-05: Khóa/mở khóa tài khoản
  async updateUserStatus(id: number, status: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/status`, { status });
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: (u.roles && u.roles.length > 0) ? u.roles[0] : "ROLE_MEMBER",
      status: u.status
    };
  },

  // USER-06: Gán vai trò cho tài khoản
  async updateUserRoles(id: number, roleCodes: string[]): Promise<User> {
    const response = await apiClient.patch<ApiResponse<any>>(`/admin/users/${id}/roles`, { roleCodes });
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: (u.roles && u.roles.length > 0) ? u.roles[0] : "ROLE_MEMBER",
      status: u.status
    };
  },

  // USER-07: Người dùng xem hồ sơ cá nhân
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<any>>("/users/me");
    const u = response.data.data;
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: (u.roles && u.roles.length > 0) ? u.roles[0] : "ROLE_MEMBER",
      status: u.status
    };
  },

  // USER-08: Người dùng cập nhật hồ sơ cá nhân (trỏ về members/me/profile hoặc users/me)
  async updateCurrentUser(data: any): Promise<User> {
    // In our backend, updating profile is done via PUT /members/me/profile for members
    const response = await apiClient.put<any>("/members/me/profile", data);
    const u = response.data; // MemberProfileResponse is directly returned by the backend
    return {
      id: u.id,
      username: u.memberCode || "",
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      role: "ROLE_MEMBER",
      status: u.status
    };
  },

  // USER-09: Đổi mật khẩu
  async changePassword(data: any): Promise<void> {
    await apiClient.put<ApiResponse<void>>("/me/change-password", data);
  },
};


