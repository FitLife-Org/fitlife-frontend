import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    ChevronRight,
    Flame,
    Plus,
    RefreshCw,
    Salad,
    Sparkles,
    Utensils,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import { showAlert } from "../../utils/alert";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import PageHeader from "../../components/common/PageHeader";

import {
    ROUTES,
} from "../../config/routes";

import {
    nutritionService,
} from "../../services/nutritionService";

import type {
    NutritionPlan,
    NutritionPlanStatus,
} from "../../types/nutrition.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

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
    value?:
        string | null,
): string {
    if (!value) {
        return "Chưa xác định";
    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime(),
    )
        ? value
        : date.toLocaleDateString(
            "vi-VN",
        );
}

function getStatusLabel(
    status:
        NutritionPlanStatus | string,
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

function getStatusVariant(
    status:
        NutritionPlanStatus | string,
):
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default" {
    switch (status) {
        case "ACTIVE":
            return "success";

        case "DRAFT":
            return "warning";

        case "COMPLETED":
            return "info";

        case "CANCELLED":
            return "danger";

        default:
            return "default";
    }
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

export default function NutritionPage() {
    const navigate =
        useNavigate();

    const [
        plans,
        setPlans,
    ] =
        useState<
            NutritionPlan[]
        >([]);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        activatingId,
        setActivatingId,
    ] =
        useState<
            number | null
        >(null);

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    const loadPlans =
        useCallback(
            async (): Promise<void> => {
                try {
                    setLoading(
                        true,
                    );

                    setError(
                        null,
                    );

                    const page =
                        await nutritionService
                            .getMyPlans(
                                0,
                                20,
                            );

                    setPlans(
                        page.content ??
                        [],
                    );
                } catch (requestError) {
                    setPlans(
                        [],
                    );

                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Không thể tải kế hoạch dinh dưỡng.",
                        ),
                    );
                } finally {
                    setLoading(
                        false,
                    );
                }
            },
            [],
        );

    useEffect(() => {
        void loadPlans();
    }, [
        loadPlans,
    ]);

    /*
     * Chỉ ACTIVE mới được dùng
     * cho dashboard dinh dưỡng.
     */
    const activePlan =
        plans.find(
            (
                plan,
            ) =>
                plan.status ===
                "ACTIVE",
        ) ??
        null;

    const handleActivate =
        async (
            plan:
            NutritionPlan,
        ): Promise<void> => {
            if (
                activatingId !==
                null
            ) {
                return;
            }

            try {
                setActivatingId(
                    plan.id,
                );

                await nutritionService
                    .activatePlan(
                        plan.id,
                    );

                void showAlert.success("Thành công", 
                    "Đã kích hoạt kế hoạch dinh dưỡng.",
                );

                await loadPlans();
            } catch (requestError) {
                void showAlert.error("Đã xảy ra lỗi", 
                    getApiErrorMessage(
                        requestError,
                        "Không thể kích hoạt kế hoạch.",
                    ),
                );
            } finally {
                setActivatingId(
                    null,
                );
            }
        };

    if (loading) {
        return (
            <Loading label="Đang tải kế hoạch dinh dưỡng..." />
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                eyebrow="Nutrition"
                title="Dinh dưỡng"
                description="Theo dõi calories, macro và thực đơn phù hợp với mục tiêu hiện tại."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                void loadPlans();
                            }}
                        >
                            <RefreshCw className="h-4 w-4" />

                            Tải lại
                        </Button>

                        {activePlan && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(
                                        ROUTES
                                            .MEMBER_NUTRITION_TODAY,
                                    )
                                }
                            >
                                <Utensils className="h-4 w-4" />

                                Hôm nay
                            </Button>
                        )}

                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate(
                                    ROUTES.MEMBER_AI,
                                )
                            }
                        >
                            <Sparkles className="h-4 w-4" />

                            Tạo bằng AI
                        </Button>
                    </div>
                }
            />

            {error ? (
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
            ) : plans.length ===
            0 ? (
                <Card className="border-dashed p-10 text-center sm:p-14">
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
                        <Sparkles className="h-4 w-4" />

                        Tạo kế hoạch bằng AI
                    </Button>
                </Card>
            ) : (
                <>
                    {/* ACTIVE PLAN */}

                    {activePlan ? (
                        <>
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

                                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <Badge variant="success">
                                            Kế hoạch đang áp dụng
                                        </Badge>

                                        <h2 className="mt-4 text-2xl font-black">
                                            {
                                                activePlan.name
                                            }
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-300">
                                            {activePlan.description ||
                                                activePlan.goal}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
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
                                </div>
                            </section>

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

                                <MacroCard
                                    label="Protein"
                                    value={
                                        activePlan.proteinGrams
                                    }
                                    className="text-emerald-600"
                                />

                                <MacroCard
                                    label="Carbohydrate"
                                    value={
                                        activePlan.carbohydrateGrams
                                    }
                                    className="text-blue-600"
                                />

                                <MacroCard
                                    label="Chất béo"
                                    value={
                                        activePlan.fatGrams
                                    }
                                    className="text-violet-600"
                                />
                            </section>
                        </>
                    ) : (
                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                rounded-2xl
                                border
                                border-amber-200
                                bg-amber-50
                                p-5
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >
                            <div>
                                <p className="font-black text-amber-900">
                                    Chưa có kế hoạch ACTIVE
                                </p>

                                <p className="mt-1 text-sm text-amber-700">
                                    Chọn một kế hoạch bản nháp bên dưới và kích hoạt để sử dụng làm thực đơn hiện tại.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ALL PLANS */}

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
                            {plans.map(
                                (
                                    plan,
                                ) => (
                                    <Card
                                        key={
                                            plan.id
                                        }
                                        className="overflow-hidden"
                                    >
                                        <div className="p-5 sm:p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge
                                                            variant={
                                                                getStatusVariant(
                                                                    plan.status,
                                                                )
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

                                                    <h3 className="mt-3 text-xl font-black text-slate-900">
                                                        {
                                                            plan.name
                                                        }
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
                                                <InfoCell
                                                    label="Mục tiêu"
                                                    value={
                                                        plan.goal
                                                    }
                                                />

                                                <InfoCell
                                                    label="Số bữa"
                                                    value={`${plan.mealsPerDay ?? plan.meals.length} bữa/ngày`}
                                                />

                                                <InfoCell
                                                    label="Thời lượng"
                                                    value={`${plan.durationWeeks} tuần`}
                                                />

                                                <InfoCell
                                                    label="Ngày tạo"
                                                    value={
                                                        formatDate(
                                                            plan.createdAt,
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {plan.status ===
                                                    "DRAFT" && (
                                                        <Button
                                                            variant="primary"
                                                            isLoading={
                                                                activatingId ===
                                                                plan.id
                                                            }
                                                            loadingText="Đang kích hoạt..."
                                                            disabled={
                                                                activatingId !==
                                                                null &&
                                                                activatingId !==
                                                                plan.id
                                                            }
                                                            onClick={() => {
                                                                void handleActivate(
                                                                    plan,
                                                                );
                                                            }}
                                                        >
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
                                                            Hôm nay
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
                                ),
                            )}
                        </div>
                    </section>
                </>
            )}
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
                className={`mt-2 text-2xl font-black ${className}`}
            >
                {value ?? "—"} g
            </p>
        </Card>
    );
}

function InfoCell({
                      label,
                      value,
                  }: {
    label: string;

    value: string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p className="mt-1 break-words font-bold text-slate-700">
                {value}
            </p>
        </div>
    );
}