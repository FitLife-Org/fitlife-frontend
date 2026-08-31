import { useState } from "react";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { memberService } from "../../../services/memberService";
import { showAlert } from "../../../utils/alert";
import { getApiErrorMessage } from "../../../utils/apiError";

interface BookSessionModalProps {
  trainerId: number;
  trainerName: string;
  onClose: () => void;
}

export default function BookSessionModal({ trainerId, trainerName, onClose }: BookSessionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bookingDate || !formData.startTime || !formData.endTime) {
      void showAlert.error("Lỗi", "Vui lòng điền đầy đủ ngày và giờ tập");
      return;
    }

    try {
      setLoading(true);
      await memberService.createBooking({
        bookingDate: formData.bookingDate,
        startTime: formData.startTime + ":00",
        endTime: formData.endTime + ":00",
        note: formData.note,
      });
      void showAlert.success("Thành công", "Đã gửi yêu cầu đặt lịch tập tới HLV!");
      onClose();
    } catch (error) {
      void showAlert.error("Lỗi khi đặt lịch", getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Đặt lịch tập</h3>
            <p className="text-sm text-slate-500">HLV {trainerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form id="book-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Ngày tập <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Từ giờ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Đến giờ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Ghi chú (Tùy chọn)</label>
              <textarea
                className="w-full rounded-xl border-slate-200 focus:border-fit-primary focus:ring-fit-primary/20 resize-none"
                rows={3}
                placeholder="Ví dụ: Tập trung vào phần thân dưới..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="book-form" disabled={loading} className="px-6 shadow-md shadow-fit-primary/20">
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </div>
      </div>
    </div>
  );
}
