import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { EquipmentService } from "../../../services/equipmentService";
export default function EditEquipmentPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        area: "",
        status: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            setFetching(true);
            try {
                const response = await EquipmentService.getById(id);
                const data = response.data?.data || response.data;
                if (data) {
                    setFormData({
                        name: data.name || "",
                        category: data.category || "Cardio",
                        area: data.area || "Khu Cardio – Tầng 1",
                        status: data.status || "ACTIVE",
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải chi tiết thiết bị:", error);
            } finally {
                setFetching(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setLoading(true);
        try {
            await EquipmentService.update(id, formData);
            navigate("/admin/equipment");
        } catch (error) {
            console.error("Lỗi khi cập nhật thiết bị:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cập nhật thiết bị #{id}</h1>
                    <p className="text-sm text-slate-500 mt-1">Chỉnh sửa thông tin thiết bị đang có</p>
                </div>
            </div>

            <Card className="p-6">
                {fetching ? (
                    <div className="py-8 text-center text-slate-500">Đang tải dữ liệu...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Tên thiết bị</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Danh mục</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                            >
                                <option value="Cardio">Cardio</option>
                                <option value="Sức mạnh">Sức mạnh (Máy khối)</option>
                                <option value="Free Weight">Free Weight (Tạ tự do)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Khu vực đặt máy</label>
                            <select
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                            >
                                <option value="Khu Cardio – Tầng 1">Khu Cardio – Tầng 1</option>
                                <option value="Khu Sức mạnh – Tầng 2">Khu Sức mạnh – Tầng 2</option>
                                <option value="Khu VIP – Tầng 3">Khu VIP – Tầng 3</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Trạng thái ban đầu</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Ngừng hoạt động</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <Button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm transition-colors">
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading || fetching} className="px-6 py-2.5 bg-fit-primary hover:bg-fit-primaryHover text-white rounded-lg font-medium text-sm shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                    </form>
                )}
            </Card>
        </div>
    );
}