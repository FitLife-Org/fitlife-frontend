import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Calendar as CalIcon } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { EquipmentService } from "../../../services/equipmentService";
export default function CreateMaintenancePage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        date: "",
        type: "MAINTENANCE",
        description: "",
        estimatedCost: "",
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setLoading(true);
        try {
            await EquipmentService.createMaintenance(id, formData);
            navigate("/admin/equipment/maintenance-schedules");
        } catch (error) {
            console.error("Lỗi khi tạo phiếu bảo trì:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tạo phiếu bảo trì/sửa chữa</h1>
                    <p className="text-sm text-slate-500 mt-1">Lập kế hoạch cho thiết bị mã: <span className="font-semibold text-slate-700">{id}</span></p>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Loại hình</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-trainer/20 focus:border-fit-trainer"
                            >
                                <option value="MAINTENANCE">Bảo trì định kỳ</option>
                                <option value="REPAIR">Sửa chữa đột xuất</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Ngày dự kiến</label>
                            <div className="relative">
                                <CalIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-trainer/20 focus:border-fit-trainer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Chi phí dự kiến (VND)</label>
                        <input
                            type="number"
                            placeholder="VD: 500000"
                            value={formData.estimatedCost}
                            onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-trainer/20 focus:border-fit-trainer"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Mô tả tình trạng / Hạng mục thực hiện</label>
                        <textarea
                            rows={4}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-trainer/20 focus:border-fit-trainer resize-none"
                            placeholder="Nhập chi tiết vấn đề hoặc các bộ phận cần bảo dưỡng..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm">
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-fit-trainer hover:bg-fit-trainer/90 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50">
                            <Save className="w-4 h-4" /> 
                            {loading ? "Đang lưu..." : "Lưu phiếu bảo trì"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}