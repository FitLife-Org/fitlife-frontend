import { isEmail, isVietnamesePhone } from "../validation";
import type { RegisterRequest } from "../../types/auth.type";

export interface RegisterFormData extends RegisterRequest {
  confirmPassword?: string;
}

export const validateRegister = (data: RegisterFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.username?.trim()) {
    errors.username = "Tên đăng nhập không được để trống.";
  } else if (data.username.length < 4 || data.username.length > 50) {
    errors.username = "Tên đăng nhập phải từ 4 đến 50 ký tự.";
  }

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
  if (data.phone && data.phone.length < 10) {
    errors.phone = "Số điện thoại phải có ít nhất 10 ký tự.";
  }
  
  if (!data.password) {
    errors.password = "Mật khẩu không được để trống.";
  } else if (data.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  return errors;
};
