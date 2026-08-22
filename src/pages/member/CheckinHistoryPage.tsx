import React, { useState, useRef, useMemo } from "react";
import {
  CheckCircle2,
  History,
  X,
  ScanLine,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Clock
} from "lucide-react";
import { usePageAnimation } from "../../hooks/usePageAnimation";
import Button from "../../components/common/Button";
import Html5QrcodePlugin from "../../components/common/Html5QrcodePlugin";
import { useCheckinHistory } from "../../hooks/useCheckinHistory";
import { useGymQrScanner } from "../../hooks/useGymQrScanner";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CheckinHistoryPage() {
  const containerRef = usePageAnimation();
  const calendarRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const {
    history,
    loading,
    showScanner,
    setShowScanner,
    handleScanSuccess: handleLogicScan
  } = useCheckinHistory();

  const { isProcessing: isScannerProcessing, handleScanSuccess } = useGymQrScanner((token) => {
    setShowScanner(false);
    handleLogicScan(token);
  });

  // Quản lý state cho Lịch
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- LOGIC LỊCH (CALENDAR HELPER) ---
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  // Điều chỉnh để Thứ 2 là ngày đầu tuần (0: T2, 1: T3, ..., 6: CN)
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
  };

  // Lấy danh sách check-in của một ngày cụ thể
  const getRecordsForDate = (date: Date) => {
    return history.filter(record => isSameDate(new Date(record.checkInTime), date));
  };

  const selectedDateRecords = history.filter(record => isSameDate(new Date(record.checkInTime), selectedDate));
  const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // --- GSAP ANIMATION ---
  useGSAP(() => {
    if (!loading && calendarRef.current) {
      const cells = gsap.utils.toArray(".gsap-calendar-cell");
      if (cells.length > 0) {
        gsap.fromTo(
          cells,
          { opacity: 0, scale: 0.8, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.015, ease: "back.out(1.5)", overwrite: true }
        );
      }
    }
  }, { scope: containerRef, dependencies: [currentMonth, loading] });

  useGSAP(() => {
    if (!loading && detailRef.current) {
      const detailCards = gsap.utils.toArray(".gsap-detail-card");
      if (detailCards.length > 0) {
        gsap.fromTo(
          detailCards,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", overwrite: true }
        );
      }
      
      const emptyState = gsap.utils.toArray(".gsap-empty-state");
      if (emptyState.length > 0) {
        gsap.fromTo(
          emptyState,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out", overwrite: true }
        );
      }
    }
  }, { scope: containerRef, dependencies: [selectedDate, loading] });

  return (
      <div className="space-y-8 pb-10" ref={containerRef}>
        {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
            </div>
        ) : (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Check-in</h1>
                  <p className="text-slate-500 mt-1">Sử dụng mã QR để điểm danh khi đến phòng tập.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                      variant="primary"
                      onClick={() => setShowScanner(true)}
                      className="rounded-xl bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 border-none"
                  >
                    <ScanLine className="w-5 h-5 text-emerald-400" /> Quét QR Phòng tập
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- KHU VỰC HIỂN THỊ LỊCH --- */}
                <div ref={calendarRef} className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                          Tháng {currentMonth.getMonth() + 1}
                        </h2>
                        <p className="text-sm font-medium text-slate-500">Năm {currentMonth.getFullYear()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handlePrevMonth} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={handleNextMonth} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400 py-2 tracking-wider">
                          {day}
                        </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {/* Render các ô trống đầu tháng */}
                    {Array.from({ length: emptyDays }).map((_, index) => (
                        <div key={`empty-${index}`} className="p-2" />
                    ))}

                    {/* Render các ngày trong tháng */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                      const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
                      const dayRecords = getRecordsForDate(dayDate);
                      const isSelected = isSameDate(dayDate, selectedDate);
                      const isToday = isSameDate(dayDate, new Date());

                      // Xác định trạng thái của ngày (thành công/thất bại) dựa trên record
                      const hasSuccess = dayRecords.some(r => r.status === "SUCCESS");
                      const hasFailure = dayRecords.some(r => r.status !== "SUCCESS");

                      return (
                          <button
                              key={index}
                              onClick={() => setSelectedDate(dayDate)}
                              className={`
                          gsap-calendar-cell relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-colors duration-200 border-2
                          ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20' : 'hover:bg-slate-50 border-transparent text-slate-700 hover:border-slate-100'}
                          ${isToday && !isSelected ? '!border-emerald-200 bg-emerald-50/50' : ''}
                        `}
                          >
                            <span className={`text-base font-bold ${isToday && !isSelected ? 'text-emerald-600' : ''}`}>{index + 1}</span>

                            {/* Dấu chấm báo hiệu có check-in */}
                            <div className="flex gap-1 mt-1.5 h-1.5">
                              {dayRecords.length > 0 && (
                                <>
                                  {hasSuccess && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-emerald-500'}`} />}
                                  {hasFailure && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-400' : 'bg-rose-500'}`} />}
                                </>
                              )}
                            </div>
                          </button>
                      );
                    })}
                  </div>
                </div>

          {/* --- KHU VỰC CHI TIẾT NGÀY ĐƯỢC CHỌN --- */}
          <div ref={detailRef} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px] lg:h-auto">
            <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-700 flex items-center justify-center">
                <History className="w-5 h-5 text-indigo-500"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Chi tiết ra vào</h2>
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  {selectedDate.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30">
              {selectedDateRecords.length === 0 ? (
                  <div className="gsap-empty-state h-full flex flex-col items-center justify-center text-slate-400 py-10">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <History className="w-8 h-8 text-slate-300"/>
                    </div>
                    <p className="font-medium text-slate-500">Chưa có lượt check-in nào</p>
                    <p className="text-sm text-slate-400 mt-1">Chọn một ngày khác trên lịch để xem.</p>
                  </div>
              ) : (
                  <div className="space-y-4 px-2">
                    {selectedDateRecords.map((record) => (
                        <div key={record.id}
                             className="gsap-detail-card relative overflow-hidden p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">

                          {/* Thanh viền dọc tạo điểm nhấn */}
                          <div
                              className={`absolute left-0 top-0 bottom-0 w-1.5 ${record.status === "SUCCESS" ? "bg-emerald-400" : "bg-rose-400"}`}/>

                          <div
                              className={`p-3 rounded-2xl flex-shrink-0 shadow-sm ${record.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                            {record.status === "SUCCESS" ? <CheckCircle2 className="w-6 h-6"/> :
                                <XCircle className="w-6 h-6"/>}
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Hàng 1: Giờ phút giây + Nhãn trạng thái nằm cạnh nhau */}
                            <div className="flex items-center gap-3">
                              <p className="font-black text-slate-900 text-2xl tracking-tight">
                                {new Date(record.checkInTime).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </p>

                              <span
                                  className={`flex-shrink-0 inline-flex py-1.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm ${
                                      record.status === "SUCCESS" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                  }`}>
                                  {record.status === "SUCCESS" ? "Done" : "Fail"}
                                </span>
                            </div>

                            {/* Hàng 2: Ngày tháng nằm dưới */}
                            <p className="text-slate-500 font-bold text-sm mt-0.5 truncate">
                              {new Date(record.checkInTime).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>

                            {record.checkOutTime && (
                              <p className="text-amber-600 font-bold text-xs mt-1.5 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Check-out lúc: {new Date(record.checkOutTime).toLocaleTimeString('vi-VN')}
                              </p>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>
              </div>

              {/* --- MODAL SCANNER (Giữ nguyên) --- */}
              {showScanner && (
                  <div
                      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md relative gsap-animate">
                      <button
                          onClick={() => setShowScanner(false)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 z-50 transition-colors"
                      >
                        <X className="w-6 h-6"/>
                      </button>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ScanLine className="w-5 h-5 text-emerald-600"/> Quét mã QR Phòng tập
                      </h2>
                      <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 min-h-[300px] relative flex flex-col items-center justify-center p-2">
                          {!isScannerProcessing ? (
                            <Html5QrcodePlugin 
                              fps={15} 
                              qrbox={250} 
                              disableFlip={false}
                              qrCodeSuccessCallback={handleScanSuccess}
                              qrCodeErrorCallback={() => {}}
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-50/90 backdrop-blur-sm z-20">
                              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg" />
                              <p className="text-emerald-700 font-bold text-lg animate-pulse">Đang giải mã thẻ...</p>
                            </div>
                          )}
                        </div>
                        <p className="text-center text-sm font-medium text-slate-500 mt-4">
                          Sử dụng Camera để quét mã đặt tại quầy Lễ tân
                        </p>
              </div>
            </div>
        )}
            </>
        )}
      </div>
  );
}