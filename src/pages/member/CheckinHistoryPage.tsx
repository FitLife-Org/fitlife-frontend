import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Clock, CheckCircle2, History, X, ScanLine } from "lucide-react";
import Button from "../../components/common/Button";
import Html5QrcodePlugin from "../../components/common/Html5QrcodePlugin";
import { useCheckinHistory } from "../../hooks/useCheckinHistory";

export default function CheckinHistoryPage() {
  const {
    history,
    loading,
    showQrModal,
    qrData,
    generating,
    showScanner,
    setShowScanner,
    handleShowQr,
    closeQrModal,
    handleScanSuccess
  } = useCheckinHistory();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check-in</h1>
          <p className="text-slate-500 mt-1">Sử dụng mã QR để điểm danh khi đến phòng tập.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowScanner(true)}
            className="rounded-xl flex items-center gap-2 border-slate-200"
          >
            <ScanLine className="w-5 h-5 text-emerald-600" /> Quét QR Phòng tập
          </Button>
          <Button 
            variant="primary" 
            onClick={handleShowQr}
            className="rounded-xl bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 border-none"
          >
            <QrCode className="w-5 h-5" /> Mã QR của tôi
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Lịch sử ra vào</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Bạn chưa có lượt check-in nào.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {history.map((record) => (
              <div key={record.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {new Date(record.checkedInAt).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Thời gian: {new Date(record.checkedInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                  record.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                }`}>
                  {record.status === "SUCCESS" ? <CheckCircle2 className="w-4 h-4" /> : null}
                  {record.status === "SUCCESS" ? "Thành công" : "Thất bại"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showQrModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQrModal}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl z-50 text-center"
            >
              <button 
                onClick={closeQrModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-black text-slate-900 mb-2">Mã Check-in</h2>
              <p className="text-slate-500 text-sm mb-8">Đưa mã này cho Lễ tân quét để điểm danh.</p>
              
              <div className="bg-slate-50 p-6 rounded-3xl inline-block mx-auto border border-slate-100 mb-6">
                {generating || !qrData ? (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-300">
                    <div className="w-8 h-8 animate-spin rounded-full border-4 border-slate-300 border-t-transparent" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-white rounded-2xl flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300">
                    <QrCode className="w-24 h-24 text-slate-900 mb-2" />
                    <p className="text-[10px] text-slate-400 font-mono break-all">{qrData.qrCodeData}</p>
                  </div>
                )}
              </div>
              
              {qrData && (
                <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-medium">
                  Mã sẽ hết hạn vào: {new Date(qrData.expiresAt).toLocaleTimeString('vi-VN')}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md relative"
            >
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-rose-500"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-emerald-600" /> Quét mã QR Phòng tập
              </h2>
              <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                <Html5QrcodePlugin 
                  fps={10} 
                  qrbox={250} 
                  disableFlip={false}
                  qrCodeSuccessCallback={handleScanSuccess} 
                />
              </div>
              <p className="text-sm text-center text-slate-500 mt-4">
                Đưa camera vào mã QR tĩnh đặt tại quầy lễ tân.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
