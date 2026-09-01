import { useState, useEffect, useRef, useCallback } from "react";
import { Html5Qrcode, type CameraDevice } from "html5-qrcode";
import { 
  X, Camera, RefreshCw, Zap, ZapOff, Keyboard, 
  AlertCircle, Loader2, CheckCircle2 
} from "lucide-react";
import toast from "react-hot-toast";

interface MemberRearCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (qrToken: string) => Promise<void> | void;
  isInside?: boolean;
}

export default function MemberRearCameraScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  isInside = false
}: MemberRearCameraScannerModalProps) {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "member-rear-camera-reader";

  // Play audio beep upon successful scan
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context might be restricted or unsupported; safely ignore
    }
  };

  // Stop camera stream cleanly
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        scannerRef.current = null;
        setIsCameraActive(false);
        setTorchOn(false);
        setHasTorch(false);
      }
    }
  }, []);

  // Handle scanned token
  const handleScanned = useCallback(async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    playBeep();
    setScanSuccess(true);

    try {
      await stopScanner();
      await onScanSuccess(token);
    } catch (err) {
      console.error("Scan processing error:", err);
      setIsProcessing(false);
      setScanSuccess(false);
    }
  }, [isProcessing, onScanSuccess, stopScanner]);

  // Start scanner using rear camera (environment)
  const startScanner = useCallback(async () => {
    setCameraError(null);
    setIsProcessing(false);
    setScanSuccess(false);

    try {
      // Ensure element exists in DOM
      const elem = document.getElementById(readerElementId);
      if (!elem) return;

      // Clean up previous instance if any
      await stopScanner();

      const html5QrCode = new Html5Qrcode(readerElementId, { verbose: false });
      scannerRef.current = html5QrCode;

      // Try discovering available cameras
      let cameraList: CameraDevice[] = [];
      try {
        cameraList = await Html5Qrcode.getCameras();
        setCameras(cameraList);
      } catch (e) {
        console.warn("Unable to enumerate cameras:", e);
      }

      // Priority: use rear camera (facingMode: environment)
      // If mobile browser provides cameras, look for environment/back label
      let cameraConfig: { facingMode: string } | string = { facingMode: "environment" };

      if (cameraList.length > 1) {
        const backCamIndex = cameraList.findIndex(c => 
          /back|rear|environment|sau/i.test(c.label)
        );
        if (backCamIndex >= 0) {
          setCurrentCameraIndex(backCamIndex);
          cameraConfig = cameraList[backCamIndex].id;
        }
      }

      const scanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const edge = Math.floor(minEdge * 0.75);
          return { width: Math.max(edge, 200), height: Math.max(edge, 200) };
        },
        aspectRatio: 1.0,
      };

      try {
        await html5QrCode.start(
          cameraConfig,
          scanConfig,
          (decodedText) => {
            void handleScanned(decodedText);
          },
          () => {
            // QR decode frame error - normal while scanning, ignore
          }
        );
        setIsCameraActive(true);
      } catch (primaryErr) {
        console.warn("Could not start with primary cameraConfig, attempting fallback to user camera:", primaryErr);
        // Fallback to default user camera if environment camera is not recognized
        await html5QrCode.start(
          { facingMode: "user" },
          scanConfig,
          (decodedText) => {
            void handleScanned(decodedText);
          },
          () => {}
        );
        setIsCameraActive(true);
      }

      // Check if torch/flashlight is supported
      try {
        const track = html5QrCode.getRunningTrackCapabilities() as MediaTrackCapabilities & { torch?: boolean };
        if (track && typeof track.torch === "boolean") {
          setHasTorch(true);
        }
      } catch {
        setHasTorch(false);
      }
    } catch (err: unknown) {
      console.error("Camera access failed:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("NotAllowedError") || errMsg.includes("Permission")) {
        setCameraError("Quyền truy cập Camera bị từ chối. Vui lòng cho phép quyền Camera trong cài đặt trình duyệt để tiếp tục.");
      } else if (errMsg.includes("NotFoundError") || errMsg.includes("no camera")) {
        setCameraError("Không tìm thấy camera trên thiết bị của bạn. Bạn có thể nhập mã QR thủ công bên dưới.");
      } else {
        setCameraError("Không thể kích hoạt camera sau. Vui lòng kiểm tra lại thiết bị hoặc nhập mã điểm danh bên dưới.");
      }
    }
  }, [handleScanned, stopScanner]);

  // Switch between cameras (if multiple available)
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1 || !scannerRef.current) return;
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);

    try {
      await stopScanner();
      const html5QrCode = new Html5Qrcode(readerElementId, { verbose: false });
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameras[nextIndex].id,
        {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          void handleScanned(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
      toast.success(`Đã chuyển sang: ${cameras[nextIndex].label || `Camera ${nextIndex + 1}`}`);
    } catch (err) {
      console.error("Failed to switch camera:", err);
      toast.error("Không thể chuyển camera.");
    }
  };

  // Toggle torch / flash
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as MediaTrackConstraintSet],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.error("Torch error:", err);
    }
  };

  // Submit manual QR token
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token) {
      toast.error("Vui lòng nhập mã QR phòng tập.");
      return;
    }
    void handleScanned(token);
  };

  // Start or stop camera when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Short delay to allow modal DOM to render
      const timer = setTimeout(() => {
        void startScanner();
      }, 150);
      return () => {
        clearTimeout(timer);
        void stopScanner();
      };
    } else {
      void stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-2xl border border-slate-700/60">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {isInside ? "Quét QR Check-out" : "Quét QR Check-in"}
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Camera sau
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isInside ? "Điểm danh giờ ra khỏi phòng" : "Quét mã QR tại quầy để điểm danh"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              void stopScanner();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="p-6 flex flex-col items-center justify-center">
          {cameraError ? (
            <div className="w-full aspect-square rounded-3xl bg-slate-800/80 border border-red-500/30 p-6 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
              <p className="text-sm font-semibold text-rose-200 mb-2">{cameraError}</p>
              <button
                onClick={() => void startScanner()}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Thử lại
              </button>
            </div>
          ) : (
            <div className="relative w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden bg-black border-2 border-emerald-500/40 shadow-inner flex items-center justify-center">
              
              {/* HTML5 QR Code Mount Element */}
              <div 
                id={readerElementId} 
                className="w-full h-full [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full [&_video]:!rounded-3xl"
              />

              {/* Scanning visual overlay */}
              {isCameraActive && !isProcessing && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  
                  {/* Corner Reticle Brackets */}
                  <div className="w-48 h-48 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse" />
                  </div>

                  <span className="absolute bottom-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                    Căn chỉnh mã QR vào giữa khung
                  </span>
                </div>
              )}

              {/* Processing Spinner / Feedback Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30">
                  {scanSuccess ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 animate-pulse">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-white mb-1">Đã nhận diện mã QR!</h4>
                      <p className="text-xs text-slate-400">Đang gửi yêu cầu điểm danh lên hệ thống...</p>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                      <p className="text-sm font-semibold text-slate-200">Đang xử lý check-in...</p>
                    </>
                  )}
                </div>
              )}

              {/* Initial Loading */}
              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                  <p className="text-xs font-medium">Đang khởi tạo camera sau...</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Camera Action Controls */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={() => void handleSwitchCamera()}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Đổi camera ({currentCameraIndex + 1}/{cameras.length})
              </button>
            )}

            {hasTorch && (
              <button
                type="button"
                onClick={() => void handleToggleTorch()}
                disabled={isProcessing}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                  torchOn 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30" 
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {torchOn ? <ZapOff className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                {torchOn ? "Tắt đèn" : "Bật đèn"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
            >
              <Keyboard className="w-3.5 h-3.5" />
              {showManualInput ? "Ẩn nhập tay" : "Nhập tay"}
            </button>
          </div>

          {/* Manual Input Section */}
          {showManualInput && (
            <form onSubmit={handleManualSubmit} className="mt-4 w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Nhập mã ký tự phòng (hiển thị bên dưới mã QR tại quầy):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="VD: FL-MAIN-GATE hoặc abc123xyz"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1 px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !manualToken.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          )}

          {/* Instruction Footer */}
          <div className="mt-5 text-center text-xs text-slate-400 space-y-1">
            <p>💡 <span className="font-semibold text-slate-300">Gợi ý:</span> Hướng camera sau vào màn hình quầy lễ tân hoặc bảng QR đặt tại cổng vào FitLife.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              void stopScanner();
              onClose();
            }}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
