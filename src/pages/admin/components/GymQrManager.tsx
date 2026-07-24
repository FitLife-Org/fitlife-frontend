import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { checkinService } from "../../../services/checkinService";
import type { AdminCheckInQrResponse } from "../../../types/checkin.type";

interface GymQrManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GymQrManager({ isOpen, onClose }: GymQrManagerProps) {
  const [qrPoints, setQrPoints] = useState<AdminCheckInQrResponse[]>([]);
  const [selectedQr, setSelectedQr] = useState<AdminCheckInQrResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchQrPoints();
    }
  }, [isOpen]);

  const fetchQrPoints = async () => {
    setLoading(true);
    try {
      const data = await checkinService.getAllGymQrs();
      const activePoints = data.filter(p => p.active || p.isActive);
      setQrPoints(activePoints);
      if (activePoints.length > 0) {
        setSelectedQr(activePoints[0]);
      } else {
        setSelectedQr(null);
      }
    } catch (error) {
      console.error("Failed to fetch gym QR points:", error);
      toast.error("Không thể tải danh sách mã QR từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedQr) {
      toast.error("Vui lòng chọn một điểm QR để tạo lại.");
      return;
    }
    setIsGenerating(true);
    try {
      const updated = await checkinService.regenerateGymQrToken(selectedQr.id);
      setSelectedQr(updated);
      setQrPoints(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast.success(`Đã tạo lại mã QR mới cho điểm "${updated.name}".`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo lại mã QR.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-slate-500" /> Mã QR Phòng Tập
              </h3>
              <button 
                onClick={onClose}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-medium text-sm">Đang tải...</p>
                </div>
              ) : selectedQr ? (
                <>
                  {qrPoints.length > 1 && (
                    <div className="mb-4 w-full">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Chọn cổng check-in</label>
                      <select
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-semibold"
                        value={selectedQr.id || ""}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const q = qrPoints.find(p => p.id === id);
                          if (q) setSelectedQr(q);
                        }}
                      >
                        {qrPoints.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.location ? `(${p.location})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {qrPoints.length === 1 && (
                    <div className="text-center mb-4">
                      <h4 className="font-bold text-slate-800 text-lg">{selectedQr.name}</h4>
                      {selectedQr.location && <p className="text-sm text-slate-500">{selectedQr.location}</p>}
                    </div>
                  )}

                  <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100 relative">
                    <QRCode
                      value={selectedQr.token}
                      size={240}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                  <p className="text-center text-sm font-medium text-slate-500 max-w-xs">
                    Màn hình này để cố định tại quầy. Hội viên dùng App FitLife để quét và tự Check-in.
                  </p>

                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                    Tạo lại mã mới
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-rose-500 font-medium">Không tìm thấy cổng check-in hoạt động nào.</p>
                  <p className="text-slate-500 text-sm mt-2">Vui lòng liên hệ Admin để tạo điểm QR mới.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
