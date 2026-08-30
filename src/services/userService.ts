import apiClient from "./apiClient";

import type {
    ApiResponse,
    PageResponse,
    Role,
} from "../types/common.type";

import type {
    User,
    UserStatus,
    AdminUserCreateRequest,
    AdminUserUpdateRequest,
    AdminUpdateUserStatusRequest,
    AdminUpdateUserRolesRequest,
} from "../types/user.type";

export interface AdminUserQueryParams {
    /**
     * Spring Pageable dùng page bắt đầu từ 0.
     */
    page?: number;
    size?: number;

    /**
     * Ví dụ:
     * createdAt,desc
     */
    sort?: string;

    keyword?: string;
    roleCode?: Role;
    status?: UserStatus;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

function requireData<T>(
    response: ApiResponse<T>,
    message = "Máy chủ không trả về dữ liệu.",
): T {
    if (
        response.data === null ||
        response.data === undefined
    ) {
        throw new Error(message);
    }

    return response.data;
}

const VALID_ROLES: readonly Role[] = [
    "ROLE_ADMIN",
    "ROLE_STAFF",
    "ROLE_TRAINER",
    "ROLE_MEMBER",
];

const VALID_USER_STATUSES:
    readonly UserStatus[] = [
    "PENDING",
    "ACTIVE",
    "INACTIVE",
    "SUSPENDED",
    "LOCKED",
];

function isRole(
    value: unknown,
): value is Role {
    return (
        typeof value === "string" &&
        VALID_ROLES.includes(
            value as Role,
        )
    );
}

function isUserStatus(
    value: unknown,
): value is UserStatus {
    return (
        typeof value === "string" &&
        VALID_USER_STATUSES.includes(
            value as UserStatus,
        )
    );
}

function normalizeUserStatus(
    value: unknown,
): UserStatus {
    const normalized =
        String(value ?? "")
            .trim()
            .toUpperCase();

    if (
        !isUserStatus(normalized)
    ) {
        throw new Error(
            `Trạng thái user không hợp lệ: ${normalized || "EMPTY"}`,
        );
    }

    return normalized;
}

function mapUser(
    user: User,
): User {
    const roles =
        Array.isArray(user.roles)
            ? user.roles.filter(isRole)
            : [];

    const status =
        normalizeUserStatus(
            user.status,
        );

    return {
        ...user,

        id:
        user.id,

        username:
            user.username ?? "",

        fullName:
            user.fullName ?? "",

        email:
            user.email ?? "",

        phone:
            user.phone ?? null,

        roles,

        status,
    };
}

function mapUserPage(
    pageData: PageResponse<User>,
): PageResponse<User> {
    return {
        ...pageData,

        content:
            Array.isArray(
                pageData.content,
            )
                ? pageData.content.map(
                    mapUser,
                )
                : [],
    };
}

export const userService = {
    /**
     * Admin lấy danh sách user.
     */
    async getUsers(
        params:
        AdminUserQueryParams = {},
    ): Promise<PageResponse<User>> {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<User>
                >
            >(
                "/admin/users",
                {
                    params: {
                        page:
                            params.page ?? 0,

                        size:
                            params.size ?? 10,

                        ...(params.sort
                            ? {
                                sort:
                                params.sort,
                            }
                            : {}),

                        ...(params.keyword?.trim()
                            ? {
                                keyword:
                                    params.keyword.trim(),
                            }
                            : {}),

                        ...(params.roleCode
                            ? {
                                roleCode:
                                params.roleCode,
                            }
                            : {}),

                        ...(params.status
                            ? {
                                status:
                                params.status,
                            }
                            : {}),
                    },
                },
            );

        const pageData =
            requireData(
                response.data,
                "Không nhận được danh sách người dùng.",
            );

        return mapUserPage(
            pageData,
        );
    },

    /**
     * Admin lấy chi tiết user.
     */
    async getUserById(
        id: number,
    ): Promise<User> {
        const response =
            await apiClient.get<
                ApiResponse<User>
            >(
                `/admin/users/${id}`,
            );

        const user =
            requireData(
                response.data,
                "Không nhận được thông tin người dùng.",
            );

        return mapUser(
            user,
        );
    },

    /**
     * Admin tạo tài khoản nội bộ.
     */
    async createUser(
        data:
        AdminUserCreateRequest,
    ): Promise<User> {
        const response =
            await apiClient.post<
                ApiResponse<User>
            >(
                "/admin/users",
                data,
            );

        const user =
            requireData(
                response.data,
                "Không nhận được tài khoản vừa tạo.",
            );

        return mapUser(
            user,
        );
    },

    /**
     * Admin cập nhật thông tin user.
     */
    async updateUser(
        id: number,
        data:
        AdminUserUpdateRequest,
    ): Promise<User> {
        const response =
            await apiClient.put<
                ApiResponse<User>
            >(
                `/admin/users/${id}`,
                data,
            );

        const user =
            requireData(
                response.data,
                "Không nhận được tài khoản sau khi cập nhật.",
            );

        return mapUser(
            user,
        );
    },

    /**
     * Admin cập nhật trạng thái user.
     */
    async updateUserStatus(
        id: number,
        status: UserStatus,
    ): Promise<User> {
        if (
            !isUserStatus(status)
        ) {
            throw new Error(
                `Trạng thái user không hợp lệ: ${status}`,
            );
        }

        const payload:
            AdminUpdateUserStatusRequest = {
            status,
        };

        const response =
            await apiClient.patch<
                ApiResponse<User>
            >(
                `/admin/users/${id}/status`,
                payload,
            );

        const user =
            requireData(
                response.data,
                "Không nhận được trạng thái tài khoản.",
            );

        return mapUser(
            user,
        );
    },

    /**
     * Admin thay toàn bộ role của user.
     */
    async updateUserRoles(
        id: number,
        roleCodes: Role[],
    ): Promise<User> {
        if (
            roleCodes.length === 0
        ) {
            throw new Error(
                "Người dùng phải có ít nhất một vai trò.",
            );
        }

        const invalidRole =
            roleCodes.find(
                (role) =>
                    !VALID_ROLES.includes(
                        role,
                    ),
            );

        if (
            invalidRole
        ) {
            throw new Error(
                `Vai trò không hợp lệ: ${invalidRole}`,
            );
        }

        const payload:
            AdminUpdateUserRolesRequest = {
            roleCodes,
        };

        const response =
            await apiClient.patch<
                ApiResponse<User>
            >(
                `/admin/users/${id}/roles`,
                payload,
            );

        const user =
            requireData(
                response.data,
                "Không nhận được vai trò tài khoản.",
            );

        return mapUser(
            user,
        );
    },

    /**
     * Lấy thông tin user hiện tại.
     */
    async getCurrentUser():
        Promise<User> {
        const response =
            await apiClient.get<
                ApiResponse<User>
            >(
                "/users/me",
            );

        const user =
            requireData(
                response.data,
                "Không nhận được tài khoản hiện tại.",
            );

        return mapUser(
            user,
        );
    },

    /**
     * Đổi mật khẩu user hiện tại.
     */
    async changePassword(
        data:
        ChangePasswordRequest,
    ): Promise<void> {
        await apiClient.put<
            ApiResponse<void>
        >(
            "/users/me/change-password",
            data,
        );
    },
};