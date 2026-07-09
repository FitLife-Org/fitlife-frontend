import { useState, useEffect } from "react";
import { QrCode, Search, User, CheckCircle2, XCircle, Activity, History, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import { checkinService } from "../../services/checkinService";
import type { CheckinRecord, MemberLookupResult } from "../../types/checkin.type";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Html5QrcodePlugin from "../../components/common/Html5QrcodePlugin";



export default function CheckinPage() {
  const [activeTab, setActiveTab] = useState<"SCAN" | "MANUAL">("SCAN");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberLookupResult[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberLookupResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<CheckinRecord[]>([]);

  useEffect(() => {
    fetchRecentCheckins();
  }, []);

  const fetchRecentCheckins = async () => {
    try {
      const data = await checkinService.getCheckinHistory({ limit: 5 });
      setRecentCheckins(data.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await checkinService.lookupMember(searchQuery);
      
      setSearchResults(results);
      if (results.length === 1) {
        setSelectedMember(results[0]);
      }
    } catch (error) {
      toast.error("Không tìm thấy hội viên nào.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleQrSuccess = async (decodedText: string) => {
    if (isCheckingIn) return; 

    try {
      setIsCheckingIn(true);
      const record = await checkinService.scanQr({ qrToken: decodedText });
      toast.success(`Check-in thành công: ${record.memberName || 'Hội viên'}`);
      fetchRecentCheckins();
    } catch (error) {
      toast.error("Mã QR không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!selectedMember) return;
    if (selectedMember.packageStatus !== "ACTIVE") {
      toast.error("Gói tập đã hết hạn, không thể check-in.");
      return;
    }

    try {
      setIsCheckingIn(true);
      const record = await checkinService.manualCheckin({ memberId: selectedMember.id, note: "Manual Check-in via Staff UI" });
      toast.success(`Check-in thành công: ${selectedMember.fullName}`);
      setSelectedMember(null);
      setSearchQuery("");
      setSearchResults([]);
      fetchRecentCheckins();
    } catch (error) {
      toast.error("Check-in thủ công thất bại.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      
      {/* TRÁI: Khu vực Nhập liệu / Quét mã */}
      <div className="w-full md:w-5/12 lg:w-1/3 flex flex-col gap-6">
        
        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
          <button
            onClick={() => setActiveTab("SCAN")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === "SCAN" ? "bg-slate-950 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
          >
            <QrCode className="w-4 h-4" /> Quét mã QR
          </button>
          <button
            onClick={() => setActiveTab("MANUAL")}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === "MANUAL" ? "bg-slate-950 text-white shadow-md" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"}`}
          >
            <Search className="w-4 h-4" /> Nhập mã
          </button>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {activeTab === "SCAN" && (
              <motion.div
                key="SCAN"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col items-center justify-center space-y-4"
              >
                <div className="w-full aspect-square relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 p-2">
                  <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_50px_rgba(0,0,0,0.1)]" />
                  <Html5QrcodePlugin 
                    fps={10} 
                    qrbox={250} 
                    disableFlip={false}
                    qrCodeSuccessCallback={handleQrSuccess}
                    qrCodeErrorCallback={(err) => { /* ẩn log lỗi liên tục của qr */ }}
                  />
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }} 
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-fit-primary/50 shadow-[0_0_15px_rgba(109,40,217,0.8)] z-20"
                  />
                </div>
                <p className="text-center text-sm text-slate-500 font-medium mt-4">
                  Đưa mã QR của hội viên vào giữa khung hình.
                </p>
              </motion.div>
            )}

            {activeTab === "MANUAL" && (
              <motion.div
                key="MANUAL"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                  <Input
                    className="flex-1"
                    placeholder="Nhập mã thẻ hoặc SĐT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                  <button 
                    type="submit"
                    disabled={isSearching}
                    className="px-4 bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSearching ? <Activity className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {searchResults.map(member => (
                    <div 
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${selectedMember?.id === member.id ? "border-slate-950 bg-slate-50 ring-1 ring-slate-950" : "border-slate-200 hover:border-slate-400"}`}
                    >
                      <h4 className="font-bold text-slate-900">{member.fullName}</h4>
                      <p className="text-xs text-slate-500 mt-1">{member.phone}</p>
                    </div>
                  ))}
                  {searchResults.length === 0 && !isSearching && searchQuery && (
                    <p className="text-center text-sm text-slate-500 mt-10">Không có kết quả trùng khớp.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PHẢI: Thẻ Thông tin Hội viên */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col gap-6">
        
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-950/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <AnimatePresence mode="wait">
            {selectedMember ? (
              <motion.div
                key="MEMBER_CARD"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md flex flex-col items-center z-10"
              >
                <div className="w-24 h-24 bg-gradient-to-tr from-slate-200 to-slate-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center mb-6 overflow-hidden">
                  {selectedMember.avatarUrl ? (
                    <img src={selectedMember.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedMember.fullName}</h2>
                <div className="flex items-center gap-2 text-slate-500 mb-6">
                  <span className="font-medium text-sm">ID: #{selectedMember.id}</span>
                  <span>&bull;</span>
                  <span className="text-sm">{selectedMember.phone}</span>
                </div>

                <div className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3">Gói tập hiện tại</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{selectedMember.packageName}</span>
                    {selectedMember.packageStatus === "ACTIVE" ? (
                      <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-none">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline-block" /> Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="bg-red-100 text-red-800 border-none">
                        <XCircle className="w-3 h-3 mr-1 inline-block" /> Hết hạn
                      </Badge>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleManualConfirm}
                  disabled={isCheckingIn || selectedMember.packageStatus !== "ACTIVE"}
                  className="w-full py-4 bg-slate-950 text-white font-bold rounded-xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {isCheckingIn ? (
                    <Activity className="w-6 h-6 animate-spin" />
                  ) : (
                    <>Xác nhận Check-in</>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="EMPTY"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center z-10"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Chưa có thông tin</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm">
                  Vui lòng quét thẻ Hội viên qua mã QR hoặc tra cứu thủ công bằng mã/SĐT ở cột bên trái.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-slate-400" /> Lượt check-in gần nhất hôm nay
          </h3>
          {recentCheckins.length > 0 ? (
            <div className="space-y-3">
              {recentCheckins.map(record => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {record.memberName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{record.memberName || `ID: ${record.memberId}`}</p>
                      <p className="text-xs text-slate-500">{new Date(record.checkedInAt).toLocaleTimeString('vi-VN')}</p>
                    </div>
                  </div>
                  {record.status === "SUCCESS" ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">SUCCESS</span>
                  ) : (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">FAILED</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">Chưa có lượt check-in nào.</p>
          )}
        </div>

      </div>
    </div>
  );
}
