import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Button from "../../components/common/Button";
import { ROUTES } from "../../config/routes";
import { workoutService } from "../../services/workoutService";
import type { WorkoutPlan } from "../../types/workout.type";
import { getApiErrorMessage } from "../../utils/apiError";

function buildWorkoutDetailRoute(planId: string | number): string {
  return ROUTES.MEMBER_WORKOUT_DETAIL.replace(":id", String(planId));
}

export default function WorkoutPlansPage() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);

  const fetchPlans = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await workoutService.getMyWorkoutPlans();
      setPlans(data);
    } catch (error) {
      setPlans([]);
      toast.error(
          getApiErrorMessage(error, "Không thể tải danh sách giáo án."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  const handleCompleteSession = async (sessionId: string): Promise<void> => {
    if (completingSessionId !== null) {
      return;
    }

    try {
      setCompletingSessionId(sessionId);
      await workoutService.completeSession(sessionId);

      toast.success("Tuyệt vời! Bạn đã hoàn thành buổi tập.");
      setPlans((previousPlans) =>
          previousPlans.map((plan) => ({
            ...plan,
            sessions: (plan.sessions ?? []).map((session) =>
                String(session.id) === sessionId
                    ? { ...session, isCompleted: true }
                    : session,
            ),
          })),
      );
    } catch (error) {
      toast.error(
          getApiErrorMessage(error, "Có lỗi xảy ra khi cập nhật tiến độ."),
      );
    } finally {
      setCompletingSessionId(null);
    }
  };

  if (loading) {
    return (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
        </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  };

  return (
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Giáo án của tôi
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Theo dõi tiến độ và hoàn thành bài tập mỗi ngày.
          </p>
        </div>

        {plans.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-12 text-center">
              <Dumbbell className="mx-auto mb-4 h-16 w-16 text-slate-300" />
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Chưa có giáo án nào
              </h3>
              <p className="text-slate-500">
                Hãy sử dụng FitLife AI để tạo và áp dụng giáo án phù hợp.
              </p>
              <Button
                  variant="primary"
                  className="mt-6"
                  onClick={() => navigate(ROUTES.MEMBER_AI)}
              >
                Tạo giáo án bằng AI
              </Button>
            </div>
        ) : (
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
              {plans.map((plan) => {
                const sessions = plan.sessions ?? [];
                const completedCount = sessions.filter(
                    (session) => session.isCompleted,
                ).length;
                const progress =
                    sessions.length > 0
                        ? (completedCount / sessions.length) * 100
                        : 0;

                return (
                    <motion.div
                        key={plan.id}
                        variants={itemVariants}
                        className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8"
                    >
                      <div className="mb-8 flex flex-col justify-between gap-6 border-b border-slate-100 pb-8 lg:flex-row">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                        {plan.status === "ACTIVE" ? "Đang tập" : plan.status}
                      </span>
                            <h2 className="text-2xl font-black text-slate-900">
                              {plan.name}
                            </h2>
                          </div>

                          <p className="mt-3 flex items-center gap-2 text-slate-500">
                            <Target className="h-4 w-4 text-slate-400" />
                            Mục tiêu: {plan.goal || "Chưa xác định"}
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-slate-500">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            HLV: {plan.trainerName || "FitLife AI"}
                          </p>

                          <Button
                              variant="outline"
                              className="mt-5"
                              onClick={() =>
                                  navigate(buildWorkoutDetailRoute(plan.id))
                              }
                          >
                            Xem chi tiết
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-5 lg:w-1/3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-bold text-slate-700">Tiến độ</span>
                            <span className="font-black text-emerald-600">
                        {Math.round(progress)}%
                      </span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="mt-2 text-right text-xs text-slate-400">
                            Đã tập {completedCount}/{sessions.length} buổi
                          </p>
                        </div>
                      </div>

                      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                        <Activity className="h-5 w-5 text-emerald-500" />
                        Lịch tập trong tuần
                      </h3>

                      {sessions.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                            <Dumbbell className="mx-auto h-10 w-10 text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">
                              Giáo án chưa có buổi tập.
                            </p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {sessions.map((session) => {
                              const exercises = session.exercises ?? [];

                              return (
                                  <motion.div
                                      key={session.id}
                                      whileHover={{ y: -5 }}
                                      className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                                          session.isCompleted
                                              ? "border-emerald-100 bg-emerald-50/50"
                                              : "border-slate-200 bg-white shadow-sm hover:shadow-md"
                                      }`}
                                  >
                                    <div className="mb-4 flex items-start justify-between">
                                      <div>
                                        <p className="mb-1 text-sm font-bold text-emerald-600">
                                          Thứ {session.dayOfWeek}
                                        </p>
                                        <h4 className="text-lg font-black text-slate-900">
                                          {session.name}
                                        </h4>
                                      </div>
                                      {session.isCompleted && (
                                          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-500" />
                                      )}
                                    </div>

                                    <div className="mb-6 space-y-3">
                                      {exercises.length === 0 ? (
                                          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                                            Chưa có bài tập trong buổi này.
                                          </p>
                                      ) : (
                                          exercises.map((exercise) => (
                                              <div
                                                  key={exercise.id}
                                                  className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm last:border-0"
                                              >
                                                <div>
                                                  <p className="font-semibold text-slate-700">
                                                    {exercise.name}
                                                  </p>
                                                  <p className="text-xs text-slate-400">
                                                    {exercise.targetMuscle || "Toàn thân"}
                                                  </p>
                                                </div>
                                                <div className="text-right font-medium text-slate-600">
                                                  {exercise.sets}×{exercise.reps}
                                                </div>
                                              </div>
                                          ))
                                      )}
                                    </div>

                                    {!session.isCompleted && (
                                        <Button
                                            variant="primary"
                                            className="w-full rounded-xl border-none bg-slate-900 py-3 text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800"
                                            isLoading={
                                                completingSessionId === String(session.id)
                                            }
                                            loadingText="Đang xử lý..."
                                            disabled={
                                                completingSessionId !== null &&
                                                completingSessionId !== String(session.id)
                                            }
                                            onClick={() =>
                                                void handleCompleteSession(String(session.id))
                                            }
                                        >
                                          Hoàn thành buổi tập
                                        </Button>
                                    )}
                                  </motion.div>
                              );
                            })}
                          </div>
                      )}
                    </motion.div>
                );
              })}
            </motion.div>
        )}
      </div>
  );
}
