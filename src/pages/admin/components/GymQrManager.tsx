import { useState } from "react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

interface GymQrManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GymQrManager({ isOpen, onClose }: GymQrManagerProps) {
  const [gymCode, setGymCode] = useState("FITLIFE-HQ-01");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    // Giả lập gọi API sinh mã QR cố định mới (đề phòng mã cũ bị lộ)
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 1000);
      setGymCode(`FITLIFE-HQ-${randomId}`);
      setIsGenerating(false);
      toast.success("Đã tạo lại mã QR mới cho phòng tập.");
    }, 1000);
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
              <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100 relative">
                <QRCode
                  value={gymCode}
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
