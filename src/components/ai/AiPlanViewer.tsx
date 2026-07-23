import {
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    CalendarPlus,
    CheckCircle2,
    Dumbbell,
    FileText,
    Salad,
    Utensils,
} from "lucide-react";

import toast from "react-hot-toast";

import Button from "../common/Button";

import { aiService } from "../../services/aiService";
import { getApiErrorMessage } from "../../utils/apiError";

import type {
    AiPlanItemResponse,
    AiSuggestionDetailResponse,
} from "../../types/ai.type";

interface AiPlanViewerProps {
    suggestion: AiSuggestionDetailResponse;

    onChanged?: (
        detail: AiSuggestionDetailResponse,
    ) => void;
}

function sortItems(
    items: AiPlanItemResponse[],
): AiPlanItemResponse[] {
    return [...items].sort(
        (first, second) => {
            const firstOrder =
                first.sortOrder ?? 0;

            const secondOrder =
                second.sortOrder ?? 0;

            if (
                firstOrder !== secondOrder
            ) {
                return firstOrder - secondOrder;
            }

            return first.id - second.id;
        },
    );
}

function getDayTitle(
    day: AiPlanItemResponse,
): string {
    return (
        day.title ||
        day.dayOfWeek ||
        `Ngày ${day.dayNo ?? ""}`
    );
}

