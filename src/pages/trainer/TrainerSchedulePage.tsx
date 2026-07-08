import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle2, XCircle, User, Loader2 } from "lucide-react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { trainerService } from "../../services/trainerService";
import type { TrainerSession } from "../../types/trainer.type";

export default function TrainerSchedulePage() {
  const [sessions, setSessions] = useState<TrainerSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await trainerService.getTrainerSchedule();
        setSessions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const getStatusBadge = (status: TrainerSession["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success" className="shadow-sm shadow-emerald-500/20">Đã hoàn thành</Badge>;
      case "SCHEDULED":
        return <Badge variant="info" className="shadow-sm shadow-blue-500/20">Sắp diễn ra</Badge>;
      case "CANCELLED":
        return <Badge variant="danger" className="shadow-sm shadow-red-500/20">Bị hủy</Badge>;
      default:
        return <Badge variant="default">Không xác định</Badge>;
    }
  };

  const getStatusIcon = (status: TrainerSession["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case "SCHEDULED":
        return <Clock className="w-6 h-6 text-blue-500" />;
      case "CANCELLED":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-fit-primary/10 to-blue-600/10 rounded-2xl border border-fit-primary/20 shadow-sm backdrop-blur-sm">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fit-primary to-blue-600">Lịch dạy hôm nay</h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">Theo dõi các ca huấn luyện cá nhân trong ngày</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 text-fit-primary font-bold">
          <Calendar className="w-5 h-5" />
          <span>{new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      <Card className="overflow-hidden border-0 ring-1 ring-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/80 backdrop-blur-xl">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 text-fit-primary animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Hôm nay bạn không có ca dạy nào.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-slate-50 transition-colors duration-200 flex flex-col sm:flex-row gap-6 sm:items-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500">Giờ</p>
                    <p className="text-lg font-black text-fit-primary">{session.startTime}</p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-5 h-5 text-slate-400" />
                      {session.memberName}
                    </h3>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(session.status)}
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {session.startTime} - {session.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {session.date}
                    </span>
                  </div>
                  
                  {session.notes && (
                    <div className="mt-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">Ghi chú: </span>
                      {session.notes}
                    </div>
                  )}
                </div>
                
                {session.status === "SCHEDULED" && (
                  <div className="shrink-0 flex gap-2">
                    <button className="px-4 py-2 bg-emerald-50 text-emerald-600 font-semibold rounded-lg border border-emerald-200 hover:bg-emerald-500 hover:text-white transition-colors duration-300">
                      Hoàn thành
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg border border-red-200 hover:bg-red-500 hover:text-white transition-colors duration-300">
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
