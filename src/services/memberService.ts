import apiClient from "./apiClient";

import type {
    ApiResponse,
    PageResponse,
} from "../types/common.type";

import type {
    MemberProfile,
    MemberStatus,
    AdminMemberCreateRequest,
    AdminMemberUpdateRequest,
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

export interface MemberQueryParams {
    page?: number;
    size?: number;

    keyword?: string;

    status?: MemberStatus;

    fitnessGoal?: string;

    sort?: string;
}

/* ============================================================
 * HELPERS
 * ============================================================ */

function requireData<T>(
    response: ApiResponse<T>,
    message: string,
): T {
    if (
        response.data === null ||
        response.data === undefined
    ) {
        throw new Error(
            response.message ||
            message,
        );
    }

    return response.data;
}

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

function normalizeOptionalDate(
    value?: string | null,
): string | undefined {
    if (
        !value ||
        !value.trim()
    ) {
        return undefined;
    }

    /*
     * Backend LocalDate nhận ISO:
     * YYYY-MM-DD
     */
    return value.trim();
}

function validatePositiveId(
    id: number,
    fieldName = "ID",
): void {
    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new Error(
            `${fieldName} không hợp lệ.`,
        );
    }
}

function mapMember(
    member: MemberProfile,
): MemberProfile {
    return {
        ...member,

        gender:
            member.gender ??
            null,

        dateOfBirth:
            member.dateOfBirth ??
            null,

        joinDate:
            member.joinDate ??
            null,

        emailVerified:
            member.emailVerified ??
            null,

        fitnessGoal:
            member.fitnessGoal ??
            null,
    };
}

/* ============================================================
 * SERVICE
 * ============================================================ */

export const memberService = {
    // =====================================================
    // MEMBER
    // =====================================================

    async getMyQr():
        Promise<{
            memberCode: string;
            qrData: string;
        }> {
        const response =
            await apiClient.get<
                ApiResponse<{
                    memberCode: string;
                    qrData: string;
                }>
            >(
                "/members/me/qr",
            );

        return requireData(
            response.data,
            "Không nhận được mã QR.",
        );
    },

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

    async updateMyProfile(
        data: Partial<MemberProfile>,
    ): Promise<MemberProfile> {
        const payload = {
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
                normalizeOptionalDate(
                    data.dateOfBirth,
                ),

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

    // =====================================================
    // BODY METRIC
    // =====================================================

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

        return Array.isArray(data)
            ? data
            : data.content;
    },

    // =====================================================
    // ADMIN - LIST
    // =====================================================

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
                                    params.keyword.trim(),
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
                                params.fitnessGoal,
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
                pageData.content
                    ?.map(
                        mapMember,
                    ) ??
                [],
        };
    },

    // =====================================================
    // ADMIN - DETAIL
    // =====================================================

    async getMemberById(
        id: number,
    ): Promise<MemberProfile> {
        validatePositiveId(
            id,
            "Member ID",
        );

        const response =
            await apiClient.get<
                ApiResponse<MemberProfile>
            >(
                `/admin/members/${id}`,
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được thông tin hội viên.",
            ),
        );
    },

    // =====================================================
    // ADMIN - CREATE
    // =====================================================

    async createMember(
        data:
        AdminMemberCreateRequest,
    ): Promise<MemberProfile> {
        const payload:
            AdminMemberCreateRequest = {
            ...data,

            username:
                data.username
                    .trim(),

            email:
                data.email
                    .trim()
                    .toLowerCase(),

            password:
            data.password,

            fullName:
                data.fullName
                    .trim(),

            phone:
                normalizeOptionalText(
                    data.phone,
                ),

            gender:
                data.gender ??
                undefined,

            dateOfBirth:
                normalizeOptionalDate(
                    data.dateOfBirth,
                ),

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

    // =====================================================
    // ADMIN - UPDATE PROFILE
    // =====================================================

    /**
     * Backend:
     *
     * PUT /admin/members/{id}
     *
     * KHÔNG dùng PATCH ở endpoint này.
     */
    async updateMember(
        id: number,
        data:
        AdminMemberUpdateRequest,
    ): Promise<MemberProfile> {
        validatePositiveId(
            id,
            "Member ID",
        );

        const payload:
            AdminMemberUpdateRequest = {
            fullName:
                normalizeOptionalText(
                    data.fullName,
                ),

            email:
                normalizeOptionalText(
                    data.email,
                )
                    ?.toLowerCase(),

            phone:
                normalizeOptionalText(
                    data.phone,
                ),

            gender:
                data.gender ??
                undefined,

            dateOfBirth:
                normalizeOptionalDate(
                    data.dateOfBirth,
                ),

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
                `/admin/members/${id}`,
                payload,
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được hội viên sau khi cập nhật.",
            ),
        );
    },

    // =====================================================
    // ADMIN - UPDATE STATUS
    // =====================================================

    /**
     * Backend:
     *
     * PATCH /admin/members/{id}/status
     */
    async updateMemberStatus(
        id: number,
        status: MemberStatus,
    ): Promise<MemberProfile> {
        validatePositiveId(
            id,
            "Member ID",
        );

        const response =
            await apiClient.patch<
                ApiResponse<MemberProfile>
            >(
                `/admin/members/${id}/status`,
                {
                    status,
                },
            );

        return mapMember(
            requireData(
                response.data,
                "Không nhận được trạng thái hội viên sau khi cập nhật.",
            ),
        );
    },

    // =====================================================
    // ADMIN - RELATED DATA
    // =====================================================

    async getMemberSubscriptions(
        id: number,
    ): Promise<Subscription[]> {
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
                        memberId:
                        id,

                        page:
                            0,

                        size:
                            100,
                    },
                },
            );

        return requireData(
            response.data,
            "Không nhận được danh sách subscription.",
        ).content;
    },

    async getMemberCheckins(
        id: number,
    ): Promise<CheckinRecord[]> {
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
                        memberId:
                        id,

                        page:
                            0,

                        size:
                            100,
                    },
                },
            );

        return requireData(
            response.data,
            "Không nhận được lịch sử check-in.",
        ).content;
    },

    async deleteMember(id: number): Promise<void> {
        await apiClient.delete(`/admin/members/${id}`);
    },

    async restoreMember(id: number): Promise<void> {
        await apiClient.patch(`/admin/members/${id}/restore`);
    },
};