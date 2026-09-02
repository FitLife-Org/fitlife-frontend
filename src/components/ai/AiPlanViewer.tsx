import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    BarChart3,
    CalendarDays,
    CalendarPlus,
    CheckCircle2,
    Dumbbell,
    ExternalLink,
    FileText,
    Flame,
    Salad,
    Sparkles,
    Utensils,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import Button from "../common/Button";
import Badge from "../common/Badge";

import {
    ROUTES,
} from "../../config/routes";

import {
    aiService,
} from "../../services/aiService";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

import type {
    AiPlanItemResponse,
    AiSuggestionDetailResponse,
    AiSuggestionStatus,
    AiSuggestionType,
} from "../../types/ai.type";

interface AiPlanViewerProps {
    suggestion:
        AiSuggestionDetailResponse;

    onChanged?: (
        detail:
        AiSuggestionDetailResponse,
    ) => void;
}

function sortItems(
    items:
    AiPlanItemResponse[],
): AiPlanItemResponse[] {
    return [
        ...items,
    ].sort(
        (
            first,
            second,
        ) => {
            const firstOrder =
                first.sortOrder ??
                0;

            const secondOrder =
                second.sortOrder ??
                0;

            if (
                firstOrder !==
                secondOrder
            ) {
                return (
                    firstOrder -
                    secondOrder
                );
            }

            return (
                first.id -
                second.id
            );
        },
    );
}

function getDayTitle(
    day:
    AiPlanItemResponse,
): string {
    return (
        day.title ||
        day.dayOfWeek ||
        `Ngày ${day.dayNo ?? ""}`
    );
}

function buildRoute(
    route: string,
    id: number,
): string {
    return route.replace(
        ":id",
        String(id),
    );
}

function getTypeLabel(
    type:
    AiSuggestionType,
): string {
    switch (type) {
        case "FULL_PLAN":
            return "Kế hoạch toàn diện";

        case "WORKOUT_PLAN":
            return "Kế hoạch tập luyện";

        case "NUTRITION_PLAN":
            return "Kế hoạch dinh dưỡng";

        case "BODY_ANALYSIS":
            return "Phân tích cơ thể";

        default:
            return type;
    }
}

function getStatusLabel(
    status:
    AiSuggestionStatus,
): string {
    switch (status) {
        case "PENDING":
            return "Đang xử lý";

        case "SUCCESS":
            return "Hoàn thành";

        case "FAILED":
            return "Thất bại";

        case "APPLIED":
            return "Đã áp dụng";

        default:
            return status;
    }
}

function getStatusVariant(
    status:
    AiSuggestionStatus,
):
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default" {
    switch (status) {
        case "SUCCESS":
        case "APPLIED":
            return "success";

        case "PENDING":
            return "warning";

        case "FAILED":
            return "danger";

        default:
            return "default";
    }
}

function getGoalLabel(
    value?: string | null,
): string {
    if (!value) {
        return "Kế hoạch cá nhân hóa";
    }

    const labels:
        Record<string, string> = {
        LOSE_WEIGHT:
            "Giảm mỡ",

        GAIN_MUSCLE:
            "Tăng cơ",

        BODY_RECOMPOSITION:
            "Tăng cơ giảm mỡ",

        MAINTAIN_FITNESS:
            "Duy trì thể lực",

        IMPROVE_ENDURANCE:
            "Cải thiện sức bền",
    };

    return (
        labels[value] ??
        value
    );
}

