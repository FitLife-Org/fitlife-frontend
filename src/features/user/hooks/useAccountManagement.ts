import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { showAlert } from "../../../utils/alert";
import { validateAdminAccountForm } from "../utils/adminAccountValidator";
import type { User, AdminUserCreateRequest, AdminUserUpdateRequest } from "../types/user.type";
import type { Status } from "../../../types/common.type";

export function useAccountManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

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

  const handleOpenEdit = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormValues({
      username: user.username,
      email: user.email,
      password: "", 
      fullName: user.fullName,
      phone: user.phone || "",
      roleCode: (user.roles && user.roles.length > 0) ? user.roles[0] : "ROLE_MEMBER",
      status: user.status
    });
    setFormModalOpen(true);
  };

  const handleOpenRoleEdit = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || ["ROLE_MEMBER"]);
    setRoleModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdminAccountForm(formValues as any, !isEditMode)) {
      return;
    }

    try {
      setFormLoading(true);
      if (isEditMode && selectedUser) {
        const updateData: AdminUserUpdateRequest = {
          fullName: formValues.fullName,
          phone: formValues.phone,
          status: formValues.status as Status
        };
        await userService.updateUser(selectedUser.id, updateData);
        showAlert.success("Thành công", `Đã cập nhật thông tin tài khoản ${formValues.username}.`);
      } else {
        await userService.createUser(formValues as AdminUserCreateRequest);
        showAlert.success("Thành công", `Đã tạo tài khoản ${formValues.username}.`);
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
        await userService.updateUserStatus(user.id, newStatus as Status);
        
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus as Status } : u));
        showAlert.success("Thành công", `Đã ${actionText.toLowerCase()} tài khoản.`);
      } catch (error: any) {
        console.error("Failed to update status:", error);
        showAlert.error("Thất bại", "Không thể cập nhật trạng thái tài khoản.");
      }
    }
  };

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
    setCurrentPage,
    detailModalOpen,
    formModalOpen,
    roleModalOpen,
    setDetailModalOpen,
    setFormModalOpen,
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
    handleRoleSubmit
  };
}
