import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Dumbbell,
    Gauge,
    Moon,
    RefreshCw,
    Sparkles,
    Target,
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
    workoutService,
} from "../../services/workoutService";

import type {
    WorkoutExercise,
    WorkoutPlan,
    WorkoutPlanDay,
} from "../../types/workout.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

function buildWorkoutDetailRoute(
    planId: number,
): string {
    return ROUTES
        .MEMBER_WORKOUT_DETAIL
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
    value?:
        string | null,
): string {
    if (!value) {
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
            "Duy trì thể lực",

        IMPROVE_ENDURANCE:
            "Cải thiện sức bền",
    };

    return (
        labels[value] ??
        value
    );
}

function getExerciseMeta(
    exercise:
    WorkoutExercise,
): string[] {
    const values:
        string[] = [];

    if (
        exercise.sets !=
        null
    ) {
        values.push(
            `${exercise.sets} hiệp`,
        );
    }

    if (
        exercise.reps
    ) {
        values.push(
            `${exercise.reps} reps`,
        );
    }

    if (
        exercise.durationMinutes !=
        null
    ) {
        values.push(
            `${exercise.durationMinutes} phút`,
        );
    }

    if (
        exercise.distanceKm !=
        null
    ) {
        values.push(
            `${exercise.distanceKm} km`,
        );
    }

    if (
        exercise.restSeconds !=
        null
    ) {
        values.push(
            `Nghỉ ${exercise.restSeconds}s`,
        );
    }

    return values;
}

