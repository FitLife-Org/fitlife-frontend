import { User, Clock, Award, Phone, Mail, FileText, X, ShieldCheck } from "lucide-react";
import Button from "./Button";
import Badge from "./Badge";
import type { Trainer } from "../../types/trainer.type";

interface TrainerDetailModalProps {
  open: boolean;
  onClose: () => void;
  trainer: Trainer | null;
  onBook?: (trainer: Trainer) => void;
  isBooked?: boolean;
}

export default function TrainerDetailModal({
  open,
  onClose,
  trainer,
  onBook,
  isBooked = false,
}: TrainerDetailModalProps) {
  if (!open || !trainer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-all duration-300 scale-100">
        {/* Header Banner */}
        <div className="h-28 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 flex justify-between items-start">
          <Badge variant="success" className="bg-white/20 text-white border-white/30 backdrop-blur-md">
            {trainer.trainerCode || `HLV #${trainer.id}`}
          </Badge>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6 pt-0 relative z-10 -mt-12">
          {/* Avatar & Header Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100 shrink-0">
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-600 font-bold text-2xl">
                <User className="w-12 h-12" />
              </div>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-black text-slate-900">{trainer.fullName}</h2>
              <p className="text-emerald-600 font-semibold text-sm">
                {trainer.specialization || trainer.specialty || "Huấn luyện viên cá nhân"}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Kinh nghiệm</p>
                <p className="text-sm font-bold text-slate-800">
                  {trainer.experienceYears ? `${trainer.experienceYears} năm` : "Đang cập nhật"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 font-medium">Chứng chỉ</p>
                <p className="text-sm font-bold text-slate-800 truncate" title={trainer.certifications || "Đang cập nhật"}>
                  {trainer.certifications || "Đang cập nhật"}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Info Sections */}
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-1">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Giới thiệu bản thân
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                {trainer.bio || "Huấn luyện viên chuyên nghiệp sẵn sàng đồng hành giúp bạn hoàn thành mục tiêu thể hình."}
              </p>
            </div>

            {(trainer.phone || trainer.email) && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Thông tin liên hệ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                  {trainer.phone && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold">{trainer.phone}</span>
                    </div>
                  )}
                  {trainer.email && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 truncate">
                      <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold truncate" title={trainer.email}>{trainer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} className="rounded-xl px-5">
              Đóng
            </Button>
            {onBook && (
              <Button
                disabled={isBooked}
                onClick={() => {
                  onClose();
                  onBook(trainer);
                }}
                className={`rounded-xl px-6 ${
                  isBooked ? "bg-emerald-50 text-emerald-700 border-none opacity-100" : ""
                }`}
              >
                {isBooked ? "Đã chọn HLV này" : "Chọn HLV này"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
