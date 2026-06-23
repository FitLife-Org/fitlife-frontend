import type { LoginRequest } from "../../types/auth.type";

export const validateLogin = (data: LoginRequest): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.identifier?.trim()) {
    errors.identifier = "Email hoặc tên đăng nhập không được để trống.";
  }

  if (!data.password?.trim()) {
    errors.password = "Mật khẩu không được để trống.";
  }

  return errors;
};
