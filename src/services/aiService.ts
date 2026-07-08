import apiClient from "./apiClient";
import type { ApiResponse, PageResponse } from "../types/common.type";
import type { 
  AiSuggestionResponse, 
  AiSuggestionDetailResponse, 
  AiFullPlanRequest,
  AiBodyAnalysisRequest,
  AiGeneratedPlan
, AiFeedbackRequest} from "../types/ai.type";

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

  async analyzeBody(data: AiBodyAnalysisRequest): Promise<AiSuggestionResponse> {
    const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(
        "/ai/suggestions/body-analysis",
        data
    );
    return response.data.data;
  },

  async getAiHistory(page = 0, size = 10): Promise<AiSuggestionResponse[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<AiSuggestionResponse>>>(`/ai/suggestions/my?page=${page}&size=${size}`);
    return response.data.data.content;
  },

  async getAiSuggestionDetail(id: number): Promise<AiSuggestionDetailResponse> {
    const response = await apiClient.get<ApiResponse<AiSuggestionDetailResponse>>(`/ai/suggestions/${id}`);
    return response.data.data;
  },

  
  async submitFeedback(id: number, data: AiFeedbackRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/ai/suggestions/${id}/feedback`, data);
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