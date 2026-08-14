import { useEffect, useState, useMemo } from "react";
import { usePageAnimation } from "../../hooks/usePageAnimation";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Dumbbell, Target, CheckCircle2, Clock, Check } from "lucide-react";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";
import { workoutService } from "../../services/workoutService";
import { subscriptionService } from "../../services/subscriptionService";
import type { WorkoutPlan, WorkoutPlanDay } from "../../types/workout.type";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../utils/apiError";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

export default function MemberSchedulePage() {
  const containerRef = usePageAnimation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState<boolean>(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const [sub, data] = await Promise.all([
        subscriptionService.getMySubscription(),
        workoutService.getMyWorkoutPlans()
      ]);
      
      setHasSubscription(!!sub);
      setPlans(data);
      const active = data.find((p) => p.status === "ACTIVE") || data[0] || null;
      setActivePlan(active);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải lịch tập."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentDate]);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getSystemDayOfWeek = (date: Date) => {
    const day = date.getDay();
    if (day === 0) return ["8", "CN", "Chủ nhật", "8.0", "CN."];
    return [(day + 1).toString(), `Thứ ${day + 1}`];
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (completingSessionId) return;

    try {
      setCompletingSessionId(sessionId);
      await workoutService.completeSession(sessionId);

      toast.success("Tuyệt vời! Bạn đã hoàn thành buổi tập.");
      
      if (activePlan) {
        setActivePlan(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            days: (prev.days ?? []).map(day => 
              String(day.id) === sessionId ? { ...day, isCompleted: true } : day
            )
          };
        });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Có lỗi xảy ra khi cập nhật tiến độ."));
    } finally {
      setCompletingSessionId(null);
    }
  };

  if (loading) {
    return <Loading label="Đang tải lịch tập..." />;
  }

  return (
    <div className="space-y-6 pb-10" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lịch Tập Của Tôi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi và quản lý lịch tập luyện hàng tuần.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" onClick={goToToday} className="font-semibold px-4 text-slate-700">
            Hôm nay
          </Button>
          <Button variant="outline" onClick={goToNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!hasSubscription ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <CalendarIcon className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            Chưa có gói tập nào
          </h3>
          <p className="text-slate-500">
            Bạn cần đăng ký gói tập để sử dụng chức năng lịch tập và nhận giáo án cá nhân hóa.
          </p>
          <Button
            variant="primary"
            className="mt-6 shadow-md shadow-fit-primary/20"
            onClick={() => navigate(ROUTES.MEMBER_PACKAGES)}
          >
            Đăng ký gói tập ngay
          </Button>
        </div>
      ) : !activePlan ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <CalendarIcon className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            Chưa có giáo án nào đang hoạt động
          </h3>
          <p className="text-slate-500">
            Bạn cần có một giáo án để xem lịch tập. Hãy sử dụng FitLife AI để tạo giáo án phù hợp với bạn.
          </p>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => navigate(ROUTES.MEMBER_AI)}
          >
            Tạo giáo án ngay
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
             <div className="flex items-center justify-between">
                <div>
                   <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Giáo án hiện tại</span>
                   <h2 className="text-lg font-black text-emerald-900">{activePlan.name}</h2>
                </div>
                <Button variant="outline" onClick={() => navigate(ROUTES.MEMBER_WORKOUTS)}>
                   Đổi giáo án
                </Button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((date, index) => {
              const isToday = new Date().toDateString() === date.toDateString();
              const systemDays = getSystemDayOfWeek(date);
              
              const daySession = activePlan.days?.find(d => {
                if (!d.dayOfWeek) return false;
                // Normalize and compare
                return systemDays.some(sd => String(d.dayOfWeek).toUpperCase().includes(sd.toUpperCase()));
              });

              return (
                <div 
                  key={index} 
                  className={`flex flex-col rounded-2xl border p-4 transition-all ${
                    isToday 
                      ? "border-emerald-500 ring-1 ring-emerald-500 bg-white shadow-md relative" 
                      : daySession && daySession.isCompleted
                        ? "border-slate-200 bg-slate-50"
                        : "border-slate-200 bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {isToday && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm whitespace-nowrap">
                      Hôm nay
                    </div>
                  )}

                  <div className="mb-4 text-center pb-3 border-b border-slate-100">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-emerald-600" : "text-slate-500"}`}>
                      {index === 6 ? "Chủ nhật" : `Thứ ${index + 2}`}
                    </p>
                    <p className={`mt-1 text-2xl font-black ${isToday ? "text-emerald-900" : "text-slate-900"}`}>
                      {date.getDate()}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    {!daySession ? (
                      <div className="text-center py-4">
                        <p className="text-sm font-medium text-slate-400">Ngày nghỉ</p>
                      </div>
                    ) : (
                      <div className="space-y-3 flex flex-col h-full">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 line-clamp-2 mb-1">
                            {daySession.name || "Buổi tập"}
                          </h4>
                          {daySession.focusArea && (
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                              <Target className="h-3 w-3 shrink-0" />
                              <span className="truncate">{daySession.focusArea}</span>
                            </div>
                          )}
                          <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-wide">
                            {daySession.exercises?.length || 0} bài tập
                          </p>
                        </div>

                        {daySession.isCompleted ? (
                          <div className="mt-auto flex items-center justify-center gap-1.5 rounded-xl bg-emerald-100/50 py-2 text-sm font-bold text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Đã tập
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            className={`mt-auto w-full rounded-xl shadow-sm border-none ${isToday ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                            isLoading={completingSessionId === String(daySession.id)}
                            disabled={completingSessionId !== null && completingSessionId !== String(daySession.id)}
                            onClick={() => handleCompleteSession(String(daySession.id))}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Hoàn thành
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
