import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Wrench, Calendar, MapPin, Tag, AlertTriangle, Trash2, Edit, DollarSign, History } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { EquipmentService } from "../../../services/equipmentService";
import type { Equipment } from "../../../types/equipment.type";
import { showAlert } from "../../../utils/alert";

export default function EquipmentDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Dynamic Areas and History States
    const [areas, setAreas] = useState<any[]>([]);
    const [isEditingArea, setIsEditingArea] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [fetchingHistory, setFetchingHistory] = useState(false);

    // Report Broken States
    const [showReportModal, setShowReportModal] = useState(false);
    const [brokenDescription, setBrokenDescription] = useState("");
    const [submittingBroken, setSubmittingBroken] = useState(false);

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

    const fetchHistory = useCallback(async () => {
        if (!id) return;
        setFetchingHistory(true);
        try {
            const data = await EquipmentService.getHistory(id);
            setHistory(data);
        } catch (error) {
            console.error("Lỗi khi tải lịch sử bảo trì:", error);
        } finally {
            setFetchingHistory(false);
        }
    }, [id]);

    useEffect(() => {
        if (!id) return;
        fetchHistory();
    }, [id, fetchHistory]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const data = await EquipmentService.getAreas();
                setAreas(data);
            } catch (error) {
                console.error("Lỗi khi tải khu vực:", error);
            }
        };
        fetchAreas();
    }, []);

    const handleUpdateStatus = async (newStatus: string) => {
        if (!id) return;
        setUpdatingStatus(true);
        try {
            await EquipmentService.updateStatus(id, newStatus);
            setEquipment((prev) => prev ? ({ ...prev, status: newStatus as Equipment["status"] }) : null);
            showAlert.success("Thành công", "Đã cập nhật trạng thái thiết bị");
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            showAlert.error("Lỗi", "Không thể cập nhật trạng thái.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAreaChange = async (newArea: string) => {
        if (!id) return;
        try {
            await EquipmentService.updateArea(id, newArea);
            setEquipment((prev) => prev ? ({ ...prev, area: newArea }) : null);
            setIsEditingArea(false);
            showAlert.success("Thành công", "Đã cập nhật khu vực thiết bị.");
        } catch (error) {
            console.error("Lỗi khi cập nhật khu vực:", error);
            showAlert.error("Lỗi", "Không thể cập nhật khu vực.");
        }
    };

    const handleReportBroken = async () => {
        if (!id || !brokenDescription.trim()) return;
        setSubmittingBroken(true);
        try {
            await EquipmentService.reportBroken(id, brokenDescription);
            showAlert.success("Thành công", "Đã gửi báo cáo hỏng thiết bị và tự động lập lịch bảo trì!");
            setShowReportModal(false);
            setBrokenDescription("");
            
            // Refresh detail and history
            const data = await EquipmentService.getById(id);
            if (data) setEquipment(data);
            fetchHistory();
        } catch (error) {
            console.error("Lỗi khi báo hỏng thiết bị:", error);
            showAlert.error("Lỗi", "Không thể gửi báo cáo báo hỏng.");
        } finally {
            setSubmittingBroken(false);
        }
    };

    const handleRetire = async () => {
        if (!id) return;
        
        const confirm = window.confirm("Bạn có chắc chắn muốn ngừng sử dụng (thanh lý) thiết bị này vĩnh viễn không?");
        if (!confirm) return;

        try {
            await EquipmentService.retire(id);
            showAlert.success("Thành công", "Thiết bị đã được chuyển sang trạng thái ngừng hoạt động.");
            setEquipment((prev) => prev ? ({ ...prev, status: "INACTIVE" }) : null);
        } catch (error) {
            console.error("Lỗi khi ngừng hoạt động thiết bị:", error);
            showAlert.error("Lỗi", "Không thể ngừng hoạt động thiết bị.");
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
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Chi tiết thiết bị</h1>
                        <p className="text-sm text-slate-500 mt-1">Mã thiết bị: {id}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => navigate(`/admin/equipment/edit/${id}`)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 border-0 shadow-md shadow-amber-500/20 transition-all">
                        <Edit2 className="w-4 h-4" /> Sửa
                    </Button>
                    <Button onClick={() => navigate(`/admin/equipment/${id}/maintenance`)} className="bg-fit-trainer text-white hover:bg-fit-trainer/90 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 border-0 transition-all">
                        <Wrench className="w-4 h-4" /> Bảo trì
                    </Button>
                    <button 
                        onClick={() => setShowReportModal(true)} 
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 border-0 shadow-md shadow-red-500/20 transition-all"
                    >
                        <AlertTriangle className="w-4 h-4" /> Báo hỏng
                    </button>
                    {equipment.status !== "INACTIVE" && (
                        <button 
                            onClick={handleRetire} 
                            className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium text-sm flex items-center gap-2 border-0 shadow-md shadow-slate-500/20 transition-all"
                        >
                            <Trash2 className="w-4 h-4" /> Ngừng dùng
                        </button>
                    )}
                </div>
            </div>

            {/* Layout chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái: Ảnh và trạng thái */}
                <Card className="p-6 col-span-1 space-y-4">
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={equipment.image} alt={equipment.name} className="w-full h-full object-cover" />
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

                        {/* Inline Area Editor */}
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-500">Khu vực</p>
                                {isEditingArea ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <select
                                            value={equipment.area}
                                            onChange={(e) => handleAreaChange(e.target.value)}
                                            className="px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary bg-white"
                                        >
                                            {areas.map((a) => (
                                                <option key={a.id} value={a.name}>
                                                    {a.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => setIsEditingArea(false)}
                                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-sm text-slate-900">{equipment.area}</p>
                                        {equipment.status !== "INACTIVE" && (
                                            <button
                                                onClick={() => setIsEditingArea(true)}
                                                className="text-slate-400 hover:text-fit-primary transition-colors"
                                                title="Thay đổi khu vực nhanh"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}
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

            {/* Lịch sử bảo trì */}
            <Card className="p-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                    <History className="w-5 h-5 text-fit-primary" />
                    <h3 className="font-bold text-slate-900">Lịch sử bảo trì & Sửa chữa</h3>
                </div>

                {fetchingHistory ? (
                    <div className="py-6 text-center text-sm text-slate-500">Đang tải lịch sử...</div>
                ) : history.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-400">Chưa có lịch sử bảo trì cho thiết bị này.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-slate-600">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                                    <th className="py-3 px-4">Ngày bảo trì</th>
                                    <th className="py-3 px-4">Loại hình</th>
                                    <th className="py-3 px-4">Mô tả hỏng hóc / công việc</th>
                                    <th className="py-3 px-4 text-right">Chi phí</th>
                                    <th className="py-3 px-4">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((h, index) => (
                                    <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-slate-900">{h.date || h.maintenanceDate}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${h.type === 'REPAIR' || h.maintenanceType === 'REPAIR' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {h.type === 'REPAIR' || h.maintenanceType === 'REPAIR' ? 'Sửa chữa' : 'Bảo trì định kỳ'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 max-w-xs truncate" title={h.description}>
                                            {h.description || "—"}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                                            {h.cost ? `${Number(h.cost).toLocaleString('vi-VN')} đ` : "0 đ"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${h.status === 'COMPLETED' ? 'text-emerald-600' : h.status === 'CANCELLED' ? 'text-slate-400' : 'text-amber-600'}`}>
                                                {h.status === 'COMPLETED' ? 'Đã hoàn thành' : h.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ thực hiện'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal báo hỏng */}
            {showReportModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold">Báo hỏng thiết bị</h3>
                        </div>
                        <p className="text-sm text-slate-500">Vui lòng mô tả chi tiết tình trạng hỏng hóc hoặc lỗi gặp phải của thiết bị này.</p>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600">Mô tả tình trạng hỏng <span className="text-red-500">*</span></label>
                            <textarea
                                required
                                value={brokenDescription}
                                onChange={(e) => setBrokenDescription(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 h-28 resize-none"
                                placeholder="Nhập mô tả lỗi (VD: Máy kêu to, lệch băng tải, lỗi màn hình cảm ứng...)"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => {
                                    setShowReportModal(false);
                                    setBrokenDescription("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleReportBroken}
                                disabled={submittingBroken || !brokenDescription.trim()}
                                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-red-500/20 disabled:opacity-50"
                            >
                                {submittingBroken ? "Đang gửi..." : "Gửi báo cáo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
