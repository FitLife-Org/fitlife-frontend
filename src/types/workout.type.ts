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

// =====================================================
// RESPONSE
// =====================================================

export interface WorkoutExercise {
  id: number;

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

  isOptional: boolean;
}

export interface WorkoutPlanDay {
  id: number;

  weekNo?: number | null;

  dayNo?: number | null;

  dayOfWeek?: string | null;

  name?: string | null;

  focusArea?: string | null;

  estimatedMinutes?: number | null;

  note?: string | null;

  sortOrder?: number | null;

  isRestDay: boolean;

  exercises: WorkoutExercise[];
}

/**
 * Response dùng cho list:
 *
 * GET /workout-plans/me
 * GET /trainer/members/{memberId}/workout-plans
 * GET /admin/workout-plans
 */
export interface WorkoutPlan {
  id: number;

  memberId?: number | null;

  code: string;

  name: string;

  goal?: string | null;

  experienceLevel?: string | null;

  sourceType: WorkoutPlanSourceType;

  status: WorkoutPlanStatus;

  durationWeeks?: number | null;

  workoutDaysPerWeek?: number | null;

  workoutDurationMinutes?: number | null;

  totalDays?: number | null;

  trainingDays?: number | null;

  startDate?: string | null;

  endDate?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;
}

/**
 * Response chi tiết:
 *
 * GET /workout-plans/{id}
 * GET /workout-plans/me/active
 */
export interface WorkoutPlanDetail extends WorkoutPlan {
  trainerId?: number | null;

  sourceAiSuggestionId?: number | null;

  description?: string | null;

  note?: string | null;

  /**
   * Backend quyết định quyền edit.
   * FE không tự suy luận lại business rule.
   */
  editableByMember: boolean;

  days: WorkoutPlanDay[];
}

// =====================================================
// REQUEST
// =====================================================

export interface WorkoutExerciseRequest {
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

export interface WorkoutPlanDayRequest {
  weekNo?: number;

  dayNo?: number;

  dayOfWeek?: string;

  name: string;

  focusArea?: string;

  estimatedMinutes?: number;

  note?: string;

  sortOrder?: number;

  isRestDay?: boolean;

  exercises?: WorkoutExerciseRequest[];
}

/**
 * Không có memberId.
 *
 * Member:
 * POST /workout-plans
 *
 * Trainer:
 * POST /trainer/members/{memberId}/workout-plans
 */
export interface WorkoutPlanCreateRequest {
  name: string;

  goal: string;

  experienceLevel?: string;

  durationWeeks?: number;

  workoutDaysPerWeek?: number;

  workoutDurationMinutes?: number;

  description?: string;

  note?: string;

  days?: WorkoutPlanDayRequest[];
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