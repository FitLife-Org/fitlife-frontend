import { useState } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Card from "../../../components/common/Card";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatCurrency } from "../../../utils/formatCurrency";
import type { GymPackage } from "../../../types/package.type";
import { useGymPackageTab } from "../../../hooks/useGymPackageTab";
import { GymPackageFormModal } from "./GymPackageFormModal";

export default function GymPackageTab() {
  const {
    packages,
    loading,
    deleteId,
    setDeleteId,
    handleDelete,
    handleToggleStatus,
    fetchPackages
  } = useGymPackageTab();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<GymPackage | null>(null);

  const handleOpenAddModal = () => {
    setSelectedPackage(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (pkg: GymPackage) => {
    setSelectedPackage(pkg);
    setModalOpen(true);
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
          <button 
            onClick={() => handleToggleStatus(row)} 
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${row.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`} 
            title={row.status === 'ACTIVE' ? 'Khóa gói tập' : 'Kích hoạt gói tập'}
          >
            {row.status === 'ACTIVE' ? (
              <><XCircle className="w-4 h-4" /> Khóa</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Active</>
            )}
          </button>
          <button onClick={() => handleOpenEditModal(row)} className="p-2 text-fit-blue hover:bg-fit-blueSoft rounded-lg transition-colors" title="Chỉnh sửa">
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-fit-primary/10 to-blue-600/10 rounded-2xl border border-fit-primary/20 shadow-sm backdrop-blur-sm">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fit-primary to-blue-600">Danh sách Gói tập Gym</h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">Quản lý dịch vụ, giá tiền và quyền lợi của các gói tập (VIP, BASIC...)</p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-gradient-to-r from-fit-primary to-blue-600 hover:from-blue-600 hover:to-indigo-600 border-0 shadow-lg shadow-fit-primary/30 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap">
          <Plus className="w-5 h-5 mr-2" />
          Tạo gói mới
        </Button>
      </div>

      <Card className="overflow-hidden border-0 ring-1 ring-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/80 backdrop-blur-xl">
        {loading ? <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-fit-primary border-t-transparent rounded-full animate-spin"></div>Đang tải dữ liệu...</div> : <Table columns={columns} data={packages} />}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa gói tập"
        message="Bạn có chắc chắn muốn xóa gói tập này không? Nếu đã có người đăng ký, gói này chỉ bị khóa lại chứ không bị xóa."
        confirmText="Xóa"
      />

      <GymPackageFormModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchPackages} 
        pkg={selectedPackage} 
      />
    </div>
  );
}
