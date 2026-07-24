import { useState } from "react";

export function useGymQrScanner(onSuccessCallback?: (token: string) => void) {
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

      if (onSuccessCallback) {
        onSuccessCallback(decodedText);
      }
      
      setTimeout(() => setIsProcessing(false), 3000);
    } catch (error: any) {
      console.error("QR scanning failed", error);
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleScanSuccess
  };
}
