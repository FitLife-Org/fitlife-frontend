import type {
    AiSuggestionResponse,
    AiSuggestionDetailResponse,
    AiUsageTodayResponse,
    AiApplyPlanResponse,
    AiFeedbackResponse,
    AiSuggestionType
} from "../types/ai.type";
import type { PageResponse } from "../types/common.type";

export function getMockUsage(): AiUsageTodayResponse {
    return {
        dailyLimit: 5,
        used: 2,
        remaining: 3,
        resetAt: new Date(new Date().setHours(23,59,59)).toISOString()
    };
}

export function getMockSuggestion(type: string): AiSuggestionResponse {
    return {
        id: Math.floor(Math.random() * 10000),
        memberId: 1,
        suggestionType: type as AiSuggestionType,
        status: "SUCCESS",
        summary: "Kế hoạch tập luyện và dinh dưỡng cá nhân hóa (Mock)",
        requestedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
    };
}

export function getMockSuggestionPage(type: string): PageResponse<AiSuggestionResponse> {
    return {
        content: [getMockSuggestion(type)],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        page: 0,
        first: true,
        last: true,
        empty: false
    };
}

export function getMockSuggestionDetail(id: number, type?: string): AiSuggestionDetailResponse {
    const base = getMockSuggestion(type || "FULL_PLAN");
    return {
        ...base,
        id,
        items: [
            {
                id: 1,
                itemType: "WORKOUT_DAY",
                title: "Ngày 1: Tập toàn thân",
                dayNo: 1,
                dayOfWeek: "Thứ Hai"
            },
            {
                id: 2,
                itemType: "EXERCISE",
                title: "Push Ups",
                exerciseName: "Push Ups",
                sets: 3,
                reps: "15",
                restSeconds: 60
            },
            {
                id: 3,
                itemType: "MEAL",
                title: "Bữa sáng",
                mealName: "Yến mạch và trứng",
                calories: 450,
                proteinGrams: 30,
                carbsGrams: 50,
                fatGrams: 15
            }
        ]
    };
}

export function getMockApplyResponse(id: number): AiApplyPlanResponse {
    return {
        suggestionId: id,
        workoutApplied: true,
        nutritionApplied: true,
        message: "Áp dụng thành công (Mock)"
    };
}

export function getMockFeedbackResponse(id: number): AiFeedbackResponse {
    return {
        id: Math.floor(Math.random() * 10000),
        aiSuggestionId: id,
        memberId: 1,
        rating: 5,
        useful: true
    };
}
