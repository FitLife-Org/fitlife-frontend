export type WorkoutPlanStatus = "ACTIVE" | "COMPLETED" | "DRAFT" | "CANCELLED";

export interface WorkoutExercise {
  id?: number;
  exerciseName: string;
  targetMuscle?: string;
  equipmentId?: number;
  sets?: number;
  reps?: string;
  weightKg?: number;
  durationMinutes?: number;
  distanceKm?: number;
  restSeconds?: number;
  tempo?: string;
  rpe?: number;
  instruction?: string;
  note?: string;
  videoUrl?: string;
  sortOrder?: number;
  isOptional?: boolean;
}

export interface WorkoutPlanDay {
  id?: number;
  weekNo?: number;
  dayNo?: number;
  dayOfWeek?: string;
  name?: string;
  focusArea?: string;
  estimatedMinutes?: number;
  note?: string;
  sortOrder?: number;
  isRestDay?: boolean;
  isCompleted?: boolean;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: number;
  memberId: number;
  memberName?: string;
  trainerId?: number;
  trainerName?: string;
  
  name: string;
  goal?: string;
  experienceLevel?: string;
  durationWeeks?: number;
  workoutDaysPerWeek?: number;
  workoutDurationMinutes?: number;
  description?: string;
  note?: string;
  
  startDate?: string;
  endDate?: string;
  status: WorkoutPlanStatus;
  
  days: WorkoutPlanDay[];
}

export interface WorkoutPlanCreateRequest {
  memberId: number;
  name: string;
  goal?: string;
  experienceLevel?: string;
  durationWeeks?: number;
  workoutDaysPerWeek?: number;
  workoutDurationMinutes?: number;
  description?: string;
  note?: string;
  days: WorkoutPlanDay[];
}
