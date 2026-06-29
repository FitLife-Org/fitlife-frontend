import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2, Clock } from "lucide-react";
import Card from "../../../components/common/Card";
import { EquipmentService } from "../../../services/equipmentService";

const MOCK_SCHEDULES = [
    { id: "BT001", equipName: "Máy chạy bộ TechnoGym T20", date: "15/06/2024", type: "Định kỳ", status: "PENDING", staff: "Nguyễn Văn A" },
    { id: "BT002", equipName: "Ghế đẩy ngực Hammer", date: "10/06/2024", type: "Sửa chữa", status: "COMPLETED", staff: "Trần Văn B" },
];

export default function MaintenanceSchedulesPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [schedules, setSchedules] = useState<any[]>(MOCK_SCHEDULES);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const response = await EquipmentService.getMaintenanceSchedules();
            const data = response.data?.data || response.data || [];
            if (Array.isArray(data) && data.length > 0) {
                setSchedules(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải lịch bảo trì:", error);
        } finally {
            setLoading(false);
        }
    };

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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : schedules.map((task) => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}