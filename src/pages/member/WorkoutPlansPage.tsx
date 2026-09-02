import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    CalendarDays,
    ChevronRight,
    Clock3,
    Dumbbell,
    Eye,
    Pencil,
    Plus,
    Sparkles,
    Target,
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
    workoutService,
} from "../../services/workoutService";

import type {
    WorkoutPlan,
    WorkoutPlanSourceType,
    WorkoutPlanStatus,
} from "../../types/workout.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

import {
    showAlert,
} from "../../utils/alert";

function buildWorkoutDetailRoute(
    id: number,
): string {
    return ROUTES
        .MEMBER_WORKOUT_DETAIL
        .replace(
            ":id",
            String(id),
        );
}

function buildWorkoutEditRoute(
    planId: number,
): string {
    return ROUTES
        .MEMBER_WORKOUT_EDIT
        .replace(
            ":id",
            String(planId),
        );
}

function getStatusLabel(
    status: WorkoutPlanStatus,
): string {
    switch (status) {
        case "ACTIVE":
            return "Đang áp dụng";

        case "DRAFT":
            return "Bản nháp";

        case "COMPLETED":
            return "Hoàn thành";

        case "ARCHIVED":
            return "Đã lưu trữ";

        case "CANCELLED":
            return "Đã hủy";

        default:
            return status;
    }
}

