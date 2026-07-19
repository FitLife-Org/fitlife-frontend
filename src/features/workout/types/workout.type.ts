export type WorkoutPlanStatus = "ACTIVE" | "COMPLETED" | "DRAFT" | "CANCELLED";

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
}

export interface WorkoutSession {
  id: string;
  name: string;
  dayOfWeek: number;
  isCompleted: boolean;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  memberName: string;
  trainerId: string;
  trainerName: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: WorkoutPlanStatus;
  sessions: WorkoutSession[];
}

export interface CreateWorkoutPlanRequest {
  memberId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  sessions: Omit<WorkoutSession, "id" | "isCompleted">[];
}
