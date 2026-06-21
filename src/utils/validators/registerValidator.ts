import { isEmail, isVietnamesePhone } from "../validation";
import type { RegisterRequest } from "../../types/auth.type";

export interface RegisterFormData extends RegisterRequest {
  confirmPassword?: string;
}

export const validateRegister = (data: RegisterFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Họ tên không được để trống.";
  }

  if (!data.email?.trim()) {
    errors.email = "Email không được để trống.";
  } else if (!isEmail(data.email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (data.phone && !isVietnamesePhone(data.phone)) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (!data.password) {
    errors.password = "Mật khẩu không được để trống.";
  } else {
    if (data.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    } else if (!/[A-Z]/.test(data.password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 chữ viết hoa.";
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 chữ số.";
    }
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  return errors;
};
