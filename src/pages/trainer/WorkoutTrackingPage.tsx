import { useEffect, useState } from "react";
import { Plus, Search, Calendar, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { workoutService } from "../../services/workoutService";
import type { WorkoutPlan } from "../../types/workout.type";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function WorkoutTrackingPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await workoutService.getWorkoutPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    setCreating(true);
    try {
      // Gọi API POST /trainers/workout-plans với dữ liệu mock
      const newPlan = await workoutService.createWorkoutPlan({
        memberId: "MEM-002",
        name: "Giáo án Tăng Cơ 2",
        goal: "Tăng 2kg cơ",
        startDate: "2026-07-01",
        endDate: "2026-07-31",
        sessions: []
      });
      setPlans(prev => [...prev, newPlan]);
      toast.success("Tạo giáo án thành công (Mock)!");
    } catch (error) {
      toast.error("Có lỗi khi tạo giáo án.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Quản lý Giáo án</h1>
          <p className="text-slate-500 mt-1">Theo dõi tiến độ và giao bài tập cho hội viên.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleCreatePlan} 
          disabled={creating}
          className="rounded-full bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 border-none shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-4 h-4" /> 
          {creating ? "Đang tạo..." : "Tạo giáo án mới"}
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <Input 
            placeholder="Tìm kiếm theo tên hội viên hoặc giáo án..." 
            icon={<Search className="w-5 h-5 text-slate-400" />}
            className="max-w-md bg-slate-50 border-transparent focus:bg-white"
          />
        </div>

        {plans.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Chưa có giáo án nào.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {plans.map(plan => (
              <div key={plan.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      Hội viên: <span className="font-semibold text-slate-700">{plan.memberName}</span> • Mục tiêu: {plan.goal}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    plan.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                  }`}>
                    {plan.status}
                  </span>
                  <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
