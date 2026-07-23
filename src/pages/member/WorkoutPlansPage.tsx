import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Dumbbell, Calendar, Target, Clock, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { workoutService } from "../../services/workoutService";
import type { WorkoutPlan, WorkoutSession } from "../../types/workout.type";
import Button from "../../components/common/Button";

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await workoutService.getMyWorkoutPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    setCompletingSessionId(sessionId);
    try {
      await workoutService.completeSession(sessionId);
      toast.success("Tuyệt vời! Bạn đã hoàn thành buổi tập.");
      // Tạm cập nhật state cục bộ để UI phản hồi ngay (Mock UI Update)
      setPlans(prev => prev.map(p => ({
        ...p,
        sessions: p.sessions.map(s => s.id === sessionId ? { ...s, isCompleted: true } : s)
      })));
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật tiến độ.");
    } finally {
      setCompletingSessionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Giáo án của tôi</h1>
          <p className="text-slate-500 mt-2 text-lg">Theo dõi tiến độ và hoàn thành bài tập mỗi ngày.</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-100">
          <Dumbbell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có giáo án nào</h3>
          <p className="text-slate-500">Huấn luyện viên chưa cấp giáo án cho bạn.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {plans.map((plan) => {
            const completedCount = plan.sessions.filter(s => s.isCompleted).length;
            const progress = (completedCount / plan.sessions.length) * 100 || 0;

            return (
              <motion.div key={plan.id} variants={itemVariants} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                {/* Header Giáo án */}
                <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {plan.status === "ACTIVE" ? "Đang tập" : plan.status}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900">{plan.name}</h2>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2 mt-3">
                      <Target className="w-4 h-4 text-slate-400" /> Mục tiêu: {plan.goal}
                    </p>
                    <p className="text-slate-500 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-slate-400" /> HLV: {plan.trainerName}
                    </p>
                  </div>
                  <div className="w-full lg:w-1/3 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-slate-700">Tiến độ</span>
                      <span className="font-black text-emerald-600">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-right">Đã tập {completedCount}/{plan.sessions.length} buổi</p>
                  </div>
                </div>

                {/* Danh sách buổi tập */}
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" /> Lịch tập trong tuần
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {plan.sessions.map((session) => (
                    <motion.div 
                      key={session.id}
                      whileHover={{ y: -5 }}
                      className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                        session.isCompleted 
                          ? "bg-emerald-50/50 border-emerald-100" 
                          : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-bold text-emerald-600 mb-1">Thứ {session.dayOfWeek}</p>
                          <h4 className="text-lg font-black text-slate-900">{session.name}</h4>
                        </div>
                        {session.isCompleted && (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {session.exercises.map(exe => (
                          <div key={exe.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                            <div>
                              <p className="font-semibold text-slate-700">{exe.name}</p>
                              <p className="text-xs text-slate-400">{exe.targetMuscle}</p>
                            </div>
                            <div className="text-right font-medium text-slate-600">
                              {exe.sets}x{exe.reps}
                            </div>
                          </div>
                        ))}
                      </div>

                      {!session.isCompleted && (
                        <Button
                          variant="primary"
                          className="w-full bg-slate-900 text-white rounded-xl py-3 shadow-lg shadow-slate-900/20 hover:bg-slate-800 border-none transition-all"
                          onClick={() => handleCompleteSession(session.id)}
                          disabled={completingSessionId === session.id}
                        >
                          {completingSessionId === session.id ? "Đang xử lý..." : "Hoàn thành buổi tập"}
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
