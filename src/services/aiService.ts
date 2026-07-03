import apiClient from "./apiClient";
import type { ApiResponse, PageResponse } from "../types/common.type";
import type { 
  AiSuggestionResponse, 
  AiSuggestionDetailResponse, 
  AiFullPlanRequest,
  AiGeneratedPlan
} from "../types/ai.type";

const MOCK_HISTORY: AiSuggestionResponse[] = [
  { 
    id: 1,
    memberId: 1,
    suggestionType: "FULL_PLAN",
    status: "SUCCESS",
    title: "Giáo án Giảm mỡ - Người mới", 
    createdAt: "2026-07-01T10:00:00Z", 
    promptText: "Mục tiêu giảm mỡ",
    summary: "4 ngày/tuần kết hợp sức mạnh và tim mạch"
  }
];

export const aiService = {
  async generateFullPlan(data: AiFullPlanRequest): Promise<AiSuggestionResponse> {
    const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(
        "/ai/suggestions/full-plan",
        data
    );

    if (!response.data.data) {
      throw new Error("Máy chủ không trả về kết quả.");
    }

    return response.data.data;
  },

  async getAiHistory(page = 0, size = 10): Promise<AiSuggestionResponse[]> {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<AiSuggestionResponse>>>(`/ai/suggestions/my?page=${page}&size=${size}`);
      return response.data.data.content;
    } catch (error) {
      console.warn("API GET /ai/suggestions/my failed, using mock data");
      return MOCK_HISTORY;
    }
  },

  async getAiSuggestionDetail(id: number): Promise<AiSuggestionDetailResponse> {
    const response = await apiClient.get<ApiResponse<AiSuggestionDetailResponse>>(`/ai/suggestions/${id}`);
    return response.data.data;
  },

  async applyPlan(plan: AiGeneratedPlan): Promise<void> {
    try {
      // Backend doesn't have an apply endpoint yet, so we mock it
      // await apiClient.post(`/ai/suggestions/${planId}/apply`);
      console.warn("API POST /ai/suggestions/{id}/apply is missing on backend, mocking success");
      await new Promise(r => setTimeout(r, 1200));
    } catch (error) {
      console.error("Failed to apply plan", error);
      throw error;
    }
  }
};