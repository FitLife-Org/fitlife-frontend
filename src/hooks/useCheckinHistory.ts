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
      const isInside = currentStatus && currentStatus.isInside;

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
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã QR không hợp lệ hoặc lỗi kết nối.");
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
    handleScanSuccess
  };
}
