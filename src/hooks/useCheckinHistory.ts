import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { memberCheckinService } from "../services/checkinService";
import type { CheckinRecord } from "../types/checkin.type";

export function useCheckinHistory() {
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  const [currentStatus, setCurrentStatus] = useState<CheckinRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const [historyData, currentData] = await Promise.all([
        memberCheckinService.getMyHistory({ page: 0, size: 50 }),
        memberCheckinService.getMyCurrentStatus()
      ]);
      setHistory(historyData.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()));
      setCurrentStatus(currentData);
    } catch (err) {
      console.error("Failed to fetch check-in info:", err);
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
      let record;
      let actionName = "";

      if (currentStatus?.isInside) {
        record = await memberCheckinService.selfCheckout({ qrToken: decodedText });
        actionName = "Check-out";
      } else {
        record = await memberCheckinService.selfCheckin({ qrToken: decodedText });
        actionName = "Check-in";
      }

      const timeStr = actionName === "Check-out" && record.checkOutTime 
        ? new Date(record.checkOutTime).toLocaleTimeString('vi-VN')
        : new Date(record.checkInTime).toLocaleTimeString('vi-VN');

      toast.success(`${actionName} thành công lúc ${timeStr}`);
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
    currentStatus,
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
