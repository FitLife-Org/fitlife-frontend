import { useEffect, useState } from "react";
import { Activity, Target, TrendingUp, Scale, AlertCircle } from "lucide-react";
import Card from "../../components/common/Card";
import { trainerService } from "../../features/trainer/services/trainerService";
import type { WorkoutProgress } from "../../features/trainer/types/trainer.type";

export default function WorkoutTrackingPage() {
  const [progress, setProgress] = useState<WorkoutProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Hardcode memberId 101 for mock demonstration
  const MOCK_MEMBER_ID = 101;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const data = await trainerService.getMemberWorkoutProgress(MOCK_MEMBER_ID);
        setProgress(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-fit-primary/10 to-blue-600/10 rounded-2xl border border-fit-primary/20 shadow-sm backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fit-primary to-blue-600">Theo dõi Tiến độ</h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">Hội viên: Nguyễn Văn A (ID: {progress.memberId})</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <button className="px-6 py-2.5 bg-gradient-to-r from-fit-primary to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-fit-primary/30 hover:-translate-y-0.5 transition-all duration-300">
            Cập nhật chỉ số
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Cân nặng hiện tại</p>
              <h3 className="text-2xl font-black text-slate-800">{progress.weight} <span className="text-sm text-slate-500">kg</span></h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Tỷ lệ mỡ (Body Fat)</p>
              <h3 className="text-2xl font-black text-slate-800">{progress.bodyFatPercentage} <span className="text-sm text-slate-500">%</span></h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Lượng cơ (Muscle)</p>
              <h3 className="text-2xl font-black text-slate-800">{progress.muscleMass} <span className="text-sm text-slate-500">kg</span></h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group bg-gradient-to-br from-slate-900 to-slate-800 border-0">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all duration-500"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-yellow-400 shadow-inner backdrop-blur-md">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Mục tiêu cân nặng</p>
              <h3 className="text-2xl font-black text-white">{progress.goals.targetWeight} <span className="text-sm text-slate-400">kg</span></h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5 text-fit-primary" />
            <h3 className="text-lg font-bold text-slate-800">Mục tiêu huấn luyện</h3>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-700 italic">"{progress.goals.description}"</p>
          </div>
          <p className="text-sm text-slate-400 mt-4 text-right">Cập nhật lần cuối: {progress.lastUpdated}</p>
        </Card>

        <Card className="p-6 flex flex-col justify-center items-center text-center border-dashed border-2 bg-slate-50/50">
          <Activity className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Biểu đồ tiến độ</h3>
          <p className="text-slate-500 text-sm mt-1 mb-4">Tính năng vẽ biểu đồ sẽ được cập nhật trong phiên bản tiếp theo.</p>
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm font-semibold hover:bg-slate-50">
            Xem lịch sử đo inBody
          </button>
        </Card>
      </div>
    </div>
  );
}
