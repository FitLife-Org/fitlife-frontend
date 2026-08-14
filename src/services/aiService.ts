import apiClient from "./apiClient";

import type {
    ApiResponse,
    PageResponse,
} from "../types/common.type";

import type {
    AiApplyPlanResponse,
    AiBodyAnalysisRequest,
    AiFeedbackRequest,
    AiFeedbackResponse,
    AiFullPlanRequest,
    AiHistoryFilter,
    AiNutritionPlanRequest,
    AiSuggestionDetailResponse,
    AiSuggestionResponse,
    AiUsageTodayResponse,
    AiWorkoutPlanRequest,
} from "../types/ai.type";

import {
    requireApiData,
} from "../utils/apiResponse";

const AI_BASE_URL =
    "/ai/suggestions";

const AI_STANDARD_TIMEOUT_MS =
    30_000;

const AI_GENERATE_TIMEOUT_MS =
    120_000;

const AI_FULL_PLAN_TIMEOUT_MS =
    180_000;

function validateSuggestionId(
    suggestionId: number,
): void {
    if (
        !Number.isInteger(suggestionId) ||
        suggestionId <= 0
    ) {
        throw new Error(
            "AI suggestion ID không hợp lệ.",
        );
    }
}

export const aiService = {
    async generateFullPlan(
        request: AiFullPlanRequest,
    ): Promise<AiSuggestionResponse> {
        const response =
            await apiClient.post<
                ApiResponse<AiSuggestionResponse>
            >(
                `${AI_BASE_URL}/full-plan`,
                request,
                {
                    timeout:
                    AI_FULL_PLAN_TIMEOUT_MS,
                },
            );

        return requireApiData(
            response.data,
            "Máy chủ không trả về kế hoạch toàn diện.",
        );
    },

    async analyzeBody(
        request: AiBodyAnalysisRequest,
    ): Promise<AiSuggestionDetailResponse> {
        const response =
            await apiClient.post<
                ApiResponse<AiSuggestionDetailResponse>
            >(
                `${AI_BASE_URL}/body-analysis`,
                request,
                {
                    timeout:
                    AI_GENERATE_TIMEOUT_MS,
                },
            );

        return requireApiData(
            response.data,
            "Máy chủ không trả về kết quả phân tích cơ thể.",
        );
    },

    async getAiHistory(
        page = 0,
        size = 10,
    ): Promise<
        PageResponse<AiSuggestionResponse>
    > {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<AiSuggestionResponse>
                >
            >(
                `${AI_BASE_URL}/my`,
                {
                    params: {
                        page,
                        size,
                    },
                    timeout:
                    AI_STANDARD_TIMEOUT_MS,
                },
            );

        return requireApiData(
            response.data,
            "Không thể tải lịch sử AI.",
        );
    },

    async getAiSuggestionDetail(
        suggestionId: number,
    ): Promise<AiSuggestionDetailResponse> {
        validateSuggestionId(
            suggestionId,
        );

        const response =
            await apiClient.get<
                ApiResponse<
                    AiSuggestionDetailResponse
                >
            >(
                `${AI_BASE_URL}/${suggestionId}`,
                {
                    timeout:
                    AI_STANDARD_TIMEOUT_MS,
                },
            );

        const detail =
            requireApiData(
                response.data,
                "Không thể tải chi tiết kế hoạch AI.",
            );

        return {
            ...detail,
            items:
                detail.items ?? [],
        };
    },

    async applyWorkoutPlan(
        suggestionId: number,
    ): Promise<AiApplyPlanResponse> {
        validateSuggestionId(
            suggestionId,
        );

        const response =
            await apiClient.post<
                ApiResponse<AiApplyPlanResponse>
            >(
                `${AI_BASE_URL}/${suggestionId}/apply-workout-plan`,
                undefined,
                {
                    timeout:
                    AI_STANDARD_TIMEOUT_MS,
                },
            );

        return requireApiData(
            response.data,
            "Không thể áp dụng kế hoạch tập luyện.",
        );
    },

    async applyNutritionPlan(
        suggestionId: number,
    ): Promise<AiApplyPlanResponse> {
        validateSuggestionId(
            suggestionId,
        );

        const response =
            await apiClient.post<
                ApiResponse<AiApplyPlanResponse>
            >(
                `${AI_BASE_URL}/${suggestionId}/apply-nutrition-plan`,
                undefined,
                {
                    timeout:
                    AI_STANDARD_TIMEOUT_MS,
                },
            );

        return requireApiData(
            response.data,
            "Không thể áp dụng kế hoạch dinh dưỡng.",
        );
    },

    async submitFeedback(
        suggestionId: number,
        request: AiFeedbackRequest,
    ): Promise<AiFeedbackResponse> {
        validateSuggestionId(
            suggestionId,
        );

        const response =
            await apiClient.post<
                ApiResponse<AiFeedbackResponse>
            >(
                `${AI_BASE_URL}/${suggestionId}/feedback`,
                request,
                {
                    timeout:
                    AI_STANDARD_TIMEOUT_MS,
                },
            );

        return requireApiData(
            response.data,
            "Không thể gửi đánh giá AI.",
        );
    },

    async retryAiSuggestion(
        suggestionId: number,
    ): Promise<AiSuggestionResponse> {
        validateSuggestionId(
            suggestionId,
        );

        const response =
            await apiClient.post<
                ApiResponse<AiSuggestionResponse>
            >(
                `${AI_BASE_URL}/${suggestionId}/retry`,
                undefined,
                {
                    timeout:
                    AI_GENERATE_TIMEOUT_MS,
                },
            );

        return requireApiData(
            response.data,
            "Không thể thử lại gợi ý AI.",
        );
    },

    async getAdminAiSuggestions(
        page = 0,
        size = 10,
    ): Promise<
        PageResponse<AiSuggestionResponse>
    > {
        try {
            const response =
                await apiClient.get<
                    ApiResponse<
                        PageResponse<AiSuggestionResponse>
                    >
                >(
                    `/admin/ai/suggestions`,
                    {
                        params: {
                            page,
                            size,
                        },
                        timeout:
                        AI_STANDARD_TIMEOUT_MS,
                    },
                );
    
            return requireApiData(
                response.data,
                "Không thể tải danh sách gợi ý AI (Admin).",
            );
        } catch {
            return {
                content: [],
                page: page,
                size: size,
                totalElements: 0,
                totalPages: 0,
                first: page === 0,
                last: true,
                empty: true
            };
        }
    },

    async getAdminAiSuggestionDetail(
        suggestionId: number,
    ): Promise<AiSuggestionDetailResponse> {
        validateSuggestionId(
            suggestionId,
        );

        const response =
            await apiClient.get<
                ApiResponse<
                    AiSuggestionDetailResponse
                >
            >(
                `/admin/ai/suggestions/${suggestionId}`,
                {
                    timeout:
                    AI_STANDARD_TIMEOUT_MS,
                },
            );

        const detail =
            requireApiData(
                response.data,
                "Không thể tải chi tiết kế hoạch AI (Admin).",
            );

        return {
            ...detail,
            items:
                detail.items ?? [],
        };
    },
};