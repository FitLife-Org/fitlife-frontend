import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { useEffect } from "react";

const qrcodeRegionId = "html5qr-code-full-region";

export interface Html5QrcodePluginProps {
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
  qrCodeSuccessCallback: (decodedText: string, decodedResult: unknown) => void;
  qrCodeErrorCallback?: (errorMessage: string) => void;
}

export default function Html5QrcodePlugin(props: Html5QrcodePluginProps) {
  useEffect(() => {
    const config = {
      fps: props.fps || 10,
      qrbox: props.qrbox || 250,
      aspectRatio: props.aspectRatio || 1.0,
      disableFlip: props.disableFlip || false,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    const html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      false
    );

    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback
    );

    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={qrcodeRegionId} className="w-full h-full overflow-hidden rounded-xl bg-slate-50" />;
}
