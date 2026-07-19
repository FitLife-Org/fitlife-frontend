import type { AdminMemberCreateRequest, AdminMemberUpdateRequest } from "../types/member.type";

export interface ValidationErrors {
  [key: string]: string;
}

const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateMemberForm = (
  data: Partial<AdminMemberCreateRequest>,
  isEdit: boolean
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.username?.trim()) {
    errors.username = "Tên đăng nhập không được để trống";
  } else if (data.username.length > 100) {
    errors.username = "Tên đăng nhập quá dài (tối đa 100 ký tự)";
  }

  if (!data.email?.trim()) {
    errors.email = "Email không được để trống";
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = "Email không đúng định dạng";
  } else if (data.email.length > 150) {
    errors.email = "Email quá dài (tối đa 150 ký tự)";
  }

  if (!isEdit) {
    if (!data.password?.trim()) {
      errors.password = "Mật khẩu không được để trống";
    } else if (data.password.length < 6 || data.password.length > 100) {
      errors.password = "Mật khẩu phải từ 6 đến 100 ký tự";
    }
  }

  if (!data.fullName?.trim()) {
    errors.fullName = "Họ tên không được để trống";
  }

  if (data.phone && !PHONE_REGEX.test(data.phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  if (data.emergencyContactPhone && !PHONE_REGEX.test(data.emergencyContactPhone)) {
    errors.emergencyContactPhone = "Số điện thoại khẩn cấp không hợp lệ";
  }

  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    if (dob >= new Date()) {
      errors.dateOfBirth = "Ngày sinh phải là ngày trong quá khứ";
    }
  }

  if (data.address && data.address.length > 255) {
    errors.address = "Địa chỉ quá dài (tối đa 255 ký tự)";
  }

  if (data.emergencyContactName && data.emergencyContactName.length > 100) {
    errors.emergencyContactName = "Tên người liên hệ khẩn cấp quá dài (tối đa 100 ký tự)";
  }

  if (data.healthNote && data.healthNote.length > 1000) {
    errors.healthNote = "Ghi chú sức khỏe quá dài (tối đa 1000 ký tự)";
  }

  return errors;
};
