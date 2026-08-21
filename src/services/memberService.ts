import apiClient from "./apiClient";

import type {
    ApiResponse,
    PageResponse,
} from "../types/common.type";

import type {
    MemberProfile,
    MemberStatus,
    FitnessGoal,
    AdminMemberCreateRequest,
    AdminMemberUpdateRequest,
    AdminMemberStatusUpdateRequest,
    UpdateMyMemberProfileRequest,
} from "../types/member.type";

import type {
    BodyMetric,
} from "../types/bodyMetric.type";

import type {
    Subscription,
} from "../types/subscription.type";

import type {
    CheckinRecord,
} from "../types/checkin.type";

// =====================================================
// TYPES
// =====================================================

export interface MemberQueryParams {
    page?: number;
    size?: number;

    keyword?: string;

    status?: MemberStatus;

    fitnessGoal?: FitnessGoal;

    sort?: string;
}

export interface MemberQrResponse {
    memberCode: string;
    qrData: string;
}

// =====================================================
// HELPERS
// =====================================================

function requireData<T>(
    response: ApiResponse<T>,
    message: string,
): T {
    if (
        response.data === null ||
        response.data === undefined
    ) {
        throw new Error(
            message,
        );
    }

    return response.data;
}

function validatePositiveId(
    value: number,
    fieldName: string,
): number {
    if (
        !Number.isInteger(
            value,
        ) ||
        value <= 0
    ) {
        throw new Error(
            `${fieldName} không hợp lệ.`,
        );
    }

    return value;
}

/**
 * Chuẩn hóa optional text.
 *
 * null / undefined / "" / "   "
 * -> undefined
 *
 * " abc "
 * -> "abc"
 */
function normalizeOptionalText(
    value?: string | null,
): string | undefined {
    if (
        value === null ||
        value === undefined
    ) {
        return undefined;
    }

    const normalized =
        value.trim();

    return normalized.length > 0
        ? normalized
        : undefined;
}

/**
 * Chuẩn hóa email trước khi gửi backend.
 */
function normalizeEmail(
    value?: string | null,
): string | undefined {
    const email =
        normalizeOptionalText(
            value,
        );

    return email
        ? email.toLowerCase()
        : undefined;
}

/**
 * Đảm bảo Member từ backend luôn được map
 * qua một helper thống nhất.
 *
 * Có thể mở rộng normalize field tại đây
 * nếu backend thay đổi response sau này.
 */
function mapMember(
    member: MemberProfile,
): MemberProfile {
    return {
        ...member,
    };
}

// =====================================================
// SERVICE
// =====================================================

