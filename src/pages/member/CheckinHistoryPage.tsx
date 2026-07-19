import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, History, X, ScanLine, XCircle } from "lucide-react";
import Button from "../../components/common/Button";
import GymQrScanner from "../../components/checkin/GymQrScanner";
import { useCheckinHistory } from "../../features/checkin/hooks/useCheckinHistory";
import { useAuthStore } from "../../store/authStore";

export default function CheckinHistoryPage() {
  const user = useAuthStore(state => state.user);
  
  const {
    history,
    loading,
    showScanner,
    setShowScanner,
    handleScanSuccess
  } = useCheckinHistory();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check-in</h1>
          <p className="text-slate-500 mt-1">Sử dụng mã QR để điểm danh khi đến phòng tập.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            onClick={() => setShowScanner(true)}
            className="rounded-xl bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 border-none"
          >
            <ScanLine className="w-5 h-5 text-emerald-400" /> Quét QR Phòng tập
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Lịch sử ra vào</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Bạn chưa có lượt check-in nào.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {history.map((record) => (
              <div key={record.id} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${record.status === "SUCCESS" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                    {record.status === "SUCCESS" ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {new Date(record.checkInTime).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Thời gian: {new Date(record.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                  record.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}>
                  {record.status === "SUCCESS" ? <CheckCircle2 className="w-4 h-4" /> : null}
                  {record.status === "SUCCESS" ? "Thành công" : "Thất bại"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 z-50"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-emerald-600" /> Quét mã QR Phòng tập
              </h2>
              <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 min-h-[300px]">
                <GymQrScanner onSuccess={() => {
                   setShowScanner(false);
                   handleScanSuccess("SUCCESS");
                }} />
              </div>
              <p className="text-center text-sm font-medium text-slate-500 mt-4">
                Sử dụng Camera để quét mã đặt tại quầy Lễ tân
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
