import { 
  Search, Plus, Eye, Edit2, Lock, Unlock, 
  Users, UserCheck, UserX, Clock, Calendar
} from "lucide-react";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";
import { useUserManagement } from "../../hooks/useUserManagement";
import type { MemberProfile } from "../../types/member.type";
import type { Status } from "../../types/common.type";

export default function UserManagementPage() {
  const {
    members,
    loading,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
    detailModalOpen,
    setDetailModalOpen,
    showFormView,
    setShowFormView,
    selectedMember,
    detailTab,
    setDetailTab,
    memberSubscriptions,
    memberCheckins,
    detailLoading,
    isEditMode,
    formValues,
    setFormValues,
    formLoading,
    handleOpenDetail,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleToggleStatus,
  } = useUserManagement();

  const renderStatusBadge = (status: MemberProfile["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success">Hoạt động</Badge>;
      case "PENDING":
        return <Badge variant="warning">Chờ xử lý</Badge>;
      case "LOCKED":
        return <Badge variant="danger">Bị khóa</Badge>;
      case "INACTIVE":
        return <Badge variant="default">Ngưng HĐ</Badge>;
      case "EXPIRED":
        return <Badge variant="purple">Hết hạn</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const totalCount = members.length;
  const activeCount = members.filter(m => m.status === "ACTIVE").length;
  const lockedCount = members.filter(m => m.status === "LOCKED").length;
  const pendingCount = members.filter(m => m.status === "PENDING").length;

  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      (m.memberCode && m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (showFormView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" onClick={() => setShowFormView(false)}>
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Chỉnh sửa Thông tin Hội viên" : "Thêm Hội viên Mới"}
            </h1>
          </div>
        </div>

        <Card className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {!isEditMode && (
                <>
                  <div className="col-span-1">
                    <Input 
                      label="Tên đăng nhập *" 
                      name="username"
                      value={(formValues as Record<string, unknown>).username as string || ""} 
                      onChange={(e) => setFormValues(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Tên đăng nhập (từ 4 ký tự)"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <Input 
                      label="Mật khẩu *" 
                      name="password"
                      type="password"
                      value={(formValues as Record<string, unknown>).password as string || ""} 
                      onChange={(e) => setFormValues(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Mật khẩu (từ 6 ký tự)"
                      required
                    />
                  </div>
                </>
              )}
              <div className="col-span-2">
                <Input 
                  label="Họ và tên *" 
                  name="fullName"
                  value={formValues.fullName} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nhập họ và tên hội viên"
                  required
                />
              </div>
              
              <div>
                <Input 
                  label="Số điện thoại *" 
                  name="phone"
                  value={formValues.phone} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div>
                <Input 
                  label="Email *" 
                  name="email"
                  type="email"
                  value={formValues.email} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="example@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Giới tính</label>
                <select 
                  value={formValues.gender}
                  onChange={(e) => setFormValues(prev => ({ ...prev, gender: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <Input 
                  label="Ngày sinh" 
                  name="dateOfBirth"
                  type="date"
                  value={formValues.dateOfBirth} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div className="col-span-2">
                <Input 
                  label="Địa chỉ" 
                  name="address"
                  value={formValues.address} 
                  onChange={(e) => setFormValues(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Nhập địa chỉ của hội viên"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Mục tiêu tập luyện</label>
                <select 
                  value={formValues.fitnessGoal || ""}
                  onChange={(e) => setFormValues(prev => ({ ...prev, fitnessGoal: e.target.value }))}
                  className="mt-2 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/10 focus:border-fit-primary font-medium"
                >
                  <option value="">-- Chọn mục tiêu --</option>
                  <option value="LOSE_WEIGHT">Giảm cân/giảm mỡ</option>
                  <option value="GAIN_MUSCLE">Tăng cơ</option>
                  <option value="MAINTAIN_FITNESS">Duy trì vóc dáng</option>
                  <option value="IMPROVE_HEALTH">Cải thiện sức khỏe</option>
                  <option value="BODY_RECOMPOSITION">Tái tạo hình thể (giảm mỡ, tăng cơ)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700">Trạng thái hoạt động</label>
                <select
                    value={formValues.status}
                    onChange={(event) => {
                      setFormValues((previous) => ({
                        ...previous,

                        status:
                            event.target.value as Status,
                      }));
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
                >
                  <option value="ACTIVE">
                    Hoạt động
                  </option>

                  <option value="PENDING">
                    Chờ xử lý
                  </option>

                  <option value="INACTIVE">
                    Ngưng hoạt động
                  </option>

                  <option value="LOCKED">
                    Bị khóa
                  </option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowFormView(false)}>
                Hủy
              </Button>
              <Button type="submit" isLoading={formLoading} className="bg-fit-primary hover:bg-fit-primaryHover text-white px-6">
                {isEditMode ? "Lưu thay đổi" : "Lưu Hội viên"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý hội viên</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách tài khoản hội viên, trạng thái hoạt động, lịch sử dịch vụ phòng tập</p>
        </div>
        <Button 
          onClick={handleOpenCreate}
          className="bg-fit-primary hover:bg-fit-primaryHover text-white shadow-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
        >
          <Plus className="w-4 h-4" /> Thêm hội viên
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng hội viên</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{totalCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-fit-primary">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang hoạt động</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{activeCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-fit-trainer">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chờ kích hoạt</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{pendingCount}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 shadow-sm border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-fit-danger">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tài khoản bị khóa</p>
            <h3 className="text-2xl font-black text-slate-900 leading-tight mt-1">{lockedCount}</h3>
          </div>
        </Card>
      </div>

      {/* Main Filter & Table Card */}
      <Card className="shadow-sm border-slate-100 overflow-hidden">
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/30 p-5 lg:flex-nowrap">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

            <input
                type="text"
                placeholder="Tìm theo mã, tên, SĐT, email..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(
                      event.target.value,
                  );
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-inner transition-all focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
            />
          </div>

          <div className="flex w-full items-center gap-3 overflow-x-auto pb-1 lg:w-auto lg:pb-0">
            <div className="flex min-w-[180px] flex-col gap-1">
              <label
                  htmlFor="member-status-filter"
                  className="pl-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                Lọc trạng thái
              </label>

              <select
                  id="member-status-filter"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                        event.target.value as
                            Status | "ALL",
                    );
                  }}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
                  style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundRepeat:
                        "no-repeat",
                    backgroundPosition:
                        "right 0.75rem center",
                    backgroundSize:
                        "1.2em 1.2em",
                  }}
              >
                <option value="ALL">
                  Tất cả trạng thái
                </option>

                <option value="ACTIVE">
                  Hoạt động
                </option>

                <option value="PENDING">
                  Chờ xử lý
                </option>

                <option value="LOCKED">
                  Bị khóa
                </option>

                <option value="INACTIVE">
                  Ngưng hoạt động
                </option>

                <option value="EXPIRED">
                  Gói đã hết hạn
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Table representation */}
        {loading ? (
          <Loading label="Đang tải danh sách hội viên..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50/80 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="px-6 py-4">Mã HV</th>
                  <th className="px-6 py-4">Hội viên</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Giới tính</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Không tìm thấy hội viên nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                        {member.memberCode || `MEM${String(member.id).padStart(4, "0")}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80 flex-shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <span>{member.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-[13px]">{member.fullName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">ID: {member.id} {member.userId ? ` | User: ${member.userId}` : ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px]">
                        <div className="flex flex-col gap-0.5 text-slate-700 font-medium">
                          <span>{member.phone}</span>
                          <span className="text-xs text-slate-400 font-normal">{member.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        {member.gender === "MALE" ? "Nam" : member.gender === "FEMALE" ? "Nữ" : "Khác"}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">
                        {member.joinDate || "Gần đây"}
                      </td>
                      <td className="px-6 py-4">
                        {renderStatusBadge(member.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenDetail(member)}
                            className="p-1.5 text-slate-400 hover:text-fit-primary hover:bg-fit-primarySoft rounded-lg transition-all" 
                            title="Xem chi tiết hồ sơ & lịch sử"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 text-slate-400 hover:text-fit-admin hover:bg-fit-adminSoft rounded-lg transition-all" 
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(member)}
                            className={`p-1.5 rounded-lg transition-all ${
                              member.status === "LOCKED" 
                                ? "text-emerald-500 hover:bg-emerald-50" 
                                : "text-rose-500 hover:bg-rose-50"
                            }`} 
                            title={member.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          >
                            {member.status === "LOCKED" ? <Unlock className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5" />}
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
      </Card>

      {/* Details Modal */}
      <Modal 
        title={`Chi tiết Hội viên: ${selectedMember?.fullName}`}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      >
        {selectedMember && (
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Custom Tab Panel Header */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setDetailTab("profile")}
                className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-all ${
                  detailTab === "profile" 
                    ? "border-fit-primary text-fit-primary" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Thông tin cá nhân
              </button>
              <button 
                onClick={() => setDetailTab("subscription")}
                className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-all ${
                  detailTab === "subscription" 
                    ? "border-fit-primary text-fit-primary" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Lịch sử gói tập
              </button>
              <button 
                onClick={() => setDetailTab("checkin")}
                className={`flex-1 py-2 text-center text-sm font-semibold border-b-2 transition-all ${
                  detailTab === "checkin" 
                    ? "border-fit-primary text-fit-primary" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Lịch sử Check-in
              </button>
            </div>

            {detailLoading ? (
              <Loading label="Đang tải dữ liệu chi tiết..." />
            ) : (
              <div className="mt-4">
                {/* TAB 1: Profile */}
                {detailTab === "profile" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-14 h-14 rounded-full bg-fit-primarySoft flex items-center justify-center text-fit-primary font-bold text-lg">
                        {selectedMember.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{selectedMember.fullName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Mã số: {selectedMember.memberCode || "Chưa có"}</p>
                        <div className="mt-1">{renderStatusBadge(selectedMember.status)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Email</span>
                        <span className="text-sm font-medium text-slate-800 mt-1 truncate">{selectedMember.email}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Số điện thoại</span>
                        <span className="text-sm font-medium text-slate-800 mt-1">{selectedMember.phone}</span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Giới tính</span>
                        <span className="text-sm font-medium text-slate-800 mt-1">
                          {selectedMember.gender === "MALE" ? "Nam" : selectedMember.gender === "FEMALE" ? "Nữ" : "Khác"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Ngày sinh</span>
                        <span className="text-sm font-medium text-slate-800 mt-1">{selectedMember.dateOfBirth || "-"}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Địa chỉ</span>
                      <span className="text-sm font-medium text-slate-800 mt-1">{selectedMember.address || "Chưa cập nhật"}</span>
                    </div>

                    

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl border border-slate-100 flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Mục tiêu tập luyện</span>
                        <span className="text-xs font-semibold text-slate-700 mt-1.5">{selectedMember.fitnessGoal || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Subscriptions */}
                {detailTab === "subscription" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 pl-1">Lịch sử giao dịch / Đăng ký gói</h4>
                    {memberSubscriptions.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">
                        Hội viên chưa có đăng ký gói tập nào.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {memberSubscriptions.map((sub) => (
                          <div key={sub.id} className="p-4 border border-slate-100 hover:border-slate-200 bg-white rounded-xl flex items-center justify-between transition-colors shadow-sm">
                            <div className="space-y-1">
                              <div className="font-bold text-slate-800 text-sm">{sub.package?.name}</div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {sub.startDate}</span>
                                <span>đến</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {sub.endDate}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-semibold text-fit-primary">
                                {((sub.package as unknown as Record<string, number>)?.basePrice || sub.basePrice || 0).toLocaleString("vi-VN")} ₫
                              </span>
                              {sub.status === "ACTIVE" ? (
                                <Badge variant="success">Hoạt động</Badge>
                              ) : sub.status === "EXPIRED" ? (
                                <Badge variant="purple">Hết hạn</Badge>
                              ) : (
                                <Badge variant="danger">Bị khóa</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: Checkins */}
                {detailTab === "checkin" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 pl-1">Lịch sử lượt check-in ra vào</h4>
                    {memberCheckins.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs font-medium">
                        Hội viên chưa có lượt check-in nào được ghi nhận.
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-100 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                          <thead className="bg-slate-50 font-semibold text-slate-500">
                            <tr>
                              <th className="px-4 py-2.5 text-left">Thời gian</th>
                              <th className="px-4 py-2.5 text-left">Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 text-slate-600">
                            {memberCheckins.map((record) => (
                              <tr key={record.id} className="hover:bg-slate-50/40">
                                <td className="px-4 py-3 font-semibold text-slate-700">
                                  {new Date(record.checkInTime).toLocaleString("vi-VN")}
                                </td>
                                <td className="px-4 py-3 font-medium">
                                  <span className={record.note?.includes("khóa") || record.note?.includes("thất bại") ? "text-rose-500" : "text-slate-600"}>
                                    {record.note || "Hợp lệ"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
              <Button type="button" variant="outline" onClick={() => setDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
