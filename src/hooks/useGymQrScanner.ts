import { useState } from "react";
import toast from "react-hot-toast";
import { memberCheckinService } from "../services/checkinService";

export function useGymQrScanner(onSuccessCallback?: () => void) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        await audio.play();
      } catch (e) {
        console.error("Audio play failed", e);
      }

      await memberCheckinService.selfCheckin({ qrToken: decodedText });
      toast.success("Điểm danh thành công!");
      
      if (onSuccessCallback) {
        onSuccessCallback();
      }
      
      setTimeout(() => setIsProcessing(false), 3000);
    } catch (error: unknown) {
      const msg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      toast.error(msg || "Điểm danh thất bại");
      setTimeout(() => setIsProcessing(false), 2000);
    }
  };

  return {
    isProcessing,
    handleScanSuccess
  };
}
