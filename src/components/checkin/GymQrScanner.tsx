import Html5QrcodePlugin from "../common/Html5QrcodePlugin";
import { useGymQrScanner } from "../../hooks/useGymQrScanner";

interface GymQrScannerProps {
  onSuccess?: (token: string) => void;
}

export default function GymQrScanner({ onSuccess }: GymQrScannerProps) {
  const { isProcessing, handleScanSuccess } = useGymQrScanner(onSuccess);

  return (
    <div
      className="h-full flex flex-col items-center justify-center space-y-4"
    >
      <div className={`w-full aspect-square relative rounded-2xl overflow-hidden border-2 border-dashed ${isProcessing ? 'border-emerald-500' : 'border-slate-300'} p-2 transition-colors duration-300`}>
        <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.1)]" />
        
        {!isProcessing ? (
          <Html5QrcodePlugin 
            fps={10} 
            qrbox={250} 
            disableFlip={false}
            qrCodeSuccessCallback={handleScanSuccess}
            qrCodeErrorCallback={() => { /* ẩn log lỗi liên tục của qr */ }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-emerald-600 font-medium text-sm">Đang xử lý...</p>
          </div>
        )}

        <div 
          className="absolute left-0 right-0 h-0.5 bg-fit-primary/50 shadow-[0_0_15px_rgba(109,40,217,0.8)] z-20 pointer-events-none"
        />
      </div>
      <p className="text-center text-sm text-slate-500 font-medium mt-4">
        Đưa mã QR của hội viên vào giữa khung hình.
      </p>
    </div>
  );
}
