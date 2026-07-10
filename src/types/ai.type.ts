export interface AiFullPlanRequest {
  goal: string;
  fitnessLevel: string;
  trainingDaysPerWeek: number;
  equipment?: string;
  healthNote?: string;
}

export interface AiGeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  note?: string;
}

export interface AiGeneratedWorkoutDay {
  dayNumber: number;
  title: string;
  focusArea: string;
  exercises: AiGeneratedExercise[];
}

export interface AiGeneratedMeal {
  mealName: string;
  foods: string;
  calories?: number;
}

export interface AiGeneratedNutrition {
  title: string;
  dailyCalories?: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  meals: AiGeneratedMeal[];
}

export interface AiGeneratedPlan {
  title: string;
  goal: string;
  fitnessLevel: string;
  summary: string;
  workoutDays: AiGeneratedWorkoutDay[];
  nutritionPlan?: AiGeneratedNutrition;
}

export interface AiSuggestionResponse {
  id: number;
  memberId: number;
  suggestionType: "WORKOUT_PLAN" | "NUTRITION_PLAN" | "FULL_PLAN" | "BODY_ANALYSIS";
  status: "PENDING" | "SUCCESS" | "FAILED" | "APPLIED";
  title: string;
  promptText: string;
  summary: string;
  rawResponse?: string;
  tokenUsed?: number;
  cost?: number;
  createdAt: string;
}

export interface AiSuggestionDetailResponse extends AiSuggestionResponse {
  errorMessage?: string;
  isApplied: boolean;
  appliedAt?: string;
  planInfo?: AiGeneratedPlan;
  bodyAnalysis?: any;
  updatedAt: string;
}
export interface AiBodyAnalysisRequest {
  userNote?: string;
}

export interface AiFeedbackRequest {
  rating: number;
  comment?: string;
}