export const memberService = {
    // =================================================
    // MEMBER - QR
    // =================================================

    async getMyQr():
        Promise<MemberQrResponse> {
        const response =
            await apiClient.get<
                ApiResponse<MemberQrResponse>
            >(
                "/members/me/qr",
            );

        return requireData(
            response.data,
            "Không nhận được mã QR hội viên.",
        );
    },

    // =================================================
    // MEMBER - PROFILE
    // =================================================

    async getMyProfile():
        Promise<MemberProfile> {
        const response =
            await apiClient.get<
                ApiResponse<MemberProfile>
            >(
                "/members/me",
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được hồ sơ hội viên.",
            ),
        );
    },

    /**
     * Member tự cập nhật hồ sơ.
     *
     * Không cho phép cập nhật:
     * - username
     * - email
     * - memberCode
     * - status
     * - joinDate
     * - avatarUrl
     */
    async updateMyProfile(
        data:
        UpdateMyMemberProfileRequest,
    ): Promise<MemberProfile> {
        const payload:
            UpdateMyMemberProfileRequest = {
            fullName:
                data.fullName.trim(),

            phone:
                normalizeOptionalText(
                    data.phone,
                ),

            gender:
                data.gender ??
                undefined,

            dateOfBirth:
                data.dateOfBirth ??
                undefined,

            address:
                normalizeOptionalText(
                    data.address,
                ),

            emergencyContactName:
                normalizeOptionalText(
                    data.emergencyContactName,
                ),

            emergencyContactPhone:
                normalizeOptionalText(
                    data.emergencyContactPhone,
                ),

            fitnessGoal:
                data.fitnessGoal ??
                undefined,

            healthNote:
                normalizeOptionalText(
                    data.healthNote,
                ),
        };

        const response =
            await apiClient.put<
                ApiResponse<MemberProfile>
            >(
                "/members/me",
                payload,
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được hồ sơ sau khi cập nhật.",
            ),
        );
    },

    // =================================================
    // MEMBER - BODY METRIC
    // =================================================

    async getBodyMetrics():
        Promise<BodyMetric[]> {
        const response =
            await apiClient.get<
                ApiResponse<
                    | PageResponse<BodyMetric>
                    | BodyMetric[]
                >
            >(
                "/body-metrics/me",
            );

        const data =
            requireData(
                response.data,
                "Không nhận được lịch sử chỉ số cơ thể.",
            );

        if (
            Array.isArray(
                data,
            )
        ) {
            return data;
        }

        return (
            data.content ??
            []
        );
    },

    // =================================================
    // ADMIN - MEMBER LIST
    // =================================================

    async getMembers(
        params:
        MemberQueryParams = {},
    ): Promise<
        PageResponse<MemberProfile>
    > {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<MemberProfile>
                >
            >(
                "/admin/members",
                {
                    params: {
                        page:
                            params.page ??
                            0,

                        size:
                            params.size ??
                            20,

                        ...(params.keyword
                            ?.trim()
                            ? {
                                keyword:
                                    params
                                        .keyword
                                        .trim(),
                            }
                            : {}),

                        ...(params.status
                            ? {
                                status:
                                params.status,
                            }
                            : {}),

                        ...(params.fitnessGoal
                            ? {
                                fitnessGoal:
                                params
                                    .fitnessGoal,
                            }
                            : {}),

                        ...(params.sort
                            ? {
                                sort:
                                params.sort,
                            }
                            : {}),
                    },
                },
            );

        const pageData =
            requireData(
                response.data,
                "Không nhận được danh sách hội viên.",
            );

        return {
            ...pageData,

            content:
                pageData
                    .content
                    ?.map(
                        mapMember,
                    ) ??
                [],
        };
    },

    // =================================================
    // ADMIN - MEMBER DETAIL
    // =================================================

    async getMemberById(
        id: number,
    ): Promise<MemberProfile> {
        const memberId =
            validatePositiveId(
                id,
                "Member ID",
            );

        const response =
            await apiClient.get<
                ApiResponse<MemberProfile>
            >(
                `/admin/members/${memberId}`,
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được thông tin hội viên.",
            ),
        );
    },

    // =================================================
    // ADMIN - CREATE MEMBER
    // POST /admin/members
    // =================================================

    async createMember(
        data:
        AdminMemberCreateRequest,
    ): Promise<MemberProfile> {
        const payload:
            AdminMemberCreateRequest = {
            username:
                data.username.trim(),

            email:
                data.email
                    .trim()
                    .toLowerCase(),

            password:
            data.password,

            fullName:
                data.fullName.trim(),

            phone:
                normalizeOptionalText(
                    data.phone,
                ),

            gender:
                data.gender ??
                undefined,

            dateOfBirth:
                data.dateOfBirth ??
                undefined,

            address:
                normalizeOptionalText(
                    data.address,
                ),

            emergencyContactName:
                normalizeOptionalText(
                    data.emergencyContactName,
                ),

            emergencyContactPhone:
                normalizeOptionalText(
                    data.emergencyContactPhone,
                ),

            fitnessGoal:
                data.fitnessGoal ??
                undefined,

            healthNote:
                normalizeOptionalText(
                    data.healthNote,
                ),
        };

        const response =
            await apiClient.post<
                ApiResponse<MemberProfile>
            >(
                "/admin/members",
                payload,
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được hội viên vừa tạo.",
            ),
        );
    },

    // =================================================
    // ADMIN - UPDATE MEMBER PROFILE
    // PUT /admin/members/{id}
    // =================================================

    /**
     * Chỉ update thông tin hồ sơ.
     *
     * KHÔNG update status ở API này.
     *
     * Status dùng:
     *
     * PATCH /admin/members/{id}/status
     */
    async updateMember(
        id: number,

        data:
        AdminMemberUpdateRequest,
    ): Promise<MemberProfile> {
        const memberId =
            validatePositiveId(
                id,
                "Member ID",
            );

        const payload:
            AdminMemberUpdateRequest = {
            email:
                normalizeEmail(
                    data.email,
                ),

            fullName:
                normalizeOptionalText(
                    data.fullName,
                ),

            phone:
                normalizeOptionalText(
                    data.phone,
                ),

            gender:
                data.gender ??
                undefined,

            dateOfBirth:
                data.dateOfBirth ??
                undefined,

            address:
                normalizeOptionalText(
                    data.address,
                ),

            emergencyContactName:
                normalizeOptionalText(
                    data.emergencyContactName,
                ),

            emergencyContactPhone:
                normalizeOptionalText(
                    data.emergencyContactPhone,
                ),

            fitnessGoal:
                data.fitnessGoal ??
                undefined,

            healthNote:
                normalizeOptionalText(
                    data.healthNote,
                ),
        };

        const response =
            await apiClient.put<
                ApiResponse<MemberProfile>
            >(
                `/admin/members/${memberId}`,
                payload,
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được hội viên sau khi cập nhật.",
            ),
        );
    },

    // =================================================
    // ADMIN - UPDATE MEMBER STATUS
    // PATCH /admin/members/{id}/status
    // =================================================

    /**
     * Contract:
     *
     * PATCH /admin/members/{id}/status
     *
     * {
     *   "status": "ACTIVE"
     * }
     *
     * hoặc
     *
     * {
     *   "status": "SUSPENDED"
     * }
     */
    async updateMemberStatus(
        id: number,

        status:
        MemberStatus,
    ): Promise<MemberProfile> {
        const memberId =
            validatePositiveId(
                id,
                "Member ID",
            );

        const payload:
            AdminMemberStatusUpdateRequest = {
            status,
        };

        const response =
            await apiClient.patch<
                ApiResponse<MemberProfile>
            >(
                `/admin/members/${memberId}/status`,
                payload,
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được hội viên sau khi cập nhật trạng thái.",
            ),
        );
    },

    // =================================================
    // ADMIN - MEMBER SUBSCRIPTIONS
    // =================================================

    async getMemberSubscriptions(
        id: number,
    ): Promise<Subscription[]> {
        const memberId =
            validatePositiveId(
                id,
                "Member ID",
            );

        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<Subscription>
                >
            >(
                "/admin/subscriptions",
                {
                    params: {
                        memberId,
                        page: 0,
                        size: 100,
                    },
                },
            );

        const data =
            requireData(
                response.data,
                "Không nhận được danh sách subscription.",
            );

        return (
            data.content ??
            []
        );
    },

    // =================================================
    // ADMIN - MEMBER CHECKINS
    // =================================================

    async getMemberCheckins(
        id: number,
    ): Promise<CheckinRecord[]> {
        const memberId =
            validatePositiveId(
                id,
                "Member ID",
            );

        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<CheckinRecord>
                >
            >(
                "/admin/check-ins",
                {
                    params: {
                        memberId,
                        page: 0,
                        size: 100,
                    },
                },
            );

        const data =
            requireData(
                response.data,
                "Không nhận được lịch sử check-in.",
            );

        return (
            data.content ??
            []
        );
    },
};