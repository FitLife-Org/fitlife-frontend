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

const AI_BASE_URL = "/ai/suggestions";
const AI_GENERATE_TIMEOUT_MS = 60_000;

function requireData<T>(
    response: ApiResponse<T>,
    fallbackMessage: string,
): T {
    if (response.data === null || response.data === undefined) {
        throw new Error(response.message || fallbackMessage);
    }

    return response.data;
}

function validateSuggestionId(suggestionId: number): void {
    if (!Number.isInteger(suggestionId) || suggestionId <= 0) {
        throw new Error("AI suggestion ID không hợp lệ.");
    }
}

export const aiService = {
    async getTodayUsage(): Promise<AiUsageTodayResponse> {
        const response = await apiClient.get<ApiResponse<AiUsageTodayResponse>>(
            `${AI_BASE_URL}/usage/today`,
        );

        return requireData(
            response.data,
            "Không thể lấy lượt sử dụng AI hôm nay.",
        );
    },

    async generateFullPlan(
        request: AiFullPlanRequest,
    ): Promise<AiSuggestionResponse> {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(
            `${AI_BASE_URL}/full-plan`,
            request,
            { timeout: AI_GENERATE_TIMEOUT_MS },
        );

        return requireData(
            response.data,
            "Máy chủ không trả về kế hoạch AI.",
        );
    },

    async generateWorkoutPlan(
        request: AiWorkoutPlanRequest,
    ): Promise<AiSuggestionResponse> {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(
            `${AI_BASE_URL}/workout-plan`,
            request,
            { timeout: AI_GENERATE_TIMEOUT_MS },
        );

        return requireData(
            response.data,
            "Máy chủ không trả về kế hoạch tập luyện.",
        );
    },

    async generateNutritionPlan(
        request: AiNutritionPlanRequest,
    ): Promise<AiSuggestionResponse> {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(
            `${AI_BASE_URL}/nutrition-plan`,
            request,
            { timeout: AI_GENERATE_TIMEOUT_MS },
        );

        return requireData(
            response.data,
            "Máy chủ không trả về kế hoạch dinh dưỡng.",
        );
    },

    async analyzeBody(
        request: AiBodyAnalysisRequest,
    ): Promise<AiSuggestionDetailResponse> {
        const response = await apiClient.post<ApiResponse<AiSuggestionDetailResponse>>(
            `${AI_BASE_URL}/body-analysis`,
            request,
            { timeout: AI_GENERATE_TIMEOUT_MS },
        );

        return requireData(
            response.data,
            "Máy chủ không trả về kết quả phân tích cơ thể.",
        );
    },

    async getAiHistory(
        page = 0,
        size = 10,
    ): Promise<PageResponse<AiSuggestionResponse>> {
        const response = await apiClient.get<
            ApiResponse<PageResponse<AiSuggestionResponse>>
        >(`${AI_BASE_URL}/my`, {
            params: { page, size },
        });

        return requireData(
            response.data,
            "Không thể tải lịch sử AI.",
        );
    },

    async getFilteredHistory(
        filter: AiHistoryFilter,
    ): Promise<PageResponse<AiSuggestionResponse>> {
        const response = await apiClient.get<
            ApiResponse<PageResponse<AiSuggestionResponse>>
        >(`${AI_BASE_URL}/my/filter`, {
            params: {
                suggestionType: filter.suggestionType,
                status: filter.status,
                page: filter.page ?? 0,
                size: filter.size ?? 10,
            },
        });

        return requireData(
            response.data,
            "Không thể tải lịch sử AI.",
        );
    },

    async getAiSuggestionDetail(
        suggestionId: number,
    ): Promise<AiSuggestionDetailResponse> {
        validateSuggestionId(suggestionId);

        const response = await apiClient.get<
            ApiResponse<AiSuggestionDetailResponse>
        >(`${AI_BASE_URL}/${suggestionId}`);

        return requireData(
            response.data,
            "Không thể tải chi tiết kế hoạch AI.",
        );
    },

    async applyWorkoutPlan(
        suggestionId: number,
    ): Promise<AiApplyPlanResponse> {
        validateSuggestionId(suggestionId);

        const response = await apiClient.post<ApiResponse<AiApplyPlanResponse>>(
            `${AI_BASE_URL}/${suggestionId}/apply-workout-plan`,
        );

        return requireData(
            response.data,
            "Không thể áp dụng kế hoạch tập luyện.",
        );
    },

    async applyNutritionPlan(
        suggestionId: number,
    ): Promise<AiApplyPlanResponse> {
        validateSuggestionId(suggestionId);

        const response = await apiClient.post<ApiResponse<AiApplyPlanResponse>>(
            `${AI_BASE_URL}/${suggestionId}/apply-nutrition-plan`,
        );

        return requireData(
            response.data,
            "Không thể áp dụng kế hoạch dinh dưỡng.",
        );
    },

    async submitFeedback(
        suggestionId: number,
        request: AiFeedbackRequest,
    ): Promise<AiFeedbackResponse> {
        validateSuggestionId(suggestionId);

        const response = await apiClient.post<ApiResponse<AiFeedbackResponse>>(
            `${AI_BASE_URL}/${suggestionId}/feedback`,
            request,
        );

        return requireData(
            response.data,
            "Không thể gửi đánh giá AI.",
        );
    },
};
