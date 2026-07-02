import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Clock, CheckCircle2, History, X } from "lucide-react";
import toast from "react-hot-toast";
import { checkinService } from "../../services/checkinService";
import type { CheckinRecord, GenerateQrResponse } from "../../types/checkin.type";
import Button from "../../components/common/Button";

export default function CheckinHistoryPage() {
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState<GenerateQrResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await checkinService.getMyCheckins();
      setHistory(data.sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()));
    } finally {
      setLoading(false);
    }
  };

  const handleShowQr = async () => {
    setShowQrModal(true);
    setGenerating(true);
    try {
      const data = await checkinService.generateQr();
      setQrData(data);
    } catch (error) {
      toast.error("Không thể tạo mã QR lúc này.");
      setShowQrModal(false);
    } finally {
      setGenerating(false);
    }
  };

  const closeQrModal = () => {
    setShowQrModal(false);
    setQrData(null);
  };

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
        <Button 
          variant="primary" 
          onClick={handleShowQr}
          className="rounded-full bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 border-none"
        >
          <QrCode className="w-5 h-5" /> Mã QR của tôi
        </Button>
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
              <div key={record.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {new Date(record.checkedInAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Thời gian: {new Date(record.checkedInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
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
        {showQrModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQrModal}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl z-50 text-center"
            >
              <button 
                onClick={closeQrModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">Mã Check-in</h2>
              <p className="text-slate-500 text-sm mb-8">Đưa mã này cho Lễ tân quét để điểm danh.</p>
              
              <div className="bg-slate-50 p-6 rounded-3xl inline-block mx-auto border border-slate-100 mb-6">
                {generating || !qrData ? (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-300">
                    <div className="w-8 h-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-white rounded-2xl flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300">
                    <QrCode className="w-24 h-24 text-slate-900 mb-2" />
                    <p className="text-[10px] text-slate-400 font-mono break-all">{qrData.qrCodeData}</p>
                  </div>
                )}
              </div>
              
              {qrData && (
                <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-medium">
                  Mã sẽ hết hạn vào: {new Date(qrData.expiresAt).toLocaleTimeString('vi-VN')}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