export default function AiPlanViewer({
                                         suggestion,
                                         onChanged,
                                     }: AiPlanViewerProps) {
    const [currentSuggestion, setCurrentSuggestion] =
        useState(suggestion);

    const [
        applyingWorkout,
        setApplyingWorkout,
    ] = useState(false);

    const [
        applyingNutrition,
        setApplyingNutrition,
    ] = useState(false);

    const items = useMemo(
        () => currentSuggestion.items ?? [],
        [currentSuggestion.items],
    );

    const workoutDays =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (item) =>
                            item.itemType ===
                            "WORKOUT_DAY",
                    ),
                ),
            [items],
        );

    const exercises =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (item) =>
                            item.itemType ===
                            "EXERCISE",
                    ),
                ),
            [items],
        );

    const nutritionItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (item) =>
                            item.itemType ===
                            "NUTRITION" ||
                            item.itemType ===
                            "MEAL",
                    ),
                ),
            [items],
        );

    const warningItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (item) =>
                            item.itemType ===
                            "WARNING",
                    ),
                ),
            [items],
        );

    const noteItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (item) =>
                            item.itemType ===
                            "NOTE",
                    ),
                ),
            [items],
        );

    const bodyAnalysisItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (item) =>
                            item.itemType ===
                            "BODY_ANALYSIS",
                    ),
                ),
            [items],
        );

    const canApplyWorkout =
        (
            currentSuggestion.suggestionType ===
            "FULL_PLAN" ||
            currentSuggestion.suggestionType ===
            "WORKOUT_PLAN"
        ) &&
        currentSuggestion.status !==
        "FAILED" &&
        !currentSuggestion
            .appliedWorkoutPlanId;

    const canApplyNutrition =
        (
            currentSuggestion.suggestionType ===
            "FULL_PLAN" ||
            currentSuggestion.suggestionType ===
            "NUTRITION_PLAN"
        ) &&
        currentSuggestion.status !==
        "FAILED" &&
        !currentSuggestion
            .appliedNutritionPlanId;

    const reloadDetail =
        async (): Promise<void> => {
            const updated =
                await aiService.getAiSuggestionDetail(
                    currentSuggestion.id,
                );

            setCurrentSuggestion(
                updated,
            );

            onChanged?.(updated);
        };

    const handleApplyWorkout =
        async () => {
            if (
                !canApplyWorkout ||
                applyingWorkout
            ) {
                return;
            }

            try {
                setApplyingWorkout(true);

                await aiService.applyWorkoutPlan(
                    currentSuggestion.id,
                );

                toast.success(
                    "Đã tạo kế hoạch tập luyện từ gợi ý AI.",
                );

                await reloadDetail();
            } catch (error) {
                toast.error(
                    getApiErrorMessage(
                        error,
                        "Không thể áp dụng kế hoạch tập luyện.",
                    ),
                );
            } finally {
                setApplyingWorkout(false);
            }
        };

    const handleApplyNutrition =
        async () => {
            if (
                !canApplyNutrition ||
                applyingNutrition
            ) {
                return;
            }

            try {
                setApplyingNutrition(true);

                await aiService.applyNutritionPlan(
                    currentSuggestion.id,
                );

                toast.success(
                    "Đã tạo kế hoạch dinh dưỡng từ gợi ý AI.",
                );

                await reloadDetail();
            } catch (error) {
                toast.error(
                    getApiErrorMessage(
                        error,
                        "Không thể áp dụng kế hoạch dinh dưỡng.",
                    ),
                );
            } finally {
                setApplyingNutrition(false);
            }
        };

    const getExercisesForDay = (
        dayNo?: number | null,
    ) => {
        return exercises.filter(
            (exercise) =>
                exercise.dayNo === dayNo,
        );
    };

    return (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6 text-white">
                <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-100">
            {currentSuggestion.suggestionType}
          </span>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            currentSuggestion.status ===
                            "FAILED"
                                ? "bg-red-500/20 text-red-200"
                                : currentSuggestion.status ===
                                "APPLIED"
                                    ? "bg-emerald-500/20 text-emerald-200"
                                    : "bg-blue-500/20 text-blue-200"
                        }`}
                    >
            {currentSuggestion.status}
          </span>
                </div>

                <h3 className="mt-4 text-xl font-black sm:text-2xl">
                    {currentSuggestion.goal
                        ? `Kế hoạch cho mục tiêu ${currentSuggestion.goal}`
                        : "Kế hoạch FitLife AI"}
                </h3>

                {currentSuggestion.summary && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                        {currentSuggestion.summary}
                    </p>
                )}
            </div>

            <div className="space-y-6 p-4 sm:p-6">
                {(currentSuggestion.warningMessage ||
                    warningItems.length > 0) && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                            <div>
                                <h4 className="font-bold text-amber-900">
                                    Cảnh báo và lưu ý an toàn
                                </h4>

                                {currentSuggestion.warningMessage && (
                                    <p className="mt-1 text-sm leading-6 text-amber-800">
                                        {
                                            currentSuggestion.warningMessage
                                        }
                                    </p>
                                )}

                                {warningItems.map(
                                    (warning) => (
                                        <p
                                            key={warning.id}
                                            className="mt-2 text-sm leading-6 text-amber-800"
                                        >
                                            {warning.title &&
                                                `${warning.title}: `}

                                            {
                                                warning.description
                                            }
                                        </p>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {workoutDays.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <Dumbbell className="h-5 w-5" />
                            </div>

                            <div>
                                <h4 className="font-black text-slate-900">
                                    Kế hoạch tập luyện
                                </h4>

                                <p className="text-xs text-slate-500">
                                    {
                                        workoutDays.length
                                    }{" "}
                                    ngày tập được đề xuất
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {workoutDays.map(
                                (day) => {
                                    const dayExercises =
                                        getExercisesForDay(
                                            day.dayNo,
                                        );

                                    return (
                                        <article
                                            key={day.id}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                            {day.dayNo ??
                                "-"}
                          </span>

                                                    <div>
                                                        <h5 className="font-bold text-slate-900">
                                                            {getDayTitle(
                                                                day,
                                                            )}
                                                        </h5>

                                                        {day.description && (
                                                            <p className="mt-0.5 text-xs text-slate-500">
                                                                {
                                                                    day.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {day.durationMinutes && (
                                                    <span className="text-xs font-bold text-slate-500">
                            {
                                day.durationMinutes
                            }{" "}
                                                        phút
                          </span>
                                                )}
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                {dayExercises.length ===
                                                0 ? (
                                                    <p className="rounded-xl bg-white p-3 text-sm text-slate-500">
                                                        Chưa có bài tập cho ngày này.
                                                    </p>
                                                ) : (
                                                    dayExercises.map(
                                                        (
                                                            exercise,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    exercise.id
                                                                }
                                                                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                                        <Dumbbell className="h-4 w-4" />
                                                                    </div>

                                                                    <div>
                                                                        <p className="font-bold text-slate-900">
                                                                            {exercise.exerciseName ||
                                                                                exercise.title ||
                                                                                "Bài tập"}
                                                                        </p>

                                                                        {exercise.description && (
                                                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                                {
                                                                                    exercise.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex shrink-0 gap-2 text-xs font-bold text-slate-700">
                                                                    {exercise.sets !=
                                                                        null && (
                                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                                      {
                                          exercise.sets
                                      }{" "}
                                                                                hiệp
                                    </span>
                                                                        )}

                                                                    {exercise.reps && (
                                                                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                                      {
                                          exercise.reps
                                      }{" "}
                                                                            reps
                                    </span>
                                                                    )}

                                                                    {exercise.restSeconds !=
                                                                        null && (
                                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5">
                                      Nghỉ{" "}
                                                                                {
                                                                                    exercise.restSeconds
                                                                                }
                                                                                s
                                    </span>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )
                                                )}
                                            </div>
                                        </article>
                                    );
                                },
                            )}
                        </div>
                    </section>
                )}

                {nutritionItems.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                <Utensils className="h-5 w-5" />
                            </div>

                            <div>
                                <h4 className="font-black text-slate-900">
                                    Kế hoạch dinh dưỡng
                                </h4>

                                <p className="text-xs text-slate-500">
                                    Gợi ý bữa ăn và chỉ số dinh dưỡng
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {nutritionItems.map(
                                (item) => (
                                    <article
                                        key={item.id}
                                        className="rounded-2xl border border-orange-100 bg-orange-50 p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm">
                                                {item.itemType ===
                                                "MEAL" ? (
                                                    <Salad className="h-4 w-4" />
                                                ) : (
                                                    <Utensils className="h-4 w-4" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                                                    {item.mealName ||
                                                        item.itemType}
                                                </p>

                                                <h5 className="mt-1 font-bold text-orange-950">
                                                    {item.title ||
                                                        "Gợi ý dinh dưỡng"}
                                                </h5>

                                                {item.portionText && (
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {
                                                            item.portionText
                                                        }
                                                    </p>
                                                )}

                                                {item.description && (
                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                        {
                                                            item.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                                            {item.calories !=
                                                null && (
                                                    <span className="rounded-lg bg-white px-2.5 py-1.5 text-orange-700">
                          {
                              item.calories
                          }{" "}
                                                        kcal
                        </span>
                                                )}

                                            {item.proteinGrams !=
                                                null && (
                                                    <span className="rounded-lg bg-white px-2.5 py-1.5 text-slate-700">
                          P{" "}
                                                        {
                                                            item.proteinGrams
                                                        }
                                                        g
                        </span>
                                                )}

                                            {item.carbsGrams !=
                                                null && (
                                                    <span className="rounded-lg bg-white px-2.5 py-1.5 text-slate-700">
                          C{" "}
                                                        {
                                                            item.carbsGrams
                                                        }
                                                        g
                        </span>
                                                )}

                                            {item.fatGrams !=
                                                null && (
                                                    <span className="rounded-lg bg-white px-2.5 py-1.5 text-slate-700">
                          F{" "}
                                                        {
                                                            item.fatGrams
                                                        }
                                                        g
                        </span>
                                                )}
                                        </div>
                                    </article>
                                ),
                            )}
                        </div>
                    </section>
                )}

                {bodyAnalysisItems.length > 0 && (
                    <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />

                            <h4 className="font-black text-blue-950">
                                Phân tích cơ thể
                            </h4>
                        </div>

                        <div className="mt-3 space-y-3">
                            {bodyAnalysisItems.map(
                                (item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-xl bg-white p-3"
                                    >
                                        {item.title && (
                                            <p className="font-bold text-slate-900">
                                                {
                                                    item.title
                                                }
                                            </p>
                                        )}

                                        {item.description && (
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                {
                                                    item.description
                                                }
                                            </p>
                                        )}
                                    </div>
                                ),
                            )}
                        </div>
                    </section>
                )}

                {noteItems.length > 0 && (
                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <h4 className="font-bold text-slate-900">
                            Ghi chú bổ sung
                        </h4>

                        <div className="mt-2 space-y-2">
                            {noteItems.map(
                                (note) => (
                                    <p
                                        key={note.id}
                                        className="text-sm leading-6 text-slate-600"
                                    >
                                        {note.title &&
                                            `${note.title}: `}

                                        {
                                            note.description
                                        }
                                    </p>
                                ),
                            )}
                        </div>
                    </section>
                )}
            </div>

            {(canApplyWorkout ||
                canApplyNutrition ||
                currentSuggestion
                    .appliedWorkoutPlanId ||
                currentSuggestion
                    .appliedNutritionPlanId) && (
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end sm:p-6">
                    {currentSuggestion
                        .appliedWorkoutPlanId ? (
                        <div className="flex min-h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />

                            Đã tạo lịch tập #
                            {
                                currentSuggestion
                                    .appliedWorkoutPlanId
                            }
                        </div>
                    ) : (
                        canApplyWorkout && (
                            <Button
                                variant="primary"
                                isLoading={
                                    applyingWorkout
                                }
                                loadingText="Đang tạo lịch tập..."
                                onClick={
                                    handleApplyWorkout
                                }
                                className="bg-slate-950 text-white hover:bg-slate-800"
                            >
                                <CalendarPlus className="h-4 w-4" />

                                Áp dụng lịch tập
                            </Button>
                        )
                    )}

                    {currentSuggestion
                        .appliedNutritionPlanId ? (
                        <div className="flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
                            <CheckCircle2 className="h-4 w-4" />

                            Đã tạo thực đơn #
                            {
                                currentSuggestion
                                    .appliedNutritionPlanId
                            }
                        </div>
                    ) : (
                        canApplyNutrition && (
                            <Button
                                variant="outline"
                                isLoading={
                                    applyingNutrition
                                }
                                loadingText="Đang tạo thực đơn..."
                                onClick={
                                    handleApplyNutrition
                                }
                                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                                <Utensils className="h-4 w-4" />

                                Áp dụng dinh dưỡng
                            </Button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
