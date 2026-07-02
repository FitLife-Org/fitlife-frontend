import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatCurrency } from "../../utils/formatCurrency";
import { showAlert } from "../../utils/alert";
import { packageService } from "../../services/packageService";
import type { GymPackage } from "../../types/package.type";
import { validateAdminPackageForm } from "../../utils/validators/adminPackageValidator";

export default function PackageManagementPage() {
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<GymPackage | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    packageType: "BASIC",
    basePrice: "",
    ptSessionsPerMonth: "0",
    hasAiWorkoutPlan: false,
    hasNutritionPlan: false,
    description: "",
    benefits: "",
    thumbnailUrl: ""
  });

  // Delete states
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAdminPackages();
      setPackages(data);
    } catch (_error) {
      // Ignore initial dummy error if no api
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg?: GymPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        code: pkg.code,
        name: pkg.name,
        packageType: pkg.packageType || "BASIC",
        basePrice: pkg.basePrice.toString(),
        ptSessionsPerMonth: pkg.ptSessionsPerMonth.toString(),
        hasAiWorkoutPlan: pkg.hasAiWorkoutPlan || false,
        hasNutritionPlan: pkg.hasNutritionPlan || false,
        description: pkg.description || "",
        benefits: pkg.benefits || "",
        thumbnailUrl: pkg.thumbnailUrl || ""
      });
    } else {
      setEditingPackage(null);
      setFormData({ 
        code: "", 
        name: "", 
        packageType: "BASIC", 
        basePrice: "", 
        ptSessionsPerMonth: "0",
        hasAiWorkoutPlan: false,
        hasNutritionPlan: false,
        description: "",
        benefits: "",
        thumbnailUrl: "" 
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        packageType: formData.packageType,
        basePrice: Number(formData.basePrice),
        ptSessionsPerMonth: Number(formData.ptSessionsPerMonth),
        hasAiWorkoutPlan: formData.hasAiWorkoutPlan,
        hasNutritionPlan: formData.hasNutritionPlan,
        description: formData.description,
        benefits: formData.benefits,
        thumbnailUrl: formData.thumbnailUrl,
        status: "ACTIVE"
      };

      if (!validateAdminPackageForm(payload, !editingPackage)) {
        return;
      }

      if (editingPackage) {
        // Exclude code for update request
        const { code, ...updatePayload } = payload;
        await packageService.updatePackage(editingPackage.id, updatePayload as any);
        showAlert.success("Thành công", "Đã cập nhật gói tập");
      } else {
        await packageService.createPackage(payload as any);
        showAlert.success("Thành công", "Đã tạo gói tập mới");
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (_error) {
      showAlert.error("Lỗi", "Không thể lưu thông tin gói tập");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await packageService.deletePackage(deleteId);
      showAlert.success("Thành công", "Đã xóa gói tập");
      fetchPackages();
    } catch (_error) {
      showAlert.error("Lỗi", "Không thể xóa gói tập");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (pkg: GymPackage) => {
    try {
      const newStatus = pkg.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await packageService.updatePackageStatus(pkg.id, newStatus);
      showAlert.success("Thành công", `Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa'} gói tập`);
      fetchPackages();
    } catch (_error) {
      showAlert.error("Lỗi", "Không thể thay đổi trạng thái");
    }
  };

  const columns = [
    {
      key: "code",
      header: "Mã / Ảnh",
      render: (row: GymPackage) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl ? (
            <img src={row.thumbnailUrl} alt={row.name} className="w-12 h-12 rounded object-cover" />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
          )}
          <span className="font-mono text-sm">{row.code || "-"}</span>
        </div>
      ),
    },
    {
      key: "name",
      header: "Gói tập",
      render: (row: GymPackage) => (
        <div>
          <p className="font-bold">{row.name}</p>
          <Badge variant={row.packageType === "VIP" ? "purple" : "default"}>{row.packageType || "BASIC"}</Badge>
        </div>
      ),
    },
    {
      key: "price",
      header: "Giá cơ bản & Quyền lợi",
      render: (row: GymPackage) => (
        <div>
          <p className="font-bold text-fit-primary">{formatCurrency(row.basePrice)}</p>
          <div className="flex flex-wrap gap-1 mt-1">
             {row.hasAiWorkoutPlan && <Badge variant="purple"><span className="text-[10px]">AI Plan</span></Badge>}
             {row.hasNutritionPlan && <Badge variant="success"><span className="text-[10px]">Nutrition</span></Badge>}
             {row.ptSessionsPerMonth > 0 && <Badge variant="warning"><span className="text-[10px]">{row.ptSessionsPerMonth} PT/tháng</span></Badge>}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Mô tả",
      render: (row: GymPackage) => (
        <p className="text-sm text-fit-muted max-w-[200px] truncate" title={row.description}>{row.description || "Không có mô tả"}</p>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: GymPackage) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "danger"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: GymPackage) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleToggleStatus(row)} className={`p-2 rounded-lg transition-colors ${row.status === 'ACTIVE' ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`} title={row.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}>
            {row.status === 'ACTIVE' ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </button>
          <button onClick={() => handleOpenModal(row)} className="p-2 text-fit-blue hover:bg-fit-blueSoft rounded-lg transition-colors" title="Chỉnh sửa">
            <Edit className="w-5 h-5" />
          </button>
          <button onClick={() => setDeleteId(row.id)} className="p-2 text-fit-danger hover:bg-fit-dangerSoft rounded-lg transition-colors" title="Xóa">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Quản lý gói tập" description="Cấu hình thông tin, giá cả và thời hạn các gói tập" />
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-5 h-5 mr-2" />
          Tạo gói mới
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div> : <Table columns={columns} data={packages} />}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPackage ? "Cập nhật gói tập" : "Tạo gói tập mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingPackage && (
            <Input
              label="Mã gói tập"
              placeholder="VD: PKG-01"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          )}
          <Input
            label="Tên gói tập"
            placeholder="VD: Premium 30 Days"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
             <label className="mb-1 block text-sm font-semibold text-fit-text">Loại gói tập</label>
             <select
                className="w-full rounded-xl border border-fit-border bg-white px-4 py-2 text-sm text-fit-text transition focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary"
                value={formData.packageType}
                onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
             >
                <option value="BASIC">BASIC (Cơ bản)</option>
                <option value="VIP">VIP (Cao cấp)</option>
                <option value="PERSONAL">PERSONAL (Gói PT)</option>
             </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá cơ bản (VNĐ)"
              type="number"
              min="0"
              placeholder="VD: 1200000"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            />
            <Input
              label="Số buổi PT / tháng"
              type="number"
              min="0"
              placeholder="VD: 4"
              required
              value={formData.ptSessionsPerMonth}
              onChange={(e) => setFormData({ ...formData, ptSessionsPerMonth: e.target.value })}
            />
          </div>
          <div className="flex gap-6 mt-2 mb-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-fit-text cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-fit-border text-fit-primary focus:ring-fit-primary"
                checked={formData.hasAiWorkoutPlan}
                onChange={(e) => setFormData({ ...formData, hasAiWorkoutPlan: e.target.checked })}
              />
              Tích hợp AI tạo Lịch tập
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-fit-text cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-fit-border text-fit-primary focus:ring-fit-primary"
                checked={formData.hasNutritionPlan}
                onChange={(e) => setFormData({ ...formData, hasNutritionPlan: e.target.checked })}
              />
              Tích hợp Gợi ý Dinh dưỡng
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-fit-text">Mô tả gói tập</label>
            <textarea
              className="w-full rounded-xl border border-fit-border bg-white px-4 py-2 text-sm text-fit-text transition focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary"
              rows={3}
              placeholder="VD: Không giới hạn số lần sử dụng..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-fit-text">Quyền lợi</label>
            <textarea
              className="w-full rounded-xl border border-fit-border bg-white px-4 py-2 text-sm text-fit-text transition focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary"
              rows={2}
              placeholder="VD: Truy cập 24/7, 1 buổi PT miễn phí..."
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">
              {editingPackage ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa gói tập"
        message="Bạn có chắc chắn muốn xóa gói tập này không? Nếu đã có người đăng ký, gói này chỉ bị khóa lại chứ không bị xóa."
        confirmText="Xóa"

      />
    </>
  );
}