export default function AiPlanViewer({
                                         suggestion,
                                         onChanged,
                                     }: AiPlanViewerProps) {
    const navigate =
        useNavigate();

    const [
        currentSuggestion,
        setCurrentSuggestion,
    ] =
        useState<
            AiSuggestionDetailResponse
        >(
            suggestion,
        );

    const [
        applyingWorkout,
        setApplyingWorkout,
    ] =
        useState(false);

    const [
        applyingNutrition,
        setApplyingNutrition,
    ] =
        useState(false);

    useEffect(() => {
        setCurrentSuggestion(
            suggestion,
        );
    }, [
        suggestion,
    ]);

    // =====================================================
    // ITEMS
    // =====================================================

    const items =
        useMemo(
            () =>
                currentSuggestion
                    .items ??
                [],
            [
                currentSuggestion
                    .items,
            ],
        );

    const workoutDays =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (
                            item,
                        ) =>
                            item.itemType ===
                            "WORKOUT_DAY",
                    ),
                ),
            [
                items,
            ],
        );

    const exercises =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (
                            item,
                        ) =>
                            item.itemType ===
                            "EXERCISE",
                    ),
                ),
            [
                items,
            ],
        );

    const nutritionItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (
                            item,
                        ) =>
                            item.itemType ===
                            "NUTRITION" ||
                            item.itemType ===
                            "MEAL",
                    ),
                ),
            [
                items,
            ],
        );

    const warningItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (
                            item,
                        ) =>
                            item.itemType ===
                            "WARNING",
                    ),
                ),
            [
                items,
            ],
        );

    const noteItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (
                            item,
                        ) =>
                            item.itemType ===
                            "NOTE",
                    ),
                ),
            [
                items,
            ],
        );

    const bodyAnalysisItems =
        useMemo(
            () =>
                sortItems(
                    items.filter(
                        (
                            item,
                        ) =>
                            item.itemType ===
                            "BODY_ANALYSIS",
                    ),
                ),
            [
                items,
            ],
        );

    // =====================================================
    // STATE
    // =====================================================

    const isSuccessful =
        currentSuggestion
            .status ===
        "SUCCESS" ||
        currentSuggestion
            .status ===
        "APPLIED";

    const canApplyWorkout =
        isSuccessful &&
        (
            currentSuggestion
                .suggestionType ===
            "FULL_PLAN" ||
            currentSuggestion
                .suggestionType ===
            "WORKOUT_PLAN"
        ) &&
        !currentSuggestion
            .appliedWorkoutPlanId;

    const canApplyNutrition =
        isSuccessful &&
        (
            currentSuggestion
                .suggestionType ===
            "FULL_PLAN" ||
            currentSuggestion
                .suggestionType ===
            "NUTRITION_PLAN"
        ) &&
        !currentSuggestion
            .appliedNutritionPlanId;

    // =====================================================
    // RELOAD
    // =====================================================

    const reloadDetail =
        async (): Promise<
            AiSuggestionDetailResponse
        > => {
            const updated =
                await aiService
                    .getAiSuggestionDetail(
                        currentSuggestion
                            .id,
                    );

            setCurrentSuggestion(
                updated,
            );

            onChanged?.(
                updated,
            );

            return updated;
        };

    // =====================================================
    // APPLY WORKOUT
    // =====================================================

    const handleApplyWorkout =
        async (): Promise<void> => {
            if (
                !canApplyWorkout ||
                applyingWorkout
            ) {
                return;
            }

            try {
                setApplyingWorkout(
                    true,
                );

                const result =
                    await aiService
                        .applyWorkoutPlan(
                            currentSuggestion
                                .id,
                        );

                const updated =
                    await reloadDetail();

                const workoutPlanId =
                    result.workoutPlanId ??
                    updated
                        .appliedWorkoutPlanId;

                toast.success(
                    "Đã tạo giáo án tập luyện từ FitLife AI.",
                );

                if (
                    workoutPlanId
                ) {
                    navigate(
                        buildRoute(
                            ROUTES
                                .MEMBER_WORKOUT_DETAIL,

                            workoutPlanId,
                        ),
                    );

                    return;
                }

                /*
                 * Apply thành công nhưng BE chưa trả ID:
                 * chuyển về list thay vì đứng im.
                 */
                navigate(
                    ROUTES
                        .MEMBER_WORKOUTS,
                );
            } catch (error) {
                toast.error(
                    getApiErrorMessage(
                        error,
                        "Không thể áp dụng kế hoạch tập luyện.",
                    ),
                );
            } finally {
                setApplyingWorkout(
                    false,
                );
            }
        };

    // =====================================================
    // APPLY NUTRITION
    // =====================================================

    const handleApplyNutrition =
        async (): Promise<void> => {
            if (
                !canApplyNutrition ||
                applyingNutrition
            ) {
                return;
            }

            try {
                setApplyingNutrition(
                    true,
                );

                const result =
                    await aiService
                        .applyNutritionPlan(
                            currentSuggestion
                                .id,
                        );

                const updated =
                    await reloadDetail();

                const nutritionPlanId =
                    result.nutritionPlanId ??
                    updated
                        .appliedNutritionPlanId;

                toast.success(
                    "Đã tạo kế hoạch dinh dưỡng từ FitLife AI.",
                );

                if (
                    nutritionPlanId
                ) {
                    navigate(
                        buildRoute(
                            ROUTES
                                .MEMBER_NUTRITION_DETAIL,

                            nutritionPlanId,
                        ),
                    );

                    return;
                }

                navigate(
                    ROUTES
                        .MEMBER_NUTRITION,
                );
            } catch (error) {
                toast.error(
                    getApiErrorMessage(
                        error,
                        "Không thể áp dụng kế hoạch dinh dưỡng.",
                    ),
                );
            } finally {
                setApplyingNutrition(
                    false,
                );
            }
        };

    // =====================================================
    // DAY EXERCISE
    // =====================================================

    const getExercisesForDay = (
        dayNo?:
            number | null,
    ): AiPlanItemResponse[] => {
        return exercises.filter(
            (
                exercise,
            ) =>
                exercise.dayNo ===
                dayNo,
        );
    };

    // =====================================================
    // ERROR STATE
    // =====================================================

    if (
        currentSuggestion
            .status ===
        "FAILED"
    ) {
        return (
            <div
                className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-red-200
                    bg-white
                    shadow-sm
                "
            >
                <div
                    className="
                        bg-gradient-to-br
                        from-red-950
                        via-slate-950
                        to-slate-900
                        p-6
                        text-white
                    "
                >
                    <Badge variant="danger">
                        Thất bại
                    </Badge>

                    <h3 className="mt-4 text-xl font-black">
                        FitLife AI chưa thể hoàn thành yêu cầu
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-red-100">
                        {currentSuggestion
                                .errorMessage ||
                            "Đã xảy ra lỗi khi xử lý dữ liệu AI."}
                    </p>
                </div>

                <div className="p-5">
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            p-4
                        "
                    >
                        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />

                        <div>
                            <p className="font-bold text-red-800">
                                Không có kế hoạch nào được áp dụng.
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                Bạn có thể kiểm tra lại dữ liệu Body Metric và thử tạo lại yêu cầu.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div
            className="
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                text-left
                shadow-sm
            "
        >
            {/* =================================================
             * HERO
             * ================================================= */}

            <div
                className="
                    relative
                    overflow-hidden
                    bg-gradient-to-br
                    from-slate-950
                    via-slate-900
                    to-violet-950
                    p-6
                    text-white
                "
            >
                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-20
                        -top-20
                        h-56
                        w-56
                        rounded-full
                        bg-violet-500/20
                        blur-3xl
                    "
                />

                <div className="relative">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                bg-white/10
                                px-3
                                py-1
                                text-xs
                                font-bold
                                text-violet-100
                            "
                        >
                            <Sparkles className="h-3 w-3" />

                            {getTypeLabel(
                                currentSuggestion
                                    .suggestionType,
                            )}
                        </span>

                        <Badge
                            variant={
                                getStatusVariant(
                                    currentSuggestion
                                        .status,
                                )
                            }
                        >
                            {getStatusLabel(
                                currentSuggestion
                                    .status,
                            )}
                        </Badge>
                    </div>

                    <h3
                        className="
                            mt-4
                            text-xl
                            font-black
                            tracking-tight
                            sm:text-2xl
                        "
                    >
                        {getGoalLabel(
                            currentSuggestion
                                .goal,
                        )}
                    </h3>

                    {currentSuggestion
                        .summary && (
                        <p
                            className="
                                mt-3
                                max-w-3xl
                                text-sm
                                leading-6
                                text-slate-300
                            "
                        >
                            {
                                currentSuggestion
                                    .summary
                            }
                        </p>
                    )}

                    <div
                        className="
                            mt-5
                            flex
                            flex-wrap
                            gap-2
                            text-xs
                            text-slate-300
                        "
                    >
                        {currentSuggestion
                                .workoutDaysPerWeek !=
                            null && (
                                <span className="rounded-lg bg-white/10 px-3 py-1.5">
                                {
                                    currentSuggestion
                                        .workoutDaysPerWeek
                                }{" "}
                                    buổi/tuần
                            </span>
                            )}

                        {currentSuggestion
                                .workoutDurationMinutes !=
                            null && (
                                <span className="rounded-lg bg-white/10 px-3 py-1.5">
                                {
                                    currentSuggestion
                                        .workoutDurationMinutes
                                }{" "}
                                    phút/buổi
                            </span>
                            )}

                        {currentSuggestion
                            .provider && (
                            <span className="rounded-lg bg-white/10 px-3 py-1.5">
                                AI:{" "}
                                {
                                    currentSuggestion
                                        .provider
                                }
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* =================================================
             * CONTENT
             * ================================================= */}

            <div className="space-y-7 p-4 sm:p-6">
                {/* =============================================
                 * WARNING
                 * ============================================= */}

                {(
                    currentSuggestion
                        .warningMessage ||
                    warningItems.length >
                    0
                ) && (
                    <section
                        className="
                            rounded-2xl
                            border
                            border-amber-200
                            bg-amber-50
                            p-4
                        "
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                            <div>
                                <h4 className="font-black text-amber-900">
                                    Cảnh báo và lưu ý an toàn
                                </h4>

                                {currentSuggestion
                                    .warningMessage && (
                                    <p className="mt-1 text-sm leading-6 text-amber-800">
                                        {
                                            currentSuggestion
                                                .warningMessage
                                        }
                                    </p>
                                )}

                                {warningItems.map(
                                    (
                                        warning,
                                    ) => (
                                        <p
                                            key={
                                                warning.id
                                            }
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
                    </section>
                )}

                {/* =============================================
                 * BODY ANALYSIS
                 * ============================================= */}

                {bodyAnalysisItems.length >
                    0 && (
                        <section>
                            <SectionHeader
                                icon={
                                    BarChart3
                                }
                                title="Phân tích cơ thể"
                                subtitle="Đánh giá dựa trên Body Metric mới nhất"
                                className="bg-blue-100 text-blue-700"
                            />

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                {bodyAnalysisItems.map(
                                    (
                                        item,
                                    ) => (
                                        <article
                                            key={
                                                item.id
                                            }
                                            className="
                                            rounded-2xl
                                            border
                                            border-blue-100
                                            bg-blue-50/60
                                            p-4
                                        "
                                        >
                                            {item.title && (
                                                <p className="font-black text-slate-900">
                                                    {
                                                        item.title
                                                    }
                                                </p>
                                            )}

                                            {item.description && (
                                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                                    {
                                                        item.description
                                                    }
                                                </p>
                                            )}
                                        </article>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                {/* =============================================
                 * WORKOUT
                 * ============================================= */}

                {workoutDays.length >
                    0 && (
                        <section>
                            <SectionHeader
                                icon={
                                    Dumbbell
                                }
                                title="Kế hoạch tập luyện"
                                subtitle={`${workoutDays.length} ngày tập được FitLife AI đề xuất`}
                                className="bg-emerald-100 text-emerald-700"
                            />

                            <div className="mt-4 space-y-4">
                                {workoutDays.map(
                                    (
                                        day,
                                    ) => {
                                        const dayExercises =
                                            getExercisesForDay(
                                                day.dayNo,
                                            );

                                        return (
                                            <article
                                                key={
                                                    day.id
                                                }
                                                className="
                                                overflow-hidden
                                                rounded-2xl
                                                border
                                                border-slate-200
                                                bg-slate-50
                                            "
                                            >
                                                <header
                                                    className="
                                                    flex
                                                    flex-col
                                                    gap-3
                                                    border-b
                                                    border-slate-200
                                                    p-4

                                                    sm:flex-row
                                                    sm:items-center
                                                    sm:justify-between
                                                "
                                                >
                                                    <div className="flex items-center gap-3">
                                                    <span
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-xl
                                                            bg-emerald-100
                                                            text-sm
                                                            font-black
                                                            text-emerald-700
                                                        "
                                                    >
                                                        {day.dayNo ??
                                                            "-"}
                                                    </span>

                                                        <div>
                                                            <h5 className="font-black text-slate-900">
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

                                                    {day.durationMinutes !=
                                                        null && (
                                                            <div
                                                                className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            rounded-lg
                                                            bg-white
                                                            px-3
                                                            py-1.5
                                                            text-xs
                                                            font-bold
                                                            text-slate-500
                                                        "
                                                            >
                                                                <CalendarDays className="h-3.5 w-3.5" />

                                                                {
                                                                    day.durationMinutes
                                                                }{" "}
                                                                phút
                                                            </div>
                                                        )}
                                                </header>

                                                <div className="space-y-2 p-4">
                                                    {dayExercises.length ===
                                                    0 ? (
                                                        <p
                                                            className="
                                                            rounded-xl
                                                            border
                                                            border-dashed
                                                            border-slate-200
                                                            bg-white
                                                            p-3
                                                            text-sm
                                                            text-slate-500
                                                        "
                                                        >
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
                                                                    className="
                                                                    flex
                                                                    flex-col
                                                                    gap-3
                                                                    rounded-xl
                                                                    border
                                                                    border-slate-100
                                                                    bg-white
                                                                    p-4

                                                                    sm:flex-row
                                                                    sm:items-center
                                                                    sm:justify-between
                                                                "
                                                                >
                                                                    <div className="flex min-w-0 items-start gap-3">
                                                                        <div
                                                                            className="
                                                                            flex
                                                                            h-9
                                                                            w-9
                                                                            shrink-0
                                                                            items-center
                                                                            justify-center
                                                                            rounded-xl
                                                                            bg-slate-100
                                                                            text-slate-500
                                                                        "
                                                                        >
                                                                            <Dumbbell className="h-4 w-4" />
                                                                        </div>

                                                                        <div className="min-w-0">
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

                                                                    <div
                                                                        className="
                                                                        flex
                                                                        shrink-0
                                                                        flex-wrap
                                                                        gap-2
                                                                        text-xs
                                                                        font-bold
                                                                        text-slate-700
                                                                    "
                                                                    >
                                                                        {exercise.sets !=
                                                                            null && (
                                                                                <MetricChip>
                                                                                    {
                                                                                        exercise.sets
                                                                                    }{" "}
                                                                                    hiệp
                                                                                </MetricChip>
                                                                            )}

                                                                        {exercise.reps && (
                                                                            <MetricChip>
                                                                                {
                                                                                    exercise.reps
                                                                                }{" "}
                                                                                reps
                                                                            </MetricChip>
                                                                        )}

                                                                        {exercise.durationMinutes !=
                                                                            null && (
                                                                                <MetricChip>
                                                                                    {
                                                                                        exercise.durationMinutes
                                                                                    }{" "}
                                                                                    phút
                                                                                </MetricChip>
                                                                            )}

                                                                        {exercise.restSeconds !=
                                                                            null && (
                                                                                <MetricChip>
                                                                                    Nghỉ{" "}
                                                                                    {
                                                                                        exercise.restSeconds
                                                                                    }
                                                                                    s
                                                                                </MetricChip>
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

                {/* =============================================
                 * NUTRITION
                 * ============================================= */}

                {nutritionItems.length >
                    0 && (
                        <section>
                            <SectionHeader
                                icon={
                                    Utensils
                                }
                                title="Kế hoạch dinh dưỡng"
                                subtitle="Bữa ăn và mục tiêu dinh dưỡng được FitLife AI đề xuất"
                                className="bg-orange-100 text-orange-700"
                            />

                            <div
                                className="
                                mt-4
                                grid
                                grid-cols-1
                                gap-3
                                md:grid-cols-2
                            "
                            >
                                {nutritionItems.map(
                                    (
                                        item,
                                    ) => (
                                        <article
                                            key={
                                                item.id
                                            }
                                            className="
                                            rounded-2xl
                                            border
                                            border-orange-100
                                            bg-orange-50/60
                                            p-4
                                        "
                                        >
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-white
                                                    text-orange-600
                                                    shadow-sm
                                                "
                                                >
                                                    {item.itemType ===
                                                    "MEAL" ? (
                                                        <Salad className="h-5 w-5" />
                                                    ) : (
                                                        <Utensils className="h-5 w-5" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <p
                                                        className="
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        text-orange-600
                                                    "
                                                    >
                                                        {item.mealName ||
                                                            item.itemType}
                                                    </p>

                                                    <h5 className="mt-1 font-black text-orange-950">
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
                                                        <span
                                                            className="
                                                        inline-flex
                                                        items-center
                                                        gap-1
                                                        rounded-lg
                                                        bg-white
                                                        px-2.5
                                                        py-1.5
                                                        text-orange-700
                                                    "
                                                        >
                                                    <Flame className="h-3 w-3" />

                                                            {
                                                                item.calories
                                                            }{" "}
                                                            kcal
                                                </span>
                                                    )}

                                                {item.proteinGrams !=
                                                    null && (
                                                        <MetricChip>
                                                            P{" "}
                                                            {
                                                                item.proteinGrams
                                                            }
                                                            g
                                                        </MetricChip>
                                                    )}

                                                {item.carbsGrams !=
                                                    null && (
                                                        <MetricChip>
                                                            C{" "}
                                                            {
                                                                item.carbsGrams
                                                            }
                                                            g
                                                        </MetricChip>
                                                    )}

                                                {item.fatGrams !=
                                                    null && (
                                                        <MetricChip>
                                                            F{" "}
                                                            {
                                                                item.fatGrams
                                                            }
                                                            g
                                                        </MetricChip>
                                                    )}
                                            </div>
                                        </article>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                {/* =============================================
                 * NOTES
                 * ============================================= */}

                {noteItems.length >
                    0 && (
                        <section
                            className="
                            rounded-2xl
                            border
                            border-slate-200
                            bg-slate-50
                            p-4
                        "
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-500" />

                                <h4 className="font-black text-slate-900">
                                    Ghi chú bổ sung
                                </h4>
                            </div>

                            <div className="mt-3 space-y-2">
                                {noteItems.map(
                                    (
                                        note,
                                    ) => (
                                        <p
                                            key={
                                                note.id
                                            }
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

            {/* =================================================
             * APPLY ACTIONS
             * ================================================= */}

            {(
                canApplyWorkout ||
                canApplyNutrition ||
                currentSuggestion
                    .appliedWorkoutPlanId ||
                currentSuggestion
                    .appliedNutritionPlanId
            ) && (
                <footer
                    className="
                        flex
                        flex-col
                        gap-3
                        border-t
                        border-slate-200
                        bg-slate-50
                        p-4

                        sm:flex-row
                        sm:flex-wrap
                        sm:justify-end
                        sm:p-6
                    "
                >
                    {/* WORKOUT APPLIED */}

                    {currentSuggestion
                        .appliedWorkoutPlanId ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <div
                                className="
                                    flex
                                    min-h-11
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-emerald-200
                                    bg-emerald-50
                                    px-4
                                    py-2
                                    text-sm
                                    font-bold
                                    text-emerald-700
                                "
                            >
                                <CheckCircle2 className="h-4 w-4" />

                                Đã tạo giáo án #
                                {
                                    currentSuggestion
                                        .appliedWorkoutPlanId
                                }
                            </div>

                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(
                                        buildRoute(
                                            ROUTES
                                                .MEMBER_WORKOUT_DETAIL,

                                            currentSuggestion
                                                .appliedWorkoutPlanId!,
                                        ),
                                    )
                                }
                            >
                                <ExternalLink className="h-4 w-4" />

                                Xem giáo án
                            </Button>
                        </div>
                    ) : (
                        canApplyWorkout && (
                            <Button
                                variant="primary"
                                isLoading={
                                    applyingWorkout
                                }
                                loadingText="Đang tạo giáo án..."
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

                    {/* NUTRITION APPLIED */}

                    {currentSuggestion
                        .appliedNutritionPlanId ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <div
                                className="
                                    flex
                                    min-h-11
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-orange-200
                                    bg-orange-50
                                    px-4
                                    py-2
                                    text-sm
                                    font-bold
                                    text-orange-700
                                "
                            >
                                <CheckCircle2 className="h-4 w-4" />

                                Đã tạo thực đơn #
                                {
                                    currentSuggestion
                                        .appliedNutritionPlanId
                                }
                            </div>

                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(
                                        buildRoute(
                                            ROUTES
                                                .MEMBER_NUTRITION_DETAIL,

                                            currentSuggestion
                                                .appliedNutritionPlanId!,
                                        ),
                                    )
                                }
                            >
                                <ExternalLink className="h-4 w-4" />

                                Xem dinh dưỡng
                            </Button>
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
                </footer>
            )}
        </div>
    );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function MetricChip({
                        children,
                    }: {
    children:
        React.ReactNode;
}) {
    return (
        <span
            className="
                rounded-lg
                bg-slate-100
                px-2.5
                py-1.5
                text-xs
                font-bold
                text-slate-700
            "
        >
            {children}
        </span>
    );
}

function SectionHeader({
                           icon: Icon,
                           title,
                           subtitle,
                           className,
                       }: {
    icon:
        typeof Dumbbell;

    title:
        string;

    subtitle:
        string;

    className:
        string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    ${className}
                `}
            >
                <Icon className="h-5 w-5" />
            </div>

            <div>
                <h4 className="font-black text-slate-900">
                    {title}
                </h4>

                <p className="text-xs text-slate-500">
                    {subtitle}
                </p>
            </div>
        </div>
    );
}