import { isEmail } from "../validation";
import type { LoginRequest } from "../../types/auth.type";

export const validateLogin = (data: LoginRequest): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.email?.trim()) {
    errors.email = "Email không được để trống.";
  } else if (!isEmail(data.email)) {
    errors.email = "Email không hợp lệ.";
  }

  if (!data.password?.trim()) {
    errors.password = "Mật khẩu không được để trống.";
  }

  return errors;
};
