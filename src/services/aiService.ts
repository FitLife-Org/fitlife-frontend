import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { AiWorkoutPlan, AiWorkoutRequest, AiHistoryItem } from "../types/ai.type";

const MOCK_HISTORY: AiHistoryItem[] = [
  { 
    id: "h-1", 
    title: "Giáo án Giảm mỡ - Người mới", 
    type: "workout", 
    createdAt: "2026-07-01T10:00:00Z", 
    summary: "4 ngày/tuần kết hợp sức mạnh và tim mạch",
    planObject: {
      title: "Giáo án Giảm mỡ - Người mới bắt đầu (Lịch sử)",
      goal: "Giảm mỡ, tăng cường thể lực",
      level: "Beginner",
      summary: "Chương trình 4 ngày/tuần kết hợp tập sức mạnh (Strength) và tim mạch (Cardio) nhẹ nhàng, phù hợp cho người mới làm quen với tạ.",
      days: [
        {
          day: 1,
          title: "Thân trên (Upper Body)",
          focus: "Ngực, Lưng, Vai",
          exercises: [
            { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", note: "Đẩy tạ đơn ghế dốc lên" },
            { name: "Lat Pulldown", sets: 3, reps: "12-15", note: "Kéo xô máy" },
            { name: "Dumbbell Lateral Raise", sets: 3, reps: "15", note: "Dang vai với tạ đơn" }
          ]
        },
        {
          day: 2,
          title: "Thân dưới (Lower Body)",
          focus: "Đùi, Mông, Bụng",
          exercises: [
            { name: "Goblet Squat", sets: 4, reps: "12", note: "Squat ôm 1 cục tạ trước ngực" },
            { name: "Leg Press", sets: 3, reps: "15", note: "Đạp đùi trên máy" },
            { name: "Plank", sets: 3, reps: "45s", note: "Gồng chặt cơ lõi" }
          ]
        }
      ],
      notes: [
        "Nghỉ 60-90 giây giữa các hiệp.",
        "Uống đủ 2.5 lít nước mỗi ngày."
      ]
    }
  },
  { id: "h-2", title: "Thực đơn 2000 calo", type: "meal", createdAt: "2026-06-25T14:30:00Z", summary: "Giàu protein, dễ chế biến" },
  { id: "h-3", title: "Phân tích BMI", type: "chat", createdAt: "2026-06-15T09:15:00Z", summary: "BMI 26.1 - Thừa cân nhẹ" }
];

export const aiService = {
  async generateWorkout(data: AiWorkoutRequest): Promise<AiWorkoutPlan> {
    const response = await apiClient.post<ApiResponse<AiWorkoutPlan>>(
        "/ai/workouts",
        data
    );

    if (!response.data.data) {
      throw new Error("Máy chủ không trả về kế hoạch tập luyện.");
    }

    return response.data.data;
  },

  async getAiHistory(): Promise<AiHistoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<AiHistoryItem[]>>("/ai/history");
      return response.data.data;
    } catch (error) {
      console.warn("API GET /ai/history failed, using mock data");
      return MOCK_HISTORY;
    }
  },

  async applyPlan(plan: AiWorkoutPlan): Promise<void> {
    try {
      await apiClient.post("/ai/apply-plan", plan);
    } catch (error) {
      console.warn("API POST /ai/apply-plan failed, using mock delay");
      await new Promise(r => setTimeout(r, 1200));
    }
  }
};