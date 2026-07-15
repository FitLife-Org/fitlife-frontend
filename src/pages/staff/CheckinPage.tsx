
import { QrCode, Search, User, CheckCircle2, XCircle, Activity, History, ArrowRight, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Html5QrcodePlugin from "../../components/common/Html5QrcodePlugin";
import { useStaffCheckinLogic } from "../../utils/validators/useStaffCheckinLogic";
import GymQrManager from "../admin/components/GymQrManager";
import { useState } from "react";

export default function CheckinPage() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedMember,
    setSelectedMember,
    isSearching,
    isCheckingIn,
    recentCheckins,
    activeMembers,
    handleSearch,
    handleQrSuccess,
    handleManualConfirm
  } = useStaffCheckinLogic();

  const [showGymQr, setShowGymQr] = useState(false);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      

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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Lịch sử Check-in */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative">
            <button
              onClick={() => setShowGymQr(true)}
              className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors tooltip"
              title="Mở mã QR Phòng Tập"
            >
              <Smartphone className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-slate-400" /> Lượt check-in gần nhất
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
                        <p className="text-xs text-slate-500">{new Date(record.checkInTime).toLocaleTimeString('vi-VN')}</p>
                      </div>
                    </div>
                    {record.type === "CHECK_OUT" ? (
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">OUT</span>
                    ) : record.status === "SUCCESS" ? (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">IN</span>
                    ) : (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">FAIL</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Chưa có lượt check-in nào.</p>
            )}
          </div>

          {/* Đang trong phòng tập */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-500" /> Hội viên đang trong phòng tập
            </h3>
            {activeMembers.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
                {activeMembers.map(record => (
                  <div key={record.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{record.memberName || `ID: ${record.memberId}`}</p>
                        <p className="text-xs text-slate-500">Vào lúc: {new Date(record.checkInTime).toLocaleTimeString('vi-VN')}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Hiện không có hội viên nào.</p>
            )}
          </div>
        </div>
      </div>

      <GymQrManager isOpen={showGymQr} onClose={() => setShowGymQr(false)} />
    </div>
  );
}
