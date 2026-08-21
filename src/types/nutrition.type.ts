export type NutritionPlanSource =
    | "AI_GENERATED"
    | "TRAINER_CREATED"
    | "MEMBER_CREATED"
    | "MANUAL";

export type NutritionPlanStatus =
    | "DRAFT"
    | "ACTIVE"
    | "COMPLETED"
    | "ARCHIVED"
    | "CANCELLED";

export interface NutritionFood {
    id?: number;

    foodName: string;

    quantity?: number | null;
    unit?: string | null;
    portionText?: string | null;

    calories?: number | null;

    proteinGrams?: number | null;
    carbohydrateGrams?: number | null;
    fatGrams?: number | null;

    preparation?: string | null;
    substitution?: string | null;
    note?: string | null;

    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface NutritionMeal {
    mealName: string;

    foods: NutritionFood[];
}

export interface NutritionPlan {
    id: number;

    name: string;

    description?: string | null;

    goal: string;

    source:
        | NutritionPlanSource
        | string;

    status:
        | NutritionPlanStatus
        | string;

    durationWeeks: number;

    dailyCalories?: number | null;

    proteinGrams?: number | null;
    carbohydrateGrams?: number | null;
    fatGrams?: number | null;
    fiberGrams?: number | null;

    mealsPerDay?: number | null;

    waterMlPerDay?: number | null;

    startDate?: string | null;

    expectedEndDate?: string | null;

    foodsToLimit?: string | null;

    substitutionNote?: string | null;

    trainerNote?: string | null;

    memberNote?: string | null;

    warningMessage?: string | null;

    modifiedFromAi?: boolean;

    completedAt?: string | null;

    archivedAt?: string | null;

    aiSuggestionId?: number | null;

    replacementPlanId?: number | null;

    createdAt?: string | null;

    updatedAt?: string | null;

    meals: NutritionMeal[];
}

/* =====================================================
 * REQUEST
 * ===================================================== */

export interface NutritionFoodRequest {
    foodName: string;

    quantity?: number;

    unit?: string;

    portionText?: string;

    calories?: number;

    proteinGrams?: number;

    carbohydrateGrams?: number;

    fatGrams?: number;

    preparation?: string;

    substitution?: string;

    note?: string;
}

export interface NutritionMealRequest {
    mealName: string;

    foods: NutritionFoodRequest[];
}

export interface NutritionPlanRequest {
    name: string;

    description?: string;

    goal: string;

    durationWeeks: number;

    dailyCalories?: number;

    proteinGrams?: number;

    carbohydrateGrams?: number;

    fatGrams?: number;

    fiberGrams?: number;

    mealsPerDay?: number;

    waterMlPerDay?: number;

    startDate?: string;

    expectedEndDate?: string;

    foodsToLimit?: string;

    substitutionNote?: string;

    trainerNote?: string;

    memberNote?: string;

    meals: NutritionMealRequest[];
}