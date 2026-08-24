import {
  Search,
  Plus,
  Eye,
  Edit2,
  Lock,
  Unlock,
  Shield,
} from "lucide-react";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";
import Pagination from "../../components/common/Pagination";

import {
  useAccountManagement,
} from "../../hooks/useAccountManagement";

import type {
  Role,
} from "../../types/common.type";

import type {
  UserStatus,
} from "../../types/user.type";

export default function AccountManagementPage() {
  const {
    users,
    loading,

    searchTerm,
    statusFilter,
    roleFilter,

    setSearchTerm,
    setStatusFilter,
    setRoleFilter,

    currentPage,
    totalPages,
    totalItems,
    pageSize,
    setPageSize,
    setCurrentPage,

    detailModalOpen,
    showFormView,
    roleModalOpen,

    setDetailModalOpen,
    setShowFormView,
    setRoleModalOpen,

    selectedUser,
    isEditMode,

    formValues,
    setFormValues,
    formLoading,

    selectedRoles,
    setSelectedRoles,
    roleLoading,

    handleSearchSubmit,
    handleOpenDetail,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenRoleEdit,
    handleFormSubmit,
    handleToggleStatus,
    handleRoleSubmit,
  } = useAccountManagement();

  const renderRoleBadge = (
      role: Role,
  ) => {
    switch (role) {
      case "ROLE_ADMIN":
        return (
            <Badge variant="danger">
              Quản trị viên
            </Badge>
        );

      case "ROLE_STAFF":
        return (
            <Badge variant="success">
              Nhân viên
            </Badge>
        );

      case "ROLE_TRAINER":
        return (
            <Badge variant="warning">
              Huấn luyện viên
            </Badge>
        );

      case "ROLE_MEMBER":
        return (
            <Badge variant="default">
              Hội viên
            </Badge>
        );
    }
  };

  const renderStatusBadge = (
      status: UserStatus,
  ) => {
    switch (status) {
      case "PENDING":
        return (
            <Badge variant="warning">
              Chờ xác minh
            </Badge>
        );

      case "ACTIVE":
        return (
            <Badge variant="success">
              Hoạt động
            </Badge>
        );

      case "INACTIVE":
        return (
            <Badge variant="default">
              Không hoạt động
            </Badge>
        );

      case "SUSPENDED":
        return (
            <Badge variant="danger">
              Bị khóa
            </Badge>
        );
    }
  };

  if (showFormView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" onClick={() => setShowFormView(false)}>
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Chỉnh sửa tài khoản" : "Thêm tài khoản nội bộ"}
            </h1>
          </div>
        </div>

        <Card className="p-5">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Họ và tên *"
                value={formValues.fullName}
                onChange={(event) => setFormValues((previous) => ({ ...previous, fullName: event.target.value }))}
                required
              />

              <Input
                label="Username *"
                value={formValues.username}
                onChange={(event) => setFormValues((previous) => ({ ...previous, username: event.target.value }))}
                required
              />

              <Input
                label="Email *"
                type="email"
                value={formValues.email}
                onChange={(event) => setFormValues((previous) => ({ ...previous, email: event.target.value }))}
                required
              />

              <Input
                label="Số điện thoại *"
                value={formValues.phone}
                onChange={(event) => setFormValues((previous) => ({ ...previous, phone: event.target.value }))}
                required
              />

              {!isEditMode && (
                <Input
                  label="Mật khẩu *"
                  type="password"
                  value={formValues.password}
                  onChange={(event) => setFormValues((previous) => ({ ...previous, password: event.target.value }))}
                  required
                />
              )}

              {!isEditMode && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Vai trò</label>
                  <select
                    value={formValues.roleCode}
                    onChange={(event) => setFormValues((previous) => ({ ...previous, roleCode: event.target.value as Role }))}
                    className="w-full rounded-xl border px-4 py-2 border-slate-200 outline-none focus:border-fit-primary"
                  >
                    <option value="ROLE_STAFF">Nhân viên</option>
                    <option value="ROLE_TRAINER">Huấn luyện viên</option>
                    <option value="ROLE_ADMIN">Quản trị viên</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Trạng thái</label>
                <select
                  value={formValues.status}
                  onChange={(event) => setFormValues((previous) => ({ ...previous, status: event.target.value as UserStatus }))}
                  className="w-full rounded-xl border px-4 py-2 border-slate-200 outline-none focus:border-fit-primary"
                >
                  <option value="PENDING">Chờ xác minh</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="SUSPENDED">Bị khóa</option>
                </select>
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
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý tài khoản
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý người dùng, vai trò và trạng thái tài khoản.
            </p>
          </div>

          <Button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 bg-fit-primary text-white"
          >
            <Plus className="h-4 w-4" />
            Thêm tài khoản nội bộ
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
            <form
                onSubmit={
                  handleSearchSubmit
                }
                className="flex w-full gap-2 lg:w-96"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    value={searchTerm}
                    onChange={(event) =>
                        setSearchTerm(
                            event.target.value,
                        )
                    }
                    placeholder="Tìm username, tên, email..."
                    className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm"
                />
              </div>

              <Button type="submit">
                Tìm
              </Button>
            </form>

            <div className="flex gap-3">
              <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(
                        event.target
                            .value as Role | "ALL",
                    );

                    setCurrentPage(0);
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
              >
                <option value="ALL">
                  Tất cả tài khoản
                </option>
                <option value="ROLE_STAFF">
                  Nhân viên
                </option>
                <option value="ROLE_TRAINER">
                  Huấn luyện viên
                </option>
                <option value="ROLE_ADMIN">
                  Quản trị viên
                </option>
                <option value="ROLE_MEMBER">
                  Hội viên
                </option>
              </select>

              <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                        event.target
                            .value as
                            | UserStatus
                            | "ALL",
                    );

                    setCurrentPage(0);
                  }}
                  className="rounded-xl border px-3 py-2 text-sm"
              >
                <option value="ALL">
                  Tất cả trạng thái
                </option>
                <option value="PENDING">
                  Chờ xác minh
                </option>
                <option value="ACTIVE">
                  Hoạt động
                </option>
                <option value="INACTIVE">
                  Không hoạt động
                </option>
                <option value="SUSPENDED">
                  Bị khóa
                </option>
              </select>
            </div>
          </div>

          {loading ? (
              <Loading label="Đang tải danh sách tài khoản..." />
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">
                      ID
                    </th>
                    <th className="px-6 py-4">
                      Tài khoản
                    </th>
                    <th className="px-6 py-4">
                      Liên hệ
                    </th>
                    <th className="px-6 py-4">
                      Vai trò
                    </th>
                    <th className="px-6 py-4">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center">
                      Thao tác
                    </th>
                  </tr>
                  </thead>

                  <tbody className="divide-y">
                  {users.length === 0 ? (
                      <tr>
                        <td
                            colSpan={6}
                            className="px-6 py-12 text-center text-slate-400"
                        >
                          Không có tài khoản.
                        </td>
                      </tr>
                  ) : (
                      users.map((user) => (
                          <tr
                              key={user.id}
                              className="hover:bg-slate-50"
                          >
                            <td className="px-6 py-4">
                              #{user.id}
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-900">
                                {
                                  user.fullName
                                }
                              </p>

                              <p className="text-xs text-slate-400">
                                {
                                  user.username
                                }
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p>
                                {user.phone ||
                                    "—"}
                              </p>

                              <p className="text-xs text-slate-400">
                                {user.email}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map(
                                    (role) => (
                                        <span
                                            key={
                                              role
                                            }
                                        >
                                {renderRoleBadge(
                                    role,
                                )}
                              </span>
                                    ),
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              {renderStatusBadge(
                                  user.status,
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenDetail(
                                            user,
                                        )
                                    }
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenEdit(
                                            user,
                                        )
                                    }
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenRoleEdit(
                                            user,
                                        )
                                    }
                                >
                                  <Shield className="h-4 w-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleToggleStatus(
                                            user,
                                        )
                                    }
                                >
                                    {(user.status === "SUSPENDED" || user.status === "INACTIVE") ? (
                                        <Unlock className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Lock className="h-4 w-4 text-rose-600" />
                                    )}
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

          {totalPages > 0 && (
              <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(0);
                  }}
              />
          )}
        </Card>

        <Modal
            title="Chi tiết tài khoản"
            open={detailModalOpen}
            onClose={() =>
                setDetailModalOpen(false)
            }
        >
          {selectedUser && (
              <div className="space-y-4">
                <h3 className="font-bold">
                  {selectedUser.fullName}
                </h3>

                <p>
                  Username:{" "}
                  {selectedUser.username}
                </p>

                <p>
                  Email:{" "}
                  {selectedUser.email}
                </p>

                <p>
                  Điện thoại:{" "}
                  {selectedUser.phone ||
                      "—"}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map(
                      (role) => (
                          <span key={role}>
                    {renderRoleBadge(
                        role,
                    )}
                  </span>
                      ),
                  )}

                  {renderStatusBadge(
                      selectedUser.status,
                  )}
                </div>
              </div>
          )}
        </Modal>



        <Modal
            title="Gán vai trò"
            open={roleModalOpen}
            onClose={() =>
                setRoleModalOpen(false)
            }
        >
          <form
              onSubmit={handleRoleSubmit}
              className="space-y-4"
          >
            <select
                value={
                    selectedRoles[0] ?? ""
                }
                onChange={(event) =>
                    setSelectedRoles([
                      event.target
                          .value as Role,
                    ])
                }
                className="w-full rounded-xl border px-4 py-3"
            >
              <option value="ROLE_MEMBER">
                Hội viên
              </option>
              <option value="ROLE_STAFF">
                Nhân viên
              </option>
              <option value="ROLE_TRAINER">
                Huấn luyện viên
              </option>
              <option value="ROLE_ADMIN">
                Quản trị viên
              </option>
            </select>

            <div className="flex justify-end gap-3">
              <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                      setRoleModalOpen(
                          false,
                      )
                  }
              >
                Hủy
              </Button>

              <Button
                  type="submit"
                  isLoading={roleLoading}
              >
                Cập nhật vai trò
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
}
