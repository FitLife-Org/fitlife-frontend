import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2, Clock } from "lucide-react";
import Card from "../../../components/common/Card";
import Pagination from "../../../components/common/Pagination";
import { EquipmentService } from "../../../services/equipmentService";

interface ScheduleItem {
    id: string;
    realId: number;
    equipName: string;
    date: string;
    type: string;
    status: string;
    staff: string;
}

export default function MaintenanceSchedulesPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const response = await EquipmentService.getMaintenanceSchedules({ page: currentPage, size: pageSize }) as any;
            const content = response?.content || [];
            if (response?.totalElements !== undefined) {
                setTotalItems(response.totalElements);
            } else {
                setTotalItems(content.length);
            }
            if (Array.isArray(content)) {
                const mapped = content.map((item: any) => ({
                    id: item.id ? `BT${String(item.id).padStart(3, "0")}` : "BT000",
                    realId: item.id,
                    equipName: item.equipmentName || "Không rõ",
                    date: item.maintenanceDate || "Chưa có",
                    type: item.maintenanceType === "MAINTENANCE" ? "Định kỳ" : item.maintenanceType === "REPAIR" ? "Sửa chữa" : item.maintenanceType || "Khác",
                    status: item.status,
                    staff: item.handledByName || "Chưa phân công"
                }));
                setSchedules(mapped);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch bảo trì:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleComplete = async (realId: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xác nhận hoàn thành phiếu bảo trì này và đưa thiết bị trở lại hoạt động?")) {
            return;
        }
        try {
            await EquipmentService.completeMaintenance(realId);
            fetchSchedules();
        } catch (error) {
            console.error("Lỗi khi hoàn thành bảo trì:", error);
        }
    };

    const filteredSchedules = schedules.filter((task) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
            task.id.toLowerCase().includes(term) ||
            task.equipName.toLowerCase().includes(term) ||
            task.staff.toLowerCase().includes(term)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Lịch bảo trì & Sửa chữa</h1>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi tiến độ bảo trì thiết bị toàn trung tâm</p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-100">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="w-80 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã phiếu, tên máy..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase text-slate-500 bg-slate-50/80 border-b border-slate-100 font-medium">
                            <tr>
                                <th className="px-5 py-4">Mã Phiếu</th>
                                <th className="px-5 py-4">Tên thiết bị</th>
                                <th className="px-5 py-4">Ngày thực hiện</th>
                                <th className="px-5 py-4">Loại hình</th>
                                <th className="px-5 py-4">Người phụ trách</th>
                                <th className="px-5 py-4">Trạng thái</th>
                                <th className="px-5 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredSchedules.map((task) => (
                                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-4 font-medium text-slate-900">{task.id}</td>
                                    <td className="px-5 py-4">{task.equipName}</td>
                                    <td className="px-5 py-4">{task.date}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{task.type}</span>
                                    </td>
                                    <td className="px-5 py-4">{task.staff}</td>
                                    <td className="px-5 py-4">
                                        {task.status === "COMPLETED" ? (
                                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle2 className="w-4 h-4" /> Đã xong</span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-amber-600 text-xs font-medium"><Clock className="w-4 h-4" /> Chờ xử lý</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        {task.status !== "COMPLETED" ? (
                                            <button
                                                onClick={() => handleComplete(task.realId)}
                                                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 rounded-lg text-xs font-medium transition-all duration-200 inline-flex items-center gap-1 shadow-sm hover:shadow active:scale-95"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Hoàn thành
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-xs font-medium">Nghiệm thu xong</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(0);
                    }}
                />
            </Card>
        </div>
    );
}