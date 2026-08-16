import { Link } from "react-router-dom";
import { Search, User, CheckCircle2, XCircle, Activity, History, ArrowRight, Smartphone, QrCode, Keyboard, ScanLine, ScanFace } from "lucide-react";
import Input from "../../components/common/Input";
import { useStaffCheckinLogic } from "../../utils/validators/useStaffCheckinLogic";
import GymQrManager from "../admin/components/GymQrManager";
import { useState } from "react";
import { ROUTES } from "../../config/routes";
import PageHeader from "../../components/common/PageHeader";
import GymQrScanner from "../../components/checkin/GymQrScanner";

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
    handleManualConfirm,
    handleScanSuccess
  } = useStaffCheckinLogic();

  const [showGymQr, setShowGymQr] = useState(false);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 md:px-8 mt-6">
      {/* HEADER TƯƠNG TÁC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <PageHeader 
          title="Hệ thống Điểm Danh" 
          description="Kiểm tra thông tin hội viên tự động bằng QR Code hoặc tra cứu thủ công nhanh chóng." 
        />
        
        <div className="flex items-center gap-3 shrink-0 z-10">
          <button
            onClick={() => setShowGymQr(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 text-sm"
          >
            <QrCode className="w-5 h-5 text-emerald-400" />
            <span>Mã QR Phòng Tập</span>
          </button>
        </div>
      </div>

      {/* THẺ THÔNG TIN HỘI VIÊN (Hiển thị to nhất khi có kết quả) */}
      {selectedMember && (
        <div className="w-full">
          <div className="bg-white p-8 md:p-10 flex flex-col items-center justify-center relative overflow-hidden rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 animate-in fade-in zoom-in duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50/30" />
            
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-10 items-center z-10">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-5xl shadow-inner border-4 border-white ring-4 ring-emerald-50">
                {selectedMember.fullName.charAt(0)}
              </div>

              {/* Thông tin */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">{selectedMember.fullName}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-600 font-medium mb-6">
                  <span className="flex items-center gap-1"><User className="w-5 h-5 text-slate-400" /> ID: {selectedMember.memberCode}</span>
                  <span className="flex items-center gap-1"><Smartphone className="w-5 h-5 text-slate-400" /> {selectedMember.phone}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm ${
                    selectedMember.currentSubscription?.status === 'ACTIVE' 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {selectedMember.currentSubscription?.status === 'ACTIVE' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {selectedMember.currentSubscription?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Hết hạn gói tập'}
                  </span>
                  
                  {selectedMember.currentSubscription?.packageName && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Gói: {selectedMember.currentSubscription.packageName}
                    </span>
                  )}
                </div>

                <button
                  onClick={handleManualConfirm}
                  disabled={isCheckingIn || selectedMember.currentSubscription?.status !== 'ACTIVE'}
                  className="w-full md:w-auto px-10 py-4 bg-emerald-600 text-white font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-emerald-700/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  {isCheckingIn ? (
                    <span className="flex items-center gap-2">
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ĐANG XỬ LÝ...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ScanFace className="w-6 h-6" /> XÁC NHẬN CHO VÀO CỔNG
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP SECTION: SCAN & SEARCH */}
      <div className="flex flex-col max-w-4xl mx-auto gap-8 w-full">
        {/* Máy quét QR */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col h-[500px] md:h-[600px] w-full">
          <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-emerald-500" /> Quét Thẻ Tự Động
          </h3>
          <p className="text-sm text-slate-500 mb-6">Đưa mã QR của Hội viên vào giữa khung hình để quét.</p>
          
          <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center">
            <div className="w-full h-full max-w-sm mx-auto">
              <GymQrScanner onSuccess={handleScanSuccess} />
            </div>
          </div>
        </div>

        {/* Nhập thủ công */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col w-full">
          <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-indigo-500" /> Tra Cứu Thủ Công
          </h3>
          <p className="text-sm text-slate-500 mb-6">Nhập Số điện thoại hoặc Mã hội viên nếu thẻ bị lỗi.</p>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6 shrink-0 relative">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                placeholder="VD: 0912345678 hoặc MEM-1234..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all disabled:opacity-50 font-bold active:scale-95 whitespace-nowrap"
            >
              {isSearching ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : "Tìm kiếm"}
            </button>
          </form>

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {searchResults.map(member => (
              <div 
                key={member.memberId}
                onClick={() => setSelectedMember(member)}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  selectedMember?.memberId === member.memberId 
                    ? 'bg-indigo-50 border-indigo-200 shadow-inner' 
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    selectedMember?.memberId === member.memberId ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {member.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{member.fullName}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{member.phone} • {member.memberCode}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {searchResults.length === 0 && !isSearching && searchQuery && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <Search className="w-12 h-12 opacity-20 mb-3" />
                <p>Không tìm thấy kết quả nào phù hợp.</p>
              </div>
            )}
            
            {searchResults.length === 0 && !isSearching && !searchQuery && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <Keyboard className="w-12 h-12 opacity-20 mb-3" />
                <p>Nhập thông tự để tìm kiếm.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BẢNG LỊCH SỬ & HOẠT ĐỘNG TẠI PHÒNG TẬP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Lịch sử Check-in */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" /> Lượt check-in mới nhất
            </h3>
          </div>

          {recentCheckins.length > 0 ? (
            <div className="space-y-4">
              {recentCheckins.slice(0, 5).map(record => (
                <div key={record.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm border border-white">
                      {record.memberName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{record.memberName || `ID: ${record.memberId}`}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{new Date(record.checkInTime).toLocaleTimeString('vi-VN')} - {new Date(record.checkInTime).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  {record.type === "CHECK_OUT" ? (
                    <span className="text-xs font-black text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200">OUT</span>
                  ) : record.status === "SUCCESS" ? (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">IN</span>
                  ) : (
                    <span className="text-xs font-black text-red-600 bg-red-100 px-3 py-1.5 rounded-lg border border-red-200">FAIL</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-center">Chưa có lượt check-in nào trong ngày.</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link to={ROUTES.STAFF_CHECKIN_HISTORY} className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-2">
              Xem toàn bộ nhật ký <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Đang trong phòng tập */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-emerald-700 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Đang trong phòng tập ({activeMembers.length})
            </h3>
          </div>

          {activeMembers.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {activeMembers.map(record => (
                <div key={record.id} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100 hover:bg-emerald-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shadow-sm border border-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{record.memberName || `ID: ${record.memberId}`}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">Vào lúc: {new Date(record.checkInTime).toLocaleTimeString('vi-VN')}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-white px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-400 text-center">Hiện không có hội viên nào trong phòng tập.</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link to={ROUTES.STAFF_CHECKIN_HISTORY} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-2">
              Xem danh sách chi tiết <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <GymQrManager isOpen={showGymQr} onClose={() => setShowGymQr(false)} />
    </div>
  );
}
