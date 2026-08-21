import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Droplets,
    Flame,
    RefreshCw,
    Salad,
    Utensils,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";

import {
    ROUTES,
} from "../../config/routes";

import {
    nutritionService,
} from "../../services/nutritionService";

import type {
    NutritionPlan,
} from "../../types/nutrition.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

function formatDate(
    value?:
        string | null,
): string {
    if (!value) {
        return "Chưa xác định";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "vi-VN",
    );
}

function getStatusLabel(
    status:
    string,
): string {
    const labels:
        Record<string, string> = {
        DRAFT:
            "Bản nháp",

        ACTIVE:
            "Đang áp dụng",

        COMPLETED:
            "Đã hoàn thành",

        ARCHIVED:
            "Đã lưu trữ",

        CANCELLED:
            "Đã hủy",
    };

    return (
        labels[status] ??
        status
    );
}

function getSourceLabel(
    source:
    string,
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
            return source;
    }
}

export default function NutritionPlanDetailPage() {
    const navigate =
        useNavigate();

    const {
        id,
    } =
        useParams<{
            id: string;
        }>();

    const planId =
        Number(id);

    const [
        plan,
        setPlan,
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
        actionLoading,
        setActionLoading,
    ] =
        useState(false);

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    const loadPlan =
        useCallback(
            async (): Promise<void> => {
                if (
                    !Number.isInteger(
                        planId,
                    ) ||
                    planId <= 0
                ) {
                    setError(
                        "Nutrition Plan ID không hợp lệ.",
                    );

                    setLoading(
                        false,
                    );

                    return;
                }

                try {
                    setLoading(
                        true,
                    );

                    setError(
                        null,
                    );

                    const result =
                        await nutritionService
                            .getPlanById(
                                planId,
                            );

                    setPlan(
                        result,
                    );
                } catch (requestError) {
                    setPlan(
                        null,
                    );

                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Không thể tải chi tiết kế hoạch dinh dưỡng.",
                        ),
                    );
                } finally {
                    setLoading(
                        false,
                    );
                }
            },
            [
                planId,
            ],
        );

    useEffect(() => {
        void loadPlan();
    }, [
        loadPlan,
    ]);

    const handleActivate =
        async (): Promise<void> => {
            if (
                !plan ||
                plan.status !==
                "DRAFT"
            ) {
                return;
            }

            try {
                setActionLoading(
                    true,
                );

                await nutritionService
                    .activatePlan(
                        plan.id,
                    );

                toast.success(
                    "Đã kích hoạt kế hoạch dinh dưỡng.",
                );

                await loadPlan();
            } catch (requestError) {
                toast.error(
                    getApiErrorMessage(
                        requestError,
                        "Không thể kích hoạt kế hoạch.",
                    ),
                );
            } finally {
                setActionLoading(
                    false,
                );
            }
        };

    if (loading) {
        return (
            <Loading label="Đang tải kế hoạch dinh dưỡng..." />
        );
    }

    if (
        error ||
        !plan
    ) {
        return (
            <Card className="mx-auto max-w-2xl p-10 text-center">
                <AlertTriangle className="mx-auto h-14 w-14 text-red-400" />

                <h1 className="mt-4 text-xl font-black text-slate-900">
                    Không thể tải kế hoạch
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    {error ||
                        "Kế hoạch không tồn tại."}
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

                        Quay lại
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => {
                            void loadPlan();
                        }}
                    >
                        Thử lại
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* HEADER */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                ROUTES.MEMBER_NUTRITION,
                            )
                        }
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />

                        Quay lại dinh dưỡng
                    </button>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge
                            variant={
                                plan.status ===
                                "ACTIVE"
                                    ? "success"
                                    : plan.status ===
                                    "DRAFT"
                                        ? "warning"
                                        : "default"
                            }
                        >
                            {getStatusLabel(
                                plan.status,
                            )}
                        </Badge>

                        <Badge variant="purple">
                            {getSourceLabel(
                                plan.source,
                            )}
                        </Badge>
                    </div>

                    <h1 className="mt-3 max-w-5xl text-3xl font-black tracking-tight text-slate-900">
                        {plan.name}
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {plan.description ||
                            "Chi tiết kế hoạch dinh dưỡng cá nhân hóa."}
                    </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                        variant="outline"
                        disabled={
                            actionLoading
                        }
                        onClick={() => {
                            void loadPlan();
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />

                        Tải lại
                    </Button>

                    {plan.status ===
                        "DRAFT" && (
                            <Button
                                variant="primary"
                                isLoading={
                                    actionLoading
                                }
                                loadingText="Đang kích hoạt..."
                                onClick={() => {
                                    void handleActivate();
                                }}
                            >
                                <CheckCircle2 className="h-4 w-4" />

                                Kích hoạt
                            </Button>
                        )}

                    {plan.status ===
                        "ACTIVE" && (
                            <Button
                                variant="primary"
                                onClick={() =>
                                    navigate(
                                        ROUTES
                                            .MEMBER_NUTRITION_TODAY,
                                    )
                                }
                            >
                                <Utensils className="h-4 w-4" />

                                Thực đơn hôm nay
                            </Button>
                        )}
                </div>
            </div>

            {/* DRAFT NOTICE */}

            {plan.status ===
                "DRAFT" && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                            <div>
                                <p className="font-black text-amber-900">
                                    Kế hoạch này đang là bản nháp
                                </p>

                                <p className="mt-1 text-sm leading-6 text-amber-700">
                                    Hãy kiểm tra thực đơn và kích hoạt để FitLife sử dụng kế hoạch này làm kế hoạch dinh dưỡng hiện tại.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            {/* MACROS */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <Card className="p-5">
                    <Flame className="h-5 w-5 text-orange-600" />

                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Calories
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900">
                        {plan.dailyCalories ??
                            "—"}{" "}
                        kcal
                    </p>
                </Card>

                <MacroCard
                    label="Protein"
                    value={
                        plan.proteinGrams
                    }
                    className="text-emerald-600"
                />

                <MacroCard
                    label="Carbohydrate"
                    value={
                        plan.carbohydrateGrams
                    }
                    className="text-blue-600"
                />

                <MacroCard
                    label="Chất béo"
                    value={
                        plan.fatGrams
                    }
                    className="text-violet-600"
                />

                <Card className="p-5">
                    <Droplets className="h-5 w-5 text-cyan-600" />

                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                        Nước/ngày
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900">
                        {plan.waterMlPerDay ??
                            "—"}{" "}
                        ml
                    </p>
                </Card>
            </section>

            {/* WARNING */}

            {plan.warningMessage && (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        <div>
                            <h2 className="font-black text-amber-900">
                                Lưu ý an toàn
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

            {/* MEALS */}

            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black text-slate-900">
                        Thực đơn
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {plan.meals.length} bữa ăn trong kế hoạch.
                    </p>
                </div>

                {plan.meals.length ===
                0 ? (
                    <Card className="border-dashed p-8 text-center">
                        <Salad className="mx-auto h-12 w-12 text-slate-300" />

                        <p className="mt-3 font-bold text-slate-700">
                            Chưa có bữa ăn trong kế hoạch.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {plan.meals.map(
                            (
                                meal,
                                mealIndex,
                            ) => (
                                <Card
                                    key={`${meal.mealName}-${mealIndex}`}
                                    className="overflow-hidden"
                                >
                                    <div className="border-b border-orange-100 bg-orange-50 p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-orange-700 shadow-sm">
                                                <Utensils className="h-5 w-5" />
                                            </div>

                                            <div>
                                                <h3 className="font-black text-orange-950">
                                                    {
                                                        meal.mealName
                                                    }
                                                </h3>

                                                <p className="text-xs text-orange-700">
                                                    {meal.foods.length} món ăn
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5">
                                        {meal.foods.map(
                                            (
                                                food,
                                                foodIndex,
                                            ) => (
                                                <article
                                                    key={
                                                        food.id ??
                                                        `${mealIndex}-${food.foodName}-${foodIndex}`
                                                    }
                                                    className="rounded-2xl border border-slate-200 p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h4 className="font-black text-slate-900">
                                                                {
                                                                    food.foodName
                                                                }
                                                            </h4>

                                                            {food.portionText && (
                                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                    {
                                                                        food.portionText
                                                                    }
                                                                </p>
                                                            )}

                                                            {food.preparation && (
                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    Chế biến:{" "}
                                                                    {
                                                                        food.preparation
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        {food.calories !=
                                                            null && (
                                                                <span className="shrink-0 rounded-xl bg-orange-100 px-3 py-2 text-sm font-black text-orange-700">
                                                                {
                                                                    food.calories
                                                                }{" "}
                                                                    kcal
                                                            </span>
                                                            )}
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                                                        <MacroMini
                                                            label="Protein"
                                                            value={
                                                                food.proteinGrams
                                                            }
                                                            className="bg-emerald-50 text-emerald-700"
                                                        />

                                                        <MacroMini
                                                            label="Carbs"
                                                            value={
                                                                food.carbohydrateGrams
                                                            }
                                                            className="bg-blue-50 text-blue-700"
                                                        />

                                                        <MacroMini
                                                            label="Fat"
                                                            value={
                                                                food.fatGrams
                                                            }
                                                            className="bg-violet-50 text-violet-700"
                                                        />
                                                    </div>

                                                    {food.substitution && (
                                                        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-700">
                                                            Thay thế:{" "}
                                                            {
                                                                food.substitution
                                                            }
                                                        </p>
                                                    )}

                                                    {food.note && (
                                                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                                                            {
                                                                food.note
                                                            }
                                                        </p>
                                                    )}
                                                </article>
                                            ),
                                        )}
                                    </div>
                                </Card>
                            ),
                        )}
                    </div>
                )}
            </section>

            {/* PLAN INFO */}

            <Card className="p-5">
                <h2 className="font-black text-slate-900">
                    Thông tin kế hoạch
                </h2>

                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Info
                        label="Mục tiêu"
                        value={
                            plan.goal
                        }
                    />

                    <Info
                        label="Thời lượng"
                        value={`${plan.durationWeeks} tuần`}
                    />

                    <Info
                        label="Ngày bắt đầu"
                        value={
                            formatDate(
                                plan.startDate,
                            )
                        }
                    />

                    <Info
                        label="Ngày tạo"
                        value={
                            formatDate(
                                plan.createdAt,
                            )
                        }
                    />
                </div>
            </Card>
        </div>
    );
}

function MacroCard({
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
        <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p
                className={`mt-3 text-2xl font-black ${className}`}
            >
                {value ?? "—"} g
            </p>
        </Card>
    );
}

function MacroMini({
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
            className={`rounded-xl p-2 ${className}`}
        >
            <p className="opacity-60">
                {label}
            </p>

            <p className="mt-1 font-black">
                {value ?? "—"}g
            </p>
        </div>
    );
}

function Info({
                  label,
                  value,
              }: {
    label: string;

    value: string;
}) {
    return (
        <div>
            <p className="text-slate-400">
                {label}
            </p>

            <p className="mt-1 font-bold text-slate-700">
                {value}
            </p>
        </div>
    );
}