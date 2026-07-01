import { showAlert } from "../alert";
import type { AdminMemberCreateRequest, AdminMemberUpdateRequest } from "../../types/member.type";

export const validateAdminMemberForm = (
  formData: AdminMemberCreateRequest | AdminMemberUpdateRequest,
  isCreate: boolean
): boolean => {
  if (isCreate) {
    const data = formData as AdminMemberCreateRequest;
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
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    showAlert.error("Lỗi", "Email không hợp lệ");
    return false;
  }
  if (formData.email && formData.email.length > 150) {
    showAlert.error("Lỗi", "Email không được vượt quá 150 ký tự");
    return false;
  }

  if (isCreate || formData.fullName !== undefined) {
    if (!formData.fullName || formData.fullName.trim() === "") {
      showAlert.error("Lỗi", "Họ và tên không được để trống");
      return false;
    }
    if (formData.fullName.length > 150) {
      showAlert.error("Lỗi", "Họ và tên không được vượt quá 150 ký tự");
      return false;
    }
  }

  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    showAlert.error("Lỗi", "Số điện thoại không hợp lệ");
    return false;
  }

  if (formData.emergencyContactPhone && !phoneRegex.test(formData.emergencyContactPhone)) {
    showAlert.error("Lỗi", "Số điện thoại khẩn cấp không hợp lệ");
    return false;
  }

  if (formData.emergencyContactName && formData.emergencyContactName.length > 100) {
    showAlert.error("Lỗi", "Tên người liên hệ khẩn cấp tối đa 100 ký tự");
    return false;
  }

  if (formData.address && formData.address.length > 255) {
    showAlert.error("Lỗi", "Địa chỉ tối đa 255 ký tự");
    return false;
  }

  if (formData.healthNote && formData.healthNote.length > 1000) {
    showAlert.error("Lỗi", "Ghi chú sức khỏe tối đa 1000 ký tự");
    return false;
  }

  if (formData.dateOfBirth) {
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    if (dob >= today) {
      showAlert.error("Lỗi", "Ngày sinh phải ở trong quá khứ");
      return false;
    }
  }

  return true;
};
