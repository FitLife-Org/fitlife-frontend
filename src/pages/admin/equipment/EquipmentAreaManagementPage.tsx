import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, ArrowLeft, Search, MapPin } from "lucide-react";
import { toast } from "react-hot-toast";

import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Loading from "../../../components/common/Loading";
import { EquipmentService } from "../../../services/equipmentService";
import type { EquipmentAreaResponse, EquipmentAreaRequest } from "../../../types/equipment.type";

export default function EquipmentAreaManagementPage() {
  const [areas, setAreas] = useState<EquipmentAreaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showFormView, setShowFormView] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState<EquipmentAreaResponse | null>(null);
  
  const [formValues, setFormValues] = useState<EquipmentAreaRequest>({
    name: "",
    description: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const data = await EquipmentService.getAreas();
      setAreas(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách khu vực:", error);
      toast.error("Không thể tải danh sách khu vực");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAreas();
  }, []);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedArea(null);
    setFormValues({ name: "", description: "" });
    setShowFormView(true);
  };

  const handleOpenEdit = (area: EquipmentAreaResponse) => {
    setIsEditMode(true);
    setSelectedArea(area);
    setFormValues({
      name: area.name,
      description: area.description || "",
    });
    setShowFormView(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.name.trim()) {
      toast.error("Tên khu vực không được để trống");
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedArea) {
        await EquipmentService.updateEquipmentAreaInfo(selectedArea.id, formValues);
        toast.success("Cập nhật thông tin khu vực thành công");
      } else {
        await EquipmentService.createEquipmentArea(formValues);
        toast.success("Tạo khu vực mới thành công");
      }
      setShowFormView(false);
      void fetchAreas();
    } catch (error: any) {
      console.error("Lỗi khi lưu khu vực:", error);
      const msg = error?.response?.data?.message || "Không thể lưu khu vực";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredAreas = areas.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !showFormView) {
    return <Loading />;
  }

  if (showFormView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" onClick={() => setShowFormView(false)}>
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Chỉnh sửa Khu vực" : "Thêm Khu vực mới"}
            </h1>
          </div>
        </div>

        <Card className="p-5 max-w-3xl">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Tên khu vực *"
                value={formValues.name}
                onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                placeholder="VD: Khu vực Tạ tự do, Khu Cardio..."
                required
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Mô tả chi tiết</label>
                <textarea
                  value={formValues.description || ""}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  placeholder="Nhập mô tả về khu vực này..."
                  className="w-full min-h-[120px] rounded-xl border border-slate-200 p-3 text-sm focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setShowFormView(false)}>
                Hủy
              </Button>
              <Button type="submit" isLoading={formLoading}>
                {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin/equipment"
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-fit-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại Quản lý Thiết bị
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Khu vực Thiết bị</h1>
          <p className="mt-1 text-sm text-slate-500">
            Thêm và quản lý các khu vực đặt máy tập trong phòng gym.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo khu vực mới
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b p-5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên khu vực..."
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary"
            />
          </div>
        </div>

        <div className="p-5">
          {filteredAreas.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              Không tìm thấy khu vực nào phù hợp
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAreas.map((area) => (
                <div
                  key={area.id}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-fit-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fit-primarySoft text-fit-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 line-clamp-1" title={area.name}>
                          {area.name}
                        </h3>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenEdit(area)}
                      className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-fit-primary group-hover:opacity-100"
                      title="Sửa khu vực"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {area.description && (
                    <p className="mt-4 text-sm text-slate-600 line-clamp-2" title={area.description}>
                      {area.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
