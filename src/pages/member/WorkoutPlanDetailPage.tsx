import {
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    Activity,
    AlertTriangle,
    Archive,
    ArrowLeft,
    CalendarDays,
    Clock3,
    Dumbbell,
    Edit3,
    Gauge,
    Play,
    Sparkles,
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
    WorkoutPlanDay,
    WorkoutPlanDetail,
    WorkoutPlanSourceType,
    WorkoutPlanStatus,
} from "../../types/workout.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

/* =========================================================
 * STATUS
 * ========================================================= */

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

/* =========================================================
 * SOURCE
 * ========================================================= */

function getSourceLabel(
    source: WorkoutPlanSourceType,
): string {
    switch (source) {
        case "AI_GENERATED":
            return "FitLife AI";

        case "TRAINER_CREATED":
            return "Huấn luyện viên";

        case "MEMBER_CREATED":
            return "Tự tạo";

        case "MANUAL":
            return "Thủ công";

        default:
            return source;
    }
}

/* =========================================================
 * PERMISSION
 * ========================================================= */

function canMemberEdit(
    plan: WorkoutPlanDetail,
): boolean {
    /*
     * Plan kết thúc / archive / cancel:
     * read-only.
     */
    if (
        plan.status === "COMPLETED" ||
        plan.status === "ARCHIVED" ||
        plan.status === "CANCELLED"
    ) {
        return false;
    }

    /*
     * Giáo án Trainer giao:
     * Member chỉ được xem.
     */
    if (
        plan.sourceType === "TRAINER_CREATED"
    ) {
        return false;
    }

    return (
        plan.sourceType === "MEMBER_CREATED" ||
        plan.sourceType === "MANUAL" ||
        plan.sourceType === "AI_GENERATED"
    );
}

function canMemberActivate(
    plan: WorkoutPlanDetail,
): boolean {
    return (
        plan.status === "DRAFT" &&
        plan.sourceType !== "TRAINER_CREATED"
    );
}

/* =========================================================
 * FORMAT
 * ========================================================= */

function formatDayLabel(
    day: WorkoutPlanDay,
    index: number,
): string {
    if (day.name) {
        return day.name;
    }

    if (day.dayNo) {
        return `Ngày ${day.dayNo}`;
    }

    return `Ngày ${index + 1}`;
}

function buildWorkoutEditRoute(
    id: number,
): string {
    return ROUTES
        .MEMBER_WORKOUT_EDIT
        .replace(
            ":id",
            String(id),
        );
}

/* =========================================================
 * PAGE
 * ========================================================= */

