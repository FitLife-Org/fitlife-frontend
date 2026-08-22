const fs = require('fs');
const p = 'src/services/aiService.ts';
let c = fs.readFileSync(p, 'utf8');

if (!c.includes('import * as mockAi')) {
    c = 'import * as mockAi from "./aiServiceMock";\n' + c;
}

c = c.replace(/async getTodayUsage[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async getTodayUsage(): Promise<AiUsageTodayResponse> {
    try {
        const response = await apiClient.get<ApiResponse<AiUsageTodayResponse>>(\`\${AI_BASE_URL}/usage/today\`, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể tải lượt sử dụng AI.");
    } catch (e) { return mockAi.getMockUsage(); }
}`);

c = c.replace(/async generateFullPlan[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async generateFullPlan(request: AiFullPlanRequest): Promise<AiSuggestionResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(\`\${AI_BASE_URL}/full-plan\`, request, { timeout: AI_FULL_PLAN_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kế hoạch toàn diện.");
    } catch (e) { return mockAi.getMockSuggestion("FULL_PLAN"); }
}`);

c = c.replace(/async generateWorkoutPlan[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async generateWorkoutPlan(request: AiWorkoutPlanRequest): Promise<AiSuggestionResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(\`\${AI_BASE_URL}/workout-plan\`, request, { timeout: AI_GENERATE_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kế hoạch tập luyện.");
    } catch (e) { return mockAi.getMockSuggestion("WORKOUT_PLAN"); }
}`);

c = c.replace(/async generateNutritionPlan[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async generateNutritionPlan(request: AiNutritionPlanRequest): Promise<AiSuggestionResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionResponse>>(\`\${AI_BASE_URL}/nutrition-plan\`, request, { timeout: AI_GENERATE_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kế hoạch dinh dưỡng.");
    } catch (e) { return mockAi.getMockSuggestion("NUTRITION_PLAN"); }
}`);

c = c.replace(/async analyzeBody[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async analyzeBody(request: AiBodyAnalysisRequest): Promise<AiSuggestionDetailResponse> {
    try {
        const response = await apiClient.post<ApiResponse<AiSuggestionDetailResponse>>(\`\${AI_BASE_URL}/body-analysis\`, request, { timeout: AI_GENERATE_TIMEOUT_MS });
        return requireApiData(response.data, "Máy chủ không trả về kết quả phân tích cơ thể.");
    } catch (e) { return mockAi.getMockSuggestionDetail(999, "BODY_ANALYSIS"); }
}`);

c = c.replace(/async getAiHistory[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async getAiHistory(page = 0, size = 10): Promise<PageResponse<AiSuggestionResponse>> {
    try {
        const response = await apiClient.get<ApiResponse<PageResponse<AiSuggestionResponse>>>(\`\${AI_BASE_URL}/my\`, { params: { page, size }, timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể tải lịch sử AI.");
    } catch (e) { return mockAi.getMockSuggestionPage("FULL_PLAN"); }
}`);

c = c.replace(/async getFilteredHistory[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async getFilteredHistory(filter: AiHistoryFilter): Promise<PageResponse<AiSuggestionResponse>> {
    try {
        const response = await apiClient.get<ApiResponse<PageResponse<AiSuggestionResponse>>>(\`\${AI_BASE_URL}/my/filter\`, { params: { suggestionType: filter.suggestionType, status: filter.status, page: filter.page ?? 0, size: filter.size ?? 10 }, timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể tải lịch sử AI.");
    } catch (e) { return mockAi.getMockSuggestionPage(filter.suggestionType || "FULL_PLAN"); }
}`);

c = c.replace(/async applyWorkoutPlan[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async applyWorkoutPlan(suggestionId: number): Promise<AiApplyPlanResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.post<ApiResponse<AiApplyPlanResponse>>(\`\${AI_BASE_URL}/\${suggestionId}/apply-workout-plan\`, undefined, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể áp dụng kế hoạch tập luyện.");
    } catch (e) { return mockAi.getMockApplyResponse(suggestionId); }
}`);

c = c.replace(/async applyNutritionPlan[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async applyNutritionPlan(suggestionId: number): Promise<AiApplyPlanResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.post<ApiResponse<AiApplyPlanResponse>>(\`\${AI_BASE_URL}/\${suggestionId}/apply-nutrition-plan\`, undefined, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể áp dụng kế hoạch dinh dưỡng.");
    } catch (e) { return mockAi.getMockApplyResponse(suggestionId); }
}`);

c = c.replace(/async submitFeedback[\s\S]*?\{[\s\S]*?return requireApiData\([^)]+\);[\s\S]*?\}/, 
`async submitFeedback(suggestionId: number, request: AiFeedbackRequest): Promise<AiFeedbackResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.post<ApiResponse<AiFeedbackResponse>>(\`\${AI_BASE_URL}/\${suggestionId}/feedback\`, request, { timeout: AI_STANDARD_TIMEOUT_MS });
        return requireApiData(response.data, "Không thể gửi đánh giá AI.");
    } catch (e) { return mockAi.getMockFeedbackResponse(suggestionId); }
}`);

// Special case for getAiSuggestionDetail since it has complex return logic
c = c.replace(/async getAiSuggestionDetail[\s\S]*?\{[\s\S]*?return\s*\{[\s\S]*?\}\s*;/m, 
`async getAiSuggestionDetail(suggestionId: number): Promise<AiSuggestionDetailResponse> {
    validateSuggestionId(suggestionId);
    try {
        const response = await apiClient.get<ApiResponse<AiSuggestionDetailResponse>>(\`\${AI_BASE_URL}/\${suggestionId}\`, { timeout: AI_STANDARD_TIMEOUT_MS });
        const detail = requireApiData(response.data, "Không thể tải chi tiết kế hoạch AI.");
        return { ...detail, items: detail.items ?? [] };
    } catch (e) { return mockAi.getMockSuggestionDetail(suggestionId, "FULL_PLAN"); }
}`);

fs.writeFileSync(p, c, 'utf8');