function getStatusVariant(
    status: WorkoutPlanStatus,
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
    source: WorkoutPlanSourceType,
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

function canEditPlan(
    plan: WorkoutPlan,
): boolean {
    const editableSource =
        plan.sourceType === "AI_GENERATED" ||
        plan.sourceType === "MEMBER_CREATED" ||
        plan.sourceType === "MANUAL";

    const editableStatus =
        plan.status === "DRAFT" ||
        plan.status === "ACTIVE";

    return (
        editableSource &&
        editableStatus
    );
}

export default function WorkoutPlansPage() {
    const containerRef =
        usePageAnimation();

    const navigate =
        useNavigate();

    const [
        plans,
        setPlans,
    ] =
        useState<WorkoutPlan[]>(
            [],
        );

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const fetchPlans =
        useCallback(
            async (): Promise<void> => {
                try {
                    setLoading(
                        true,
                    );

                    const data =
                        await workoutService
                            .getMyWorkoutPlans();

                    setPlans(
                        data,
                    );
                } catch (error) {
                    setPlans(
                        [],
                    );

                    void showAlert.error(
                        "Đã xảy ra lỗi",
                        getApiErrorMessage(
                            error,
                            "Không thể tải danh sách giáo án.",
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
        void fetchPlans();
    }, [
        fetchPlans,
    ]);

    const activePlanCount =
        useMemo(
            () =>
                plans.filter(
                    (
                        plan,
                    ) =>
                        plan.status ===
                        "ACTIVE",
                ).length,
            [
                plans,
            ],
        );

    const editablePlanCount =
        useMemo(
            () =>
                plans.filter(
                    canEditPlan,
                ).length,
            [
                plans,
            ],
        );

    if (loading) {
        return (
            <Loading label="Đang tải danh sách giáo án..." />
        );
    }

    return (
        <div
            ref={containerRef}
            className="space-y-6 pb-10"
        >
            <PageHeader
                eyebrow="Workout"
                title="Giáo án của tôi"
                description="Quản lý các giáo án tập luyện được tạo bởi FitLife AI, huấn luyện viên hoặc chính bạn."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    ROUTES
                                        .MEMBER_WORKOUT_CREATE,
                                )
                            }
                        >
                            <Plus className="h-4 w-4" />

                            Tạo thủ công
                        </Button>

                        <Button
                            variant="primary"
                            onClick={() =>
                                navigate(
                                    ROUTES
                                        .MEMBER_AI,
                                )
                            }
                        >
                            <Sparkles className="h-4 w-4" />

                            Tạo bằng AI
                        </Button>
                    </div>
                }
            />

            <section
                className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-3
                "
            >
                <SummaryCard
                    label="Tổng giáo án"
                    value={
                        plans.length
                    }
                />

                <SummaryCard
                    label="Đang áp dụng"
                    value={
                        activePlanCount
                    }
                />

                <SummaryCard
                    label="Có thể chỉnh sửa"
                    value={
                        editablePlanCount
                    }
                />
            </section>

            {plans.length ===
            0 ? (
                <EmptyWorkoutState
                    onManual={() =>
                        navigate(
                            ROUTES
                                .MEMBER_WORKOUT_CREATE,
                        )
                    }
                    onAi={() =>
                        navigate(
                            ROUTES
                                .MEMBER_AI,
                        )
                    }
                />
            ) : (
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-5
                        xl:grid-cols-2
                    "
                >
                    {plans.map(
                        (
                            plan,
                        ) => (
                            <WorkoutPlanCard
                                key={
                                    plan.id
                                }
                                plan={
                                    plan
                                }
                                onView={() =>
                                    navigate(
                                        buildWorkoutDetailRoute(
                                            plan.id,
                                        ),
                                    )
                                }
                                onEdit={() =>
                                    navigate(
                                        buildWorkoutEditRoute(
                                            plan.id,
                                        ),
                                    )
                                }
                            />
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

function WorkoutPlanCard({
                             plan,
                             onView,
                             onEdit,
                         }: {
    plan: WorkoutPlan;

    onView: () => void;

    onEdit: () => void;
}) {
    const editable =
        canEditPlan(
            plan,
        );

    const totalDays =
        plan.totalDays ??
        0;

    const trainingDays =
        plan.trainingDays ??
        0;

    return (
        <Card
            className="
                group
                overflow-hidden
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-lg
            "
        >
            <div
                className="
                    relative
                    overflow-hidden
                    border-b
                    border-slate-100
                    p-6
                "
            >
                <div
                    className="
                        pointer-events-none
                        absolute
                        -right-16
                        -top-20
                        h-40
                        w-40
                        rounded-full
                        bg-emerald-100
                        blur-3xl
                    "
                />

                <div className="relative">
                    <div
                        className="
                            flex
                            items-start
                            justify-between
                            gap-4
                        "
                    >
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
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
                                        plan.sourceType,
                                    )}
                                </Badge>

                                {editable && (
                                    <Badge variant="info">
                                        Có thể chỉnh sửa
                                    </Badge>
                                )}
                            </div>

                            <h2
                                className="
                                    mt-4
                                    line-clamp-2
                                    text-xl
                                    font-black
                                    tracking-tight
                                    text-slate-950
                                "
                            >
                                {plan.name}
                            </h2>

                            <p
                                className="
                                    mt-2
                                    flex
                                    items-center
                                    gap-2
                                    text-sm
                                    text-slate-500
                                "
                            >
                                <Target className="h-4 w-4 shrink-0" />

                                <span className="line-clamp-1">
                                    {plan.goal ||
                                        "Chưa xác định mục tiêu"}
                                </span>
                            </p>
                        </div>

                        <div
                            className="
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-2xl
                                bg-emerald-100
                                text-emerald-700
                            "
                        >
                            <Dumbbell className="h-6 w-6" />
                        </div>
                    </div>

                    <div
                        className="
                            mt-5
                            grid
                            grid-cols-2
                            gap-3
                            sm:grid-cols-4
                        "
                    >
                        <PlanStat
                            icon={
                                CalendarDays
                            }
                            label="Tuần"
                            value={
                                plan.durationWeeks !=
                                null
                                    ? String(
                                        plan.durationWeeks,
                                    )
                                    : "-"
                            }
                        />

                        <PlanStat
                            icon={
                                Activity
                            }
                            label="Buổi/tuần"
                            value={
                                plan.workoutDaysPerWeek !=
                                null
                                    ? String(
                                        plan.workoutDaysPerWeek,
                                    )
                                    : "-"
                            }
                        />

                        <PlanStat
                            icon={
                                Clock3
                            }
                            label="Phút/buổi"
                            value={
                                plan.workoutDurationMinutes !=
                                null
                                    ? String(
                                        plan.workoutDurationMinutes,
                                    )
                                    : "-"
                            }
                        />

                        <PlanStat
                            icon={
                                Dumbbell
                            }
                            label="Ngày tập"
                            value={
                                String(
                                    trainingDays ||
                                    totalDays,
                                )
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-2 text-sm">
                    <PlanInfoRow
                        label="Trình độ"
                        value={
                            plan.experienceLevel
                                ? plan
                                    .experienceLevel
                                    .toLowerCase()
                                    .replace(
                                        /_/g,
                                        " ",
                                    )
                                : "-"
                        }
                    />

                    <PlanInfoRow
                        label="Tổng ngày"
                        value={`${totalDays} ngày`}
                    />

                    <PlanInfoRow
                        label="Nguồn"
                        value={
                            getSourceLabel(
                                plan.sourceType,
                            )
                        }
                    />

                    <PlanInfoRow
                        label="Trạng thái"
                        value={
                            getStatusLabel(
                                plan.status,
                            )
                        }
                    />
                </div>

                <div
                    className="
                        mt-6
                        grid
                        grid-cols-1
                        gap-2
                        sm:grid-cols-2
                    "
                >
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={
                            onView
                        }
                    >
                        <Eye className="h-4 w-4" />

                        Xem chi tiết

                        <ChevronRight className="ml-auto h-4 w-4" />
                    </Button>

                    {editable ? (
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={
                                onEdit
                            }
                        >
                            <Pencil className="h-4 w-4" />

                            Chỉnh sửa
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            disabled
                            className="w-full"
                        >
                            <Pencil className="h-4 w-4" />

                            Chỉ đọc
                        </Button>
                    )}
                </div>

                {plan.sourceType ===
                    "TRAINER_CREATED" && (
                        <p
                            className="
                                mt-3
                                text-xs
                                leading-5
                                text-slate-400
                            "
                        >
                            Giáo án do huấn luyện viên tạo không thể chỉnh sửa trực tiếp bởi hội viên.
                        </p>
                    )}

                {(plan.status ===
                    "COMPLETED" ||
                    plan.status ===
                    "ARCHIVED") && (
                    <p
                        className="
                                mt-3
                                text-xs
                                leading-5
                                text-slate-400
                            "
                    >
                        Giáo án ở trạng thái này chỉ có thể xem lại.
                    </p>
                )}
            </div>
        </Card>
    );
}

function PlanStat({
                      icon: Icon,
                      label,
                      value,
                  }: {
    icon: typeof Activity;

    label: string;

    value: string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <Icon className="h-4 w-4 text-slate-400" />

            <p
                className="
                    mt-2
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-400
                "
            >
                {label}
            </p>

            <p className="mt-0.5 font-black text-slate-800">
                {value}
            </p>
        </div>
    );
}

function PlanInfoRow({
                         label,
                         value,
                     }: {
    label: string;

    value: string;
}) {
    return (
        <div
            className="
                flex
                items-start
                justify-between
                gap-4
            "
        >
            <span className="text-slate-500">
                {label}
            </span>

            <span className="text-right font-semibold text-slate-700">
                {value}
            </span>
        </div>
    );
}

function SummaryCard({
                         label,
                         value,
                     }: {
    label: string;

    value: number;
}) {
    return (
        <Card className="p-5">
            <p
                className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                "
            >
                {label}
            </p>

            <p className="mt-2 text-3xl font-black text-slate-900">
                {value}
            </p>
        </Card>
    );
}

function EmptyWorkoutState({
                               onManual,
                               onAi,
                           }: {
    onManual: () => void;

    onAi: () => void;
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
                    bg-emerald-100
                    text-emerald-700
                "
            >
                <Dumbbell className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
                Chưa có giáo án tập luyện
            </h3>

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
                Bạn có thể tự xây dựng giáo án hoặc để FitLife AI tạo kế hoạch dựa trên mục tiêu và dữ liệu cơ thể.
            </p>

            <div
                className="
                    mt-6
                    flex
                    flex-col
                    justify-center
                    gap-2
                    sm:flex-row
                "
            >
                <Button
                    variant="outline"
                    onClick={
                        onManual
                    }
                >
                    <Plus className="h-4 w-4" />

                    Tạo thủ công
                </Button>

                <Button
                    variant="primary"
                    onClick={
                        onAi
                    }
                >
                    <Sparkles className="h-4 w-4" />

                    Tạo bằng AI
                </Button>
            </div>
        </Card>
    );
}