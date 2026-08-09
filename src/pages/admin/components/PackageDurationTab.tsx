import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Card from "../../../components/common/Card";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatCurrency } from "../../../utils/formatCurrency";
import type { PackageDuration } from "../../../types/package.type";
import { usePackageDurationTab } from "../../../hooks/usePackageDurationTab";

export default function PackageDurationTab() {
  const {
    durations,
    packages,
    loading,
    isModalOpen,
    setIsModalOpen,
    editingDuration,
    formData,
    setFormData,
    deleteId,
    setDeleteId,
    handleOpenModal,
    handleSubmit,
    handleDelete,
    handleToggleStatus
  } = usePackageDurationTab();

  const columns = [
    {
      key: "code",
      header: "Mã thời hạn",
      render: (row: PackageDuration) => (
        <span className="font-mono font-medium text-fit-primary">{row.code}</span>
      ),
    },
    {
      key: "name",
      header: "Tên thời hạn",
      render: (row: PackageDuration) => (
        <div>
          <p className="font-bold text-slate-800">{row.name}</p>
          <span className="text-xs text-slate-500 font-medium">{row.gymPackageName || "Chưa gán gói"}</span>
        </div>
      ),
    },
    {
      key: "months",
      header: "Số tháng",
      render: (row: PackageDuration) => (
        <Badge variant="purple">{row.months} Tháng</Badge>
      ),
    },
    {
      key: "price",
      header: "Giá & Khuyến mãi",
      render: (row: PackageDuration) => (
        <div>
          <p className="font-bold text-slate-900">{formatCurrency(row.price || 0)}</p>
          {row.discountPercent && row.discountPercent > 0 ? (
            <p className="text-xs text-fit-primary font-semibold">Khuyến mãi: {formatCurrency(row.discountPrice || 0)} (-{row.discountPercent}%)</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: PackageDuration) => (
        <Badge variant={row.status === "ACTIVE" ? "success" : "danger"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: PackageDuration) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleToggleStatus(row)} 
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${row.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`} 
            title={row.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}
          >
            {row.status === 'ACTIVE' ? (
              <><XCircle className="w-4 h-4" /> Khóa</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Active</>
            )}
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 shadow-sm backdrop-blur-sm">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Thời hạn Gói tập</h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">Quản lý các mốc thời gian và cấu hình chiết khấu cho hội viên</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border-0 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap">
          <Plus className="w-5 h-5 mr-2" />
          Tạo thời hạn mới
        </Button>
      </div>

      <Card className="overflow-hidden border-0 ring-1 ring-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/80 backdrop-blur-xl">
        {loading ? <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center gap-3"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>Đang tải dữ liệu...</div> : <Table columns={columns} data={durations} />}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDuration ? "Cập nhật thời hạn" : "Tạo thời hạn mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingDuration && (
              <Input
                label="Mã thời hạn"
                placeholder="VD: DUR_01"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            )}
            <div className={!editingDuration ? "md:col-span-1" : "md:col-span-2"}>
               <label className="mb-1 block text-sm font-semibold text-fit-text">Gói tập áp dụng</label>
               <select
                  disabled={!!editingDuration}
                  className="w-full rounded-xl border border-fit-border bg-white px-4 py-2 text-sm text-fit-text transition focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary disabled:bg-slate-100"
                  value={formData.gymPackageId}
                  onChange={(e) => setFormData({ ...formData, gymPackageId: e.target.value })}
               >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.packageType})
                    </option>
                  ))}
               </select>
            </div>
            <div className="md:col-span-2">
              <Input
                label="Tên thời hạn"
                placeholder="VD: Gói 1 Tháng"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Số tháng"
              type="number"
              min="1"
              max="60"
              placeholder="VD: 1"
              required
              value={formData.months}
              onChange={(e) => setFormData({ ...formData, months: e.target.value })}
            />
            <Input
              label="% Giảm giá"
              type="number"
              min="0"
              max="100"
              placeholder="VD: 0"
              required
              value={formData.discountPercent}
              onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá trị gốc (VNĐ)"
              type="number"
              min="0"
              placeholder="VD: 500000"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            <Input
              label="Giá khuyến mãi (VNĐ)"
              type="number"
              min="0"
              placeholder="VD: 450000 (Mặc định bằng giá gốc)"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit">
              {editingDuration ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa thời hạn"
        message="Bạn có chắc chắn muốn xóa cấu hình thời hạn này không?"
        confirmText="Xóa"
      />
    </div>
  );
}
