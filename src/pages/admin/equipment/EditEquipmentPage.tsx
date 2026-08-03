import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { EquipmentService } from "../../../services/equipmentService";
import { uploadService } from "../../../services/uploadService";
import { validateAdminEquipmentForm } from "../../../utils/validators/adminEquipmentValidator";
import type { AdminEquipmentUpdateRequest } from "../../../types/equipment.type";
import { showAlert } from "../../../utils/alert";

export default function EditEquipmentPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState<AdminEquipmentUpdateRequest>({
        name: "",
        category: "Cardio",
        area: "Khu Cardio – Tầng 1",
        status: "ACTIVE",
        purchaseDate: "",
        warrantyExpiry: "",
        description: "",
        image: ""
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [areas, setAreas] = useState<any[]>([]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const res = await EquipmentService.getAreas();
                setAreas(res);
            } catch (error) {
                console.error("Lỗi khi tải danh sách khu vực:", error);
            }
        };
        fetchAreas();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showAlert.error("Lỗi", "Vui lòng chọn file hình ảnh hợp lệ.");
            return;
        }

        setUploadingImage(true);
        try {
            const res = await uploadService.upload(file);
            setFormData(prev => ({ ...prev, image: res.url }));
            showAlert.success("Thành công", "Tải ảnh lên thành công");
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error);
            showAlert.error("Lỗi", "Không thể tải ảnh lên máy chủ");
        } finally {
            setUploadingImage(false);
        }
    };

    const fetchEquipmentDetails = useCallback(async () => {
        if (!id) return;
        try {
            const data = await EquipmentService.getById(id);
            setFormData({
                name: data.name || "",
                category: data.category || "Cardio",
                area: data.area || "Khu Cardio – Tầng 1",
                status: data.status || "ACTIVE",
                purchaseDate: data.purchaseDate || "",
                warrantyExpiry: data.warrantyExpiry || "",
                description: data.description || "",
                image: data.image || ""
            });
        } catch (error) {
            console.error("Lỗi tải thông tin:", error);
            showAlert.error("Lỗi", "Không thể tải thông tin thiết bị");
            navigate("/admin/equipment");
        } finally {
            setFetching(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchEquipmentDetails();
    }, [fetchEquipmentDetails]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateAdminEquipmentForm(formData, false)) {
            return;
        }

        setLoading(true);
        try {
            await EquipmentService.update(id as string, formData);
            showAlert.success("Thành công", "Đã cập nhật thiết bị");
            navigate("/admin/equipment");
        } catch (error: unknown) {
            console.error("Lỗi khi cập nhật:", error);
            const msg = error && typeof error === 'object' && 'response' in error 
              ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
              : null;
            showAlert.error("Lỗi", msg || "Không thể cập nhật thiết bị");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center text-slate-500">Đang tải thông tin thiết bị...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa thiết bị</h1>
                    <p className="text-sm text-slate-500 mt-1">Mã thiết bị: {id}</p>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Tên thiết bị <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                                placeholder="VD: Máy chạy bộ TechnoGym"
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
                                {areas.map((a) => (
                                    <option key={a.id} value={a.name}>
                                        {a.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Ngày mua</label>
                            <input
                                type="date"
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Hạn bảo hành</label>
                            <input
                                type="date"
                                value={formData.warrantyExpiry}
                                onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="MAINTENANCE">Đang bảo trì</option>
                                <option value="INACTIVE">Ngừng hoạt động</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Ghi chú / Mô tả</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary h-24 resize-none"
                            placeholder="Ghi chú về thiết bị..."
                        />
                    </div>

                     <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Hình ảnh thiết bị</label>
                        <div className="flex gap-4 border-b border-slate-100 pb-2">
                            <button
                                type="button"
                                onClick={() => setImageMode("upload")}
                                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${imageMode === "upload" ? "border-fit-primary text-fit-primary" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                            >
                                Tải ảnh lên (File)
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageMode("url")}
                                className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${imageMode === "url" ? "border-fit-primary text-fit-primary" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                            >
                                Nhập đường dẫn (URL)
                            </button>
                        </div>

                        {imageMode === "url" ? (
                            <div className="space-y-1.5">
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 hover:border-fit-primary rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 text-slate-400 mb-2 group-hover:text-fit-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <p className="text-xs text-slate-500"><span className="font-semibold text-fit-primary">Nhấp để tải lên</span> hoặc kéo thả</p>
                                            <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG (Tối đa 5MB)</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleImageUpload} 
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                </div>
                                {uploadingImage && <p className="text-xs text-slate-500">Đang tải ảnh lên...</p>}
                            </div>
                        )}

                        {formData.image && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 mt-2">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, image: "" })}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                        <Button type="button" variant="danger" onClick={() => navigate(-1)} className="px-6 py-2.5 shadow-md shadow-red-500/10">
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading} className="px-6 py-2.5 bg-fit-primary hover:bg-fit-primaryHover text-white rounded-lg font-medium text-sm shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" />
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}