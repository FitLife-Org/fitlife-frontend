import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Dumbbell,
    Target,
    UserRound,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";

import { ROUTES } from "../../config/routes";
import { workoutService } from "../../services/workoutService";

import type {
    WorkoutPlan,
} from "../../types/workout.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

function formatStatus(
    status?: string,
): string {
    const labels:
        Record<string, string> = {
        DRAFT: "Bản nháp",
        ACTIVE: "Đang tập",
        COMPLETED: "Đã hoàn thành",
        ARCHIVED: "Đã lưu trữ",
        CANCELLED: "Đã hủy",
    };

    if (!status) {
        return "Chưa xác định";
    }

    return labels[status] ?? status;
}

export default function WorkoutPlanDetailPage() {
    const navigate = useNavigate();

    const { id } = useParams<{
        id: string;
    }>();

    const [plan, setPlan] =
        useState<WorkoutPlan | null>(
            null,
        );

    const [loading, setLoading] =
        useState(true);

    const [
        completingSessionId,
        setCompletingSessionId,
    ] = useState<string | null>(
        null,
    );

    const [error, setError] =
        useState<string | null>(
            null,
        );

    const loadPlan =
        useCallback(async () => {
            const planId =
                Number(id);

            if (
                !Number.isInteger(planId) ||
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
                setError(
                    getApiErrorMessage(
                        requestError,
                        "Không thể tải chi tiết giáo án.",
                    ),
                );
            } finally {
                setLoading(false);
            }
        }, [id]);

    useEffect(() => {
        void loadPlan();
    }, [loadPlan]);

    const handleCompleteSession =
        async (
            sessionId: string,
        ): Promise<void> => {
            try {
                setCompletingSessionId(
                    sessionId,
                );

                await workoutService
                    .completeSession(
                        sessionId,
                    );

                toast.success(
                    "Đã hoàn thành buổi tập.",
                );

                await loadPlan();
            } catch (requestError) {
                toast.error(
                    getApiErrorMessage(
                        requestError,
                        "Không thể cập nhật buổi tập.",
                    ),
                );
            } finally {
                setCompletingSessionId(
                    null,
                );
            }
        };

    if (loading) {
        return (
            <Loading label="Đang tải chi tiết giáo án..." />
        );
    }

    if (error || !plan) {
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

                <div className="mt-6 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(
                                ROUTES.MEMBER_WORKOUTS,
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

    const days =
        plan.days ?? [];

    const completedCount =
        days.filter(
            (session: any) =>
                session.isCompleted,
        ).length;

    const progress =
        days.length > 0
            ? Math.round(
                (
                    completedCount /
                    days.length
                ) * 100,
            )
            : 0;

    return (
        <div className="space-y-6 pb-10">
            <div>
                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            ROUTES.MEMBER_WORKOUTS,
                        )
                    }
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại giáo án
                </button>

                <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            {formatStatus(
                plan.status,
            )}
          </span>
                </div>

                <h1 className="mt-3 text-3xl font-black text-slate-900">
                    {plan.name}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Theo dõi các buổi tập và tiến độ của giáo án.
                </p>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-5">
                    <Target className="h-5 w-5 text-emerald-600" />

                    <p className="mt-3 text-xs font-bold uppercase text-slate-400">
                        Mục tiêu
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                        {plan.goal ||
                            "Chưa xác định"}
                    </p>
                </Card>

                <Card className="p-5">
                    <UserRound className="h-5 w-5 text-blue-600" />

                    <p className="mt-3 text-xs font-bold uppercase text-slate-400">
                        Huấn luyện viên
                    </p>

                    <p className="mt-1 font-black text-slate-900">
                        {plan.trainerName ||
                            "FitLife AI"}
                    </p>
                </Card>

                <Card className="p-5">
                    <Calendar className="h-5 w-5 text-violet-600" />

                    <p className="mt-3 text-xs font-bold uppercase text-slate-400">
                        Số buổi
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900">
                        {days.length}
                    </p>
                </Card>

                <Card className="p-5">
                    <Activity className="h-5 w-5 text-orange-600" />

                    <p className="mt-3 text-xs font-bold uppercase text-slate-400">
                        Tiến độ
                    </p>

                    <p className="mt-1 text-2xl font-black text-emerald-600">
                        {progress}%
                    </p>
                </Card>
            </section>

            <Card className="p-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="font-black text-slate-900">
                            Tiến độ giáo án
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Đã hoàn thành{" "}
                            {completedCount}/
                            {days.length} buổi.
                        </p>
                    </div>

                    <span className="text-xl font-black text-emerald-600">
            {progress}%
          </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{
                            width: `${progress}%`,
                        }}
                    />
                </div>
            </Card>

            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black text-slate-900">
                        Các buổi tập
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Chi tiết bài tập theo từng buổi.
                    </p>
                </div>

                {days.length === 0 ? (
                    <Card className="p-10 text-center">
                        <Dumbbell className="mx-auto h-14 w-14 text-slate-300" />

                        <p className="mt-4 font-bold text-slate-700">
                            Giáo án chưa có buổi tập.
                        </p>
                    </Card>
                ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                        {days.map(
                            (session: any) => (
                                <Card
                                    key={session.id}
                                    className="overflow-hidden"
                                >
                                    <div className="border-b border-slate-100 p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-emerald-600">
                                                    Thứ{" "}
                                                    {session.dayOfWeek}
                                                </p>

                                                <h3 className="mt-1 text-lg font-black text-slate-900">
                                                    {session.name}
                                                </h3>
                                            </div>

                                            {session.isCompleted && (
                                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                            )}
                                        </div>

                                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                            <Clock className="h-4 w-4" />
                                            {session.exercises?.length ??
                                                0}{" "}
                                            bài tập
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-5">
                                        {(session.exercises ??
                                            []).map(
                                            (exercise: any) => (
                                                <div
                                                    key={exercise.id}
                                                    className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-800">
                                                            {exercise.exerciseName}
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {exercise.targetMuscle ||
                                                                "Toàn thân"}
                                                        </p>
                                                    </div>

                                                    <span className="shrink-0 text-sm font-bold text-slate-600">
                            {exercise.sets} ×{" "}
                                                        {exercise.reps}
                          </span>
                                                </div>
                                            ),
                                        )}

                                        {!session.isCompleted && (
                                            <Button
                                                variant="primary"
                                                className="mt-3 w-full"
                                                isLoading={
                                                    completingSessionId ===
                                                    String(
                                                        session.id,
                                                    )
                                                }
                                                loadingText="Đang cập nhật..."
                                                onClick={() =>
                                                    void handleCompleteSession(
                                                        String(
                                                            session.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Hoàn thành buổi tập
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ),
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}