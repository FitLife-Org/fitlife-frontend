
import { Search, User, CheckCircle2, XCircle, Activity, History, ArrowRight, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "../../components/common/Input";
import { useStaffCheckinLogic } from "../../utils/validators/useStaffCheckinLogic";
import GymQrManager from "../admin/components/GymQrManager";
import { useState } from "react";

export default function CheckinPage() {
  const {
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
    handleManualConfirm
  } = useStaffCheckinLogic();

  const [showGymQr, setShowGymQr] = useState(false);

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      

      <div className="w-full md:w-5/12 lg:w-1/3 flex flex-col gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
          <AnimatePresence mode="wait">
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
                    className="px-4 bg-fit-staff text-white rounded-xl hover:bg-fit-staffHover transition-colors disabled:opacity-50 font-bold"
                  >
                    {isSearching ? <Activity className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {searchResults.map(member => (
                    <div 
                      key={member.memberId}
                      onClick={() => setSelectedMember(member)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${selectedMember?.memberId === member.memberId ? 'bg-fit-staff text-white shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <h4 className="font-bold">{member.fullName}</h4>
                      <p className="text-xs opacity-75 mt-1">{member.phone}</p>
                    </div>
                  ))}
                  {searchResults.length === 0 && !isSearching && searchQuery && (
                    <p className="text-center text-sm text-fit-muted mt-10">Không có kết quả trùng khớp.</p>
                  )}
                </div>
              </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* PHẢI: Thẻ Thông tin Hội viên */}
      <div className="w-full md:w-7/12 lg:w-2/3 flex flex-col gap-6">
        
        <div className="fit-card p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fit-staffSoft rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {selectedMember ? (
              <motion.div
                key="member-info"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-full flex flex-col z-10"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-fit-staffSoft text-fit-staff overflow-hidden ring-4 ring-white shadow-lg flex items-center justify-center font-black text-2xl">
                      {selectedMember.fullName.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">{selectedMember.fullName}</h2>
                      <p className="text-fit-muted flex items-center gap-1 mt-1 font-medium">
                        <User className="w-4 h-4" /> ID: {selectedMember.memberCode}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                      selectedMember.currentSubscription?.status === 'ACTIVE' 
                        ? 'bg-fit-primarySoft text-fit-primary' 
                        : 'bg-fit-dangerSoft text-fit-danger'
                    }`}>
                      {selectedMember.currentSubscription?.status === 'ACTIVE' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {selectedMember.currentSubscription?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Hết hạn'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-fit-border">
                    <p className="text-xs font-bold text-fit-muted uppercase tracking-wider mb-1">Số điện thoại</p>
                    <p className="font-semibold text-slate-700">{selectedMember.phone}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-fit-border">
                    <p className="text-xs font-bold text-fit-muted uppercase tracking-wider mb-1">Gói hiện tại</p>
                    <p className="font-semibold text-slate-700">{selectedMember.currentSubscription?.packageName || 'Không có'}</p>
                  </div>
                </div>

                <button
                  onClick={handleManualConfirm}
                  disabled={isCheckingIn || selectedMember.currentSubscription?.status !== 'ACTIVE'}
                  className="w-full py-4 bg-fit-staff text-white font-bold rounded-2xl shadow-lg hover:bg-fit-staffHover transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                  {isCheckingIn ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Xác nhận Check-in
                    </span>
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