export default function WorkoutPlanDetailPage() {
    const navigate =
        useNavigate();

    const { id } =
        useParams<{
            id: string;
        }>();

    const [
        plan,
        setPlan,
    ] =
        useState<
            WorkoutPlanDetail | null
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

    const [
        archiving,
        setArchiving,
    ] =
        useState(false);

    /* =====================================================
     * LOAD
     * ===================================================== */

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

                    setLoading(false);

                    return;
                }

                try {
                    setLoading(true);

                    setError(null);

                    const result =
                        await workoutService
                            .getWorkoutPlanDetails(
                                planId,
                            );

                    setPlan(result);
                } catch (requestError) {
                    setPlan(null);

                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Không thể tải chi tiết giáo án.",
                        ),
                    );
                } finally {
                    setLoading(false);
                }
            },
            [id],
        );

    useEffect(() => {
        void loadPlan();
    }, [loadPlan]);

    /* =====================================================
     * ACTIVATE
     * ===================================================== */

    const handleActivatePlan =
        async (): Promise<void> => {
            if (
                !plan ||
                !canMemberActivate(plan)
            ) {
                return;
            }

            try {
                setActivating(true);

                await workoutService
                    .activateWorkoutPlan(
                        plan.id,
                    );

                await loadPlan();

                void showAlert.success(
                    "Thành công",
                    "Đã kích hoạt giáo án thành công.",
                );
            } catch (requestError) {
                void showAlert.error(
                    "Đã xảy ra lỗi",
                    getApiErrorMessage(
                        requestError,
                        "Không thể kích hoạt giáo án.",
                    ),
                );
            } finally {
                setActivating(false);
            }
        };

    /* =====================================================
     * ARCHIVE
     * ===================================================== */

    const handleArchivePlan =
        async (): Promise<void> => {
            if (!plan) {
                return;
            }

            try {
                setArchiving(true);

                await workoutService
                    .archiveWorkoutPlan(
                        plan.id,
                    );

                void showAlert.success(
                    "Đã lưu trữ",
                    "Giáo án đã được chuyển vào lưu trữ.",
                );

                navigate(
                    ROUTES.MEMBER_WORKOUTS,
                );
            } catch (requestError) {
                void showAlert.error(
                    "Đã xảy ra lỗi",
                    getApiErrorMessage(
                        requestError,
                        "Không thể lưu trữ giáo án.",
                    ),
                );
            } finally {
                setArchiving(false);
            }
        };

    /* =====================================================
     * LOADING
     * ===================================================== */

    if (loading) {
        return (
            <Loading label="Đang tải chi tiết giáo án..." />
        );
    }

    /* =====================================================
     * ERROR
     * ===================================================== */

    if (
        error ||
        !plan
    ) {
        return (
            <Card className="mx-auto max-w-2xl p-10 text-center">
                <AlertTriangle
                    className="
                        mx-auto
                        h-14
                        w-14
                        text-red-400
                    "
                />

                <h1
                    className="
                        mt-4
                        text-xl
                        font-black
                        text-slate-900
                    "
                >
                    Không thể tải giáo án
                </h1>

                <p
                    className="
                        mt-2
                        text-sm
                        text-slate-500
                    "
                >
                    {error ||
                        "Giáo án không tồn tại."}
                </p>

                <div
                    className="
                        mt-6
                        flex
                        flex-wrap
                        justify-center
                        gap-2
                    "
                >
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

    /* =====================================================
     * DERIVED DATA
     * ===================================================== */

    const days =
        plan.days ?? [];

    const trainingDays =
        days.filter(
            (day) =>
                !day.isRestDay,
        );

    const totalExercises =
        trainingDays.reduce(
            (
                total,
                day,
            ) =>
                total +
                (
                    day.exercises?.length ??
                    0
                ),
            0,
        );

    const editable =
        canMemberEdit(plan);

    const activatable =
        canMemberActivate(plan);

    /* =====================================================
     * UI
     * ===================================================== */

    return (
        <div
            className="
                w-full
                min-w-0
                space-y-6
                overflow-x-hidden
                pb-10
            "
        >
            {/* =============================================
                BACK
            ============================================== */}

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

                Giáo án của tôi
            </button>

            {/* =============================================
                HEADER
            ============================================== */}

            <section
                className="
                    rounded-3xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                    sm:p-6
                    lg:p-7
                "
            >
                <div
                    className="
                        flex
                        flex-col
                        gap-5
                        xl:flex-row
                        xl:items-start
                        xl:justify-between
                    "
                >
                    <div className="min-w-0 flex-1">
                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                            "
                        >
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

                            {plan.sourceType ===
                                "AI_GENERATED" && (
                                    <span
                                        className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        rounded-full
                                        bg-violet-50
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-bold
                                        text-violet-700
                                    "
                                    >
                                    <Sparkles className="h-3.5 w-3.5" />

                                    AI
                                </span>
                                )}
                        </div>

                        <h1
                            className="
                                mt-4
                                break-words
                                text-2xl
                                font-black
                                tracking-tight
                                text-slate-950
                                sm:text-3xl
                            "
                        >
                            {plan.name}
                        </h1>

                        {plan.description ? (
                            <p
                                className="
                                    mt-3
                                    max-w-4xl
                                    whitespace-pre-wrap
                                    text-sm
                                    leading-6
                                    text-slate-500
                                "
                            >
                                {plan.description}
                            </p>
                        ) : (
                            <p
                                className="
                                    mt-3
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Chi tiết kế hoạch tập luyện của bạn.
                            </p>
                        )}
                    </div>

                    {/* ACTIONS */}

                    <div
                        className="
                            flex
                            shrink-0
                            flex-wrap
                            gap-2
                        "
                    >
                        {editable && (
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate(
                                        buildWorkoutEditRoute(
                                            plan.id,
                                        ),
                                    )
                                }
                            >
                                <Edit3 className="h-4 w-4" />

                                Chỉnh sửa
                            </Button>
                        )}

                        {activatable && (
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

                                Kích hoạt
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

                        {editable &&
                            plan.status !==
                            "ARCHIVED" && (
                                <Button
                                    variant="outline"
                                    isLoading={
                                        archiving
                                    }
                                    loadingText="Đang lưu..."
                                    onClick={() => {
                                        void handleArchivePlan();
                                    }}
                                >
                                    <Archive className="h-4 w-4" />

                                    Lưu trữ
                                </Button>
                            )}
                    </div>
                </div>
            </section>

            {/* =============================================
                PERMISSION NOTICE
            ============================================== */}

            {plan.sourceType ===
                "TRAINER_CREATED" && (
                    <div
                        className="
                        rounded-2xl
                        border
                        border-blue-200
                        bg-blue-50
                        p-4
                    "
                    >
                        <div
                            className="
                            flex
                            items-start
                            gap-3
                        "
                        >
                            <UserRound
                                className="
                                mt-0.5
                                h-5
                                w-5
                                shrink-0
                                text-blue-600
                            "
                            />

                            <div>
                                <p
                                    className="
                                    font-black
                                    text-blue-900
                                "
                                >
                                    Giáo án từ huấn luyện viên
                                </p>

                                <p
                                    className="
                                    mt-1
                                    text-sm
                                    leading-6
                                    text-blue-700
                                "
                                >
                                    Giáo án này được huấn luyện viên
                                    tạo cho bạn. Bạn có thể xem chi
                                    tiết nhưng không thể trực tiếp
                                    chỉnh sửa nội dung.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

            {plan.status ===
                "DRAFT" &&
                activatable && (
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
                            <p
                                className="
                                    font-black
                                    text-amber-900
                                "
                            >
                                Giáo án đang là bản nháp
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    leading-6
                                    text-amber-700
                                "
                            >
                                Bạn có thể chỉnh sửa ngày tập,
                                bài tập và thông tin giáo án
                                trước khi kích hoạt.
                            </p>
                        </div>

                        <div
                            className="
                                flex
                                shrink-0
                                flex-wrap
                                gap-2
                            "
                        >
                            {editable && (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        navigate(
                                            buildWorkoutEditRoute(
                                                plan.id,
                                            ),
                                        )
                                    }
                                >
                                    <Edit3 className="h-4 w-4" />

                                    Chỉnh sửa
                                </Button>
                            )}

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

                                Kích hoạt
                            </Button>
                        </div>
                    </div>
                )}

            {/* =============================================
                SUMMARY
            ============================================== */}

            <section
                className="
                    grid
                    grid-cols-2
                    gap-3
                    md:grid-cols-3
                    xl:grid-cols-6
                "
            >
                <SummaryCard
                    icon={Target}
                    label="Mục tiêu"
                    value={
                        plan.goal ||
                        "-"
                    }
                />

                <SummaryCard
                    icon={Gauge}
                    label="Trình độ"
                    value={
                        plan.experienceLevel ||
                        "-"
                    }
                />

                <SummaryCard
                    icon={CalendarDays}
                    label="Thời lượng"
                    value={
                        plan.durationWeeks != null
                            ? `${plan.durationWeeks} tuần`
                            : "-"
                    }
                />

                <SummaryCard
                    icon={Activity}
                    label="Ngày tập"
                    value={`${trainingDays.length}`}
                />

                <SummaryCard
                    icon={Dumbbell}
                    label="Bài tập"
                    value={`${totalExercises}`}
                />

                <SummaryCard
                    icon={Clock3}
                    label="Phút / buổi"
                    value={
                        plan.workoutDurationMinutes != null
                            ? `${plan.workoutDurationMinutes}`
                            : "-"
                    }
                />
            </section>

            {/* =============================================
                NOTE / SOURCE
            ============================================== */}

            {(plan.note ||
                plan.sourceType ===
                "AI_GENERATED" ||
                plan.sourceType ===
                "TRAINER_CREATED") && (
                <Card className="p-5">
                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >
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
                            {plan.sourceType ===
                            "AI_GENERATED" ? (
                                <Sparkles className="h-5 w-5" />
                            ) : (
                                <UserRound className="h-5 w-5" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2
                                className="
                                    font-black
                                    text-slate-900
                                "
                            >
                                {plan.sourceType ===
                                "AI_GENERATED"
                                    ? "Gợi ý từ FitLife AI"
                                    : plan.sourceType ===
                                    "TRAINER_CREATED"
                                        ? "Hướng dẫn từ huấn luyện viên"
                                        : "Ghi chú giáo án"}
                            </h2>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                {plan.sourceType ===
                                "AI_GENERATED"
                                    ? "Giáo án được khởi tạo từ đề xuất của FitLife AI."
                                    : plan.sourceType ===
                                    "TRAINER_CREATED"
                                        ? "Giáo án được xây dựng bởi huấn luyện viên."
                                        : "Thông tin bổ sung của giáo án."}
                            </p>

                            {plan.note && (
                                <p
                                    className="
                                        mt-3
                                        whitespace-pre-wrap
                                        break-words
                                        text-sm
                                        leading-6
                                        text-slate-600
                                    "
                                >
                                    {plan.note}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {/* =============================================
                DAYS
            ============================================== */}

            <section>
                <div
                    className="
                        mb-4
                        flex
                        flex-col
                        gap-1
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                    "
                >
                    <div>
                        <h2
                            className="
                                text-xl
                                font-black
                                text-slate-900
                            "
                        >
                            Lịch tập chi tiết
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                            "
                        >
                            {days.length} ngày ·{" "}
                            {trainingDays.length} ngày tập ·{" "}
                            {totalExercises} bài tập
                        </p>
                    </div>

                    {editable && (
                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    buildWorkoutEditRoute(
                                        plan.id,
                                    ),
                                )
                            }
                        >
                            <Edit3 className="h-4 w-4" />

                            Sửa lịch tập
                        </Button>
                    )}
                </div>

                {days.length === 0 ? (
                    <Card
                        className="
                            border-dashed
                            p-10
                            text-center
                        "
                    >
                        <Dumbbell
                            className="
                                mx-auto
                                h-14
                                w-14
                                text-slate-300
                            "
                        />

                        <p
                            className="
                                mt-4
                                font-bold
                                text-slate-700
                            "
                        >
                            Giáo án chưa có cấu trúc ngày tập.
                        </p>

                        {editable && (
                            <Button
                                variant="primary"
                                className="mt-5"
                                onClick={() =>
                                    navigate(
                                        buildWorkoutEditRoute(
                                            plan.id,
                                        ),
                                    )
                                }
                            >
                                <Edit3 className="h-4 w-4" />

                                Thêm lịch tập
                            </Button>
                        )}
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
                                    day={day}
                                    index={dayIndex}
                                />
                            ),
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

/* =========================================================
 * DAY
 * ========================================================= */

function WorkoutDayCard({
                            day,
                            index,
                        }: {
    day: WorkoutPlanDay;
    index: number;
}) {
    const exercises =
        day.exercises ?? [];

    return (
        <Card
            className="
                min-w-0
                overflow-hidden
            "
        >
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
                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                        "
                    >
                        <div
                            className={`
                                flex
                                h-10
                                w-10
                                shrink-0
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

                        <div className="min-w-0">
                            <h3
                                className="
                                    break-words
                                    font-black
                                    text-slate-900
                                "
                            >
                                {formatDayLabel(
                                    day,
                                    index,
                                )}
                            </h3>

                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-slate-500
                                "
                            >
                                {day.isRestDay
                                    ? "Ngày nghỉ phục hồi"
                                    : `${exercises.length} bài tập`}
                            </p>
                        </div>
                    </div>

                    <div
                        className="
                            flex
                            flex-wrap
                            gap-2
                        "
                    >
                        {day.dayOfWeek && (
                            <Badge variant="default">
                                {day.dayOfWeek}
                            </Badge>
                        )}

                        {day.isRestDay && (
                            <Badge variant="default">
                                Nghỉ
                            </Badge>
                        )}

                        {day.focusArea &&
                            !day.isRestDay && (
                                <Badge variant="success">
                                    {day.focusArea}
                                </Badge>
                            )}

                        {day.estimatedMinutes != null &&
                            !day.isRestDay && (
                                <Badge variant="info">
                                    {day.estimatedMinutes} phút
                                </Badge>
                            )}
                    </div>
                </div>

                {day.note && (
                    <p
                        className="
                            mt-3
                            whitespace-pre-wrap
                            break-words
                            text-sm
                            leading-6
                            text-slate-600
                        "
                    >
                        {day.note}
                    </p>
                )}
            </header>

            {!day.isRestDay && (
                <div className="p-4 sm:p-5">
                    {exercises.length === 0 ? (
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
                                            min-w-0
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
                                                lg:flex-row
                                                lg:items-start
                                                lg:justify-between
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    min-w-0
                                                    flex-1
                                                    items-start
                                                    gap-3
                                                "
                                            >
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
                                                    <h4
                                                        className="
                                                            break-words
                                                            font-black
                                                            text-slate-900
                                                        "
                                                    >
                                                        {
                                                            exercise.exerciseName
                                                        }
                                                    </h4>

                                                    {exercise.targetMuscle && (
                                                        <p
                                                            className="
                                                                mt-1
                                                                text-xs
                                                                text-slate-500
                                                            "
                                                        >
                                                            Nhóm cơ:{" "}
                                                            {
                                                                exercise.targetMuscle
                                                            }
                                                        </p>
                                                    )}

                                                    {exercise.instruction && (
                                                        <p
                                                            className="
                                                                mt-2
                                                                whitespace-pre-wrap
                                                                break-words
                                                                text-sm
                                                                leading-6
                                                                text-slate-600
                                                            "
                                                        >
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
                                                {exercise.sets != null && (
                                                    <Metric>
                                                        {exercise.sets} hiệp
                                                    </Metric>
                                                )}

                                                {exercise.reps && (
                                                    <Metric>
                                                        {exercise.reps} reps
                                                    </Metric>
                                                )}

                                                {exercise.weightKg != null && (
                                                    <Metric>
                                                        {exercise.weightKg} kg
                                                    </Metric>
                                                )}

                                                {exercise.restSeconds != null && (
                                                    <Metric>
                                                        Nghỉ{" "}
                                                        {exercise.restSeconds}s
                                                    </Metric>
                                                )}

                                                {exercise.durationMinutes != null && (
                                                    <Metric>
                                                        {
                                                            exercise.durationMinutes
                                                        }{" "}
                                                        phút
                                                    </Metric>
                                                )}

                                                {exercise.distanceKm != null && (
                                                    <Metric>
                                                        {
                                                            exercise.distanceKm
                                                        }{" "}
                                                        km
                                                    </Metric>
                                                )}

                                                {exercise.rpe != null && (
                                                    <Metric>
                                                        RPE{" "}
                                                        {exercise.rpe}
                                                    </Metric>
                                                )}

                                                {exercise.tempo && (
                                                    <Metric>
                                                        Tempo{" "}
                                                        {exercise.tempo}
                                                    </Metric>
                                                )}

                                                {exercise.isOptional && (
                                                    <Metric>
                                                        Tùy chọn
                                                    </Metric>
                                                )}
                                            </div>
                                        </div>

                                        {exercise.note && (
                                            <p
                                                className="
                                                    mt-3
                                                    whitespace-pre-wrap
                                                    break-words
                                                    text-xs
                                                    leading-5
                                                    text-slate-500
                                                "
                                            >
                                                Lưu ý:{" "}
                                                {exercise.note}
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

/* =========================================================
 * SUMMARY CARD
 * ========================================================= */

function SummaryCard({
                         icon: Icon,
                         label,
                         value,
                     }: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <Card
            className="
                min-w-0
                p-4
                sm:p-5
            "
        >
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

            <p
                className="
                    mt-1
                    break-words
                    font-black
                    text-slate-900
                "
            >
                {value}
            </p>
        </Card>
    );
}

/* =========================================================
 * METRIC
 * ========================================================= */

function Metric({
                    children,
                }: {
    children: ReactNode;
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