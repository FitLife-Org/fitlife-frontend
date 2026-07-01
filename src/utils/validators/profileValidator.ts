import { showAlert } from "../alert";
import type { UpdateProfileRequest } from "../../types/profile.type";

export const validateProfileForm = (formData: UpdateProfileRequest): boolean => {
  if (!formData.fullName || formData.fullName.trim() === "") {
    showAlert.error("Lỗi", "Họ và tên không được để trống");
    return false;
  }
  if (formData.fullName.length > 150) {
    showAlert.error("Lỗi", "Họ và tên không được vượt quá 150 ký tự");
    return false;
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
