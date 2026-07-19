import { useState, useEffect } from "react";
import { Search, Plus, Filter, Eye, Edit2, MoreVertical, Layers, CheckCircle2, Wrench, XCircle, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { EquipmentService } from "../../../services/equipmentService";
import type { Equipment, EquipmentSummary } from "../../../types/equipment.type";
const INITIAL_SUMMARY: EquipmentSummary = {
  total: 0,
  active: { count: 0, percentage: 0 },
  maintenance: { count: 0, percentage: 0 },
  inactive: { count: 0, percentage: 0 },
  upcomingMaintenance: { count: 0, timeFrame: "Trong 7 ngày tới" }
};

export default function EquipmentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [summary, setSummary] = useState<EquipmentSummary>(INITIAL_SUMMARY);
  const [loading, setLoading] = useState(false);
  
  // Pagination States
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const pageSize = 10;

  useEffect(() => {
    fetchEquipments();
    fetchSummary();
  }, [currentPage, statusFilter]);

  const fetchSummary = async () => {
    try {
      const summaryData = await EquipmentService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Lỗi khi tải thống kê thiết bị:", error);
    }
  };

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const data = await EquipmentService.getAll(currentPage, pageSize, searchTerm, statusFilter);
      if (data && data.items) {
        setEquipments(data.items);
        setTotalItems(data.totalItems);
        setCurrentPage(data.page);
      }
    } catch (error) {
      console.error("Lỗi khi tải thiết bị:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: Equipment["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-fit-primarySoft text-fit-primary border border-fit-primary/20"><span className="w-1.5 h-1.5 rounded-full bg-fit-primary"></span>Hoạt động</span>;
      case "MAINTENANCE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-fit-trainerSoft text-fit-trainer border border-fit-trainer/20"><span className="w-1.5 h-1.5 rounded-full bg-fit-trainer"></span>Bảo trì</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-fit-dangerSoft text-fit-danger border border-fit-danger/20"><span className="w-1.5 h-1.5 rounded-full bg-fit-danger"></span>Ngừng hoạt động</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý trang thiết bị</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi toàn bộ trang thiết bị trong phòng gym</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') fetchEquipments(); }}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary w-64 shadow-sm"
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 shadow-sm relative">
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">3</div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
          </button>
          <Link to="/admin/equipment/add">
            <Button className="bg-fit-primary hover:bg-fit-primaryHover text-white shadow-sm flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm">
              <Plus className="w-4 h-4" /> Thêm thiết bị
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total */}
        <Card className="p-5 flex flex-col justify-center shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-fit-primarySoft flex items-center justify-center text-fit-primary">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tổng số thiết bị</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{summary.total}</h3>
              <p className="text-xs text-slate-500 mt-1">Thiết bị</p>
            </div>
          </div>
        </Card>

        {/* Active */}
        <Card className="p-5 flex flex-col justify-center shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-fit-adminSoft flex items-center justify-center text-fit-admin">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Đang hoạt động</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{summary.active.count}</h3>
              <p className="text-xs text-slate-500 mt-1">{summary.active.percentage}%</p>
            </div>
          </div>
        </Card>

        {/* Maintenance */}
        <Card className="p-5 flex flex-col justify-center shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-fit-trainerSoft flex items-center justify-center text-fit-trainer">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bảo trì</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{summary.maintenance.count}</h3>
              <p className="text-xs text-slate-500 mt-1">{summary.maintenance.percentage}%</p>
            </div>
          </div>
        </Card>

        {/* Inactive */}
        <Card className="p-5 flex flex-col justify-center shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-fit-dangerSoft flex items-center justify-center text-fit-danger">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ngừng hoạt động</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{summary.inactive.count}</h3>
              <p className="text-xs text-slate-500 mt-1">{summary.inactive.percentage}%</p>
            </div>
          </div>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="p-5 flex flex-col justify-center shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sắp bảo trì</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{summary.upcomingMaintenance.count}</h3>
              <p className="text-xs text-slate-500 mt-1">{summary.upcomingMaintenance.timeFrame}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="shadow-sm border-slate-100">
        {/* Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          <div className="w-full lg:w-80 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm thiết bị, mã thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-[11px] font-medium text-slate-500 uppercase pl-1">Danh mục</label>
              <select className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm appearance-none cursor-pointer w-full" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.2em 1.2em", paddingRight: "2rem" }}>
                <option>Tất cả</option>
                <option>Cardio</option>
                <option>Sức mạnh</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-[11px] font-medium text-slate-500 uppercase pl-1">Trạng thái</label>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm appearance-none cursor-pointer w-full" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.2em 1.2em", paddingRight: "2rem" }}>
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[140px]">
              <label className="text-[11px] font-medium text-slate-500 uppercase pl-1">Khu vực</label>
              <select className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 focus:outline-none focus:border-emerald-500 shadow-sm appearance-none cursor-pointer w-full" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "1.2em 1.2em", paddingRight: "2rem" }}>
                <option>Tất cả</option>
                <option>Khu Cardio</option>
                <option>Khu Sức mạnh</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 justify-end mt-[18px]">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium shadow-sm h-[38px] whitespace-nowrap">
                <Filter className="w-4 h-4 text-fit-primary" />
                <span className="hidden sm:inline">Bộ lọc</span>
                <div className="w-1.5 h-1.5 rounded-full bg-fit-primary absolute top-1 right-1 sm:static"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50/80 border-b border-slate-100 font-medium">
              <tr>
                <th className="px-5 py-4 w-12"><input type="checkbox" className="rounded border-slate-300 text-fit-primary focus:ring-fit-primary cursor-pointer" /></th>
                <th className="px-5 py-4 min-w-[280px]">Thiết bị</th>
                <th className="px-5 py-4">Danh mục</th>
                <th className="px-5 py-4">Khu vực</th>
                <th className="px-5 py-4">Tình trạng</th>
                <th className="px-5 py-4 whitespace-nowrap">Lần bảo trì gần nhất</th>
                <th className="px-5 py-4 whitespace-nowrap">Ngày bảo trì tiếp theo</th>
                <th className="px-5 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : equipments.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-4"><input type="checkbox" className="rounded border-slate-300 text-fit-primary focus:ring-fit-primary cursor-pointer" /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/60 p-1">
                        <img src={eq.image} alt={eq.name} className="w-full h-full object-cover mix-blend-multiply rounded-md" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[13px]">{eq.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Mã: {eq.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] font-medium text-slate-700">{eq.category}</td>
                  <td className="px-5 py-4 text-[13px] text-slate-600">{eq.area}</td>
                  <td className="px-5 py-4">{renderStatusBadge(eq.status)}</td>
                  <td className="px-5 py-4 text-[13px] text-slate-600">{eq.lastMaintenance}</td>
                  <td className="px-5 py-4">
                    {eq.nextMaintenance ? (
                      <div className="flex flex-col">
                        <span className="text-[13px] text-slate-900 font-medium">{eq.nextMaintenance}</span>
                        {typeof eq.daysToNextMaintenance === "number" && (
                          <span className={`text-[11px] mt-0.5 ${eq.daysToNextMaintenance <= 7 ? 'text-fit-trainer font-medium' : 'text-fit-primary'}`}>
                            Còn {eq.daysToNextMaintenance} ngày
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-fit-primary hover:bg-fit-primarySoft rounded-md transition-colors" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link to={`/admin/equipment/edit/${eq.id}`}>
                        <button className="p-1.5 text-slate-400 hover:text-fit-admin hover:bg-fit-adminSoft rounded-md transition-colors" title="Chỉnh sửa">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="Thêm thao tác">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>Hiển thị</span>
            <select className="px-2.5 py-1 border border-slate-200 rounded text-slate-700 bg-white focus:outline-none focus:border-fit-primary cursor-pointer">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>1 - {equipments.length} của {totalItems} thiết bị</span>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button className="w-8 h-8 rounded bg-fit-primary text-white font-medium flex items-center justify-center text-sm shadow-sm hover:bg-fit-primaryHover transition-colors">1</button>
            <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 font-medium flex items-center justify-center text-sm transition-colors">2</button>
            <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 font-medium flex items-center justify-center text-sm transition-colors">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
            <button className="w-8 h-8 rounded text-slate-600 hover:bg-slate-100 font-medium flex items-center justify-center text-sm transition-colors">13</button>
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={equipments.length < pageSize}
              className="p-1.5 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
