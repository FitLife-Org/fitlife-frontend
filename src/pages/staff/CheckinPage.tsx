import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, User, CheckCircle2, XCircle, Activity, History, 
  Smartphone, Keyboard, ScanLine, ScanFace, QrCode, RefreshCw, 
  Maximize2, X, Plus, LogOut, Clock, Users, ShieldCheck, Building2,
  Calendar
} from "lucide-react";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/Table";
import GymQrScanner from "../../components/checkin/GymQrScanner";

import { staffCheckinService, adminQrService } from "../../services/checkinService";
import type { 
  CheckinRecord, 
  AdminCheckInQrResponse, 
  MemberLookupResult 
} from "../../types/checkin.type";
import { useAuthStore } from "../../store/authStore";
import { getApiErrorMessage } from "../../utils/apiError";

export default function CheckinPage() {
  const isAdmin = useAuthStore((state) => state.user?.roles.includes("ROLE_ADMIN") ?? false);

  // ==========================================
  // 1. GYM QR CODE MANAGEMENT STATE
  // ==========================================
  const [qrPoints, setQrPoints] = useState<AdminCheckInQrResponse[]>([]);
  const [selectedQr, setSelectedQr] = useState<AdminCheckInQrResponse | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [isRotatingQr, setIsRotatingQr] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [showCreateQrModal, setShowCreateQrModal] = useState(false);
  const [newQrForm, setNewQrForm] = useState({ name: "", location: "", token: "" });
  const [isCreatingQr, setIsCreatingQr] = useState(false);
  const [liveClock, setLiveClock] = useState(new Date().toLocaleTimeString("vi-VN"));

  const generateRandomRoomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = newQrForm.name.trim() 
      ? "FL-" + newQrForm.name.trim().split(" ").pop()?.toUpperCase().slice(0, 4)
      : "FL-ROOM";
    setNewQrForm(prev => ({ ...prev, token: `${prefix}-${randomPart}` }));
  };

  // ==========================================
  // 2. MANUAL CHECK-IN & SEARCH STATE
  // ==========================================
  const [manualInputMode, setManualInputMode] = useState<"SEARCH" | "SCANNER">("SEARCH");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberLookupResult[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberLookupResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // ==========================================
  // 3. HISTORY & INSIDE OCCUPANCY STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState<"HISTORY" | "INSIDE">("HISTORY");
  const [historyRecords, setHistoryRecords] = useState<CheckinRecord[]>([]);
  const [insideRecords, setInsideRecords] = useState<CheckinRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);

  // Real-time live clock for kiosk mode
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString("vi-VN"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Gym QR Codes
  const fetchQrPoints = useCallback(async () => {
    setLoadingQr(true);
    try {
      const data = await adminQrService.getAllGymQrs();
      const activeList = Array.isArray(data) ? data.filter(p => p.active || p.isActive) : [];
      if (activeList.length > 0) {
        setQrPoints(activeList);
        setSelectedQr(prev => (prev && activeList.find(p => p.id === prev.id)) || activeList[0]);
      } else {
        const defaultPoint: AdminCheckInQrResponse = {
          id: 1,
          name: "Mã QR Cố Định Quầy Lễ Tân",
          token: "FITLIFE_MAIN_GATE_QR",
          location: "Tầng 1 - Quầy Lễ Tân",
          isActive: true,
          active: true,
          createdAt: new Date().toISOString()
        };
        setQrPoints([defaultPoint]);
        setSelectedQr(defaultPoint);
      }
    } catch {
      const defaultPoint: AdminCheckInQrResponse = {
        id: 1,
        name: "Mã QR Cố Định Quầy Lễ Tân",
        token: "FITLIFE_MAIN_GATE_QR",
        location: "Tầng 1 - Quầy Lễ Tân",
        isActive: true,
        active: true,
        createdAt: new Date().toISOString()
      };
      setQrPoints([defaultPoint]);
      setSelectedQr(defaultPoint);
    } finally {
      setLoadingQr(false);
    }
  }, []);

  // Fetch Check-in History and Inside Members
  const fetchCheckinData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [historyData, insideData] = await Promise.all([
        staffCheckinService.getCheckinHistory(),
        staffCheckinService.getMembersCurrentlyInside()
      ]);
      setHistoryRecords(historyData);
      setInsideRecords(insideData);
    } catch (err) {
      console.error("Failed to load check-in records:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    void fetchQrPoints();
    void fetchCheckinData();
  }, [fetchQrPoints, fetchCheckinData]);

  // Rotate QR token
  const handleRotateQr = async () => {
    if (!selectedQr) return;
    setIsRotatingQr(true);
    try {
      const updated = await adminQrService.regenerateGymQrToken(selectedQr.id);
      setSelectedQr(updated);
      setQrPoints(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast.success(`Đã tạo lại mã QR mới cho "${updated.name}"`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tạo lại mã QR."));
    } finally {
      setIsRotatingQr(false);
    }
  };

  // Create new QR point
  const handleCreateQrPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQrForm.name.trim()) {
      toast.error("Vui lòng nhập tên điểm QR");
      return;
    }
    setIsCreatingQr(true);
    try {
      const created = await adminQrService.createGymQr({
        name: newQrForm.name.trim(),
        location: newQrForm.location.trim() || undefined,
        token: newQrForm.token.trim() || undefined,
        active: true
      });
      toast.success("Tạo điểm quét QR mới thành công!");
      setShowCreateQrModal(false);
      setNewQrForm({ name: "", location: "", token: "" });
      setQrPoints(prev => [...prev, created]);
      setSelectedQr(created);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tạo điểm QR mới."));
    } finally {
      setIsCreatingQr(false);
    }
  };

  // Search member by code or phone
  const handleMemberSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      toast.error("Vui lòng nhập mã thẻ hoặc số điện thoại");
      return;
    }
    setIsSearching(true);
    try {
      const result = await staffCheckinService.lookupMember(query);
      setSearchResults([result]);
      setSelectedMember(result);
    } catch {
      toast.error("Không tìm thấy hội viên nào khớp với thông tin");
      setSearchResults([]);
      setSelectedMember(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm Manual Check-in
  const handleManualCheckInConfirm = async () => {
    if (!selectedMember) return;
    if (selectedMember.currentSubscription?.status !== "ACTIVE") {
      toast.error("Gói tập của hội viên đã hết hạn hoặc không hoạt động!");
      return;
    }

    setIsCheckingIn(true);
    try {
      await staffCheckinService.manualCheckin({
        memberId: selectedMember.memberId,
        memberCode: selectedMember.memberCode,
        reason: "Lễ tân check-in thủ công tại quầy"
      });
      toast.success(`Check-in thành công cho hội viên ${selectedMember.fullName}!`);
      setSelectedMember(null);
      setSearchQuery("");
      setSearchResults([]);
      void fetchCheckinData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Check-in thất bại."));
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Manual Check-out for an inside member
  const handleManualCheckout = async (checkInId: number, memberName?: string) => {
    setCheckingOutId(checkInId);
    try {
      await staffCheckinService.manualCheckout(checkInId);
      toast.success(`Check-out thành công cho ${memberName || "hội viên"}!`);
      void fetchCheckinData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Lỗi khi Check-out."));
    } finally {
      setCheckingOutId(null);
    }
  };

  // Secondary QR Scanner callback (if receptionist uses counter webcam to scan member card)
  const handleMemberCardScanSuccess = async (decodedText: string) => {
    if (isCheckingIn) return;
    setIsCheckingIn(true);
    try {
      await staffCheckinService.scanMemberQr({ qrData: decodedText });
      toast.success("Quét thẻ check-in thành công!");
      void fetchCheckinData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Quét thẻ thất bại."));
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Filtered history
  const filteredHistory = useMemo(() => {
    if (!historySearchTerm.trim()) return historyRecords;
    const lower = historySearchTerm.toLowerCase();
    return historyRecords.filter(r => 
      r.memberName?.toLowerCase().includes(lower) ||
      r.memberCode?.toLowerCase().includes(lower) ||
      r.id.toString().includes(lower)
    );
  }, [historyRecords, historySearchTerm]);

  // Filtered inside members
  const filteredInside = useMemo(() => {
    if (!historySearchTerm.trim()) return insideRecords;
    const lower = historySearchTerm.toLowerCase();
    return insideRecords.filter(r => 
      r.memberName?.toLowerCase().includes(lower) ||
      r.memberCode?.toLowerCase().includes(lower) ||
      r.id.toString().includes(lower)
    );
  }, [insideRecords, historySearchTerm]);

  // Table Columns for History
  const historyColumns = [
    {
      key: "id",
      header: "Mã Lượt",
      render: (row: CheckinRecord) => (
        <span className="font-mono text-xs font-semibold text-slate-500">#{row.id}</span>
      ),
    },
    {
      key: "memberName",
      header: "Hội viên",
      render: (row: CheckinRecord) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.memberName || `Hội viên #${row.memberId}`}</span>
          {row.memberCode && <span className="text-xs text-slate-400 font-mono">Mã: {row.memberCode}</span>}
        </div>
      ),
    },
    {
      key: "checkInTime",
      header: "Thời gian vào",
      render: (row: CheckinRecord) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{new Date(row.checkInTime).toLocaleString("vi-VN")}</span>
        </div>
      ),
    },
    {
      key: "checkOutTime",
      header: "Thời gian ra",
      render: (row: CheckinRecord) => (
        row.checkOutTime ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{new Date(row.checkOutTime).toLocaleString("vi-VN")}</span>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đang trong phòng
          </span>
        )
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: CheckinRecord) => (
        row.status === "SUCCESS" ? (
          <Badge variant="success">Thành công</Badge>
        ) : row.status === "CANCELLED" ? (
          <Badge variant="danger">Đã hủy</Badge>
        ) : (
          <Badge variant="warning">{row.status}</Badge>
        )
      ),
    },
  ];

  // Table Columns for Inside Members
  const insideColumns = [
    {
      key: "id",
      header: "Mã Lượt",
      render: (row: CheckinRecord) => (
        <span className="font-mono text-xs font-semibold text-slate-500">#{row.id}</span>
      ),
    },
    {
      key: "memberName",
      header: "Hội viên",
      render: (row: CheckinRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            {row.memberName?.charAt(0) || "U"}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{row.memberName || `Hội viên #${row.memberId}`}</span>
            {row.memberCode && <span className="text-xs text-slate-400 font-mono">Mã: {row.memberCode}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "checkInTime",
      header: "Giờ vào phòng",
      render: (row: CheckinRecord) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{new Date(row.checkInTime).toLocaleTimeString("vi-VN")}</span>
          <span className="text-slate-400 font-normal">({new Date(row.checkInTime).toLocaleDateString("vi-VN")})</span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Thao tác",
      render: (row: CheckinRecord) => (
        <button
          onClick={() => handleManualCheckout(row.id, row.memberName)}
          disabled={checkingOutId === row.id}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-all border border-amber-200 disabled:opacity-50 cursor-pointer shadow-sm hover:shadow"
        >
          {checkingOutId === row.id ? (
            <div className="w-3.5 h-3.5 border-2 border-amber-700/30 border-t-amber-700 rounded-full animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>Cho ra (Check-out)</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto px-4 md:px-6 mt-4">
      
      {/* =====================================================
       * PAGE HEADER
       * ===================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ScanLine className="w-7 h-7 text-emerald-600" /> Điểm Danh & Ra Vào
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Mã QR phòng tập cho hội viên tự quét, tra cứu điểm danh thủ công và theo dõi nhật ký hiện diện tập trung.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsKioskOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            title="Mở toàn màn hình hiển thị tại quầy lễ tân"
          >
            <Maximize2 className="w-4 h-4 text-emerald-400" />
            <span>Màn hình Quầy Lễ Tân</span>
          </button>

          <button
            type="button"
            onClick={() => {
              void fetchQrPoints();
              void fetchCheckinData();
              toast.success("Đã làm mới dữ liệu");
            }}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* =====================================================
       * TOP SECTION: 2 PRIMARY CARDS (QR CODE + MANUAL CHECK-IN)
       * ===================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ---------------------------------------------------
         * CARD 1: MÃ QR PHÒNG TẬP (HỘI VIÊN DÙNG CAMERA QUÉT)
         * --------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col h-full relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Mã QR Phòng Tập</h2>
                <p className="text-xs text-slate-500">Mã QR để hội viên dùng camera sau quét check-in</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowCreateQrModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm điểm
                </button>
              )}
            </div>
          </div>

          {/* QR Point Selector (if multiple points exist) */}
          {qrPoints.length > 1 && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Chọn điểm quét / Cổng
              </label>
              <select
                value={selectedQr?.id || ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  const found = qrPoints.find(p => p.id === id);
                  if (found) setSelectedQr(found);
                }}
                className="w-full p-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {qrPoints.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.location ? `(${p.location})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Central QR Code Display */}
          <div className="flex-1 flex flex-col items-center justify-center my-4">
            {loadingQr ? (
              <div className="w-56 h-56 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs text-slate-400">Đang tải mã QR...</p>
              </div>
            ) : selectedQr ? (
              <div className="flex flex-col items-center">
                <div className="p-5 rounded-3xl bg-white shadow-xl shadow-slate-200/60 border-2 border-emerald-500/20 relative group">
                  <QRCode
                    value={selectedQr.token}
                    size={200}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox="0 0 256 256"
                  />
                  <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-black text-slate-900 text-base">{selectedQr.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedQr.location || "Quầy Lễ Tân Trung Tâm"}
                  </p>
                </div>

                {/* Khung Mã Ký Tự Phòng / Mã Nhập Tay */}
                <div className="mt-3 w-full max-w-xs p-3 rounded-2xl bg-slate-900 text-white border border-emerald-500/30 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Mã ký tự phòng (Nhập tay)
                    </span>
                    <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                      {selectedQr.token}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedQr.token);
                      toast.success(`Đã sao chép mã phòng: ${selectedQr.token}`);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                    title="Sao chép mã phòng"
                  >
                    Sao chép
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action buttons for QR */}
          <div className="pt-4 border-t border-slate-100 mt-auto flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRotateQr}
              disabled={isRotatingQr || !selectedQr}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              title="Đổi token bảo mật mới cho mã QR nếu bị lộ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotatingQr ? "animate-spin" : ""}`} />
              <span>Đổi mã mới (Rotate)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsKioskOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Phóng to Quầy</span>
            </button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-[11px] text-slate-400">
              💡 Hội viên mở App FitLife trên điện thoại → nhấn <span className="font-semibold text-emerald-600">"Quét QR check in bằng camera sau"</span> để điểm danh.
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------
         * CARD 2: ĐIỂM DANH THỦ CÔNG (TRA CỨU & NHẬP MÃ)
         * --------------------------------------------------- */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col h-full relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Điểm Danh Thủ Công</h2>
                <p className="text-xs text-slate-500">Tra cứu theo Mã hội viên hoặc Số điện thoại</p>
              </div>
            </div>

            {/* Toggle input mode */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setManualInputMode("SEARCH")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  manualInputMode === "SEARCH"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Nhập mã / SĐT
              </button>
              <button
                type="button"
                onClick={() => setManualInputMode("SCANNER")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  manualInputMode === "SCANNER"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Quét thẻ vạch
              </button>
            </div>
          </div>

          {manualInputMode === "SEARCH" ? (
            <>
              {/* Form tra cứu */}
              <form onSubmit={handleMemberSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="VD: 0912345678 hoặc MEM-001..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSearching ? <Activity className="w-4 h-4 animate-spin" /> : "Tra cứu"}
                </button>
              </form>

              {/* Thông tin kết quả tìm kiếm */}
              {selectedMember ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-white border-2 border-indigo-200 shadow-md space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-inner shrink-0">
                      {selectedMember.fullName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{selectedMember.fullName}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {selectedMember.memberCode}
                        </span>
                        <span>•</span>
                        <span>{selectedMember.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chi tiết gói tập */}
                  <div className="p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase font-bold text-slate-400">Gói tập hiện tại</p>
                      <p className="text-sm font-bold text-slate-800">
                        {selectedMember.currentSubscription?.packageName || "Chưa đăng ký gói"}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      selectedMember.currentSubscription?.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-rose-100 text-rose-700 border border-rose-200"
                    }`}>
                      {selectedMember.currentSubscription?.status === "ACTIVE" ? "Đang hoạt động" : "Hết hạn / Không có"}
                    </span>
                  </div>

                  {/* Nút xác nhận Check-in */}
                  <button
                    type="button"
                    onClick={handleManualCheckInConfirm}
                    disabled={isCheckingIn || selectedMember.currentSubscription?.status !== "ACTIVE"}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                  >
                    {isCheckingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <ScanFace className="w-5 h-5" />
                        <span>Xác nhận cho vào cổng</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <User className="w-10 h-10 text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600 text-sm">Chưa chọn hội viên</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Nhập số điện thoại hoặc mã hội viên ở trên để tra cứu thông tin thẻ và điểm danh vào phòng.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Chế độ quét thẻ vạch/QR qua webcam quầy */
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-xs mx-auto overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 p-2">
                <GymQrScanner onSuccess={handleMemberCardScanSuccess} />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Đưa thẻ hội viên hoặc mã vạch của hội viên vào trước camera quầy.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* =====================================================
       * BOTTOM SECTION: UNIFIED DATA TABLES & HISTORY
       * ===================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Tab switcher + Search filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("HISTORY")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "HISTORY"
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Lượt Check-in Mới Nhất</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white">
                {historyRecords.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("INSIDE")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === "INSIDE"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Đang trong phòng tập</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "INSIDE" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
              }`}>
                {insideRecords.length}
              </span>
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã thẻ..."
              value={historySearchTerm}
              onChange={(e) => setHistorySearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tab Content Display */}
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Đang tải nhật ký điểm danh...</p>
          </div>
        ) : activeTab === "HISTORY" ? (
          filteredHistory.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-base">Chưa có lượt check-in nào</p>
              <p className="text-xs text-slate-400 mt-1">Khi hội viên quét mã QR hoặc check-in thủ công, thông tin sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table columns={historyColumns} data={filteredHistory} />
            </div>
          )
        ) : (
          filteredInside.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-base">Hiện không có hội viên nào trong phòng tập</p>
              <p className="text-xs text-slate-400 mt-1">Danh sách sẽ tự động cập nhật khi có hội viên check-in vào phòng.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table columns={insideColumns} data={filteredInside} />
            </div>
          )
        )}

      </div>

      {/* =====================================================
       * KIOSK FULLSCREEN MODAL (DISPLAY AT RECEPTION DESK)
       * ===================================================== */}
      {isKioskOpen && selectedQr && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col items-center justify-between p-8 md:p-12 animate-in fade-in duration-300">
          
          {/* Kiosk Header */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30">
                FL
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">FitLife Fitness & Yoga</h1>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Cổng Điểm Danh Tự Động</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-mono font-black text-white">{liveClock}</p>
                <p className="text-xs text-slate-400">
                  {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric", year: "numeric" })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsKioskOpen(false)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Đóng toàn màn hình"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Big QR Display */}
          <div className="flex flex-col items-center justify-center my-auto text-center">
            <div className="relative p-8 rounded-[2.5rem] bg-white shadow-2xl shadow-emerald-500/20 border-4 border-emerald-500 mb-6">
              <QRCode
                value={selectedQr.token}
                size={300}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox="0 0 256 256"
              />
            </div>

            <h2 className="text-3xl font-black text-white mb-2">{selectedQr.name}</h2>
            <p className="text-slate-400 font-medium text-base mb-4">
              {selectedQr.location || "Quầy Lễ Tân"}
            </p>

            {/* Box mã ký tự phòng */}
            <div className="mb-6 px-6 py-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/50 flex flex-col items-center shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Mã điểm danh nhập tay:
              </span>
              <span className="font-mono text-3xl font-black text-emerald-400 tracking-widest">
                {selectedQr.token}
              </span>
            </div>

            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <span>Mở App FitLife → Bấm "Quét QR check in bằng camera sau" (hoặc nhập mã ở trên)</span>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full max-w-4xl text-center text-xs text-slate-500">
            Hệ thống Cổng Điểm Danh FitLife • Nhấn nút [X] góc phải để quay về màn hình quản trị
          </div>
        </div>
      )}

      {/* =====================================================
       * CREATE QR POINT MODAL
       * ===================================================== */}
      {showCreateQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Thêm Điểm QR Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateQrModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQrPoint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên điểm quét <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cổng phụ Tầng 2, Khu VIP..."
                  value={newQrForm.name}
                  onChange={(e) => setNewQrForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Vị trí lắp đặt
                </label>
                <input
                  type="text"
                  placeholder="VD: Quầy lễ tân cổng phụ, Tầng 2..."
                  value={newQrForm.location}
                  onChange={(e) => setNewQrForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mã ký tự phòng (Mã nhập tay)
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomRoomCode}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Tạo mã ngẫu nhiên
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="VD: FL-ROOM-01 (Để trống hệ thống sẽ tự sinh)"
                  value={newQrForm.token}
                  onChange={(e) => setNewQrForm(prev => ({ ...prev, token: e.target.value.toUpperCase() }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold uppercase"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mã ngắn gọn này cho phép hội viên gõ tay trên app để check-in nếu camera không quét được.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateQrModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-sm font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingQr}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isCreatingQr ? "Đang tạo..." : "Xác nhận tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
