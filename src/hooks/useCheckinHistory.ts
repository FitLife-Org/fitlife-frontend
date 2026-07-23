import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { memberCheckinService } from "../services/checkinService";
import type { CheckinRecord } from "../types/checkin.type";

export function useCheckinHistory() {
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await memberCheckinService.getMyHistory({ page: 0, size: 50 });
      setHistory(data.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()));
    } finally {
      setLoading(false);
    }
  };

  const handleShowQr = () => {
    setShowQrModal(true);
  };

  const closeQrModal = () => {
    setShowQrModal(false);
  };

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    try {
      const latestRecord = history.length > 0 ? history[0] : null;
      const isInside = latestRecord && latestRecord.status === "SUCCESS" && !latestRecord.checkOutTime;

      let record;
      let actionName = "";

      if (isInside) {
        record = await memberCheckinService.selfCheckout({ qrToken: decodedText });
        actionName = "Check-out";
      } else {
        record = await memberCheckinService.selfCheckin({ qrToken: decodedText });
        actionName = "Check-in";
      }

      toast.success(`${actionName} thành công lúc ${new Date(record.checkInTime).toLocaleTimeString('vi-VN')}`);
      await fetchHistory();
    } catch (error: unknown) {
      const msg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      toast.error(msg || "Mã QR không hợp lệ hoặc lỗi kết nối.");
    }
  };

  return {
    history,
    loading,
    showQrModal,
    showScanner,
    setShowScanner,
    handleShowQr,
    closeQrModal,
    handleScanSuccess,
    fetchHistory
  };
}
