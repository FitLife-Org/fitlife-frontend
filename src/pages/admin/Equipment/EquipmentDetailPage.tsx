import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Wrench, Calendar, MapPin, Tag } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { EquipmentService } from "../../../features/equipment/services/equipmentService";
import type { Equipment } from "../../../features/equipment/types/equipment.type";
export default function EquipmentDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [equipment, setEquipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const data = await EquipmentService.getById(id);
                if (data) setEquipment(data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết thiết bị:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!id) return;
        setUpdatingStatus(true);
        try {
            await EquipmentService.updateStatus(id, newStatus);
            setEquipment((prev: any) => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return <div className="py-12 text-center text-slate-500">Đang tải chi tiết thiết bị...</div>;
    }

    if (!equipment) {
        return <div className="py-12 text-center text-slate-500">Không tìm thấy thiết bị</div>;
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Chi tiết thiết bị</h1>
                        <p className="text-sm text-slate-500 mt-1">Mã thiết bị: {id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate(`/admin/equipment/${id}/edit`)} className="px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg font-medium text-sm flex items-center gap-2">
                        <Edit2 className="w-4 h-4" /> Sửa
                    </Button>
                    <Button onClick={() => navigate(`/admin/equipment/${id}/maintenance`)} className="bg-fit-trainer text-white hover:bg-fit-trainer/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> Bảo trì
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Ảnh và trạng thái */}
                <Card className="p-6 col-span-1 space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={equipment.image} alt={equipment.name} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg text-slate-900">{equipment.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-slate-500 font-medium">Trạng thái:</span>
                            <select
                                value={equipment.status}
                                onChange={(e) => handleUpdateStatus(e.target.value)}
                                disabled={updatingStatus}
                                className={`text-xs font-medium px-2 py-1 rounded-md border border-slate-200 focus:outline-none focus:border-fit-primary ${equipment.status === 'ACTIVE' ? 'text-fit-primary bg-fit-primarySoft' : equipment.status === 'MAINTENANCE' ? 'text-fit-trainer bg-fit-trainerSoft' : 'text-fit-danger bg-fit-dangerSoft'}`}
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                                <option value="INACTIVE">Ngừng hoạt động</option>
                            </select>
                            {updatingStatus && <span className="text-xs text-slate-400">Đang lưu...</span>}
                        </div>
                    </div>
                </Card>

                {/* Cột phải: Thông số chi tiết */}
                <Card className="p-6 col-span-1 lg:col-span-2 space-y-6">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3">Thông tin chung</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                        <div className="flex items-start gap-3">
                            <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Danh mục</p>
                                <p className="text-sm text-slate-900 mt-0.5">{equipment.category}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Khu vực</p>
                                <p className="text-sm text-slate-900 mt-0.5">{equipment.area}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Bảo trì gần nhất</p>
                                <p className="text-sm text-slate-900 mt-0.5">{equipment.lastMaintenance || "Chưa có"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Wrench className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-slate-500">Bảo trì tiếp theo</p>
                                <p className="text-sm text-slate-900 mt-0.5">{equipment.nextMaintenance || "Chưa lên lịch"} {equipment.daysToNextMaintenance ? `(Còn ${equipment.daysToNextMaintenance} ngày)` : ""}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}