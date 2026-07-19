import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Activity, Calendar as CalendarIcon, CreditCard, Dumbbell, 
  Flame, Heart, History, TrendingUp, ChevronRight 
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { useMemberHome } from "../../hooks/useMemberHome";
import { X } from "lucide-react";

export default function MemberHomePage() {
  const { user, activeSub, loading, calculateDaysLeft } = useMemberHome();

  const statCards = [
    { title: "Ngày tập tháng này", value: "12", unit: "ngày", icon: <CalendarIcon className="h-6 w-6" />, color: "from-blue-500 to-cyan-400" },
    { title: "Calories đốt cháy", value: "3,240", unit: "kcal", icon: <Flame className="h-6 w-6" />, color: "from-orange-500 to-red-400" },
    { title: "Thời gian tập", value: "14.5", unit: "giờ", icon: <Activity className="h-6 w-6" />, color: "from-emerald-500 to-teal-400" },
    { title: "Chỉ số BMI", value: "22.4", unit: "Bình thường", icon: <Heart className="h-6 w-6" />, color: "from-purple-500 to-indigo-400" },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title={`Chào mừng trở lại, ${user?.fullName?.split(" ").pop() || "Hội viên"}! 👋`}
          description="Cùng xem lại tiến trình tập luyện của bạn hôm nay nhé."
        />
        <div className="flex gap-3">
          <Link 
            to="/member/checkins"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-fit-primary px-5 py-3 font-bold text-white shadow-lg shadow-fit-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            <img src="https://api.iconify.design/mdi:qrcode-scan.svg?color=white" alt="Scan QR" className="w-5 h-5" />
            Quét Mã Phòng Tập
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
          >
            <Card className="p-5 h-full overflow-hidden relative group cursor-pointer border-none shadow-md hover:shadow-lg transition-all">
              <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 transition-transform group-hover:scale-150`}></div>
              <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                {stat.icon}
              </div>
              <p className="text-sm font-medium text-fit-muted">{stat.title}</p>
              <div className="mt-1 flex items-baseline gap-1">
                <h3 className="text-2xl font-black text-fit-text">{stat.value}</h3>
                <span className="text-xs font-medium text-fit-muted">{stat.unit}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-fit-text flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-fit-primary" />
                Gói tập hiện tại
              </h2>
              <Link to="/member/subscriptions" className="text-sm font-medium text-fit-primary hover:underline flex items-center">
                Quản lý gói <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {activeSub ? (
              <Card className="p-0 overflow-hidden border-none shadow-xl bg-slate-900 text-white">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div>
                    <Badge variant="success">Đang hoạt động</Badge>
                    <h3 className="mt-3 text-2xl font-black">{activeSub.gymPackageName || "Gói tập FitLife"}</h3>
                    <p className="mt-1 text-slate-400 text-sm">Hiệu lực đến: {activeSub.endDate}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center min-w-[120px]">
                    <p className="text-xs text-slate-300 font-medium">Còn lại</p>
                    <p className="text-3xl font-black text-emerald-400">{calculateDaysLeft(activeSub.endDate || "")}</p>
                    <p className="text-xs text-slate-300">ngày</p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center border-dashed border-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                  <CreditCard className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-900">Chưa có gói tập</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Bạn cần đăng ký gói tập để sử dụng dịch vụ.</p>
                <Link to="/member/packages" className="text-fit-primary font-bold hover:underline">
                  Xem bảng giá ngay
                </Link>
              </Card>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-fit-text flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-fit-primary" />
                Bài tập hôm nay
              </h2>
            </div>
            <Card className="p-6 border-l-4 border-l-fit-primary">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Lịch tập Ngực & Tay sau (Chest & Triceps)</h3>
                  <p className="text-sm text-fit-muted mt-1">Cấp độ: Trung bình • Thời gian: 60 phút</p>
                </div>
                <Badge variant="warning">Chưa hoàn thành</Badge>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Bench Press", sets: "4 sets x 10 reps" },
                  { name: "Incline DB Press", sets: "3 sets x 12 reps" },
                  { name: "Cable Crossover", sets: "3 sets x 15 reps" },
                  { name: "Tricep Pushdown", sets: "4 sets x 12 reps" }
                ].map((exercise, i) => (
                  <div key={i} className="bg-fit-bg p-3 rounded-lg border border-fit-border">
                    <p className="font-bold text-sm text-slate-800">{exercise.name}</p>
                    <p className="text-xs text-fit-muted mt-1">{exercise.sets}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">
                  Đánh dấu hoàn thành
                </button>
              </div>
            </Card>
          </section>

        </div>

        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-fit-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-fit-primary" />
                Mục tiêu tuần
              </h2>
            </div>
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">Số buổi tập</span>
                    <span className="font-bold text-fit-primary">3/5 buổi</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-fit-primary rounded-full w-[60%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">Calories tiêu hao</span>
                    <span className="font-bold text-orange-500">1,200/2,000 kcal</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full w-[60%]"></div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-fit-text flex items-center gap-2">
                <History className="w-5 h-5 text-fit-primary" />
                Hoạt động gần đây
              </h2>
            </div>
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {[
                  { title: "Check-in thành công", desc: "Cơ sở Q1", time: "Hôm nay, 17:30", type: "checkin" },
                  { title: "Hoàn thành bài tập", desc: "Cardio & Bụng", time: "Hôm qua, 18:45", type: "workout" },
                  { title: "Gia hạn gói tập", desc: "Premium 3 tháng", time: "2 ngày trước", type: "payment" }
                ].map((log, i) => (
                  <div key={i} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors">
                    <div className="mt-1">
                      {log.type === 'checkin' && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />}
                      {log.type === 'workout' && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />}
                      {log.type === 'payment' && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{log.title}</p>
                      <p className="text-xs text-slate-500">{log.desc}</p>
                    </div>
                    <div className="ml-auto text-xs text-slate-400 whitespace-nowrap">{log.time}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link to="/member/checkin" className="text-sm font-medium text-fit-primary hover:underline">
                  Xem tất cả lịch sử
                </Link>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
