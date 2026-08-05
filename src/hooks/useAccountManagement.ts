import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { userService } from "../services/userService";
import { showAlert } from "../utils/alert";
import { validateAdminAccountForm } from "../utils/validators/adminAccountValidator";

import type {
  Role,
} from "../types/common.type";

import type {
  User,
  UserStatus,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
} from "../types/user.type";

const DEFAULT_PAGE_SIZE = 10;

interface AccountFormValues {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  roleCode: Role;
  status: UserStatus;
}

const INITIAL_FORM_VALUES: AccountFormValues = {
  username: "",
  email: "",
  password: "",
  fullName: "",
  phone: "",
  roleCode: "ROLE_STAFF",
  status: "ACTIVE",
};

export function useAccountManagement() {
  const [users, setUsers] =
      useState<User[]>([]);

  const [loading, setLoading] =
      useState(true);

  const [searchTerm, setSearchTerm] =
      useState("");

  const [
    submittedSearchTerm,
    setSubmittedSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<UserStatus | "ALL">(
      "ALL",
  );

  const [
    roleFilter,
    setRoleFilter,
  ] = useState<Role | "ALL">(
      "ALL",
  );

  /*
   * Spring Pageable bắt đầu từ page = 0.
   */
  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    totalItems,
    setTotalItems,
  ] = useState(0);

  const pageSize =
      DEFAULT_PAGE_SIZE;

  const [
    detailModalOpen,
    setDetailModalOpen,
  ] = useState(false);

  const [
    showFormView,
    setShowFormView,
  ] = useState(false);

  const [
    roleModalOpen,
    setRoleModalOpen,
  ] = useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<User | null>(
      null,
  );

  const [
    isEditMode,
    setIsEditMode,
  ] = useState(false);

  const [
    formValues,
    setFormValues,
  ] = useState<AccountFormValues>(
      INITIAL_FORM_VALUES,
  );

  const [
    formLoading,
    setFormLoading,
  ] = useState(false);

  const [
    selectedRoles,
    setSelectedRoles,
  ] = useState<Role[]>([]);

  const [
    roleLoading,
    setRoleLoading,
  ] = useState(false);

  const fetchUsers =
      useCallback(async () => {
        try {
          setLoading(true);

          const result =
              await userService.getUsers({
                page: currentPage,
                size: pageSize,

                keyword:
                    submittedSearchTerm
                        .trim() ||
                    undefined,

                status:
                    statusFilter === "ALL"
                        ? undefined
                        : statusFilter,

                roleCode:
                    roleFilter === "ALL"
                        ? undefined
                        : roleFilter,
              });

          setUsers(result.content);

          setTotalPages(
              result.totalPages,
          );

          setTotalItems(
              result.totalElements,
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "Failed to fetch users:",
              error,
          );

          setUsers([]);
          setTotalPages(0);
          setTotalItems(0);

          showAlert.error(
              "Lỗi",
              "Không thể tải danh sách tài khoản.",
          );
        } finally {
          setLoading(false);
        }
      }, [
        currentPage,
        pageSize,
        roleFilter,
        statusFilter,
        submittedSearchTerm,
      ]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(0);
  }, [
    roleFilter,
    statusFilter,
  ]);

  const handleSearchSubmit = (
      event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCurrentPage(0);

    setSubmittedSearchTerm(
        searchTerm,
    );
  };

  const handleOpenDetail = (
      user: User,
  ) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsEditMode(false);

    setFormValues({
      ...INITIAL_FORM_VALUES,
    });

    setshowFormView(true);
  };

  const handleOpenEdit = (
      user: User,
  ) => {
    setSelectedUser(user);
    setIsEditMode(true);

    setFormValues({
      username:
      user.username,

      email:
      user.email,

      password: "",

      fullName:
      user.fullName,

      phone:
          user.phone ?? "",

      roleCode:
          user.roles[0] ??
          "ROLE_MEMBER",

      status:
      user.status,
    });

    setshowFormView(true);
  };

  const handleOpenRoleEdit = (
      user: User,
  ) => {
    setSelectedUser(user);

    setSelectedRoles(
        user.roles.length > 0
            ? [...user.roles]
            : ["ROLE_MEMBER"],
    );

    setRoleModalOpen(true);
  };

  const handleFormSubmit =
      async (
          event:
          FormEvent<HTMLFormElement>,
      ) => {
        event.preventDefault();

        const validationPayload:
            | AdminUserCreateRequest
            | AdminUserUpdateRequest =
            isEditMode
                ? {
                  username:
                  formValues.username,

                  email:
                  formValues.email,

                  fullName:
                  formValues.fullName,

                  phone:
                  formValues.phone,

                  status:
                  formValues.status,
                }
                : {
                  username:
                  formValues.username,

                  email:
                  formValues.email,

                  password:
                  formValues.password,

                  fullName:
                  formValues.fullName,

                  phone:
                  formValues.phone,

                  roleCode:
                  formValues.roleCode,

                  status:
                  formValues.status,
                };

        if (
            !validateAdminAccountForm(
                validationPayload,
                !isEditMode,
            )
        ) {
          return;
        }

        try {
          setFormLoading(true);

          if (
              isEditMode &&
              selectedUser
          ) {
            const updateData:
                AdminUserUpdateRequest = {
              username:
                  formValues.username
                      .trim(),

              email:
                  formValues.email
                      .trim()
                      .toLowerCase(),

              fullName:
                  formValues.fullName
                      .trim(),

              phone:
                  formValues.phone
                      .trim(),

              status:
              formValues.status,
            };

            await userService.updateUser(
                selectedUser.id,
                updateData,
            );

            showAlert.success(
                "Thành công",
                `Đã cập nhật tài khoản ${formValues.username}.`,
            );
          } else {
            const createData:
                AdminUserCreateRequest = {
              username:
                  formValues.username
                      .trim(),

              email:
                  formValues.email
                      .trim()
                      .toLowerCase(),

              password:
              formValues.password,

              fullName:
                  formValues.fullName
                      .trim(),

              phone:
                  formValues.phone
                      .trim(),

              roleCode:
              formValues.roleCode,

              status:
              formValues.status,
            };

            await userService.createUser(
                createData,
            );

            showAlert.success(
                "Thành công",
                `Đã tạo tài khoản ${formValues.username}.`,
            );
          }

          setShowFormView(false);

          await fetchUsers();
        } catch (
            error: unknown
            ) {
          console.error(
              "Failed to submit user form:",
              error,
          );

          const message =
              error &&
              typeof error ===
              "object" &&
              "response" in error
                  ? (
                      error as {
                        response?: {
                          data?: {
                            message?: string;
                          };
                        };
                      }
                  ).response?.data
                      ?.message
                  : undefined;

          showAlert.error(
              "Thao tác thất bại",
              message ??
              "Có lỗi xảy ra trong quá trình lưu dữ liệu.",
          );
        } finally {
          setFormLoading(false);
        }
      };

  const handleToggleStatus =
      async (user: User) => {
        const currentlyLocked =
            user.status ===
            "LOCKED";

        const newStatus:
            UserStatus =
            currentlyLocked
                ? "ACTIVE"
                : "LOCKED";

        const actionText =
            currentlyLocked
                ? "Mở khóa"
                : "Khóa";

        const result =
            await showAlert.confirm(
                `${actionText} tài khoản?`,
                `Bạn có chắc muốn ${actionText.toLowerCase()} tài khoản của ${user.fullName}?`,
            );

        if (!result.isConfirmed) {
          return;
        }

        try {
          const updatedUser =
              await userService
                  .updateUserStatus(
                      user.id,
                      newStatus,
                  );

          setUsers((previous) =>
              previous.map(
                  (item) =>
                      item.id ===
                      updatedUser.id
                          ? updatedUser
                          : item,
              ),
          );

          showAlert.success(
              "Thành công",
              `Đã ${actionText.toLowerCase()} tài khoản.`,
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "Failed to update user status:",
              error,
          );

          showAlert.error(
              "Thất bại",
              "Không thể cập nhật trạng thái tài khoản.",
          );
        }
      };

  const handleRoleSubmit =
      async (
          event:
          FormEvent<HTMLFormElement>,
      ) => {
        event.preventDefault();

        if (!selectedUser) {
          return;
        }

        if (
            selectedRoles.length ===
            0
        ) {
          showAlert.warning(
              "Thiếu vai trò",
              "Người dùng phải có ít nhất một vai trò.",
          );

          return;
        }

        try {
          setRoleLoading(true);

          const updatedUser =
              await userService
                  .updateUserRoles(
                      selectedUser.id,
                      selectedRoles,
                  );

          setUsers((previous) =>
              previous.map(
                  (item) =>
                      item.id ===
                      updatedUser.id
                          ? updatedUser
                          : item,
              ),
          );

          setRoleModalOpen(false);

          showAlert.success(
              "Thành công",
              "Đã cập nhật vai trò người dùng.",
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "Failed to update roles:",
              error,
          );

          showAlert.error(
              "Thất bại",
              "Không thể cập nhật vai trò tài khoản.",
          );
        } finally {
          setRoleLoading(false);
        }
      };

  return {
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
    setCurrentPage,

    detailModalOpen,
    showFormView,
    roleModalOpen,

    setDetailModalOpen,
    setshowFormView,
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

    refreshUsers:
    fetchUsers,
  };
}
