import { Eye, Utensils, Search, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Loading from "../../components/common/Loading";
import { useAdminNutrition } from "../../hooks/useAdminNutrition";
import NutritionPlanDetailModal from "./components/NutritionPlanDetailModal";

export default function AdminNutritionPage() {
  const {
    plans,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    totalElements,
    detailModalOpen,
    setDetailModalOpen,
    selectedPlan,
    detailLoading,
    handleOpenDetail
  } = useAdminNutrition();

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return <Badge variant="success">Đang áp dụng</Badge>;
      case "DRAFT": return <Badge variant="warning">Bản nháp</Badge>;
      case "COMPLETED": return <Badge variant="purple">Hoàn thành</Badge>;
      case "ARCHIVED": return <Badge variant="default">Lưu trữ</Badge>;
      case "CANCELLED": return <Badge variant="danger">Đã hủy</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const renderSourceBadge = (source: string) => {
    switch (source) {
      case "AI_GENERATED": return <Badge variant="purple">AI Generated</Badge>;
      case "TRAINER_CREATED": return <Badge variant="success">Trainer</Badge>;
      case "MEMBER_CREATED": return <Badge variant="default">Member</Badge>;
      default: return <Badge variant="warning">{source}</Badge>;
    }
  };

  // Simple local filter for search term (since API might not have search yet)
  const filteredPlans = plans.filter(p => {
    const matchesSearch = 
      (p.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (p.goal?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Thực đơn Dinh dưỡng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và giám sát tất cả các kế hoạch dinh dưỡng trong hệ thống</p>
        </div>
      </div>

      {/* Summary Stats (Just total for now) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Thực Đơn (Tất cả)</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{totalElements}</h3>
          </div>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card className="shadow-sm border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 bg-slate-50/30">
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
            <input 
              type="text" 
              placeholder="Tìm theo tên thực đơn, mục tiêu..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary transition-all shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide pl-1">Lọc Trạng thái</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:border-fit-primary font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang áp dụng</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <Loading label="Đang tải danh sách thực đơn..." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/80 border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Mã TĐ</th>
                    <th className="px-6 py-4">Tên thực đơn</th>
                    <th className="px-6 py-4">Mục tiêu</th>
                    <th className="px-6 py-4">Thông số</th>
                    <th className="px-6 py-4">Nguồn</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPlans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        Không tìm thấy thực đơn nào.
                      </td>
                    </tr>
                  ) : (
                    filteredPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-slate-50/40 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                          #{plan.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-[13px]">{plan.name || "Không tên"}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-slate-700 font-medium">
                          {plan.goal}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5 text-[12px] font-medium">
                            <span className="text-fit-primary">{plan.dailyCalories} kcal/ngày</span>
                            <span className="text-slate-400">{plan.durationWeeks} tuần • {plan.mealsPerDay} bữa/ngày</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {renderSourceBadge(plan.source)}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(plan.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenDetail(plan)}
                              className="p-1.5 text-slate-400 hover:text-fit-primary hover:bg-fit-primarySoft rounded-lg transition-all" 
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Trang {page + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 h-auto text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 h-auto text-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <NutritionPlanDetailModal 
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        plan={selectedPlan}
        loading={detailLoading}
      />
    </div>
  );
}