export default function WorkoutTodayPage() {
    const containerRef =
        usePageAnimation();

    const navigate =
        useNavigate();

    const [
        activePlan,
        setActivePlan,
    ] =
        useState<
            WorkoutPlan | null
        >(null);

    const [
        todayDay,
        setTodayDay,
    ] =
        useState<
            WorkoutPlanDay | null
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

    const loadTodayWorkout =
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
                     * Quan trọng:
                     *
                     * 1. Kiểm tra ACTIVE plan trước.
                     * 2. Chỉ gọi /today nếu ACTIVE tồn tại.
                     *
                     * Như vậy tránh việc Backend bị gọi
                     * /active + /today cùng lúc khi member
                     * chưa kích hoạt giáo án.
                     */
                    const plan =
                        await workoutService
                            .getActiveWorkoutPlan();

                    setActivePlan(
                        plan,
                    );

                    if (!plan) {
                        setTodayDay(
                            null,
                        );

                        return;
                    }

                    const day =
                        await workoutService
                            .getTodayWorkoutDay();

                    setTodayDay(
                        day,
                    );
                } catch (requestError) {
                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Không thể tải buổi tập hôm nay.",
                        ),
                    );

                    setTodayDay(
                        null,
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
        void loadTodayWorkout();
    }, [
        loadTodayWorkout,
    ]);

    const exercises =
        useMemo(
            () =>
                todayDay
                    ?.exercises ??
                [],
            [
                todayDay,
            ],
        );

    const estimatedMinutes =
        useMemo(
            () => {
                if (
                    todayDay
                        ?.estimatedMinutes !=
                    null
                ) {
                    return todayDay
                        .estimatedMinutes;
                }

                if (
                    activePlan
                        ?.workoutDurationMinutes !=
                    null
                ) {
                    return activePlan
                        .workoutDurationMinutes;
                }

                const exerciseMinutes =
                    exercises.reduce(
                        (
                            total,
                            exercise,
                        ) =>
                            total +
                            (
                                exercise.durationMinutes ??
                                0
                            ),
                        0,
                    );

                return exerciseMinutes >
                0
                    ? exerciseMinutes
                    : null;
            },
            [
                activePlan,
                todayDay,
                exercises,
            ],
        );

    if (loading) {
        return (
            <Loading label="Đang tải buổi tập hôm nay..." />
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
                        Không thể tải buổi tập
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
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

                            Giáo án của tôi
                        </Button>

                        <Button
                            variant="primary"
                            onClick={() => {
                                void loadTodayWorkout();
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
                eyebrow="Today's Workout"
                title="Buổi tập hôm nay"
                description={
                    formatToday()
                }
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    ROUTES.MEMBER_WORKOUTS,
                                )
                            }
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Giáo án
                        </Button>

                        <Button
                            variant="outline"
                            disabled={
                                refreshing
                            }
                            onClick={() => {
                                void loadTodayWorkout(
                                    true,
                                );
                            }}
                        >
                            <RefreshCw
                                className={`
                  h-4 w-4

                  ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                `}
                            />

                            Làm mới
                        </Button>
                    </div>
                }
            />

            {/* =================================================
       * NO ACTIVE PLAN
       * ================================================= */}

            {!activePlan ? (
                <NoActivePlan
                    onCreate={() =>
                        navigate(
                            ROUTES.MEMBER_AI,
                        )
                    }
                    onViewPlans={() =>
                        navigate(
                            ROUTES.MEMBER_WORKOUTS,
                        )
                    }
                />
            ) : (
                <>
                    {/* =============================================
           * ACTIVE PLAN
           * ============================================= */}

                    <section
                        className="
              relative
              overflow-hidden
              rounded-3xl
              bg-gradient-to-br
              from-slate-950
              via-slate-900
              to-emerald-950
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
                bg-emerald-500/20
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
                                        Giáo án đang hoạt động
                                    </Badge>

                                    {activePlan.sourceType && (
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
                      {activePlan.sourceType ===
                      "AI_GENERATED"
                          ? "FitLife AI"
                          : activePlan.sourceType}
                    </span>
                                    )}
                                </div>

                                <h2
                                    className="
                    mt-4
                    text-2xl
                    font-black
                    tracking-tight
                  "
                                >
                                    {
                                        activePlan.name
                                    }
                                </h2>

                                <p className="mt-2 text-sm text-slate-300">
                                    Mục tiêu:{" "}
                                    <span className="font-bold text-white">
                    {getGoalLabel(
                        activePlan.goal,
                    )}
                  </span>
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate(
                                            ROUTES
                                                .MEMBER_SCHEDULE,
                                        )
                                    }
                                    className="
                    border-white/20
                    bg-white/10
                    text-white
                    hover:bg-white/20
                  "
                                >
                                    <CalendarDays className="h-4 w-4" />

                                    Lịch tuần
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate(
                                            buildWorkoutDetailRoute(
                                                activePlan.id,
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
                                    Xem toàn bộ giáo án
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* =============================================
           * TODAY REST DAY / NO DAY
           * ============================================= */}

                    {!todayDay ||
                    todayDay.isRestDay ? (
                        <RestDayCard
                            hasTodayDay={
                                Boolean(
                                    todayDay,
                                )
                            }
                            onViewSchedule={() =>
                                navigate(
                                    ROUTES
                                        .MEMBER_SCHEDULE,
                                )
                            }
                        />
                    ) : (
                        <>
                            {/* =====================================
               * TODAY SUMMARY
               * ===================================== */}

                            <section
                                className="
                  grid
                  grid-cols-2
                  gap-4
                  lg:grid-cols-4
                "
                            >
                                <SummaryCard
                                    icon={
                                        Target
                                    }
                                    label="Trọng tâm"
                                    value={
                                        todayDay.focusArea ||
                                        "-"
                                    }
                                />

                                <SummaryCard
                                    icon={
                                        Dumbbell
                                    }
                                    label="Bài tập"
                                    value={`${exercises.length}`}
                                />

                                <SummaryCard
                                    icon={
                                        Clock3
                                    }
                                    label="Thời lượng"
                                    value={
                                        estimatedMinutes !=
                                        null
                                            ? `${estimatedMinutes} phút`
                                            : "-"
                                    }
                                />

                                <SummaryCard
                                    icon={
                                        Gauge
                                    }
                                    label="Ngày số"
                                    value={
                                        todayDay.dayNo !=
                                        null
                                            ? String(
                                                todayDay.dayNo,
                                            )
                                            : "-"
                                    }
                                />
                            </section>

                            {/* =====================================
               * DAY HEADER
               * ===================================== */}

                            <Card className="overflow-hidden">
                                <header
                                    className="
                    border-b
                    border-emerald-100
                    bg-emerald-50/70
                    p-5
                    sm:p-6
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
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-emerald-500
                          text-white
                          shadow-lg
                          shadow-emerald-500/20
                        "
                                            >
                                                <Dumbbell className="h-6 w-6" />
                                            </div>

                                            <div>
                                                <p
                                                    className="
                            text-xs
                            font-black
                            uppercase
                            tracking-wider
                            text-emerald-600
                          "
                                                >
                                                    Kế hoạch hôm nay
                                                </p>

                                                <h2
                                                    className="
                            mt-1
                            text-xl
                            font-black
                            text-slate-950
                            sm:text-2xl
                          "
                                                >
                                                    {todayDay.name ||
                                                        "Buổi tập hôm nay"}
                                                </h2>

                                                {todayDay.focusArea && (
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Trọng tâm:{" "}
                                                        <span className="font-bold text-slate-700">
                              {
                                  todayDay.focusArea
                              }
                            </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {todayDay.dayOfWeek && (
                                                <Badge variant="info">
                                                    {
                                                        todayDay.dayOfWeek
                                                    }
                                                </Badge>
                                            )}

                                            {todayDay.weekNo !=
                                                null && (
                                                    <Badge variant="purple">
                                                        Tuần{" "}
                                                        {
                                                            todayDay.weekNo
                                                        }
                                                    </Badge>
                                                )}
                                        </div>
                                    </div>

                                    {todayDay.note && (
                                        <div
                                            className="
                        mt-5
                        rounded-xl
                        border
                        border-emerald-100
                        bg-white/70
                        p-4
                        text-sm
                        leading-6
                        text-slate-600
                      "
                                        >
                                            {todayDay.note}
                                        </div>
                                    )}
                                </header>

                                {/* =================================
                 * EXERCISES
                 * ================================= */}

                                <div className="p-5 sm:p-6">
                                    <div
                                        className="
                      mb-5
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                                    >
                                        <div>
                                            <h3 className="font-black text-slate-900">
                                                Danh sách bài tập
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Thực hiện theo thứ tự được đề xuất.
                                            </p>
                                        </div>

                                        <span
                                            className="
                        rounded-full
                        bg-slate-100
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-slate-500
                      "
                                        >
                      {
                          exercises.length
                      }{" "}
                                            bài
                    </span>
                                    </div>

                                    {exercises.length ===
                                    0 ? (
                                        <div
                                            className="
                        rounded-2xl
                        border
                        border-dashed
                        border-slate-300
                        bg-slate-50
                        p-8
                        text-center
                      "
                                        >
                                            <Dumbbell className="mx-auto h-10 w-10 text-slate-300" />

                                            <p className="mt-3 font-bold text-slate-700">
                                                Buổi tập chưa có bài tập
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {exercises.map(
                                                (
                                                    exercise,
                                                    index,
                                                ) => (
                                                    <ExerciseCard
                                                        key={
                                                            exercise.id ??
                                                            `${exercise.exerciseName}-${index}`
                                                        }
                                                        exercise={
                                                            exercise
                                                        }
                                                        index={
                                                            index
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div
                                className="
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-blue-200
                  bg-blue-50
                  p-4
                "
                            >
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                                <div>
                                    <p className="text-sm font-black text-blue-900">
                                        Buổi tập hôm nay đã sẵn sàng
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-blue-700">
                                        FitLife đang hiển thị buổi tập tương ứng với ngày hiện tại từ giáo án ACTIVE của bạn.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

function ExerciseCard({
                          exercise,
                          index,
                      }: {
    exercise:
        WorkoutExercise;

    index:
        number;
}) {
    const metadata =
        getExerciseMeta(
            exercise,
        );

    return (
        <article
            className="
        rounded-2xl
        border
        border-slate-200
        bg-slate-50
        p-4
        transition
        hover:border-emerald-200
        hover:bg-white
        hover:shadow-sm
        sm:p-5
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
                <div className="flex min-w-0 items-start gap-4">
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
              font-black
              text-emerald-700
              shadow-sm
            "
                    >
                        {index + 1}
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black text-slate-900">
                                {
                                    exercise.exerciseName
                                }
                            </h4>

                            {exercise.isOptional && (
                                <Badge variant="default">
                                    Tùy chọn
                                </Badge>
                            )}
                        </div>

                        {exercise.targetMuscle && (
                            <p className="mt-1 text-xs font-medium text-slate-500">
                                Nhóm cơ:{" "}
                                {
                                    exercise.targetMuscle
                                }
                            </p>
                        )}

                        {exercise.instruction && (
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                {
                                    exercise.instruction
                                }
                            </p>
                        )}
                    </div>
                </div>

                {metadata.length >
                    0 && (
                        <div
                            className="
              flex
              shrink-0
              flex-wrap
              gap-2
              sm:max-w-xs
              sm:justify-end
            "
                        >
                            {metadata.map(
                                (
                                    value,
                                ) => (
                                    <span
                                        key={
                                            value
                                        }
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
                  {value}
                </span>
                                ),
                            )}
                        </div>
                    )}
            </div>

            {(exercise.weightKg !=
                null ||
                exercise.rpe !=
                null ||
                exercise.tempo) && (
                <div
                    className="
            mt-4
            flex
            flex-wrap
            gap-2
            border-t
            border-slate-200
            pt-3
          "
                >
                    {exercise.weightKg !=
                        null && (
                            <Badge variant="info">
                                {
                                    exercise.weightKg
                                }{" "}
                                kg
                            </Badge>
                        )}

                    {exercise.rpe !=
                        null && (
                            <Badge variant="warning">
                                RPE{" "}
                                {
                                    exercise.rpe
                                }
                            </Badge>
                        )}

                    {exercise.tempo && (
                        <Badge variant="purple">
                            Tempo{" "}
                            {
                                exercise.tempo
                            }
                        </Badge>
                    )}
                </div>
            )}

            {exercise.note && (
                <p
                    className="
            mt-3
            whitespace-pre-wrap
            rounded-xl
            bg-amber-50
            px-3
            py-2
            text-xs
            leading-5
            text-amber-700
          "
                >
                    Lưu ý:{" "}
                    {exercise.note}
                </p>
            )}
        </article>
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
          bg-emerald-100
          text-emerald-700
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

            <p className="mt-1 font-black text-slate-900">
                {value}
            </p>
        </Card>
    );
}

function RestDayCard({
                         hasTodayDay,
                         onViewSchedule,
                     }: {
    hasTodayDay:
        boolean;

    onViewSchedule:
        () => void;
}) {
    return (
        <Card
            className="
        overflow-hidden
        border-blue-100
        bg-gradient-to-br
        from-blue-50
        to-white
        p-8
        text-center
        sm:p-12
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
          bg-blue-100
          text-blue-600
        "
            >
                <Moon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
                {hasTodayDay
                    ? "Hôm nay là ngày nghỉ"
                    : "Không có buổi tập hôm nay"}
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
                Giáo án của bạn đang hoạt động nhưng hôm nay không có buổi tập. Hãy phục hồi và chuẩn bị cho buổi tiếp theo.
            </p>

            <Button
                variant="outline"
                onClick={
                    onViewSchedule
                }
                className="mt-6"
            >
                <CalendarDays className="h-4 w-4" />

                Xem lịch tuần
            </Button>
        </Card>
    );
}

function NoActivePlan({
                          onCreate,
                          onViewPlans,
                      }: {
    onCreate:
        () => void;

    onViewPlans:
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
                <CalendarDays className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
                Chưa có giáo án đang hoạt động
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
                Giáo án AI sau khi áp dụng được lưu ở trạng thái bản nháp. Hãy mở giáo án và kích hoạt trước khi bắt đầu tập luyện.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button
                    variant="outline"
                    onClick={
                        onViewPlans
                    }
                >
                    <Dumbbell className="h-4 w-4" />

                    Xem giáo án
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