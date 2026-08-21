export type WorkoutPlanStatus =
    | "DRAFT"
    | "ACTIVE"
    | "COMPLETED"
    | "ARCHIVED"
    | "CANCELLED";

export type WorkoutPlanSourceType =
    | "AI_GENERATED"
    | "TRAINER_CREATED"
    | "MEMBER_CREATED"
    | "MANUAL";

export interface WorkoutExercise {
  id?: number;

  exerciseName: string;

  targetMuscle?: string | null;

  equipmentId?: number | null;

  sets?: number | null;

  reps?: string | null;

  weightKg?: number | null;

  durationMinutes?: number | null;

  distanceKm?: number | null;

  restSeconds?: number | null;

  tempo?: string | null;

  rpe?: number | null;

  instruction?: string | null;

  note?: string | null;

  videoUrl?: string | null;

  sortOrder?: number | null;

  isOptional?: boolean;
}

export interface WorkoutPlanDay {
  id?: number;

  weekNo?: number | null;

  dayNo?: number | null;

  dayOfWeek?: string | null;

  name?: string | null;

  focusArea?: string | null;

  estimatedMinutes?: number | null;

  note?: string | null;

  sortOrder?: number | null;

  isRestDay?: boolean;

  /*
   * Chỉ giữ field này nếu backend detail hiện
   * thực sự trả về.
   *
   * Không dùng field này để gọi
   * /workout-plans/{dayId}/complete.
   */
  isCompleted?: boolean;

  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: number;

  code?: string | null;

  memberId?: number | null;

  memberName?: string | null;

  trainerId?: number | null;

  trainerName?: string | null;

  name: string;

  goal?: string | null;

  experienceLevel?: string | null;

  sourceType?: WorkoutPlanSourceType | string | null;

  status: WorkoutPlanStatus;

  durationWeeks?: number | null;

  workoutDaysPerWeek?: number | null;

  workoutDurationMinutes?: number | null;

  description?: string | null;

  note?: string | null;

  startDate?: string | null;

  endDate?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;

  days: WorkoutPlanDay[];
}

/*
 * Request dùng cho Member / Trainer.
 *
 * memberId KHÔNG nằm trong body Trainer vì backend:
 *
 * POST /trainer/members/{memberId}/workout-plans
 *
 * đã lấy memberId từ path.
 */
export interface WorkoutPlanCreateRequest {
  name: string;

  goal?: string;

  experienceLevel?: string;

  durationWeeks?: number;

  workoutDaysPerWeek?: number;

  workoutDurationMinutes?: number;

  description?: string;

  note?: string;

  days?: WorkoutPlanDay[];
}

export interface WorkoutPlanUpdateRequest {
  name?: string;

  goal?: string;

  experienceLevel?: string;

  durationWeeks?: number;

  workoutDaysPerWeek?: number;

  workoutDurationMinutes?: number;

  description?: string;

  note?: string;
}