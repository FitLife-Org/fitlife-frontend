import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    CalendarDays,
    ChevronRight,
    Flame,
    Plus,
    RefreshCw,
    Salad,
    Utensils,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

import { ROUTES } from "../../config/routes";
import { nutritionService } from "../../services/nutritionService";

import type {
    NutritionPlan,
} from "../../types/nutrition.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

import {
    getCurrentMemberId,
} from "../../utils/currentMember";

function buildDetailRoute(
    id: number,
): string {
    return ROUTES
        .MEMBER_NUTRITION_DETAIL
        .replace(
            ":id",
            String(id),
        );
}

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

function getStatusClass(
    status: string,
): string {
    switch (status) {
        case "ACTIVE":
            return "bg-emerald-100 text-emerald-700";

        case "COMPLETED":
            return "bg-blue-100 text-blue-700";

        case "ARCHIVED":
            return "bg-slate-200 text-slate-600";

        case "CANCELLED":
            return "bg-red-100 text-red-700";

        default:
            return "bg-amber-100 text-amber-700";
    }
}

export default function NutritionPage() {
    const navigate = useNavigate();

    const [plans, setPlans] =
        useState<NutritionPlan[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const loadPlans =
        useCallback(async () => {
            try {
                setLoading(true);
                setError(null);

                const memberId =
                    getCurrentMemberId();

                const page =
                    await nutritionService
                        .getPlansByMember(
                            memberId,
                            0,
                            20,
                        );

                setPlans(
                    page.content ?? [],
                );
            } catch (requestError) {
                setError(
                    getApiErrorMessage(
                        requestError,
                        "Không thể tải kế hoạch dinh dưỡng.",
                    ),
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        void loadPlans();
    }, [loadPlans]);

    const activePlan =
        plans.find(
            (plan) =>
                plan.status === "ACTIVE",
        ) ??
        plans[0] ??
        null;

    const handleActivate =
        async (
            plan: NutritionPlan,
        ): Promise<void> => {
            try {
                const memberId =
                    getCurrentMemberId();

                await nutritionService
                    .activatePlan(
                        plan.id,
                        memberId,
                    );

                toast.success(
                    "Đã kích hoạt kế hoạch dinh dưỡng.",
                );

                await loadPlans();
            } catch (requestError) {
                toast.error(
                    getApiErrorMessage(
                        requestError,
                        "Không thể kích hoạt kế hoạch.",
                    ),
                );
            }
        };

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Dinh dưỡng"
                description="Theo dõi calories, macro và thực đơn phù hợp với mục tiêu hiện tại."
                action={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            disabled={loading}
                            onClick={() => {
                                void loadPlans();
                            }}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            Tải lại
                        </Button>

                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate(
                                    ROUTES.MEMBER_AI,
                                )
                            }
                        >
                            <Plus className="h-4 w-4" />
                            Tạo bằng AI
                        </Button>
                    </div>
                }
            />

            {loading ? (
                <div className="flex min-h-72 items-center justify-center">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
                </div>
            ) : error ? (
                <Card className="p-8 text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />

                    <h2 className="mt-4 text-lg font-black text-slate-900">
                        Không thể tải dữ liệu
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error}
                    </p>

                    <Button
                        variant="outline"
                        onClick={() => {
                            void loadPlans();
                        }}
                        className="mt-5"
                    >
                        Thử lại
                    </Button>
                </Card>
            ) : plans.length === 0 ? (
                <Card className="p-10 text-center">
                    <Salad className="mx-auto h-16 w-16 text-slate-300" />

                    <h2 className="mt-4 text-xl font-black text-slate-900">
                        Chưa có kế hoạch dinh dưỡng
                    </h2>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                        Hãy sử dụng FitLife AI để tạo kế hoạch calories, macro và bữa ăn phù hợp.
                    </p>

                    <Button
                        variant="primary"
                        onClick={() =>
                            navigate(
                                ROUTES.MEMBER_AI,
                            )
                        }
                        className="mt-6"
                    >
                        Tạo kế hoạch bằng AI
                    </Button>
                </Card>
            ) : (
                <>
                    {activePlan && (
                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Card className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                                        <Flame className="h-5 w-5" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Calories/ngày
                                        </p>

                                        <p className="mt-1 text-xl font-black text-slate-900">
                                            {activePlan.dailyCalories ??
                                                "—"}{" "}
                                            kcal
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Protein
                                </p>

                                <p className="mt-2 text-2xl font-black text-emerald-600">
                                    {activePlan.proteinGrams ??
                                        "—"}{" "}
                                    g
                                </p>
                            </Card>

                            <Card className="p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Carbohydrate
                                </p>

                                <p className="mt-2 text-2xl font-black text-blue-600">
                                    {activePlan.carbohydrateGrams ??
                                        "—"}{" "}
                                    g
                                </p>
                            </Card>

                            <Card className="p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Chất béo
                                </p>

                                <p className="mt-2 text-2xl font-black text-violet-600">
                                    {activePlan.fatGrams ??
                                        "—"}{" "}
                                    g
                                </p>
                            </Card>
                        </section>
                    )}

                    <section>
                        <div className="mb-4">
                            <h2 className="text-xl font-black text-slate-900">
                                Kế hoạch của tôi
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Xem và quản lý các kế hoạch dinh dưỡng đã tạo.
                            </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            {plans.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className="overflow-hidden"
                                >
                                    <div className="p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                                plan.status,
                            )}`}
                        >
                          {getStatusLabel(
                              plan.status,
                          )}
                        </span>

                                                <h3 className="mt-3 text-xl font-black text-slate-900">
                                                    {plan.name}
                                                </h3>

                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                                    {plan.description ||
                                                        "Chưa có mô tả."}
                                                </p>
                                            </div>

                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                                                <Utensils className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs text-slate-400">
                                                    Mục tiêu
                                                </p>

                                                <p className="mt-1 font-bold text-slate-700">
                                                    {plan.goal}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs text-slate-400">
                                                    Số bữa
                                                </p>

                                                <p className="mt-1 font-bold text-slate-700">
                                                    {plan.mealsPerDay ??
                                                        plan.meals.length}{" "}
                                                    bữa/ngày
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs text-slate-400">
                                                    Thời lượng
                                                </p>

                                                <p className="mt-1 font-bold text-slate-700">
                                                    {plan.durationWeeks} tuần
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-slate-50 p-3">
                                                <p className="text-xs text-slate-400">
                                                    Ngày tạo
                                                </p>

                                                <p className="mt-1 font-bold text-slate-700">
                                                    {formatDate(
                                                        plan.createdAt,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {plan.status ===
                                                "DRAFT" && (
                                                    <Button
                                                        variant="primary"
                                                        onClick={() => {
                                                            void handleActivate(
                                                                plan,
                                                            );
                                                        }}
                                                    >
                                                        Kích hoạt
                                                    </Button>
                                                )}

                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    navigate(
                                                        buildDetailRoute(
                                                            plan.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Xem chi tiết
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}