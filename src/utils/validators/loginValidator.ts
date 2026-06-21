type LoginForm = {
  email: string;
  password: string;
};

export function validateLogin(form: LoginForm) {
  const errors: Record<string, string> = {};

  if (!form.email.trim()) {
    errors.email = "Email hoặc tên đăng nhập là bắt buộc.";
  }

  if (!form.password) {
    errors.password = "Mật khẩu là bắt buộc.";
  }

  return errors;
}