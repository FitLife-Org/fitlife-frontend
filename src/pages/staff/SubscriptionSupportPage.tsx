import { Search, Ban, Clock, CheckCircle, SearchX } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import { formatCurrency } from "../../utils/formatCurrency";
import type { Subscription } from "../../types/subscription.type";
import { useSubscriptionSupport } from "../../hooks/useSubscriptionSupport";
import { useState } from "react";

export default function SubscriptionSupportPage() {
  const {
    subscriptions,
    loading,
    statusFilter,
    setStatusFilter,
    handleCancel,
    handleExpire
  } = useSubscriptionSupport();

  const [searchTerm, setSearchTerm] = useState("");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Đang hiệu lực</Badge>;
      case "PENDING":
        return <Badge variant="warning">Chờ kích hoạt</Badge>;
      case "EXPIRED":
        return <Badge variant="default">Hết hạn</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Đã hủy</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!searchTerm) return true;
    const lowerKeyword = searchTerm.toLowerCase();
    return sub.memberId?.toString().includes(lowerKeyword) ||
           sub.memberName?.toLowerCase().includes(lowerKeyword) ||
           sub.gymPackageName?.toLowerCase().includes(lowerKeyword);
  });

  const columns = [
    {
      key: "id",
      header: "Mã ĐK",
      render: (row: Subscription) => (
        <span className="font-mono text-sm text-slate-500">#{row.id}</span>
      ),
    },
    {
      key: "memberName",
      header: "Hội viên",
      render: (row: Subscription) => (
        <span className="font-bold text-slate-800">{row.memberName || `Hội viên #${row.memberId}`}</span>
      ),
    },
    {
      key: "gymPackageName",
      header: "Gói tập",
      render: (row: Subscription) => (
        <div className="flex flex-col">
          <span className="font-semibold text-fit-primary">{row.gymPackageName}</span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Thời gian",
      render: (row: Subscription) => (
        <div className="flex flex-col text-sm text-slate-500">
          <span>Bắt đầu: {row.startDate || "-"}</span>
          <span>Kết thúc: {row.endDate || "-"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Subscription) => getStatusBadge(row.status),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: Subscription) => {
        if (row.status === "CANCELLED" || row.status === "EXPIRED") {
          return <span className="text-xs text-slate-400">Không khả dụng</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCancel(row.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Hủy gói tập"
            >
              <Ban className="w-5 h-5" />
            </button>
            
            {row.status === "ACTIVE" && (
              <button
                onClick={() => handleExpire(row.id)}
                className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="Báo hết hạn"
              >
                <Clock className="w-5 h-5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader 
          title="Quản lý & Hỗ trợ gói tập" 
          description="Kiểm tra, gia hạn và xử lý sự cố gói tập cho hội viên" 
        />
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tên hội viên, tên gói..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary transition-all shadow-sm"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary shadow-sm"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hiệu lực</option>
            <option value="PENDING">Chờ kích hoạt</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-fit-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Đang tải danh sách gói tập...</p>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy dữ liệu</h3>
            <p className="text-slate-500 max-w-sm">
              Không có gói tập nào phù hợp với bộ lọc hiện tại. Vui lòng thử tìm kiếm với từ khóa khác.
            </p>
          </div>
        ) : (
          <Table columns={columns} data={filteredSubscriptions} />
        )}
      </Card>
    </div>
  );
}
