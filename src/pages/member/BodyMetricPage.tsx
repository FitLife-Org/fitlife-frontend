import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, TrendingDown, TrendingUp, Scale, Ruler, HeartPulse, Dumbbell, X, Plus, Save } from "lucide-react";
import toast from "react-hot-toast";
import { bodyMetricService } from "../../features/bodyMetric/services/bodyMetricService";
import type { BodyMetric, BodyMetricProgress } from "../../features/user/types/member.type";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useBodyMetricLogic } from "../../features/bodyMetric/utils/useBodyMetricLogic";

export default function BodyMetricPage() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [progress, setProgress] = useState<BodyMetricProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsData, progressData] = await Promise.all([
        bodyMetricService.getMyMetrics(),
        bodyMetricService.getMyProgress()
      ]);
      setMetrics(metricsData.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()));
      setProgress(progressData);
    } catch (error) {
      toast.error("Không thể tải chỉ số cơ thể.");
    } finally {
      setLoading(false);
    }
  };

  const {
    showAddModal,
    submitting,
    formData,
    setFormData,
    handleSubmit,
    handleOpenModal,
    handleCloseModal
  } = useBodyMetricLogic(fetchData);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  const latestMetric = metrics[0];

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case "weightKg": return <Scale className="w-6 h-6 text-emerald-600" />;
      case "bmi": return <Activity className="w-6 h-6 text-blue-600" />;
      case "bodyFatPercent": return <HeartPulse className="w-6 h-6 text-red-600" />;
      case "muscleMassKg": return <Dumbbell className="w-6 h-6 text-orange-600" />;
      default: return <Activity className="w-6 h-6 text-slate-600" />;
    }
  };

  const getMetricLabel = (metricName: string) => {
    switch (metricName) {
      case "weightKg": return "Cân nặng";
      case "bmi": return "Chỉ số BMI";
      case "bodyFatPercent": return "Tỷ lệ mỡ (Body Fat)";
      case "muscleMassKg": return "Lượng cơ bắp";
      default: return metricName;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Chỉ số cơ thể</h1>
          <p className="text-slate-500 mt-2 text-lg">Theo dõi hành trình thay đổi vóc dáng của bạn.</p>
        </div>
        <Button 
          variant="primary"
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/20 hover:-translate-y-1 hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" /> Cập nhật chỉ số
        </Button>
      </div>

      {!latestMetric ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-100">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Bạn chưa có dữ liệu InBody nào.</p>
          <p className="text-sm text-slate-400 mt-2">Vui lòng liên hệ Huấn luyện viên (PT) hoặc Lễ tân để được đo và cập nhật chỉ số.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Bento Grid cho Tiến độ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {progress.map((prog, idx) => (
              <motion.div 
                key={prog.metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    {getMetricIcon(prog.metric)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${
                    prog.trend === "up" ? "bg-emerald-50 text-emerald-600" : 
                    prog.trend === "down" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                  }`}>
                    {prog.trend === "up" ? <TrendingUp className="w-3 h-3" /> : prog.trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                    {prog.change > 0 ? "+" : ""}{prog.change}{prog.metric === "bodyFatPercent" ? "%" : "kg"}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{getMetricLabel(prog.metric)}</p>
                  <h3 className="text-3xl font-black text-slate-900">
                    {prog.currentValue}
                    <span className="text-base font-medium text-slate-400 ml-1">{prog.metric === "bodyFatPercent" ? "%" : prog.metric === "bmi" ? "" : "kg"}</span>
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Biểu đồ Premium */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 relative overflow-hidden group"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10 gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tiến độ 8 tuần qua</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Phân tích xu hướng giảm mỡ & cân nặng</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-sm font-bold text-slate-700">Cân nặng (kg)</span>
                </div>
              </div>
            </div>

            <div className="h-[320px] w-full relative">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-10 flex flex-col justify-between text-xs font-bold text-slate-400 z-10">
                <span>72kg</span>
                <span>70kg</span>
                <span>68kg</span>
                <span>66kg</span>
                <span>64kg</span>
              </div>
              
              <div className="ml-12 h-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
                        <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Grid lines */}
                    {[0, 50, 100, 150, 200].map((y, i) => (
                      <line key={y} x1="0" x2="100%" y1={y} y2={y} stroke="#f1f5f9" strokeWidth="2" strokeDasharray={i === 4 ? "0" : "8 8"} />
                    ))}

                    {/* Area under curve */}
                    <motion.path 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      d="M 20 180 L 128 160 L 236 150 L 344 120 L 452 100 L 560 80 L 668 90 L 776 40 L 776 200 L 20 200 Z" 
                      fill="url(#areaGradient)" 
                    />

                    {/* Main Line */}
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      d="M 20 180 L 128 160 L 236 150 L 344 120 L 452 100 L 560 80 L 668 90 L 776 40" 
                      fill="none" 
                      stroke="url(#lineGradient)" 
                      strokeWidth="5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      filter="url(#glow)"
                    />

                    {/* Data Points */}
                    {[
                      { x: 20, y: 180, val: 70.5, label: "Tuần 1" },
                      { x: 128, y: 160, val: 69.8, label: "Tuần 2" },
                      { x: 236, y: 150, val: 69.2, label: "Tuần 3" },
                      { x: 344, y: 120, val: 68.2, label: "Tuần 4" },
                      { x: 452, y: 100, val: 67.5, label: "Tuần 5" },
                      { x: 560, y: 80, val: 67.0, label: "Tuần 6" },
                      { x: 668, y: 90, val: 67.2, label: "Tuần 7" },
                      { x: 776, y: 40, val: 66.1, label: "Tuần 8" },
                    ].map((point, i) => (
                      <g key={i}>
                        <motion.circle 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.6 + i * 0.1, type: "spring", stiffness: 200 }}
                          cx={point.x} cy={point.y} r="6" fill="#fff" stroke="#10b981" strokeWidth="3" 
                          className="cursor-pointer hover:stroke-emerald-400 hover:r-8 transition-all duration-300"
                        />
                        <motion.text 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 + i * 0.1 }}
                          x={point.x} y={point.y - 18} 
                          textAnchor="middle" 
                          className="text-[15px] font-black fill-slate-700"
                        >
                          {point.val}
                        </motion.text>
                        {/* X-axis label */}
                        <motion.text 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1 }}
                          x={point.x} y="235" 
                          textAnchor="middle" 
                          className="text-[13px] font-bold fill-slate-400 uppercase tracking-wider"
                        >
                          {point.label}
                        </motion.text>
                      </g>
                    ))}
                  </svg>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Thêm Chỉ Số */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden z-10"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-emerald-500" />
                  Cập nhật chỉ số
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-rose-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Input 
                    label="Cân nặng (kg) *" 
                    type="number" 
                    step="0.1"
                    placeholder="VD: 70.5"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({...formData, weightKg: e.target.value})}
                    required
                  />
                  <Input 
                    label="Chiều cao (cm)" 
                    type="number" 
                    placeholder="VD: 175"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({...formData, heightCm: e.target.value})}
                  />
                  <Input 
                    label="Tỷ lệ mỡ (%)" 
                    type="number" 
                    step="0.1"
                    placeholder="VD: 18.5"
                    value={formData.bodyFatPercent}
                    onChange={(e) => setFormData({...formData, bodyFatPercent: e.target.value})}
                  />
                  <Input 
                    label="Lượng cơ bắp (kg)" 
                    type="number" 
                    step="0.1"
                    placeholder="VD: 35.2"
                    value={formData.muscleMassKg}
                    onChange={(e) => setFormData({...formData, muscleMassKg: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCloseModal}
                    className="rounded-xl px-6"
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    isLoading={submitting}
                    className="rounded-xl px-8 flex items-center gap-2 shadow-lg shadow-fit-primary/20"
                  >
                    <Save className="w-5 h-5" />
                    Lưu chỉ số
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
