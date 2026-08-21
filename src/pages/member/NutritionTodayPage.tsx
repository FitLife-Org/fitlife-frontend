import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    ArrowLeft,
    Droplets,
    Flame,
    RefreshCw,
    Salad,
    Sparkles,
    Utensils,
    type LucideIcon,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";

import {
    ROUTES,
} from "../../config/routes";

import {
    usePageAnimation,
} from "../../hooks/usePageAnimation";

import {
    nutritionService,
} from "../../services/nutritionService";

import type {
    NutritionFood,
    NutritionPlan,
} from "../../types/nutrition.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

function buildNutritionDetailRoute(
    planId: number,
): string {
    return ROUTES
        .MEMBER_NUTRITION_DETAIL
        .replace(
            ":id",
            String(planId),
        );
}

function formatToday(): string {
    return new Intl.DateTimeFormat(
        "vi-VN",
        {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        },
    ).format(
        new Date(),
    );
}

function getGoalLabel(
    goal?: string | null,
): string {
    if (!goal) {
        return "Chưa xác định";
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
            "Duy trì thể trạng",

        IMPROVE_ENDURANCE:
            "Cải thiện sức bền",
    };

    return (
        labels[goal] ??
        goal
    );
}

function getSourceLabel(
    source?: string | null,
): string {
    switch (source) {
        case "AI_GENERATED":
            return "FitLife AI";

        case "TRAINER_CREATED":
            return "Huấn luyện viên";

        case "MEMBER_CREATED":
            return "Hội viên";

        case "MANUAL":
            return "Thủ công";

        default:
            return source ||
                "FitLife";
    }
}

