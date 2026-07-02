import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { WorkoutPlan, CreateWorkoutPlanRequest } from "../types/workout.type";

const MOCK_WORKOUT_PLAN: WorkoutPlan = {
  id: "WKP-001",
  memberId: "MEM-001",
  memberName: "Nguyễn Văn A",
  trainerId: "TRN-001",
  trainerName: "Nguyễn Tuấn Khoa",
  name: "Giáo án Tăng Cơ Giảm Mỡ",
  goal: "Giảm 3kg mỡ, tăng 2kg cơ trong 1 tháng",
  startDate: "2026-07-01",
  endDate: "2026-07-31",
  status: "ACTIVE",
  sessions: [
    {
      id: "SES-001",
      name: "Ngực & Tay sau",
      dayOfWeek: 1, // Thứ 2
      isCompleted: false,
      exercises: [
        { id: "EXE-01", name: "Barbell Bench Press", targetMuscle: "Ngực", sets: 4, reps: 10, restSeconds: 90 },
        { id: "EXE-02", name: "Incline Dumbbell Press", targetMuscle: "Ngực trên", sets: 3, reps: 12, restSeconds: 60 },
        { id: "EXE-03", name: "Tricep Pushdown", targetMuscle: "Tay sau", sets: 3, reps: 15, restSeconds: 60 },
      ]
    },
    {
      id: "SES-002",
      name: "Lưng & Tay trước",
      dayOfWeek: 3, // Thứ 4
      isCompleted: true,
      exercises: [
        { id: "EXE-04", name: "Lat Pulldown", targetMuscle: "Lưng xô", sets: 4, reps: 12, restSeconds: 60 },
        { id: "EXE-05", name: "Barbell Row", targetMuscle: "Lưng giữa", sets: 3, reps: 10, restSeconds: 90 },
        { id: "EXE-06", name: "Dumbbell Bicep Curl", targetMuscle: "Tay trước", sets: 3, reps: 15, restSeconds: 60 },
      ]
    }
  ]
};

export const workoutService = {
  // WKT-01: Lấy danh sách kế hoạch tập (Trainer/Admin)
  getWorkoutPlans: async (): Promise<WorkoutPlan[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WorkoutPlan[]>>("/workout-plans");
      return response.data.data;
    } catch (error) {
      console.warn("API /workout-plans failed, using mock data", error);
      return [MOCK_WORKOUT_PLAN];
    }
  },

  // WKT-02: Chi tiết kế hoạch tập
  getWorkoutPlanDetails: async (id: string): Promise<WorkoutPlan> => {
    try {
      const response = await apiClient.get<ApiResponse<WorkoutPlan>>(`/workout-plans/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn(`API /workout-plans/${id} failed, using mock data`, error);
      return { ...MOCK_WORKOUT_PLAN, id }; // Mock
    }
  },

  // WKT-03: Trainer tạo kế hoạch tập
  createWorkoutPlan: async (data: CreateWorkoutPlanRequest): Promise<WorkoutPlan> => {
    try {
      const response = await apiClient.post<ApiResponse<WorkoutPlan>>("/trainers/workout-plans", data);
      return response.data.data;
    } catch (error) {
      console.warn("API POST /trainers/workout-plans failed, using mock data", error);
      await new Promise(r => setTimeout(r, 1000));
      return { ...MOCK_WORKOUT_PLAN, ...data, id: "WKP-002" } as WorkoutPlan;
    }
  },

  // WKT-04: Trainer cập nhật kế hoạch
  updateWorkoutPlan: async (id: string, data: Partial<CreateWorkoutPlanRequest>): Promise<WorkoutPlan> => {
    try {
      const response = await apiClient.put<ApiResponse<WorkoutPlan>>(`/trainers/workout-plans/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.warn(`API PUT /trainers/workout-plans/${id} failed, using mock data`, error);
      await new Promise(r => setTimeout(r, 1000));
      return { ...MOCK_WORKOUT_PLAN, ...data, id } as WorkoutPlan;
    }
  },

  // WKT-05: Member xem kế hoạch tập của mình
  getMyWorkoutPlans: async (): Promise<WorkoutPlan[]> => {
    try {
      const response = await apiClient.get<ApiResponse<WorkoutPlan[]>>("/members/me/workout-plans");
      return response.data.data;
    } catch (error) {
      console.warn("API /members/me/workout-plans failed, using mock data", error);
      return [MOCK_WORKOUT_PLAN];
    }
  },

  // WKT-06: Member đánh dấu hoàn thành buổi tập
  completeSession: async (sessionId: string): Promise<void> => {
    try {
      await apiClient.patch<ApiResponse<void>>(`/workout-sessions/${sessionId}/complete`);
    } catch (error) {
      console.warn(`API PATCH /workout-sessions/${sessionId}/complete failed, using mock data`, error);
      await new Promise(r => setTimeout(r, 800));
    }
  }
};
