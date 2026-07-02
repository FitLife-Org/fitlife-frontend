import { showAlert } from "../alert";
import type { AdminUserCreateRequest, AdminUserUpdateRequest } from "../../types/user.type";

export const validateAdminAccountForm = (
  formData: AdminUserCreateRequest | AdminUserUpdateRequest,
  isCreate: boolean
): boolean => {
  if (isCreate) {
    const data = formData as AdminUserCreateRequest;
    if (!data.username || data.username.length < 4 || data.username.length > 50) {
      showAlert.error("Lỗi", "Username phải từ 4 đến 50 ký tự");
      return false;
    }
    if (!data.password || data.password.length < 6 || data.password.length > 100) {
      showAlert.error("Lỗi", "Mật khẩu phải từ 6 đến 100 ký tự");
      return false;
    }
    if (!data.email) {
      showAlert.error("Lỗi", "Email không được để trống");
      return false;
    }
    if (!data.roleCode) {
      showAlert.error("Lỗi", "Vui lòng chọn vai trò (Role)");
      return false;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if ((formData as any).email && !emailRegex.test((formData as any).email)) {
    showAlert.error("Lỗi", "Email không hợp lệ");
    return false;
  }
  if ((formData as any).email && (formData as any).email.length > 100) {
    showAlert.error("Lỗi", "Email không được vượt quá 100 ký tự");
    return false;
  }

  if (isCreate || formData.fullName !== undefined) {
    if (!formData.fullName || formData.fullName.trim() === "") {
      showAlert.error("Lỗi", "Họ và tên không được để trống");
      return false;
    }
    if (formData.fullName.length > 100) {
      showAlert.error("Lỗi", "Họ và tên không được vượt quá 100 ký tự");
      return false;
    }
  }

  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    showAlert.error("Lỗi", "Số điện thoại không hợp lệ");
    return false;
  }

  return true;
};
