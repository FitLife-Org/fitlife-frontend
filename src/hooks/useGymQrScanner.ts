import { useState } from "react";

export function useGymQrScanner(
    onSuccessCallback?: (token: string) => void,
) {
  const [isProcessing, setIsProcessing] =
      useState(false);

  const handleScanSuccess = async (
      decodedText: string,
  ): Promise<void> => {
    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);

      try {
        const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
        );

        await audio.play();
      } catch (audioError: unknown) {
        console.error(
            "Audio play failed",
            audioError,
        );
      }

      onSuccessCallback?.(decodedText);

      window.setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
    } catch (error: unknown) {
      console.error(
          "QR scanning failed",
          error,
      );

      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleScanSuccess,
  };
}