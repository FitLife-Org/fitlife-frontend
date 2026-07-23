export type AiSuggestionType =
    | "FULL_PLAN"
    | "WORKOUT_PLAN"
    | "NUTRITION_PLAN"
    | "BODY_ANALYSIS";

export type AiSuggestionStatus =
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "APPLIED";

export type AiPlanItemType =
    | "WORKOUT_DAY"
    | "EXERCISE"
    | "MEAL"
    | "NUTRITION"
    | "BODY_ANALYSIS"
    | "WARNING"
    | "NOTE";

export type AiGoal =
    | "LOSE_WEIGHT"
    | "GAIN_MUSCLE"
    | "BODY_RECOMPOSITION"
    | "MAINTAIN_FITNESS"
    | "IMPROVE_ENDURANCE";

export type AiExperienceLevel =
    | "BEGINNER"
    | "INTERMEDIATE"
    | "ADVANCED";

export type AiActivityLevel =
    | "SEDENTARY"
    | "LIGHT"
    | "MODERATE"
    | "ACTIVE"
    | "VERY_ACTIVE";

export type AiPreferredLanguage =
    | "vi"
    | "en";

export type AiPlanFormMode =
    | "FULL_PLAN"
    | "WORKOUT_PLAN"
    | "NUTRITION_PLAN";

/* ============================================================
 * REQUEST
 * ============================================================ */

export interface AiFullPlanRequest {
  goal: AiGoal;
  experienceLevel: AiExperienceLevel;
  activityLevel: AiActivityLevel;

  workoutDaysPerWeek: number;
  workoutDurationMinutes: number;

  mealsPerDay: number;

  preferredLanguage: AiPreferredLanguage;
  userNote?: string;
}

export interface AiWorkoutPlanRequest {
  goal: AiGoal;
  experienceLevel: AiExperienceLevel;
  activityLevel: AiActivityLevel;

  workoutDaysPerWeek: number;
  workoutDurationMinutes: number;

  preferredLanguage: AiPreferredLanguage;
  userNote?: string;
}

export interface AiNutritionPlanRequest {
  goal: AiGoal;
  activityLevel: AiActivityLevel;

  mealsPerDay: number;

  preferredLanguage: AiPreferredLanguage;
  userNote?: string;
}

export interface AiBodyAnalysisRequest {
  preferredLanguage?: AiPreferredLanguage;
  userNote?: string;
}

export interface AiFeedbackRequest {
  rating: number;
  useful?: boolean;
  comment?: string;
}

/* ============================================================
 * AI RAW RESPONSE SNAPSHOT
 * ============================================================ */

export interface AiRawWorkoutExercise {
  name: string;
  note?: string | null;

  sets?: number | null;
  reps?: string | null;

  restSeconds?: number | null;
  durationMinutes?: number | null;
}

export interface AiRawWorkoutDay {
  dayNo: number;
  dayOfWeek?: string | null;
  focus?: string | null;

  exercises: AiRawWorkoutExercise[];
}

export interface AiRawNutritionMeal {
  mealName: string;
  foodItems?: string | null;
  portionText?: string | null;

  calories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;

  note?: string | null;
}

export interface AiRawNutritionPlan {
  targetCalories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;

  meals?: AiRawNutritionMeal[];
}

export interface AiRawResponse {
  summary?: string | null;
  bodyAnalysis?: string | null;

  warnings?: string[];

  workoutPlan?: AiRawWorkoutDay[];

  nutritionPlan?: AiRawNutritionPlan;
}

/* ============================================================
 * RESPONSE
 * ============================================================ */

export interface AiFeedbackResponse {
  id: number;
  aiSuggestionId: number;
  memberId: number;

  memberName?: string | null;

  rating: number;
  useful?: boolean | null;
  comment?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AiUsageTodayResponse {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

export interface AiPlanItemResponse {
  id: number;
  aiSuggestionId?: number | null;

  itemType: AiPlanItemType;

  title: string;
  description?: string | null;

  dayNo?: number | null;
  dayOfWeek?: string | null;

  exerciseName?: string | null;
  sets?: number | null;
  reps?: string | null;
  restSeconds?: number | null;
  durationMinutes?: number | null;

  mealName?: string | null;
  portionText?: string | null;

  calories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;

  sortOrder?: number | null;
  createdAt?: string | null;
}

export interface AiSuggestionResponse {
  id: number;

  memberId: number;
  memberCode?: string | null;
  memberName?: string | null;

  suggestionType: AiSuggestionType;

  goal?: AiGoal | string | null;
  experienceLevel?: AiExperienceLevel | string | null;
  activityLevel?: AiActivityLevel | string | null;

  workoutDaysPerWeek?: number | null;
  workoutDurationMinutes?: number | null;

  preferredLanguage?: AiPreferredLanguage | string | null;

  summary?: string | null;
  warningMessage?: string | null;

  provider?: string | null;
  modelName?: string | null;
  promptVersion?: string | null;

  status: AiSuggestionStatus;

  errorCode?: string | null;
  errorMessage?: string | null;

  appliedWorkoutPlanId?: number | null;
  appliedNutritionPlanId?: number | null;

  requestedAt?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AiSuggestionDetailResponse
    extends AiSuggestionResponse {
  latestBodyMetricId?: number | null;
  userNote?: string | null;

  inputSnapshot?: Record<string, unknown> | null;
  contextSnapshot?: Record<string, unknown> | null;

  aiResponse?: AiRawResponse | null;

  items: AiPlanItemResponse[];

  feedback?: AiFeedbackResponse | null;
}

export interface AiApplyPlanResponse {
  suggestionId: number;

  workoutPlanId?: number | null;
  nutritionPlanId?: number | null;

  workoutApplied: boolean;
  nutritionApplied: boolean;

  message?: string | null;
}

export interface AiHistoryFilter {
  suggestionType?: AiSuggestionType;
  status?: AiSuggestionStatus;

  page?: number;
  size?: number;
}

/* ============================================================
 * FORM / UI
 * ============================================================ */

export interface AiAdvancedPlanFormValue {
  goal: AiGoal;
  experienceLevel: AiExperienceLevel;
  activityLevel: AiActivityLevel;

  workoutDaysPerWeek: number;
  workoutDurationMinutes: number;

  mealsPerDay: number;

  preferredLanguage: AiPreferredLanguage;

  userNote: string;
}

export interface AiChatMessageModel {
  id: string;

  sender: "user" | "ai";

  text: string;
  timestamp: string;

  suggestionDetail?: AiSuggestionDetailResponse;
}