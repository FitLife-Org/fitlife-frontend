import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Calendar,
    ChevronLeft,
    Clock,
    Dumbbell,
    Edit3,
    Plus,
} from "lucide-react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import gsap from "gsap";

import {
    useGSAP,
} from "@gsap/react";

import toast from "react-hot-toast";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

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

export default function TrainerWorkoutPage() {
    const {
        memberId,
    } =
        useParams<{
            memberId: string;
        }>();

    const navigate =
        useNavigate();

    const containerRef =
        useRef<HTMLDivElement>(
            null,
        );

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
                if (!memberId) {
                    setPlans([]);
                    setLoading(false);
                    return;
                }

                const numericMemberId =
                    Number(memberId);

                if (
                    !Number.isInteger(
                        numericMemberId,
                    ) ||
                    numericMemberId <= 0
                ) {
                    setPlans([]);
                    setLoading(false);

                    toast.error(
                        "Member ID không hợp lệ.",
                    );

                    return;
                }

                try {
                    setLoading(true);

                    const data =
                        await workoutService
                            .getTrainerWorkoutPlans(
                                numericMemberId,
                            );

                    setPlans(
                        data,
                    );
                } catch (error) {
                    setPlans([]);

                    toast.error(
                        getApiErrorMessage(
                            error,
                            "Không thể tải giáo án của hội viên.",
                        ),
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                memberId,
            ],
        );

    useEffect(() => {
        void fetchPlans();
    }, [
        fetchPlans,
    ]);

    useGSAP(
        () => {
            if (
                loading ||
                plans.length === 0
            ) {
                return;
            }

            gsap.from(
                ".gsap-plan-card",
                {
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power3.out",
                },
            );
        },
        {
            dependencies: [
                loading,
                plans,
            ],
            scope: containerRef,
        },
    );

    return (
        <div
            ref={
                containerRef
            }
            className="space-y-6"
        >
            <div
                className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/trainer/members",
                            )
                        }
                        className="
                            rounded-full
                            p-2
                            transition-colors
                            hover:bg-slate-100
                        "
                    >
                        <ChevronLeft className="h-6 w-6 text-slate-600" />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Quản lý lịch tập
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Hội viên ID:{" "}
                            {memberId}
                        </p>
                    </div>
                </div>

                <Link
                    to={`/trainer/members/${memberId}/workouts/create`}
                >
                    <Button
                        className="
                            flex
                            items-center
                            gap-2
                            bg-gradient-to-r
                            from-fit-primary
                            to-blue-600
                            text-white
                            shadow-lg
                            shadow-fit-primary/20
                            transition-transform
                            hover:scale-[1.02]
                        "
                    >
                        <Plus className="h-5 w-5" />

                        Tạo lịch tập mới
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div
                        className="
                            h-8
                            w-8
                            animate-spin
                            rounded-full
                            border-4
                            border-fit-primary
                            border-t-transparent
                        "
                    />
                </div>
            ) : plans.length ===
            0 ? (
                <Card className="border-2 border-dashed border-slate-200 p-12 text-center">
                    <div
                        className="
                            mx-auto
                            mb-4
                            flex
                            h-16
                            w-16
                            items-center
                            justify-center
                            rounded-full
                            bg-slate-50
                        "
                    >
                        <Dumbbell className="h-8 w-8 text-slate-400" />
                    </div>

                    <h3 className="mb-2 text-lg font-bold text-slate-700">
                        Chưa có lịch tập nào
                    </h3>

                    <p className="mx-auto mb-6 max-w-md text-slate-500">
                        Hội viên này hiện chưa có lộ trình tập luyện nào. Hãy tạo một lộ trình mới để giúp họ đạt mục tiêu.
                    </p>

                    <Link
                        to={`/trainer/members/${memberId}/workouts/create`}
                    >
                        <Button
                            variant="outline"
                            className="
                                border-fit-primary
                                text-fit-primary
                                hover:bg-fit-primary
                                hover:text-white
                            "
                        >
                            Tạo lịch tập đầu tiên
                        </Button>
                    </Link>
                </Card>
            ) : (
                <div
                    className="
                        grid
                        grid-cols-1
                        gap-6
                        md:grid-cols-2
                        xl:grid-cols-3
                    "
                >
                    {plans.map(
                        (
                            plan,
                        ) => (
                            <Card
                                key={
                                    plan.id
                                }
                                className="
                                    gsap-plan-card
                                    group
                                    overflow-hidden
                                    transition-all
                                    duration-300
                                    hover:shadow-xl
                                "
                            >
                                <div className="p-6">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div
                                                className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-purple-50
                                                    text-purple-600
                                                "
                                            >
                                                <Dumbbell className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-slate-800">
                                                    {
                                                        plan.name
                                                    }
                                                </h3>

                                                <p className="truncate text-xs text-slate-500">
                                                    {plan.goal ||
                                                        "Chưa xác định mục tiêu"}
                                                </p>
                                            </div>
                                        </div>

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
                                    </div>

                                    <div className="mb-4">
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

                                    <div className="mb-6 grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                                                <Calendar className="h-4 w-4" />

                                                <span className="text-xs font-medium">
                                                    Thời gian
                                                </span>
                                            </div>

                                            <p className="font-semibold text-slate-800">
                                                {plan.durationWeeks ??
                                                    "-"}{" "}
                                                tuần
                                            </p>
                                        </div>

                                        <div className="rounded-lg border border-purple-100 bg-purple-50 p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-purple-500">
                                                <Clock className="h-4 w-4" />

                                                <span className="text-xs font-medium">
                                                    Buổi / Tuần
                                                </span>
                                            </div>

                                            <p className="font-semibold text-purple-700">
                                                {plan.workoutDaysPerWeek ??
                                                    "-"}{" "}
                                                buổi
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-6 space-y-2 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">
                                                Mức độ:
                                            </span>

                                            <span className="text-right font-medium text-slate-700">
                                                {plan.experienceLevel
                                                    ? plan.experienceLevel
                                                        .toLowerCase()
                                                        .replace(/_/g, " ")
                                                    : "-"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">
                                                Thời lượng:
                                            </span>

                                            <span className="font-medium text-slate-700">
                                                {plan.workoutDurationMinutes !=
                                                null
                                                    ? `${plan.workoutDurationMinutes} phút`
                                                    : "-"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">
                                                Tổng số ngày:
                                            </span>

                                            <span className="font-medium text-slate-700">
                                                {plan.totalDays ??
                                                    0}{" "}
                                                ngày
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">
                                                Ngày tập:
                                            </span>

                                            <span className="font-medium text-slate-700">
                                                {plan.trainingDays ??
                                                    0}{" "}
                                                ngày
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/trainer/members/${memberId}/workouts/${plan.id}/edit`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="outline"
                                                className="
                                                    w-full
                                                    border-slate-200
                                                    text-slate-600
                                                    hover:bg-slate-50
                                                "
                                            >
                                                <Edit3 className="h-4 w-4" />

                                                Sửa
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}