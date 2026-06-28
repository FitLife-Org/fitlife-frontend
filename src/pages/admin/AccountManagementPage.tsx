import { useState, useEffect } from "react";
import { 
  Search, Plus, Eye, Edit2, ShieldAlert, Lock, Unlock, 
  User as UserIcon, Mail, Phone, Shield, Users, UserCheck, UserX, Clock, Key
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";
import { userService } from "../../services/userService";
import { showAlert } from "../../utils/alert";
import type { User } from "../../types/user.type";
import type { Role, Status } from "../../types/common.type";

export default function AccountManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [isEditMode, setIsEditMode] = useState(false);
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    roleCode: "ROLE_STAFF",
    status: "ACTIVE"
  });
  const [formLoading, setFormLoading] = useState(false);
  
  // Role assignment state
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      if (searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }
      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (roleFilter !== "ALL") {
        params.roleCode = roleFilter;
      }

      const result = await userService.getUsers(params);
      setUsers(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showAlert.error("Lỗi", "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, roleFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  // Open Detail Modal
  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setFormValues({
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      roleCode: "ROLE_STAFF",
      status: "ACTIVE"
    });
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormValues({
      username: user.username,
      email: user.email,
      password: "", // Not used in edit mode
      fullName: user.fullName,
      phone: user.phone || "",
      roleCode: user.role,
      status: user.status
    });
    setFormModalOpen(true);
  };

  // Open Role Edit Modal
  const handleOpenRoleEdit = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles([user.role]);
    setRoleModalOpen(true);
  };

  // Submit User form (Create / Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.username || !formValues.email || !formValues.fullName || !formValues.phone) {
      showAlert.error("Lỗi nhập liệu", "Vui lòng điền đầy đủ các trường thông tin bắt buộc!");
      return;
    }
    if (!isEditMode && !formValues.password) {
      showAlert.error("Lỗi nhập liệu", "Vui lòng nhập mật khẩu cho tài khoản mới!");
      return;
    }

    try {
      setFormLoading(true);
      if (isEditMode && selectedUser) {
        // Prepare update data (excludes password & role)
        const updateData = {
          username: formValues.username,
          email: formValues.email,
          fullName: formValues.fullName,
          phone: formValues.phone,
          status: formValues.status
        };
        await userService.updateUser(selectedUser.id, updateData);
        showAlert.success("Thành công", `Đã cập nhật thông tin tài khoản ${formValues.fullName}.`);
      } else {
        // Create internal user
        await userService.createUser(formValues);
        showAlert.success("Thành công", `Đã tạo tài khoản nội bộ cho ${formValues.fullName}.`);
      }
      setFormModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to submit form:", error);
      const errorMsg = error?.response?.data?.message || "Có lỗi xảy ra trong quá trình lưu dữ liệu.";
      showAlert.error("Thao tác thất bại", errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  // Quick Lock/Unlock Status
  const handleToggleStatus = async (user: User) => {
    const isCurrentlyLocked = user.status === "LOCKED";
    const newStatus = isCurrentlyLocked ? "ACTIVE" : "LOCKED";
    const actionText = isCurrentlyLocked ? "Mở khóa" : "Khóa";

    const result = await showAlert.confirm(
      `${actionText} tài khoản?`,
      `Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản của ${user.fullName}?`
    );

    if (result.isConfirmed) {
      try {
        await userService.updateUserStatus(user.id, newStatus);
        
        // Update local state directly to be fast
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus as Status } : u));
        showAlert.success("Thành công", `Đã ${actionText.toLowerCase()} tài khoản.`);
      } catch (error: any) {
        console.error("Failed to update status:", error);
        showAlert.error("Thất bại", "Không thể cập nhật trạng thái tài khoản.");
      }
    }
  };

  // Submit Role Assignment
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || selectedRoles.length === 0) return;

    try {
      setRoleLoading(true);
      await userService.updateUserRoles(selectedUser.id, selectedRoles);
      showAlert.success("Thành công", "Đã cập nhật vai trò của người dùng.");
      setRoleModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to update roles:", error);
      showAlert.error("Thất bại", "Không thể cập nhật vai trò tài khoản.");
    } finally {
      setRoleLoading(false);
    }
  };

  // Render Role badge
  const renderRoleBadge = (role: Role) => {
    switch (role) {
      case "ROLE_ADMIN":
        return <Badge variant="danger">Quản trị viên</Badge>;
      case "ROLE_STAFF":
        return <Badge variant="success">Nhân viên</Badge>;
      case "ROLE_PT":
        return <Badge variant="warning">Huấn luyện viên</Badge>;
      case "ROLE_MEMBER":
        return <Badge variant="default">Hội viên</Badge>;
      default:
        return <Badge variant="default">{role}</Badge>;
    }
  };

  // Render Status badge
  const renderStatusBadge = (status: Status) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Hoạt động</Badge>;
      case "INACTIVE":
        return <Badge variant="default">Không HĐ</Badge>;
      case "LOCKED":
        return <Badge variant="danger">Bị khóa</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách người dùng hệ thống, phân quyền vai trò và trạng thái tài khoản</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-fit-primary hover:bg-fit-primaryHover text-white shadow-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Thêm tài khoản nội bộ
        </Button>
      </div>

      {/* Main Filter & Table Card */}
      <Card className="shadow-sm border-slate-100 overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 bg-slate-50/30">
          <form onSubmit={handleSearchSubmit} className="w-full lg:w-96 relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
              <input 
                type="text" 
                placeholder="Tìm theo username, tên, SĐT, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary transition-all shadow-inner"
              />
            </div>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl py-2 px-4 text-sm font-semibold">
              Tìm kiếm
            </Button>
          </form>
          
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex flex-col gap-1 min-w-[140px] flex-1 lg:flex-none">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide pl-1">Lọc vai trò</label>
              <select 
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/10 shadow-sm font-medium w-full"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ROLE_ADMIN">Quản trị viên</option>
                <option value="ROLE_STAFF">Nhân viên</option>
                <option value="ROLE_PT">Huấn luyện viên</option>
                <option value="ROLE_MEMBER">Hội viên</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[140px] flex-1 lg:flex-none">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide pl-1">Lọc Trạng thái</label>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm text-slate-700 focus:outline-none focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/10 shadow-sm font-medium w-full"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="LOCKED">Bị khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table representation */}
        {loading ? (
          <Loading label="Đang tải danh sách tài khoản..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/80 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Tài khoản / Tên</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy tài khoản nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">
                            <span>{user.fullName.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">{user.fullName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Username: {user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px]">
                        <div className="flex flex-col gap-0.5 text-slate-700 font-medium">
                          <span>{user.phone || "—"}</span>
                          <span className="text-xs text-slate-400 font-normal">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {renderRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenDetail(user)}
                            className="p-1.5 text-slate-400 hover:text-fit-primary hover:bg-fit-primarySoft rounded-lg transition-all" 
                            title="Xem chi tiết tài khoản"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-fit-admin hover:bg-fit-adminSoft rounded-lg transition-all" 
                            title="Chỉnh sửa tài khoản"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleOpenRoleEdit(user)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" 
                            title="Gán vai trò"
                          >
                            <Shield className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition-all ${
                              user.status === "LOCKED" 
                                ? "text-emerald-500 hover:bg-emerald-50" 
                                : "text-rose-500 hover:bg-rose-50"
                            }`} 
                            title={user.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {user.status === "LOCKED" ? <Unlock className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium">
              Hiển thị {users.length} trên {totalItems} tài khoản
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs"
              >
                Trước
              </Button>
              <span className="text-xs font-bold text-slate-700 px-2">Trang {currentPage} / {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Details Modal (USER-02) */}
      <Modal 
        title="Chi tiết tài khoản"
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-14 h-14 rounded-full bg-fit-primarySoft flex items-center justify-center text-fit-primary font-bold text-lg">
                {selectedUser.fullName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedUser.fullName}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Username: {selectedUser.username}</p>
                <div className="mt-1.5 flex gap-1.5">
                  {renderRoleBadge(selectedUser.role)}
                  {renderStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">ID Tài khoản</span>
                <span className="text-sm font-semibold text-slate-800 mt-1">#{selectedUser.id}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Số điện thoại</span>
                <span className="text-sm font-semibold text-slate-800 mt-1">{selectedUser.phone || "—"}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 flex flex-col col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Địa chỉ Email</span>
                <span className="text-sm font-semibold text-slate-800 mt-1 truncate">{selectedUser.email}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Form Modal (USER-03, USER-04) */}
      <Modal 
        title={isEditMode ? "Chỉnh sửa Tài khoản" : "Tạo Tài khoản Nội bộ"}
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input 
                label="Họ và tên *" 
                name="fullName"
                value={formValues.fullName} 
                onChange={(e) => setFormValues(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            
            <div>
              <Input 
                label="Username *" 
                name="username"
                value={formValues.username} 
                onChange={(e) => setFormValues(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nhập tên đăng nhập"
                required
                disabled={isEditMode} // Usually username is immutable
              />
            </div>

            <div>
              <Input 
                label="Số điện thoại *" 
                name="phone"
                value={formValues.phone} 
                onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ví dụ: 0987654321"
                required
              />
            </div>

            <div className="col-span-2">
              <Input 
                label="Email *" 
                name="email"
                type="email"
                value={formValues.email} 
                onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
                placeholder="example@fitlife.local"
                required
              />
            </div>

            {!isEditMode && (
              <div className="col-span-2">
                <Input 
                  label="Mật khẩu khởi tạo *" 
                  name="password"
                  type="password"
                  value={formValues.password} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                />
              </div>
            )}

            {!isEditMode && (
              <div>
                <label className="block text-sm font-semibold text-slate-700">Vai trò chính</label>
                <select 
                  value={formValues.roleCode}
                  onChange={(e) => setFormValues(prev => ({ ...prev, roleCode: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
                >
                  <option value="ROLE_STAFF">Nhân viên (Staff)</option>
                  <option value="ROLE_PT">Huấn luyện viên (PT)</option>
                  <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700">Trạng thái</label>
              <select 
                value={formValues.status}
                onChange={(e) => setFormValues(prev => ({ ...prev, status: e.target.value }))}
                className="mt-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Không hoạt động</option>
                <option value="LOCKED">Bị khóa</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={formLoading} className="bg-fit-primary hover:bg-fit-primaryHover text-white">
              {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Assignment Modal (USER-06) */}
      <Modal 
        title="Gán vai trò cho tài khoản"
        open={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          {selectedUser && (
            <div>
              <p className="text-sm text-slate-600 mb-3">
                Thay đổi phân quyền cho tài khoản <strong className="text-slate-900">{selectedUser.fullName}</strong> ({selectedUser.username}).
              </p>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Chọn vai trò mới</label>
                <select 
                  value={selectedRoles[0] || ""}
                  onChange={(e) => setSelectedRoles([e.target.value])}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
                >
                  <option value="ROLE_MEMBER">Hội viên (Member)</option>
                  <option value="ROLE_STAFF">Nhân viên (Staff)</option>
                  <option value="ROLE_PT">Huấn luyện viên (PT)</option>
                  <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button type="button" variant="outline" onClick={() => setRoleModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={roleLoading} className="bg-fit-primary hover:bg-fit-primaryHover text-white">
              Cập nhật vai trò
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
