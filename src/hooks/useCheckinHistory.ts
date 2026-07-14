import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { checkinService } from "../services/checkinService";
import type { CheckinRecord, GenerateQrResponse } from "../types/checkin.type";

export function useCheckinHistory() {
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [qrData, setQrData] = useState<GenerateQrResponse | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await checkinService.getMyCheckins();
      setHistory(data.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()));
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

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    try {
      const record = await checkinService.selfCheckin({ gymCode: decodedText });
      const actionName = record.type === "CHECK_OUT" ? "Check-out" : "Check-in";
      toast.success(`${actionName} thành công lúc ${new Date(record.checkInTime).toLocaleTimeString('vi-VN')}`);
      await fetchHistory();
    } catch (error) {
      toast.error("Mã QR không hợp lệ hoặc lỗi kết nối.");
    }
  };

  return {
    history,
    loading,
    showQrModal,
    showScanner,
    setShowScanner,
    qrData,
    generating,
    handleShowQr,
    closeQrModal,
    handleScanSuccess
  };
}
