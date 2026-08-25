import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  History,
  Users,
  Search,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Clock,
} from "lucide-react";

import toast from "react-hot-toast";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";

import {
  staffCheckinService,
} from "../../services/checkinService";

import type {
  CheckinRecord,
} from "../../types/checkin.type";

export default function StaffCheckinHistoryPage() {
  const [activeTab, setActiveTab] = useState<"HISTORY" | "INSIDE">("HISTORY");
  const [historyRecords, setHistoryRecords] = useState<CheckinRecord[]>([]);
  const [insideRecords, setInsideRecords] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);

  const fetchData =
      useCallback(async (): Promise<void> => {
        setLoading(true);

        try {
          if (activeTab === "HISTORY") {
            const data =
                await staffCheckinService
                    .getCheckinHistory();

            setHistoryRecords(data);
          } else {
            const data =
                await staffCheckinService
                    .getMembersCurrentlyInside();

            setInsideRecords(data);
          }
        } catch {
          toast.error(
              "Không thể tải danh sách dữ liệu.",
          );
        } finally {
          setLoading(false);
        }
      }, [activeTab]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleManualCheckout = async (id: number) => {
    try {
      setCheckingOutId(id);
      await staffCheckinService.manualCheckout(id);
      toast.success("Check-out thành công!");
      void fetchData();
    } catch {
      toast.error("Lỗi khi Check-out.");
    } finally {
      setCheckingOutId(null);
    }
  };

  const filteredHistory = historyRecords.filter(r => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return r.memberName?.toLowerCase().includes(lower) ||
           r.memberCode?.toLowerCase().includes(lower) ||
           r.id.toString().includes(lower);
  });

  const filteredInside = insideRecords.filter(r => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return r.memberName?.toLowerCase().includes(lower) ||
           r.memberCode?.toLowerCase().includes(lower) ||
           r.id.toString().includes(lower);
  });

  const historyColumns = [
    {
      key: "id",
      header: "Mã Lượt",
      render: (row: CheckinRecord) => (
        <span className="font-mono text-sm text-slate-500">#{row.id}</span>
      ),
    },
    {
      key: "memberName",
      header: "Hội viên",
      render: (row: CheckinRecord) => (
        <div>
          <span className="font-bold text-slate-800 block">{row.memberName || `Hội viên #${row.memberId}`}</span>
          {row.memberCode && <span className="text-xs text-slate-400 font-medium">Mã: {row.memberCode}</span>}
        </div>
      ),
    },
    {
      key: "checkInTime",
      header: "Thời gian Check-in",
      render: (row: CheckinRecord) => (
        <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
          <Clock className="w-4 h-4 text-emerald-500" />
          {new Date(row.checkInTime).toLocaleString('vi-VN')}
        </div>
      ),
    },
    {
      key: "checkOutTime",
      header: "Thời gian Check-out",
      render: (row: CheckinRecord) => (
        row.checkOutTime ? (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
            <Clock className="w-4 h-4 text-amber-500" />
            {new Date(row.checkOutTime).toLocaleString('vi-VN')}
          </div>
        ) : (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
            Đang trong phòng
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
          <Badge variant="default">{row.status}</Badge>
        )
      ),
    },
  ];

  const insideColumns = [
    {
      key: "id",
      header: "Mã Lượt",
      render: (row: CheckinRecord) => (
        <span className="font-mono text-sm text-slate-500">#{row.id}</span>
      ),
    },
    {
      key: "memberName",
      header: "Hội viên",
      render: (row: CheckinRecord) => (
        <div>
          <span className="font-bold text-slate-800 block">{row.memberName || `Hội viên #${row.memberId}`}</span>
          {row.memberCode && <span className="text-xs text-slate-400 font-medium">Mã: {row.memberCode}</span>}
        </div>
      ),
    },
    {
      key: "checkInTime",
      header: "Giờ vào phòng",
      render: (row: CheckinRecord) => (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          {new Date(row.checkInTime).toLocaleTimeString('vi-VN')}
        </div>
      ),
    },
    {
      key: "action",
      header: "Thao tác",
      render: (row: CheckinRecord) => (
        <button
          onClick={() => handleManualCheckout(row.id)}
          disabled={checkingOutId === row.id}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
        >
          {checkingOutId === row.id ? (
            <div className="w-3.5 h-3.5 border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          Check-out
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title="Nhật ký Check-in & Hiện diện"
          description="Quản lý chi tiết lịch sử ra vào và danh sách hội viên đang trong phòng tập"
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã thẻ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-staff/20 focus:border-fit-staff transition-all shadow-sm"
            />
          </div>

          <button
              onClick={() => {
                void fetchData();
              }}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-sm font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "HISTORY"
              ? "border-fit-staff text-fit-staff bg-fit-staffSoft/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <History className="w-4 h-4" /> Lịch sử Check-in ({historyRecords.length})
        </button>

        <button
          onClick={() => setActiveTab("INSIDE")}
          className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all ${
            activeTab === "INSIDE"
              ? "border-fit-staff text-fit-staff bg-fit-staffSoft/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" /> Đang trong phòng ({insideRecords.length})
        </button>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-fit-staff border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : activeTab === "HISTORY" ? (
          filteredHistory.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">Chưa có dữ liệu lịch sử check-in</p>
              <p className="text-sm text-slate-400 mt-1">Khi có lượt check-in từ quầy hoặc QR, thông tin sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <Table columns={historyColumns} data={filteredHistory} />
          )
        ) : (
          filteredInside.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">Hiện không có hội viên nào trong phòng tập</p>
              <p className="text-sm text-slate-400 mt-1">Danh sách sẽ tự động cập nhật khi có hội viên check-in vào phòng.</p>
            </div>
          ) : (
            <Table columns={insideColumns} data={filteredInside} />
          )
        )}
      </Card>
    </div>
  );
}
