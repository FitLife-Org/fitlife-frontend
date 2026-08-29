import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Activity,
    CalendarDays,
    ChevronRight,
    Clock3,
    Dumbbell,
    Sparkles,
    Target,
    UserRound,
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

function buildWorkoutDetailRoute(
    planId:
        string | number,
): string {
    return ROUTES
        .MEMBER_WORKOUT_DETAIL
        .replace(
            ":id",
            String(planId),
        );
}

function getStatusLabel(
    status:
    WorkoutPlanStatus,
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
    status:
    WorkoutPlanStatus,
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
    WorkoutPlanSourceType,
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

export default function WorkoutPlansPage() {
    const containerRef =
        usePageAnimation();

    const navigate =
        useNavigate();

    const [
        plans,
        setPlans,
    ] =
        useState<
            WorkoutPlan[]
        >([]);

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
                description="Theo dõi các kế hoạch tập luyện được tạo bởi FitLife AI, huấn luyện viên hoặc chính bạn."
                action={
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
                }
            />

            {plans.length ===
            0 ? (
                <EmptyWorkoutState
                    onCreate={() =>
                        navigate(
                            ROUTES.MEMBER_AI,
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
                         }: {
    plan:
        WorkoutPlan;

    onView:
        () => void;
}) {
    const totalDays =
        plan.totalDays ??
        0;

    const trainingDays =
        plan.trainingDays ??
        0;

    const restDays =
        Math.max(
            0,
            totalDays -
            trainingDays,
        );

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

                                <span
                                    className="
                        rounded-full
                        bg-slate-100
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        text-slate-500
                      "
                                >
                    {getSourceLabel(
                        plan.sourceType,
                    )}
                  </span>
                            </div>

                            <h2
                                className="
                      mt-4
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
                                <Target className="h-4 w-4" />

                                {plan.goal ||
                                    "Chưa xác định mục tiêu"}
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
                        <Stat
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

                        <Stat
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

                        <Stat
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

                        <Stat
                            icon={
                                UserRound
                            }
                            label="Số ngày"
                            value={
                                String(
                                    totalDays,
                                )
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div
                    className="
                grid
                grid-cols-2
                gap-3
              "
                >
                    <div
                        className="
                  rounded-2xl
                  border
                  border-emerald-100
                  bg-emerald-50/60
                  p-4
                "
                    >
                        <p className="text-xs font-bold text-emerald-600">
                            Ngày tập
                        </p>

                        <p className="mt-1 text-2xl font-black text-emerald-900">
                            {trainingDays}
                        </p>
                    </div>

                    <div
                        className="
                  rounded-2xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                "
                    >
                        <p className="text-xs font-bold text-slate-500">
                            Ngày nghỉ
                        </p>

                        <p className="mt-1 text-2xl font-black text-slate-800">
                            {restDays}
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-400">
                    Xem chi tiết để theo dõi từng ngày tập và danh sách bài tập trong giáo án.
                </p>

                <Button
                    variant="outline"
                    className="mt-5 w-full"
                    onClick={
                        onView
                    }
                >
                    Xem chi tiết

                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}

function Stat({
                  icon: Icon,
                  label,
                  value,
              }: {
    icon:
        typeof Activity;

    label:
        string;

    value:
        string;
}) {
    return (
        <div className="rounded-xl bg-slate-50 p-3">
            <Icon className="h-4 w-4 text-slate-400" />

            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-0.5 font-black text-slate-800">
                {value}
            </p>
        </div>
    );
}

function EmptyWorkoutState({
                               onCreate,
                           }: {
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
              max-w-md
              text-sm
              leading-6
              text-slate-500
            "
            >
                FitLife AI có thể phân tích mục tiêu và Body Metric để tạo giáo án phù hợp cho bạn.
            </p>

            <Button
                variant="primary"
                className="mt-6"
                onClick={
                    onCreate
                }
            >
                <Sparkles className="h-4 w-4" />

                Tạo giáo án bằng AI
            </Button>
        </Card>
    );
}