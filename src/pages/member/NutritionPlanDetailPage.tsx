import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Copy,
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

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

import { ROUTES } from "../../config/routes";
import { nutritionService } from "../../services/nutritionService";

import type {
    NutritionPlan,
} from "../../types/nutrition.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

function formatDate(
    value?: string | null,
): string {
    if (!value) {
        return "Chưa xác định";
    }

    const date = new Date(value);

    if (
        Number.isNaN(date.getTime())
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "vi-VN",
    );
}

function getStatusLabel(
    status: string,
): string {
    const labels:
        Record<string, string> = {
        DRAFT: "Bản nháp",
        ACTIVE: "Đang áp dụng",
        COMPLETED: "Đã hoàn thành",
        ARCHIVED: "Đã lưu trữ",
        CANCELLED: "Đã hủy",
    };

    return labels[status] ?? status;
}

export default function NutritionPlanDetailPage() {
    const navigate = useNavigate();

    const { id } = useParams<{
        id: string;
    }>();

    const planId = Number(id);

    const [plan, setPlan] =
        useState<NutritionPlan | null>(
            null,
        );

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const loadPlan =
        useCallback(async () => {
            if (
                !Number.isInteger(planId) ||
                planId <= 0
            ) {
                setError(
                    "Nutrition Plan ID không hợp lệ.",
                );

                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError(null);

                const result =
                    await nutritionService
                        .getPlanById(
                            planId,
                        );

                setPlan(result);
            } catch (requestError) {
                setError(
                    getApiErrorMessage(
                        requestError,
                        "Không thể tải chi tiết kế hoạch dinh dưỡng.",
                    ),
                );
            } finally {
                setLoading(false);
            }
        }, [planId]);

    useEffect(() => {
        void loadPlan();
    }, [loadPlan]);

    const handleActivate =
        async (): Promise<void> => {
            if (!plan) {
                return;
            }

            try {
                setActionLoading(true);

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
                setActionLoading(false);
            }
        };

    const handleClone =
        async (): Promise<void> => {
            if (!plan) {
                return;
            }

            try {
                setActionLoading(true);

                const cloned =
                    await nutritionService
                        .clonePlan(
                            plan.id,
                        );

                toast.success(
                    "Đã sao chép kế hoạch.",
                );

                navigate(
                    ROUTES
                        .MEMBER_NUTRITION_DETAIL
                        .replace(
                            ":id",
                            String(cloned.id),
                        ),
                );
            } catch (requestError) {
                toast.error(
                    getApiErrorMessage(
                        requestError,
                        "Không thể sao chép kế hoạch.",
                    ),
                );
            } finally {
                setActionLoading(false);
            }
        };

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        );
    }

    if (error || !plan) {
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

                <div className="mt-6 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(
                                ROUTES.MEMBER_NUTRITION,
                            )
                        }
                    >
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
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

                    <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              {getStatusLabel(
                  plan.status,
              )}
            </span>

                        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
              {plan.source}
            </span>
                    </div>

                    <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                        {plan.name}
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                        {plan.description ||
                            "Chưa có mô tả."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() => {
                            void loadPlan();
                        }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Tải lại
                    </Button>

                    <Button
                        variant="outline"
                        isLoading={actionLoading}
                        onClick={() => {
                            void handleClone();
                        }}
                    >
                        <Copy className="h-4 w-4" />
                        Sao chép
                    </Button>

                    {plan.status === "DRAFT" && (
                        <Button
                            variant="primary"
                            isLoading={actionLoading}
                            loadingText="Đang kích hoạt..."
                            onClick={() => {
                                void handleActivate();
                            }}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Kích hoạt
                        </Button>
                    )}
                </div>
            </div>

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

                <Card className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Protein
                    </p>

                    <p className="mt-3 text-2xl font-black text-emerald-600">
                        {plan.proteinGrams ??
                            "—"}{" "}
                        g
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Carbohydrate
                    </p>

                    <p className="mt-3 text-2xl font-black text-blue-600">
                        {plan.carbohydrateGrams ??
                            "—"}{" "}
                        g
                    </p>
                </Card>

                <Card className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Chất béo
                    </p>

                    <p className="mt-3 text-2xl font-black text-violet-600">
                        {plan.fatGrams ??
                            "—"}{" "}
                        g
                    </p>
                </Card>

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

            {plan.warningMessage && (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        <div>
                            <h2 className="font-black text-amber-900">
                                Lưu ý an toàn
                            </h2>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-amber-800">
                                {plan.warningMessage}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black text-slate-900">
                        Thực đơn trong ngày
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {plan.meals.length} bữa ăn được đề xuất.
                    </p>
                </div>

                {plan.meals.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Salad className="mx-auto h-12 w-12 text-slate-300" />

                        <p className="mt-3 font-bold text-slate-700">
                            Chưa có bữa ăn trong kế hoạch.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {plan.meals.map(
                            (meal, mealIndex) => (
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
                                                    {meal.mealName}
                                                </h3>

                                                <p className="text-xs text-orange-700">
                                                    {meal.foods.length} món ăn
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5">
                                        {meal.foods.map(
                                            (food) => (
                                                <article
                                                    key={food.id}
                                                    className="rounded-2xl border border-slate-200 p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h4 className="font-black text-slate-900">
                                                                {food.preparation ||
                                                                    food.foodName}
                                                            </h4>

                                                            {food.portionText && (
                                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                    {food.portionText}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {food.calories !=
                                                            null && (
                                                                <span className="shrink-0 rounded-xl bg-orange-100 px-3 py-2 text-sm font-black text-orange-700">
                                {food.calories} kcal
                              </span>
                                                            )}
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                                                        <div className="rounded-xl bg-emerald-50 p-2">
                                                            <p className="text-slate-400">
                                                                Protein
                                                            </p>

                                                            <p className="mt-1 font-black text-emerald-700">
                                                                {food.proteinGrams ??
                                                                    "—"}
                                                                g
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-blue-50 p-2">
                                                            <p className="text-slate-400">
                                                                Carbs
                                                            </p>

                                                            <p className="mt-1 font-black text-blue-700">
                                                                {food.carbohydrateGrams ??
                                                                    "—"}
                                                                g
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-violet-50 p-2">
                                                            <p className="text-slate-400">
                                                                Fat
                                                            </p>

                                                            <p className="mt-1 font-black text-violet-700">
                                                                {food.fatGrams ??
                                                                    "—"}
                                                                g
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {food.note && (
                                                        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                                                            {food.note}
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

            <Card className="p-5">
                <h2 className="font-black text-slate-900">
                    Thông tin kế hoạch
                </h2>

                <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-slate-400">
                            Mục tiêu
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                            {plan.goal}
                        </p>
                    </div>

                    <div>
                        <p className="text-slate-400">
                            Thời lượng
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                            {plan.durationWeeks} tuần
                        </p>
                    </div>

                    <div>
                        <p className="text-slate-400">
                            Ngày bắt đầu
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                            {formatDate(
                                plan.startDate,
                            )}
                        </p>
                    </div>

                    <div>
                        <p className="text-slate-400">
                            Ngày tạo
                        </p>

                        <p className="mt-1 font-bold text-slate-700">
                            {formatDate(
                                plan.createdAt,
                            )}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
