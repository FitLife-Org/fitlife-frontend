import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, TrendingDown, TrendingUp, Scale, Ruler, HeartPulse, Dumbbell } from "lucide-react";
import toast from "react-hot-toast";
import { bodyMetricService } from "../../services/bodyMetricService";
import type { BodyMetric, BodyMetricProgress } from "../../types/member.type";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function BodyMetricPage() {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [progress, setProgress] = useState<BodyMetricProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({ height: "", weight: "", bodyFat: "", muscleMass: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [metricsData, progressData] = await Promise.all([
        bodyMetricService.getMyMetrics(),
        bodyMetricService.getMyProgress()
      ]);
      setMetrics(metricsData.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime()));
      setProgress(progressData);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.height || !formData.weight) {
      toast.error("Vui lòng nhập chiều cao và cân nặng.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const newMetric = await bodyMetricService.createMyMetric({
        height: Number(formData.height),
        weight: Number(formData.weight),
        bodyFat: formData.bodyFat ? Number(formData.bodyFat) : undefined,
        muscleMass: formData.muscleMass ? Number(formData.muscleMass) : undefined,
      });
      setMetrics(prev => [newMetric, ...prev]);
      setShowForm(false);
      setFormData({ height: "", weight: "", bodyFat: "", muscleMass: "" });
      toast.success("Thêm chỉ số mới thành công!");
    } catch (error) {
      toast.error("Lỗi khi thêm chỉ số.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      case "weight": return <Scale className="w-6 h-6 text-emerald-600" />;
      case "bmi": return <Activity className="w-6 h-6 text-blue-600" />;
      case "bodyFat": return <HeartPulse className="w-6 h-6 text-red-600" />;
      case "muscleMass": return <Dumbbell className="w-6 h-6 text-orange-600" />;
      default: return <Activity className="w-6 h-6 text-slate-600" />;
    }
  };

  const getMetricLabel = (metricName: string) => {
    switch (metricName) {
      case "weight": return "Cân nặng";
      case "bmi": return "Chỉ số BMI";
      case "bodyFat": return "Tỷ lệ mỡ (Body Fat)";
      case "muscleMass": return "Lượng cơ bắp";
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
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 border-none"
        >
          {showForm ? "Hủy" : <><Plus className="w-4 h-4" /> Cập nhật InBody</>}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm"
            onSubmit={handleCreate}
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6">Thêm chỉ số mới (Hôm nay)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Input 
                label="Chiều cao (cm) *" 
                type="number" 
                value={formData.height} 
                onChange={(e) => setFormData({...formData, height: e.target.value})} 
                placeholder="Ví dụ: 175"
              />
              <Input 
                label="Cân nặng (kg) *" 
                type="number" 
                value={formData.weight} 
                onChange={(e) => setFormData({...formData, weight: e.target.value})} 
                placeholder="Ví dụ: 70.5"
              />
              <Input 
                label="Tỷ lệ mỡ (%)" 
                type="number" 
                value={formData.bodyFat} 
                onChange={(e) => setFormData({...formData, bodyFat: e.target.value})} 
                placeholder="Ví dụ: 15.5"
              />
              <Input 
                label="Cơ bắp (kg)" 
                type="number" 
                value={formData.muscleMass} 
                onChange={(e) => setFormData({...formData, muscleMass: e.target.value})} 
                placeholder="Ví dụ: 35.2"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="rounded-full bg-emerald-500 text-white border-none hover:bg-emerald-600 px-8" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : "Lưu chỉ số"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!latestMetric ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-100">
          <p className="text-slate-500 mb-4">Chưa có dữ liệu InBody nào.</p>
          <Button variant="primary" onClick={() => setShowForm(true)} className="rounded-full">Thêm chỉ số đầu tiên</Button>
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
                    {prog.change > 0 ? "+" : ""}{prog.change}{prog.metric === "bodyFat" ? "%" : "kg"}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{getMetricLabel(prog.metric)}</p>
                  <h3 className="text-3xl font-black text-slate-900">
                    {prog.currentValue}
                    <span className="text-base font-medium text-slate-400 ml-1">{prog.metric === "bodyFat" ? "%" : prog.metric === "bmi" ? "" : "kg"}</span>
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Biểu đồ (Mock SVG) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900">Tiến độ 8 tuần qua</h3>
              <span className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full">Đường màu xanh: Cân nặng</span>
            </div>
            <div className="h-72 rounded-2xl bg-gradient-to-b from-white to-emerald-50/30 p-2">
              <svg className="h-full w-full" viewBox="0 0 800 260" preserveAspectRatio="none">
                {[50, 100, 150, 200].map((y) => <line key={y} x1="0" x2="100%" y1={y} y2={y} stroke="#f1f5f9" strokeWidth="2" />)}
                <polyline fill="none" points="20,180 100,170 180,165 260,150 340,140 420,130 500,120 580,110 660,105 740,90" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {[20, 100, 180, 260, 340, 420, 500, 580, 660, 740].map((x, i) => (
                  <circle key={x} cx={x} cy={[180, 170, 165, 150, 140, 130, 120, 110, 105, 90][i]} r="5" fill="#fff" stroke="#10b981" strokeWidth="3" />
                ))}
              </svg>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
