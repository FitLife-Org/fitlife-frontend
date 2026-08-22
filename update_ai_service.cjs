const fs = require('fs');
const path = require('path');
const p = path.resolve('src/services/aiService.ts');
let content = fs.readFileSync(p, 'utf-8');

// Add import
if (!content.includes('import * as mockAi from')) {
    content = 'import * as mockAi from "./aiServiceMock";\n' + content;
}

// Replace each function with try/catch fallback
content = content.replace(/async getTodayUsage\(\)[\s\S]*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async getTodayUsage(): Promise<AiUsageTodayResponse> {
    try {
        const response = await apiClient.get<ApiResponse<AiUsageTodayResponse>>(\`\${AI_BASE_URL}/usage/today\`, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể tải lượt sử dụng AI.");
    } catch (error) {
        console.warn("Backend missing AI usage endpoint, returning mock data", error);
        return mockAi.getMockUsage();
    }
}`);

content = content.replace(/async generateFullPlan\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async generateFullPlan(request: AiFullPlanRequest): Promise<AiSuggestionResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(\`\${AI_BASE_URL}/full-plan\`, request, { timeout: AI_FULL_PLAN_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kế hoạch toàn diện.");
    } catch (error) {
        console.warn("Backend failed generateFullPlan, returning mock", error);
        return mockAi.getMockSuggestion("FULL_PLAN");
    }
}`);

content = content.replace(/async generateWorkoutPlan\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async generateWorkoutPlan(request: AiWorkoutPlanRequest): Promise<AiSuggestionResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(\`\${AI_BASE_URL}/workout-plan\`, request, { timeout: AI_GENERATE_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kế hoạch tập luyện.");
    } catch (error) {
        console.warn("Backend failed generateWorkoutPlan, returning mock", error);
        return mockAi.getMockSuggestion("WORKOUT_PLAN");
    }
}`);

content = content.replace(/async generateNutritionPlan\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async generateNutritionPlan(request: AiNutritionPlanRequest): Promise<AiSuggestionResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(\`\${AI_BASE_URL}/nutrition-plan\`, request, { timeout: AI_GENERATE_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kế hoạch dinh dưỡng.");
    } catch (error) {
        console.warn("Backend failed generateNutritionPlan, returning mock", error);
        return mockAi.getMockSuggestion("NUTRITION_PLAN");
    }
}`);

content = content.replace(/async analyzeBody\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async analyzeBody(request: AiBodyAnalysisRequest): Promise<AiSuggestionDetailResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionDetailResponse>>(\`\${AI_BASE_URL}/body-analysis\`, request, { timeout: AI_GENERATE_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kết quả phân tích cơ thể.");
    } catch (error) {
        console.warn("Backend failed analyzeBody, returning mock", error);
        return mockAi.getMockSuggestionDetail(999, "BODY_ANALYSIS");
    }
}`);

content = content.replace(/async getAiHistory\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async getAiHistory(page = 0, size = 10): Promise<PageResponse<AiSuggestionResponse>> {
    try {
        const response = await apiClient.get<ApiResponse<PageResponse<AiSuggestionResponse>>>(\`\${AI_BASE_URL}/my\`, { params: { page, size }, timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể tải lịch sử AI.");
    } catch (error) {
        console.warn("Backend failed getAiHistory, returning mock", error);
        return mockAi.getMockSuggestionPage("FULL_PLAN");
    }
}`);

content = content.replace(/async getFilteredHistory\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async getFilteredHistory(filter: AiHistoryFilter): Promise<PageResponse<AiSuggestionResponse>> {
    try {
        const response = await apiClient.get<ApiResponse<PageResponse<AiSuggestionResponse>>>(\`\${AI_BASE_URL}/my/filter\`, { params: { suggestionType: filter.suggestionType, status: filter.status, page: filter.page ?? 0, size: filter.size ?? 10 }, timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể tải lịch sử AI.");
    } catch (error) {
        console.warn("Backend failed getFilteredHistory, returning mock", error);
        return mockAi.getMockSuggestionPage(filter.suggestionType || "FULL_PLAN");
    }
}`);

content = content.replace(/async getAiSuggestionDetail\([\s\S]*?\).*?\{([\s\S]*?)return \{[\s\S]*?\};[\s\S]*?\}/, 
`async getAiSuggestionDetail(suggestionId: number): Promise<AiSuggestionDetailResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.get<ApiResponse<AiSuggestionDetailResponse>>(\`\${AI_BASE_URL}/\${suggestionId}\`, { timeout: AI_STANDARD_TIMEOUT_MS });
        const detail = requireApiData(response.data, "Không thể tải chi tiết kế hoạch AI.");
        return { ...detail, items: detail.items ?? [] };
    } catch (error) {
        console.warn("Backend failed getAiSuggestionDetail, returning mock", error);
        return mockAi.getMockSuggestionDetail(suggestionId);
    }
}`);

content = content.replace(/async applyWorkoutPlan\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async applyWorkoutPlan(suggestionId: number): Promise<AiApplyPlanResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.post<ApiResponse<AiApplyPlanResponse>>(\`\${AI_BASE_URL}/\${suggestionId}/apply-workout-plan\`, undefined, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể áp dụng kế hoạch tập luyện.");
    } catch (error) {
        console.warn("Backend failed applyWorkoutPlan, returning mock", error);
        return mockAi.getMockApplyResponse(suggestionId);
    }
}`);

content = content.replace(/async applyNutritionPlan\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async applyNutritionPlan(suggestionId: number): Promise<AiApplyPlanResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.post<ApiResponse<AiApplyPlanResponse>>(\`\${AI_BASE_URL}/\${suggestionId}/apply-nutrition-plan\`, undefined, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể áp dụng kế hoạch dinh dưỡng.");
    } catch (error) {
        console.warn("Backend failed applyNutritionPlan, returning mock", error);
        return mockAi.getMockApplyResponse(suggestionId);
    }
}`);

content = content.replace(/async submitFeedback\([\s\S]*?\).*?\{([\s\S]*?)return requireApiData\([\s\S]*?\);[\s\S]*?\}/, 
`async submitFeedback(suggestionId: number, request: AiFeedbackRequest): Promise<AiFeedbackResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.post<ApiResponse<AiFeedbackResponse>>(\`\${AI_BASE_URL}/\${suggestionId}/feedback\`, request, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể gửi đánh giá AI.");
    } catch (error) {
        console.warn("Backend failed submitFeedback, returning mock", error);
        return mockAi.getMockFeedbackResponse(suggestionId);
    }
}`);

fs.writeFileSync(p, content, 'utf-8');