export default function NutritionTodayPage() {
    const containerRef =
        usePageAnimation();

    const navigate =
        useNavigate();

    const [
        activePlan,
        setActivePlan,
    ] =
        useState<
            NutritionPlan | null
        >(null);

    const [
        todayPlan,
        setTodayPlan,
    ] =
        useState<
            NutritionPlan | null
        >(null);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        refreshing,
        setRefreshing,
    ] =
        useState(false);

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    const loadTodayNutrition =
        useCallback(
            async (
                silent = false,
            ): Promise<void> => {
                try {
                    if (silent) {
                        setRefreshing(
                            true,
                        );
                    } else {
                        setLoading(
                            true,
                        );
                    }

                    setError(
                        null,
                    );

                    /*
                     * Giống Workout:
                     *
                     * 1. Kiểm tra ACTIVE trước.
                     * 2. Chỉ gọi /me/today nếu
                     *    tồn tại ACTIVE plan.
                     */
                    const active =
                        await nutritionService
                            .getActivePlan();

                    setActivePlan(
                        active,
                    );

                    if (!active) {
                        setTodayPlan(
                            null,
                        );

                        return;
                    }

                    const today =
                        await nutritionService
                            .getTodayPlan();

                    setTodayPlan(
                        today,
                    );
                } catch (requestError) {
                    setTodayPlan(
                        null,
                    );

                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Không thể tải thực đơn hôm nay.",
                        ),
                    );
                } finally {
                    setLoading(
                        false,
                    );

                    setRefreshing(
                        false,
                    );
                }
            },
            [],
        );

    useEffect(() => {
        void loadTodayNutrition();
    }, [
        loadTodayNutrition,
    ]);

    /*
     * Nếu API /today trả plan riêng,
     * dùng todayPlan.
     *
     * activePlan chỉ dùng thông tin
     * tổng quan và navigation.
     */
    const plan =
        todayPlan ??
        activePlan;

    const meals =
        useMemo(
            () =>
                todayPlan
                    ?.meals ??
                [],
            [
                todayPlan,
            ],
        );

    const totalMealCalories =
        useMemo(
            () =>
                meals.reduce(
                    (
                        total,
                        meal,
                    ) =>
                        total +
                        meal.foods.reduce(
                            (
                                mealTotal,
                                food,
                            ) =>
                                mealTotal +
                                (
                                    food.calories ??
                                    0
                                ),
                            0,
                        ),
                    0,
                ),
            [
                meals,
            ],
        );

    if (loading) {
        return (
            <Loading label="Đang tải thực đơn hôm nay..." />
        );
    }

    if (
        error &&
        !activePlan
    ) {
        return (
            <div
                ref={
                    containerRef
                }
                className="pb-10"
            >
                <Card className="mx-auto max-w-2xl p-10 text-center">
                    <AlertTriangle className="mx-auto h-14 w-14 text-red-400" />

                    <h1 className="mt-4 text-xl font-black text-slate-900">
                        Không thể tải thực đơn
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    ROUTES.MEMBER_NUTRITION,
                                )
                            }
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Kế hoạch dinh dưỡng
                        </Button>

                        <Button
                            variant="primary"
                            onClick={() => {
                                void loadTodayNutrition();
                            }}
                        >
                            <RefreshCw className="h-4 w-4" />

                            Thử lại
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div
            ref={
                containerRef
            }
            className="space-y-6 pb-10"
        >
            <PageHeader
                eyebrow="Today's Nutrition"
                title="Dinh dưỡng hôm nay"
                description={
                    formatToday()
                }
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    ROUTES.MEMBER_NUTRITION,
                                )
                            }
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Kế hoạch
                        </Button>

                        <Button
                            variant="outline"
                            disabled={
                                refreshing
                            }
                            onClick={() => {
                                void loadTodayNutrition(
                                    true,
                                );
                            }}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            Làm mới
                        </Button>
                    </div>
                }
            />

            {!activePlan ? (
                <NoActiveNutritionPlan
                    onViewPlans={() =>
                        navigate(
                            ROUTES.MEMBER_NUTRITION,
                        )
                    }
                    onCreate={() =>
                        navigate(
                            ROUTES.MEMBER_AI,
                        )
                    }
                />
            ) : !todayPlan ? (
                <NoTodayNutrition
                    activePlan={
                        activePlan
                    }
                    onViewPlan={() =>
                        navigate(
                            buildNutritionDetailRoute(
                                activePlan.id,
                            ),
                        )
                    }
                />
            ) : plan ? (
                <>
                    {/* =========================================
                     * ACTIVE PLAN
                     * ========================================= */}

                    <section
                        className="
                            relative
                            overflow-hidden
                            rounded-3xl
                            bg-gradient-to-br
                            from-slate-950
                            via-slate-900
                            to-orange-950
                            p-6
                            text-white
                            shadow-lg
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
                                bg-orange-500/20
                                blur-3xl
                            "
                        />

                        <div
                            className="
                                relative
                                flex
                                flex-col
                                gap-5
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            "
                        >
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="success">
                                        Kế hoạch đang áp dụng
                                    </Badge>

                                    <span
                                        className="
                                            rounded-full
                                            bg-white/10
                                            px-3
                                            py-1
                                            text-[11px]
                                            font-bold
                                            text-slate-300
                                        "
                                    >
                                        {getSourceLabel(
                                            plan.source,
                                        )}
                                    </span>
                                </div>

                                <h2 className="mt-4 text-2xl font-black tracking-tight">
                                    {
                                        plan.name
                                    }
                                </h2>

                                <p className="mt-2 text-sm text-slate-300">
                                    Mục tiêu:{" "}
                                    <span className="font-bold text-white">
                                        {getGoalLabel(
                                            plan.goal,
                                        )}
                                    </span>
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(
                                        buildNutritionDetailRoute(
                                            plan.id,
                                        ),
                                    )
                                }
                                className="
                                    border-white/20
                                    bg-white/10
                                    text-white
                                    hover:bg-white/20
                                "
                            >
                                Xem toàn bộ kế hoạch
                            </Button>
                        </div>
                    </section>

                    {/* =========================================
                     * DAILY SUMMARY
                     * ========================================= */}

                    <section
                        className="
                            grid
                            grid-cols-2
                            gap-4
                            lg:grid-cols-5
                        "
                    >
                        <SummaryCard
                            icon={
                                Flame
                            }
                            label="Calories"
                            value={
                                plan.dailyCalories !=
                                null
                                    ? `${plan.dailyCalories} kcal`
                                    : totalMealCalories >
                                    0
                                        ? `${totalMealCalories} kcal`
                                        : "—"
                            }
                        />

                        <SummaryCard
                            icon={
                                Salad
                            }
                            label="Protein"
                            value={
                                plan.proteinGrams !=
                                null
                                    ? `${plan.proteinGrams} g`
                                    : "—"
                            }
                        />

                        <SummaryCard
                            icon={
                                Utensils
                            }
                            label="Carbs"
                            value={
                                plan.carbohydrateGrams !=
                                null
                                    ? `${plan.carbohydrateGrams} g`
                                    : "—"
                            }
                        />

                        <SummaryCard
                            icon={
                                Flame
                            }
                            label="Chất béo"
                            value={
                                plan.fatGrams !=
                                null
                                    ? `${plan.fatGrams} g`
                                    : "—"
                            }
                        />

                        <SummaryCard
                            icon={
                                Droplets
                            }
                            label="Nước"
                            value={
                                plan.waterMlPerDay !=
                                null
                                    ? `${plan.waterMlPerDay} ml`
                                    : "—"
                            }
                        />
                    </section>

                    {/* =========================================
                     * WARNING
                     * ========================================= */}

                    {plan.warningMessage && (
                        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                                <div>
                                    <h2 className="font-black text-amber-900">
                                        Lưu ý
                                    </h2>

                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-800">
                                        {
                                            plan.warningMessage
                                        }
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* =========================================
                     * MEALS
                     * ========================================= */}

                    <section>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">
                                    Thực đơn hôm nay
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    {meals.length} bữa ăn trong kế hoạch hôm nay.
                                </p>
                            </div>

                            {plan.mealsPerDay !=
                                null && (
                                    <Badge variant="purple">
                                        Mục tiêu{" "}
                                        {
                                            plan.mealsPerDay
                                        }{" "}
                                        bữa/ngày
                                    </Badge>
                                )}
                        </div>

                        {meals.length ===
                        0 ? (
                            <Card className="border-dashed p-10 text-center">
                                <Salad className="mx-auto h-14 w-14 text-slate-300" />

                                <h3 className="mt-4 font-black text-slate-800">
                                    Chưa có bữa ăn
                                </h3>

                                <p className="mt-2 text-sm text-slate-500">
                                    Kế hoạch hôm nay chưa có dữ liệu bữa ăn.
                                </p>
                            </Card>
                        ) : (
                            <div className="grid gap-5 xl:grid-cols-2">
                                {meals.map(
                                    (
                                        meal,
                                        mealIndex,
                                    ) => (
                                        <Card
                                            key={`${meal.mealName}-${mealIndex}`}
                                            className="overflow-hidden"
                                        >
                                            <header
                                                className="
                                                    border-b
                                                    border-orange-100
                                                    bg-orange-50
                                                    p-5
                                                "
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="
                                                            flex
                                                            h-11
                                                            w-11
                                                            items-center
                                                            justify-center
                                                            rounded-2xl
                                                            bg-white
                                                            text-orange-700
                                                            shadow-sm
                                                        "
                                                    >
                                                        <Utensils className="h-5 w-5" />
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-wider text-orange-500">
                                                            Bữa{" "}
                                                            {mealIndex +
                                                                1}
                                                        </p>

                                                        <h3 className="font-black text-orange-950">
                                                            {
                                                                meal.mealName
                                                            }
                                                        </h3>

                                                        <p className="mt-0.5 text-xs text-orange-700">
                                                            {
                                                                meal.foods
                                                                    .length
                                                            }{" "}
                                                            món
                                                        </p>
                                                    </div>
                                                </div>
                                            </header>

                                            <div className="space-y-3 p-5">
                                                {meal.foods.map(
                                                    (
                                                        food,
                                                        foodIndex,
                                                    ) => (
                                                        <FoodCard
                                                            key={
                                                                food.id ??
                                                                `${mealIndex}-${food.foodName}-${foodIndex}`
                                                            }
                                                            food={
                                                                food
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </Card>
                                    ),
                                )}
                            </div>
                        )}
                    </section>

                    {/* =========================================
                     * EXTRA GUIDANCE
                     * ========================================= */}

                    {(plan.foodsToLimit ||
                        plan.substitutionNote ||
                        plan.trainerNote ||
                        plan.memberNote) && (
                        <Card className="p-5 sm:p-6">
                            <h2 className="font-black text-slate-900">
                                Hướng dẫn thêm
                            </h2>

                            <div className="mt-4 space-y-4">
                                {plan.foodsToLimit && (
                                    <Guidance
                                        label="Thực phẩm nên hạn chế"
                                        value={
                                            plan.foodsToLimit
                                        }
                                    />
                                )}

                                {plan.substitutionNote && (
                                    <Guidance
                                        label="Gợi ý thay thế"
                                        value={
                                            plan.substitutionNote
                                        }
                                    />
                                )}

                                {plan.trainerNote && (
                                    <Guidance
                                        label="Ghi chú huấn luyện viên"
                                        value={
                                            plan.trainerNote
                                        }
                                    />
                                )}

                                {plan.memberNote && (
                                    <Guidance
                                        label="Ghi chú cá nhân"
                                        value={
                                            plan.memberNote
                                        }
                                    />
                                )}
                            </div>
                        </Card>
                    )}
                </>
            ) : null}
        </div>
    );
}

function FoodCard({
                      food,
                  }: {
    food:
        NutritionFood;
}) {
    return (
        <article
            className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-4
            "
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h4 className="font-black text-slate-900">
                        {
                            food.foodName
                        }
                    </h4>

                    {food.portionText && (
                        <p className="mt-1 text-sm text-slate-500">
                            {
                                food.portionText
                            }
                        </p>
                    )}

                    {(food.quantity !=
                        null ||
                        food.unit) && (
                        <p className="mt-1 text-xs text-slate-400">
                            {food.quantity ??
                                ""}{" "}
                            {food.unit ??
                                ""}
                        </p>
                    )}

                    {food.preparation && (
                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Chế biến:{" "}
                            {
                                food.preparation
                            }
                        </p>
                    )}
                </div>

                {food.calories !=
                    null && (
                        <span
                            className="
                            shrink-0
                            rounded-xl
                            bg-orange-100
                            px-3
                            py-2
                            text-sm
                            font-black
                            text-orange-700
                        "
                        >
                        {
                            food.calories
                        }{" "}
                            kcal
                    </span>
                    )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
                <FoodMacro
                    label="Protein"
                    value={
                        food.proteinGrams
                    }
                    className="bg-emerald-50 text-emerald-700"
                />

                <FoodMacro
                    label="Carbs"
                    value={
                        food.carbohydrateGrams
                    }
                    className="bg-blue-50 text-blue-700"
                />

                <FoodMacro
                    label="Fat"
                    value={
                        food.fatGrams
                    }
                    className="bg-violet-50 text-violet-700"
                />
            </div>

            {food.substitution && (
                <p
                    className="
                        mt-3
                        rounded-xl
                        bg-blue-50
                        p-3
                        text-xs
                        leading-5
                        text-blue-700
                    "
                >
                    Có thể thay bằng:{" "}
                    {
                        food.substitution
                    }
                </p>
            )}

            {food.note && (
                <p
                    className="
                        mt-3
                        rounded-xl
                        bg-white
                        p-3
                        text-xs
                        leading-5
                        text-slate-500
                    "
                >
                    {
                        food.note
                    }
                </p>
            )}
        </article>
    );
}

function FoodMacro({
                       label,
                       value,
                       className,
                   }: {
    label: string;

    value?:
        number | null;

    className:
        string;
}) {
    return (
        <div
            className={`rounded-xl p-2 text-center text-xs ${className}`}
        >
            <p className="opacity-60">
                {label}
            </p>

            <p className="mt-1 font-black">
                {value ??
                    "—"}
                g
            </p>
        </div>
    );
}

function SummaryCard({
                         icon: Icon,
                         label,
                         value,
                     }: {
    icon:
        LucideIcon;

    label:
        string;

    value:
        string;
}) {
    return (
        <Card className="p-4 sm:p-5">
            <div
                className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-100
                    text-orange-700
                "
            >
                <Icon className="h-4 w-4" />
            </div>

            <p
                className="
                    mt-3
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                "
            >
                {label}
            </p>

            <p className="mt-1 break-words font-black text-slate-900">
                {value}
            </p>
        </Card>
    );
}

function Guidance({
                      label,
                      value,
                  }: {
    label: string;

    value:
        string;
}) {
    return (
        <div
            className="
                rounded-xl
                bg-slate-50
                p-4
            "
        >
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {value}
            </p>
        </div>
    );
}

function NoActiveNutritionPlan({
                                   onViewPlans,
                                   onCreate,
                               }: {
    onViewPlans:
        () => void;

    onCreate:
        () => void;
}) {
    return (
        <Card
            className="
                border-dashed
                p-10
                text-center
                sm:p-14
            "
        >
            <div
                className="
                    mx-auto
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-orange-100
                    text-orange-700
                "
            >
                <Salad className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
                Chưa có kế hoạch dinh dưỡng đang áp dụng
            </h2>

            <p
                className="
                    mx-auto
                    mt-2
                    max-w-lg
                    text-sm
                    leading-6
                    text-slate-500
                "
            >
                Kế hoạch AI sau khi áp dụng được lưu dưới dạng bản nháp. Hãy kiểm tra và kích hoạt kế hoạch trước.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button
                    variant="outline"
                    onClick={
                        onViewPlans
                    }
                >
                    <Utensils className="h-4 w-4" />

                    Xem kế hoạch
                </Button>

                <Button
                    variant="primary"
                    onClick={
                        onCreate
                    }
                >
                    <Sparkles className="h-4 w-4" />

                    Tạo bằng AI
                </Button>
            </div>
        </Card>
    );
}

function NoTodayNutrition({
                              activePlan,
                              onViewPlan,
                          }: {
    activePlan:
        NutritionPlan;

    onViewPlan:
        () => void;
}) {
    return (
        <>
            <section
                className="
                    rounded-3xl
                    bg-slate-950
                    p-6
                    text-white
                "
            >
                <Badge variant="success">
                    Kế hoạch đang áp dụng
                </Badge>

                <h2 className="mt-3 text-xl font-black">
                    {
                        activePlan.name
                    }
                </h2>
            </section>

            <Card className="border-dashed p-10 text-center sm:p-14">
                <Salad className="mx-auto h-14 w-14 text-slate-300" />

                <h2 className="mt-4 text-xl font-black text-slate-900">
                    Chưa có thực đơn cho hôm nay
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                    Kế hoạch đang hoạt động nhưng Backend chưa trả về thực đơn tương ứng với ngày hiện tại.
                </p>

                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={
                        onViewPlan
                    }
                >
                    Xem kế hoạch đầy đủ
                </Button>
            </Card>
        </>
    );
}