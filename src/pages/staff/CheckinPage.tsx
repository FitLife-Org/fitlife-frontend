import { useState, useEffect } from "react";
import { QrCode, Search, UserCheck, History, Keyboard, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { checkinService } from "../../services/checkinService";
import type { CheckinRecord } from "../../types/checkin.type";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function CheckinPage() {
  const [activeTab, setActiveTab] = useState<"SCAN" | "MANUAL">("SCAN");
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  
  // States cho Manual
  const [memberIdStr, setMemberIdStr] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // States cho Scan
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await checkinService.getCheckinHistory();
      setHistory(data.sort((a: any, b: any) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateScan = async () => {
    setScanning(true);
    try {
      const record = await checkinService.scanQr({ qrToken: "MOCK_QR_TOKEN_" + Date.now() });
      toast.success(`Check-in thành công cho: ${record.memberName}`);
      setHistory(prev => [record, ...prev]);
    } catch (error) {
      toast.error("Quét mã QR thất bại (Token không hợp lệ).");
    } finally {
      setScanning(false);
    }
  };

  const handleManualCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberIdStr) return toast.error("Vui lòng nhập ID Hội viên");
    
    setManualSubmitting(true);
    try {
      const record = await checkinService.manualCheckin({ 
        memberId: Number(memberIdStr),
        note: "Check-in thủ công bởi Lễ tân"
      });
      toast.success(`Check-in thủ công thành công cho ID: ${record.memberId}`);
      setHistory(prev => [record, ...prev]);
      setMemberIdStr("");
    } catch (error) {
      toast.error("Lỗi khi check-in thủ công.");
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kiểm soát ra vào</h1>
        <p className="text-slate-500 mt-1">Quét mã QR hoặc điểm danh thủ công cho hội viên.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phần Thao tác (Trái) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex p-2 bg-slate-50 border-b border-slate-100">
              <button 
                onClick={() => setActiveTab("SCAN")}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "SCAN" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <QrCode className="w-4 h-4" /> Quét QR
              </button>
              <button 
                onClick={() => setActiveTab("MANUAL")}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "MANUAL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Keyboard className="w-4 h-4" /> Thủ công
              </button>
            </div>

            <div className="p-6">
              {activeTab === "SCAN" ? (
                <div className="text-center">
                  <div className="w-full aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-6 mb-6">
                    <QrCode className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-500 text-sm">Tính năng Camera Native sẽ được phát triển ở Sprint 3.</p>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={handleSimulateScan}
                    disabled={scanning}
                    className="w-full rounded-xl bg-slate-900 text-white flex items-center justify-center gap-2"
                  >
                    {scanning ? "Đang xử lý..." : <><QrCode className="w-5 h-5" /> Giả lập Quét mã QR</>}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleManualCheckin} className="space-y-6">
                  <Input 
                    label="Mã Hội viên (ID) *" 
                    placeholder="Ví dụ: 1" 
                    type="number"
                    value={memberIdStr}
                    onChange={(e) => setMemberIdStr(e.target.value)}
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={manualSubmitting}
                    className="w-full rounded-xl bg-slate-900 text-white flex items-center justify-center gap-2"
                  >
                    {manualSubmitting ? "Đang xử lý..." : <><UserCheck className="w-5 h-5" /> Xác nhận Check-in</>}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Lịch sử trong ngày (Phải) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Lịch sử hôm nay</h2>
                <p className="text-sm text-slate-500">Các lượt vào phòng tập mới nhất.</p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                Chưa có lượt check-in nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {history.map(record => (
                  <div key={record.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {record.memberId}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{record.memberName || `Hội viên #${record.memberId}`}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {new Date(record.checkedInAt).toLocaleTimeString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
