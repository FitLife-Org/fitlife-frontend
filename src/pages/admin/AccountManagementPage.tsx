import {
  Search,
  Plus,
  Eye,
  Edit2,
  Lock,
  Unlock,
  Shield,
  UserRound,
  Mail,
  Phone,
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

// =====================================================
// ROLE OPTIONS
// =====================================================

const CREATE_INTERNAL_ROLE_OPTIONS: Array<{
  value: Role;
  label: string;
}> = [
  {
    value: "ROLE_STAFF",
    label: "Nhân viên",
  },
  {
    value: "ROLE_ADMIN",
    label: "Quản trị viên",
  },
];

/**
 * Endpoint:
 *
 * PATCH /admin/users/{id}/roles
 *
 * Backend hiện hỗ trợ đủ:
 * - ROLE_ADMIN
 * - ROLE_STAFF
 * - ROLE_TRAINER
 * - ROLE_MEMBER
 */
const UPDATE_ROLE_OPTIONS: Array<{
  value: Role;
  label: string;
}> = [
  {
    value: "ROLE_MEMBER",
    label: "Hội viên",
  },
  {
    value: "ROLE_STAFF",
    label: "Nhân viên",
  },
  {
    value: "ROLE_ADMIN",
    label: "Quản trị viên",
  },
];

// =====================================================
// PAGE
// =====================================================

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

  // =====================================================
  // ROLE BADGE
  // =====================================================

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

      default:
        return null;
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

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
              Tạm đình chỉ
            </Badge>
        );

      case "LOCKED":
        return (
            <Badge variant="danger">
              Đã khóa
            </Badge>
        );

      default:
        return (
            <Badge variant="default">
              {status}
            </Badge>
        );
    }
  };

  // =====================================================
  // CREATE / EDIT VIEW
  // =====================================================

  if (showFormView) {
    return (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
                type="button"
                variant="outline"
                onClick={() =>
                    setShowFormView(false)
                }
            >
              Quay lại
            </Button>

            <div>
              <h1 className="text-2xl font-black text-slate-900">
                {isEditMode
                    ? "Chỉnh sửa tài khoản"
                    : "Thêm tài khoản nội bộ"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {isEditMode
                    ? "Cập nhật thông tin cơ bản và trạng thái tài khoản."
                    : "Tạo tài khoản nội bộ cho quản trị viên, nhân viên hoặc huấn luyện viên."}
              </p>
            </div>
          </div>

          <Card className="p-6">
            <form
                onSubmit={handleFormSubmit}
                className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Input
                    label="Họ và tên *"
                    value={
                      formValues.fullName
                    }
                    onChange={(event) =>
                        setFormValues(
                            (previous) => ({
                              ...previous,
                              fullName:
                              event.target.value,
                            }),
                        )
                    }
                    required
                />

                <Input
                    label="Username *"
                    value={
                      formValues.username
                    }
                    onChange={(event) =>
                        setFormValues(
                            (previous) => ({
                              ...previous,
                              username:
                              event.target.value,
                            }),
                        )
                    }
                    required
                />

                <Input
                    label="Email *"
                    type="email"
                    value={
                      formValues.email
                    }
                    onChange={(event) =>
                        setFormValues(
                            (previous) => ({
                              ...previous,
                              email:
                              event.target.value,
                            }),
                        )
                    }
                    required
                />

                <Input
                    label="Số điện thoại *"
                    value={
                      formValues.phone
                    }
                    onChange={(event) =>
                        setFormValues(
                            (previous) => ({
                              ...previous,
                              phone:
                              event.target.value,
                            }),
                        )
                    }
                    required
                />

                {!isEditMode && (
                    <Input
                        label="Mật khẩu *"
                        type="password"
                        value={
                          formValues.password
                        }
                        onChange={(event) =>
                            setFormValues(
                                (previous) => ({
                                  ...previous,
                                  password:
                                  event.target.value,
                                }),
                            )
                        }
                        required
                    />
                )}

                {!isEditMode && (
                    <div className="space-y-1.5">
                      <label
                          htmlFor="internal-role"
                          className="text-sm font-semibold text-slate-700"
                      >
                        Vai trò *
                      </label>

                      <select
                          id="internal-role"
                          value={
                            formValues.roleCode
                          }
                          onChange={(event) =>
                              setFormValues(
                                  (previous) => ({
                                    ...previous,

                                    roleCode:
                                        event.target
                                            .value as Role,
                                  }),
                              )
                          }
                          className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-2.5
                      text-sm
                      outline-none
                      transition
                      focus:border-fit-primary
                      focus:ring-2
                      focus:ring-fit-primary/10
                    "
                      >
                        {CREATE_INTERNAL_ROLE_OPTIONS.map(
                            (option) => (
                                <option
                                    key={
                                      option.value
                                    }
                                    value={
                                      option.value
                                    }
                                >
                                  {option.label}
                                </option>
                            ),
                        )}
                      </select>

                      <p className="text-xs leading-5 text-slate-400">
                        Hội viên được tạo thông qua nghiệp vụ đăng ký hội viên.
                      </p>
                    </div>
                )}

                <div className="space-y-1.5">
                  <label
                      htmlFor="user-status"
                      className="text-sm font-semibold text-slate-700"
                  >
                    Trạng thái
                  </label>

                  <select
                      id="user-status"
                      value={
                        formValues.status
                      }
                      onChange={(event) =>
                          setFormValues(
                              (previous) => ({
                                ...previous,

                                status:
                                    event.target
                                        .value as UserStatus,
                              }),
                          )
                      }
                      className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-fit-primary
                    focus:ring-2
                    focus:ring-fit-primary/10
                  "
                  >
                    <option value="ACTIVE">
                      Hoạt động
                    </option>

                    <option value="INACTIVE">
                      Không hoạt động
                    </option>

                    <option value="LOCKED">
                      Đã khóa
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setShowFormView(false)
                    }
                >
                  Hủy
                </Button>

                <Button
                    type="submit"
                    isLoading={
                      formLoading
                    }
                >
                  {isEditMode
                      ? "Lưu thay đổi"
                      : "Tạo tài khoản"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
    );
  }

  // =====================================================
  // LIST
  // =====================================================

  return (
      <div className="space-y-6">
        {/* =================================================
          HEADER
      ================================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Quản lý tài khoản
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý người dùng, vai trò và trạng thái tài khoản.
            </p>
          </div>

          <Button
              onClick={
                handleOpenCreate
              }
              className="flex items-center gap-2 bg-fit-primary text-white"
          >
            <Plus className="h-4 w-4" />

            Thêm tài khoản nội bộ
          </Button>
        </div>

        {/* =================================================
          TABLE CARD
      ================================================== */}

        <Card className="overflow-hidden">
          {/* ===============================================
            FILTERS
        ================================================ */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
            <form
                onSubmit={
                  handleSearchSubmit
                }
                className="flex w-full gap-2 xl:max-w-md"
            >
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                    value={
                      searchTerm
                    }
                    onChange={(event) =>
                        setSearchTerm(
                            event.target.value,
                        )
                    }
                    placeholder="Tìm username, tên, email..."
                    className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  py-2.5
                  pl-9
                  pr-3
                  text-sm
                  outline-none
                  transition
                  focus:border-fit-primary
                  focus:ring-2
                  focus:ring-fit-primary/10
                "
                />
              </div>

              <Button type="submit">
                Tìm
              </Button>
            </form>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* ROLE FILTER */}

              <select
                  value={
                    roleFilter
                  }
                  onChange={(event) => {
                    setRoleFilter(
                        event.target
                            .value as
                            | Role
                            | "ALL",
                    );

                    setCurrentPage(
                        0,
                    );
                  }}
                  className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                py-2.5
                text-sm
                outline-none
                focus:border-fit-primary
              "
              >
                <option value="ALL">
                  Tất cả vai trò
                </option>

                <option value="ROLE_MEMBER">
                  Hội viên
                </option>

                <option value="ROLE_TRAINER">
                  Huấn luyện viên
                </option>

                <option value="ROLE_STAFF">
                  Nhân viên
                </option>

                <option value="ROLE_ADMIN">
                  Quản trị viên
                </option>
              </select>

              {/* STATUS FILTER */}

              <select
                  value={
                    statusFilter
                  }
                  onChange={(event) => {
                    setStatusFilter(
                        event.target
                            .value as
                            | UserStatus
                            | "ALL",
                    );

                    setCurrentPage(
                        0,
                    );
                  }}
                  className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-3
                py-2.5
                text-sm
                outline-none
                focus:border-fit-primary
              "
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

                <option value="LOCKED">
                  Đã khóa
                </option>

                <option value="SUSPENDED">
                  Tạm đình chỉ
                </option>
              </select>
            </div>
          </div>

          {/* ===============================================
            CONTENT
        ================================================ */}

          {loading ? (
              <Loading label="Đang tải danh sách tài khoản..." />
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      ID
                    </th>

                    <th className="px-5 py-4">
                      Tài khoản
                    </th>

                    <th className="px-5 py-4">
                      Liên hệ
                    </th>

                    <th className="px-5 py-4">
                      Vai trò
                    </th>

                    <th className="px-5 py-4">
                      Trạng thái
                    </th>

                    <th className="px-5 py-4 text-center">
                      Thao tác
                    </th>
                  </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                  {users.length ===
                  0 ? (
                      <tr>
                        <td
                            colSpan={6}
                            className="px-6 py-14 text-center"
                        >
                          <UserRound className="mx-auto h-10 w-10 text-slate-300" />

                          <p className="mt-3 font-semibold text-slate-500">
                            Không có tài khoản phù hợp.
                          </p>
                        </td>
                      </tr>
                  ) : (
                      users.map(
                          (user) => {
                            const isLocked =
                                user.status ===
                                "LOCKED";

                            return (
                                <tr
                                    key={
                                      user.id
                                    }
                                    className="transition hover:bg-slate-50"
                                >
                                  {/* ID */}

                                  <td className="px-5 py-4 font-medium text-slate-600">
                                    #{user.id}
                                  </td>

                                  {/* ACCOUNT */}

                                  <td className="px-5 py-4">
                                    <p className="font-bold text-slate-900">
                                      {user.fullName ||
                                          "—"}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                      @{user.username}
                                    </p>
                                  </td>

                                  {/* CONTACT */}

                                  <td className="px-5 py-4">
                                    <div className="space-y-1">
                                      <p className="flex items-center gap-1.5 text-sm text-slate-700">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" />

                                        {user.phone ||
                                            "—"}
                                      </p>

                                      <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Mail className="h-3.5 w-3.5" />

                                        {user.email}
                                      </p>
                                    </div>
                                  </td>

                                  {/* ROLES */}

                                  <td className="px-5 py-4">
                                    <div className="flex flex-wrap gap-1.5">
                                      {user.roles.length >
                                      0 ? (
                                          user.roles.map(
                                              (
                                                  role,
                                              ) => (
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
                                          )
                                      ) : (
                                          <span className="text-xs text-slate-400">
                                  Chưa có vai trò
                                </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* STATUS */}

                                  <td className="px-5 py-4">
                                    {renderStatusBadge(
                                        user.status,
                                    )}
                                  </td>

                                  {/* ACTION */}

                                  <td className="px-5 py-4">
                                    <div className="flex items-center justify-center gap-1">
                                      {/* VIEW */}

                                      <button
                                          type="button"
                                          title="Xem chi tiết"
                                          onClick={() =>
                                              handleOpenDetail(
                                                  user,
                                              )
                                          }
                                          className="
                                  rounded-lg
                                  p-2
                                  text-slate-500
                                  transition
                                  hover:bg-slate-100
                                  hover:text-slate-900
                                "
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>

                                      {/* EDIT */}

                                      <button
                                          type="button"
                                          title="Chỉnh sửa tài khoản"
                                          onClick={() =>
                                              handleOpenEdit(
                                                  user,
                                              )
                                          }
                                          className="
                                  rounded-lg
                                  p-2
                                  text-slate-500
                                  transition
                                  hover:bg-blue-50
                                  hover:text-blue-600
                                "
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>

                                      {/* ROLE */}

                                      <button
                                          type="button"
                                          title="Cập nhật vai trò"
                                          onClick={() =>
                                              handleOpenRoleEdit(
                                                  user,
                                              )
                                          }
                                          className="
                                  rounded-lg
                                  p-2
                                  text-slate-500
                                  transition
                                  hover:bg-indigo-50
                                  hover:text-indigo-600
                                "
                                      >
                                        <Shield className="h-4 w-4" />
                                      </button>

                                      {/* LOCK / UNLOCK */}

                                      <button
                                          type="button"
                                          title={
                                            isLocked
                                                ? "Mở khóa tài khoản"
                                                : "Khóa tài khoản"
                                          }
                                          onClick={() =>
                                              handleToggleStatus(
                                                  user,
                                              )
                                          }
                                          className={`
                                  rounded-lg
                                  p-2
                                  transition

                                  ${
                                              isLocked
                                                  ? "text-emerald-600 hover:bg-emerald-50"
                                                  : "text-rose-600 hover:bg-rose-50"
                                          }
                                `}
                                      >
                                        {isLocked ? (
                                            <Unlock className="h-4 w-4" />
                                        ) : (
                                            <Lock className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                            );
                          },
                      )
                  )}
                  </tbody>
                </table>
              </div>
          )}

          {/* ===============================================
            PAGINATION
        ================================================ */}

          {totalPages > 0 && (
              <Pagination
                  currentPage={
                    currentPage
                  }
                  pageSize={
                    pageSize
                  }
                  totalItems={
                    totalItems
                  }
                  onPageChange={
                    setCurrentPage
                  }
                  onPageSizeChange={(
                      size,
                  ) => {
                    setPageSize(
                        size,
                    );

                    setCurrentPage(
                        0,
                    );
                  }}
              />
          )}
        </Card>

        {/* =================================================
          DETAIL MODAL
      ================================================== */}

        <Modal
            title="Chi tiết tài khoản"
            open={
              detailModalOpen
            }
            onClose={() =>
                setDetailModalOpen(
                    false,
                )
            }
        >
          {selectedUser && (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div
                      className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-600
                "
                  >
                    <UserRound className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">
                      {selectedUser.fullName}
                    </h3>

                    <p className="text-sm text-slate-400">
                      @{selectedUser.username}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                  <p>
                <span className="font-semibold text-slate-500">
                  ID:
                </span>{" "}
                    #{selectedUser.id}
                  </p>

                  <p>
                <span className="font-semibold text-slate-500">
                  Email:
                </span>{" "}
                    {selectedUser.email}
                  </p>

                  <p>
                <span className="font-semibold text-slate-500">
                  Điện thoại:
                </span>{" "}
                    {selectedUser.phone ||
                        "—"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Vai trò
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles.map(
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
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Trạng thái
                  </p>

                  {renderStatusBadge(
                      selectedUser.status,
                  )}
                </div>
              </div>
          )}
        </Modal>

        {/* =================================================
          ROLE MODAL
      ================================================== */}

        <Modal
            title="Cập nhật vai trò"
            open={
              roleModalOpen
            }
            onClose={() =>
                setRoleModalOpen(
                    false,
                )
            }
        >
          <form
              onSubmit={
                handleRoleSubmit
              }
              className="space-y-5"
          >
            {selectedUser && (
                <div
                    className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
              "
                >
                  <p className="text-xs font-medium text-slate-400">
                    Tài khoản
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {selectedUser.fullName}
                  </p>

                  <p className="text-xs text-slate-500">
                    @{selectedUser.username}
                  </p>
                </div>
            )}

            <div className="space-y-1.5">
              <label
                  htmlFor="role-select"
                  className="text-sm font-semibold text-slate-700"
              >
                Vai trò
              </label>

              <select
                  id="role-select"

                  /**
                   * QUAN TRỌNG:
                   *
                   * Modal role phải bind selectedRoles,
                   * KHÔNG bind formValues.roleCode.
                   */
                  value={
                      selectedRoles[0] ??
                      ""
                  }
                  onChange={(event) =>
                      setSelectedRoles([
                        event.target
                            .value as Role,
                      ])
                  }
                  className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-fit-primary
                focus:ring-2
                focus:ring-fit-primary/10
              "
              >
                {UPDATE_ROLE_OPTIONS.map(
                    (option) => (
                        <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                        >
                          {option.label}
                        </option>
                    ),
                )}
              </select>
            </div>

            {/* WARNING MEMBER / TRAINER */}

            {(selectedRoles.includes(
                    "ROLE_MEMBER",
                ) ||
                selectedRoles.includes(
                    "ROLE_TRAINER",
                )) && (
                <div
                    className="
                rounded-xl
                border
                border-amber-200
                bg-amber-50
                px-4
                py-3
                text-sm
                leading-6
                text-amber-700
              "
                >
                  <strong>
                    Lưu ý:
                  </strong>{" "}
                  Vai trò Hội viên hoặc Huấn luyện viên yêu cầu hồ sơ nghiệp vụ tương ứng trong hệ thống. Việc đổi role không tự tạo Member/Trainer profile nếu Backend chưa xử lý provisioning.
                </div>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
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
                  isLoading={
                    roleLoading
                  }
                  disabled={
                      selectedRoles.length ===
                      0
                  }
              >
                Cập nhật vai trò
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
}