import {
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    Clock3,
    Dumbbell,
    Gauge,
    Play,
    Target,
    UserRound,
    type LucideIcon,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { showAlert } from "../../utils/alert";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";

import {
    ROUTES,
} from "../../config/routes";

import {
    workoutService,
} from "../../services/workoutService";

import type {
    WorkoutPlan,
    WorkoutPlanDay,
    WorkoutPlanStatus,
} from "../../types/workout.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

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

function formatDayLabel(
    day:
    WorkoutPlanDay,
    index:
    number,
): string {
    if (day.name) {
        return day.name;
    }

    if (day.dayNo) {
        return `Ngày ${day.dayNo}`;
    }

    return `Ngày ${index + 1}`;
}

export default function WorkoutPlanDetailPage() {
    const navigate =
        useNavigate();

    const {
        id,
    } =
        useParams<{
            id: string;
        }>();

    const [
        plan,
        setPlan,
    ] =
        useState<
            WorkoutPlan | null
        >(null);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(null);

    const [
        activating,
        setActivating,
    ] =
        useState(false);

    const loadPlan =
        useCallback(
            async (): Promise<void> => {
                const planId =
                    Number(id);

                if (
                    !Number.isInteger(
                        planId,
                    ) ||
                    planId <= 0
                ) {
                    setError(
                        "Workout Plan ID không hợp lệ.",
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
                        await workoutService
                            .getWorkoutPlanDetails(
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
                            "Không thể tải chi tiết giáo án.",
                        ),
                    );
                } finally {
                    setLoading(
                        false,
                    );
                }
            },
            [
                id,
            ],
        );

    useEffect(() => {
        void loadPlan();
    }, [
        loadPlan,
    ]);

    const handleActivatePlan =
        async (): Promise<void> => {
            if (
                !plan ||
                plan.status !== "DRAFT"
            ) {
                return;
            }

            try {
                setActivating(
                    true,
                );

                const activatedPlan =
                    await workoutService
                        .activateWorkoutPlan(
                            plan.id,
                        );

                setPlan(
                    activatedPlan,
                );

                void showAlert.success("Thành công", 
                    "Đã kích hoạt giáo án thành công.",
                );
            } catch (requestError) {
                void showAlert.error("Đã xảy ra lỗi", 
                    getApiErrorMessage(
                        requestError,
                        "Không thể kích hoạt giáo án.",
                    ),
                );
            } finally {
                setActivating(
                    false,
                );
            }
        };

    if (loading) {
        return (
            <Loading label="Đang tải chi tiết giáo án..." />
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
                    Không thể tải giáo án
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    {error ||
                        "Giáo án không tồn tại."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(
                                ROUTES.MEMBER_WORKOUTS,
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

    const days =
        plan.days ?? [];

    const trainingDays =
        days.filter(
            (
                day,
            ) =>
                !day.isRestDay,
        );

    return (
        <div className="space-y-6 pb-10">
            {/* =================================================
       * HEADER
       * ================================================= */}

            <div>
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            ROUTES.MEMBER_WORKOUTS,
                        )
                    }
                    className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-slate-500
            transition
            hover:text-slate-900
          "
                >
                    <ArrowLeft className="h-4 w-4" />

                    Quay lại giáo án
                </button>

                <div
                    className="
            mt-5
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-start
            lg:justify-between
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

                            {plan.sourceType && (
                                <Badge variant="purple">
                                    {
                                        plan.sourceType ===
                                        "AI_GENERATED"
                                            ? "AI"
                                            : plan.sourceType
                                    }
                                </Badge>
                            )}
                        </div>

                        <h1
                            className="
                mt-3
                max-w-5xl
                text-3xl
                font-black
                tracking-tight
                text-slate-950
              "
                        >
                            {plan.name}
                        </h1>

                        {plan.description ? (
                            <p
                                className="
                  mt-2
                  max-w-4xl
                  text-sm
                  leading-6
                  text-slate-500
                "
                            >
                                {plan.description}
                            </p>
                        ) : (
                            <p className="mt-2 text-sm text-slate-500">
                                Chi tiết kế hoạch tập luyện của bạn.
                            </p>
                        )}
                    </div>

                    {/* =============================================
           * PLAN ACTIONS
           * ============================================= */}

                    <div className="flex shrink-0 flex-wrap gap-2">
                        {plan.status ===
                            "DRAFT" && (
                                <Button
                                    variant="primary"
                                    isLoading={
                                        activating
                                    }
                                    loadingText="Đang kích hoạt..."
                                    onClick={() => {
                                        void handleActivatePlan();
                                    }}
                                >
                                    <Play className="h-4 w-4" />

                                    Kích hoạt giáo án
                                </Button>
                            )}

                        {plan.status ===
                            "ACTIVE" && (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={() =>
                                            navigate(
                                                ROUTES
                                                    .MEMBER_WORKOUT_TODAY,
                                            )
                                        }
                                    >
                                        <Dumbbell className="h-4 w-4" />

                                        Tập hôm nay
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            navigate(
                                                ROUTES
                                                    .MEMBER_SCHEDULE,
                                            )
                                        }
                                    >
                                        <CalendarDays className="h-4 w-4" />

                                        Lịch tuần
                                    </Button>
                                </>
                            )}
                    </div>
                </div>
            </div>

            {/* =================================================
       * DRAFT NOTICE
       * ================================================= */}

            {plan.status ===
                "DRAFT" && (
                    <div
                        className="
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            p-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
                    >
                        <div>
                            <p className="font-black text-amber-900">
                                Giáo án này đang là bản nháp
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-700">
                                Hãy kiểm tra kế hoạch và kích hoạt để FitLife sử dụng giáo án này cho buổi tập hôm nay và lịch tập.
                            </p>
                        </div>

                        <Button
                            variant="primary"
                            isLoading={
                                activating
                            }
                            loadingText="Đang kích hoạt..."
                            onClick={() => {
                                void handleActivatePlan();
                            }}
                            className="shrink-0"
                        >
                            <Play className="h-4 w-4" />

                            Kích hoạt
                        </Button>
                    </div>
                )}

            {/* =================================================
       * SUMMARY
       * ================================================= */}

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
                        Target
                    }
                    label="Mục tiêu"
                    value={
                        plan.goal ||
                        "-"
                    }
                />

                <SummaryCard
                    icon={
                        Gauge
                    }
                    label="Trình độ"
                    value={
                        plan.experienceLevel ||
                        "-"
                    }
                />

                <SummaryCard
                    icon={
                        CalendarDays
                    }
                    label="Thời lượng"
                    value={
                        plan.durationWeeks !=
                        null
                            ? `${plan.durationWeeks} tuần`
                            : "-"
                    }
                />

                <SummaryCard
                    icon={
                        Activity
                    }
                    label="Ngày tập"
                    value={`${trainingDays.length}`}
                />

                <SummaryCard
                    icon={
                        Clock3
                    }
                    label="Phút / buổi"
                    value={
                        plan.workoutDurationMinutes !=
                        null
                            ? `${plan.workoutDurationMinutes}`
                            : "-"
                    }
                />
            </section>

            {/* =================================================
       * TRAINER / NOTE
       * ================================================= */}

            {(plan.trainerName ||
                plan.note ||
                plan.sourceType ===
                "AI_GENERATED") && (
                <Card className="p-5">
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
                bg-blue-100
                text-blue-700
              "
                        >
                            <UserRound className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="font-black text-slate-900">
                                Hướng dẫn
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {plan.trainerName
                                    ? `Huấn luyện viên: ${plan.trainerName}`
                                    : "Được tạo bởi FitLife AI"}
                            </p>

                            {plan.note && (
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                    {
                                        plan.note
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* =================================================
       * DAYS
       * ================================================= */}

            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black text-slate-900">
                        Lịch tập chi tiết
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Các ngày và bài tập trong giáo án.
                    </p>
                </div>

                {days.length ===
                0 ? (
                    <Card className="border-dashed p-10 text-center">
                        <Dumbbell className="mx-auto h-14 w-14 text-slate-300" />

                        <p className="mt-4 font-bold text-slate-700">
                            Giáo án chưa có cấu trúc ngày tập.
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-5">
                        {days.map(
                            (
                                day,
                                dayIndex,
                            ) => (
                                <WorkoutDayCard
                                    key={
                                        day.id ??
                                        `${plan.id}-${dayIndex}`
                                    }
                                    day={
                                        day
                                    }
                                    index={
                                        dayIndex
                                    }
                                />
                            ),
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

function WorkoutDayCard({
                            day,
                            index,
                        }: {
    day:
        WorkoutPlanDay;

    index:
        number;
}) {
    const exercises =
        day.exercises ??
        [];

    return (
        <Card className="overflow-hidden">
            <header
                className={`
          border-b
          border-slate-100
          p-5

          ${
                    day.isRestDay
                        ? "bg-slate-50"
                        : "bg-emerald-50/50"
                }
        `}
            >
                <div
                    className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                font-black

                ${
                                day.isRestDay
                                    ? "bg-slate-200 text-slate-500"
                                    : "bg-emerald-100 text-emerald-700"
                            }
              `}
                        >
                            {day.dayNo ??
                                index + 1}
                        </div>

                        <div>
                            <h3 className="font-black text-slate-900">
                                {formatDayLabel(
                                    day,
                                    index,
                                )}
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500">
                                {day.isRestDay
                                    ? "Ngày nghỉ phục hồi"
                                    : `${exercises.length} bài tập`}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {day.dayOfWeek && (
                            <Badge variant="default">
                                {
                                    day.dayOfWeek
                                }
                            </Badge>
                        )}

                        {day.focusArea && (
                            <Badge variant="success">
                                {
                                    day.focusArea
                                }
                            </Badge>
                        )}

                        {day.estimatedMinutes !=
                            null && (
                                <Badge variant="info">
                                    {
                                        day.estimatedMinutes
                                    }{" "}
                                    phút
                                </Badge>
                            )}
                    </div>
                </div>

                {day.note && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {day.note}
                    </p>
                )}
            </header>

            {!day.isRestDay && (
                <div className="p-5">
                    {exercises.length ===
                    0 ? (
                        <div
                            className="
                rounded-xl
                border
                border-dashed
                border-slate-200
                bg-slate-50
                p-5
                text-center
                text-sm
                text-slate-500
              "
                        >
                            Chưa có bài tập trong ngày này.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {exercises.map(
                                (
                                    exercise,
                                    exerciseIndex,
                                ) => (
                                    <article
                                        key={
                                            exercise.id ??
                                            `${exercise.exerciseName}-${exerciseIndex}`
                                        }
                                        className="
                      rounded-2xl
                      border
                      border-slate-100
                      bg-slate-50
                      p-4
                    "
                                    >
                                        <div
                                            className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
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
                            bg-white
                            text-emerald-600
                            shadow-sm
                          "
                                                >
                                                    <Dumbbell className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0">
                                                    <h4 className="font-black text-slate-900">
                                                        {
                                                            exercise.exerciseName
                                                        }
                                                    </h4>

                                                    {exercise.targetMuscle && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Nhóm cơ:{" "}
                                                            {
                                                                exercise.targetMuscle
                                                            }
                                                        </p>
                                                    )}

                                                    {exercise.instruction && (
                                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                            {
                                                                exercise.instruction
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
                        "
                                            >
                                                {exercise.sets !=
                                                    null && (
                                                        <Metric>
                                                            {
                                                                exercise.sets
                                                            }{" "}
                                                            hiệp
                                                        </Metric>
                                                    )}

                                                {exercise.reps && (
                                                    <Metric>
                                                        {
                                                            exercise.reps
                                                        }{" "}
                                                        reps
                                                    </Metric>
                                                )}

                                                {exercise.restSeconds !=
                                                    null && (
                                                        <Metric>
                                                            Nghỉ{" "}
                                                            {
                                                                exercise.restSeconds
                                                            }
                                                            s
                                                        </Metric>
                                                    )}

                                                {exercise.durationMinutes !=
                                                    null && (
                                                        <Metric>
                                                            {
                                                                exercise.durationMinutes
                                                            }{" "}
                                                            phút
                                                        </Metric>
                                                    )}
                                            </div>
                                        </div>

                                        {exercise.note && (
                                            <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                                                Lưu ý:{" "}
                                                {
                                                    exercise.note
                                                }
                                            </p>
                                        )}
                                    </article>
                                ),
                            )}
                        </div>
                    )}
                </div>
            )}
        </Card>
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
            <Icon className="h-5 w-5 text-emerald-600" />

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

function Metric({
                    children,
                }: {
    children:
        ReactNode;
}) {
    return (
        <span
            className="
        rounded-lg
        bg-white
        px-2.5
        py-1.5
        text-xs
        font-bold
        text-slate-700
        shadow-sm
      "
        >
      {children}
    </span>
    );
}