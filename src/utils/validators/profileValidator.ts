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

  if (formData.emergencyContactName && formData.emergencyContactName.length > 100) {
    showAlert.error("Lỗi", "Tên người liên hệ khẩn cấp không vượt quá 100 ký tự");
    return false;
  }

  if (formData.healthNote && formData.healthNote.length > 1000) {
    showAlert.error("Lỗi", "Ghi chú sức khỏe không được vượt quá 1000 ký tự");
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

export const validateChangePassword = (oldPass: string, newPass: string, confirmPass: string): boolean => {
  if (!oldPass || !newPass || !confirmPass) {
    showAlert.error("L?i", "Vui l?ng �i?n �?y �? th�ng tin m?t kh?u");
    return false;
  }
  if (newPass !== confirmPass) {
    showAlert.error("L?i", "M?t kh?u m?i kh�ng tr�ng kh?p");
    return false;
  }
  if (newPass.length < 6) {
    showAlert.error("L?i", "M?t kh?u ph?i t? 6 k? t? tr? l�n");
    return false;
  }
  return true;
};
