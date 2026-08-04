import apiClient from "./apiClient";

import type {
    ApiResponse,
    PageResponse,
    Status,
} from "../types/common.type";

import type {
    BodyMetric,
    MemberProfile,
    AdminMemberCreateRequest,
    AdminMemberUpdateRequest,
} from "../types/member.type";

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
    status?: Status;
    fitnessGoal?: string;
    sort?: string;
}

function requireData<T>(
    response: ApiResponse<T>,
    message: string,
): T {
    if (
        response.data === null ||
        response.data === undefined
    ) {
        throw new Error(message);
    }

    return response.data;
}

function normalizeOptionalText(
    value?: string | null,
): string | undefined {
    if (value === null || value === undefined) {
        return undefined;
    }

    const normalized = value.trim();

    return normalized.length > 0
        ? normalized
        : undefined;
}

function mapMember(
    member: MemberProfile,
): MemberProfile {
    return {
        ...member,
        status: member.status,
    };
}

export const memberService = {
    async getMyProfile():
        Promise<MemberProfile> {
        const response =
            await apiClient.get<
                ApiResponse<MemberProfile>
            >("/members/me");

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
        const payload: Partial<MemberProfile> = {
            ...data,

            fullName:
                normalizeOptionalText(
                    data.fullName,
                ),

            phone:
                normalizeOptionalText(
                    data.phone,
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
                data.fitnessGoal ?? undefined,

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

    async getBodyMetrics():
        Promise<BodyMetric[]> {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<BodyMetric> |
                    BodyMetric[]
                >
            >("/body-metrics/me");

        const data = requireData(
            response.data,
            "Không nhận được lịch sử chỉ số cơ thể.",
        );

        return Array.isArray(data)
            ? data
            : data.content;
    },

    /**
     * Admin lấy danh sách Member.
     * page bắt đầu từ 0.
     */
    async getMembers(
        params: MemberQueryParams = {},
    ): Promise<PageResponse<MemberProfile>> {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<MemberProfile>
                >
            >(
                "/admin/members",
                {
                    params: {
                        page: params.page ?? 0,
                        size: params.size ?? 20,

                        ...(params.keyword?.trim()
                            ? {
                                keyword:
                                    params.keyword.trim(),
                            }
                            : {}),

                        ...(params.status
                            ? {
                                status: params.status,
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
                                sort: params.sort,
                            }
                            : {}),
                    },
                },
            );

        const pageData = requireData(
            response.data,
            "Không nhận được danh sách hội viên.",
        );

        return {
            ...pageData,
            content:
                pageData.content.map(
                    mapMember,
                ),
        };
    },

    async getMemberById(
        id: number,
    ): Promise<MemberProfile> {
        const response =
            await apiClient.get<
                ApiResponse<MemberProfile>
            >(`/admin/members/${id}`);

        return mapMember(
            requireData(
                response.data,
                "Không nhận được thông tin hội viên.",
            ),
        );
    },

    async getMemberByCode(
        memberCode: string,
    ): Promise<MemberProfile> {
        const normalizedCode =
            memberCode.trim();

        if (!normalizedCode) {
            throw new Error(
                "Mã hội viên không được để trống.",
            );
        }

        const response =
            await apiClient.get<
                ApiResponse<MemberProfile>
            >(
                `/admin/members/code/${encodeURIComponent(
                    normalizedCode,
                )}`,
            );

        return mapMember(
            requireData(
                response.data,
                "Không tìm thấy hội viên.",
            ),
        );
    },

    async createMember(
        data: AdminMemberCreateRequest,
    ): Promise<MemberProfile> {
        const payload: AdminMemberCreateRequest = {
            ...data,

            username:
                data.username.trim(),

            email:
                data.email.trim().toLowerCase(),

            password:
            data.password,

            fullName:
                data.fullName.trim(),

            phone:
                normalizeOptionalText(
                    data.phone,
                ),

            gender:
                data.gender ?? undefined,

            dateOfBirth:
                data.dateOfBirth ?? undefined,

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
                data.fitnessGoal ?? undefined,

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

    async updateMember(
        id: number,
        data: AdminMemberUpdateRequest,
    ): Promise<MemberProfile> {
        const payload: AdminMemberUpdateRequest = {
            ...data,

            fullName:
                normalizeOptionalText(
                    data.fullName,
                ),

            email:
                normalizeOptionalText(
                    data.email,
                ),

            phone:
                normalizeOptionalText(
                    data.phone,
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
                data.fitnessGoal ?? undefined,

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

    async updateMemberStatus(
        id: number,
        status: Status,
    ): Promise<MemberProfile> {
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
                "Không nhận được trạng thái hội viên.",
            ),
        );
    },

    async deleteMember(
        id: number,
    ): Promise<void> {
        await apiClient.delete<
            ApiResponse<void>
        >(`/admin/members/${id}`);
    },

    async getMemberSubscriptions(
        id: number,
    ): Promise<Subscription[]> {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<Subscription>
                >
            >(
                "/admin/subscriptions",
                {
                    params: {
                        memberId: id,
                        page: 0,
                        size: 100,
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
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<CheckinRecord>
                >
            >(
                "/admin/check-ins",
                {
                    params: {
                        memberId: id,
                        page: 0,
                        size: 100,
                    },
                },
            );

        return requireData(
            response.data,
            "Không nhận được lịch sử check-in.",
        ).content;
    },

    async restoreMember(
        id: number,
    ): Promise<void> {
        await apiClient.patch<
            ApiResponse<void>
        >(
            `/admin/members/${id}/restore`,
        );
    },
};