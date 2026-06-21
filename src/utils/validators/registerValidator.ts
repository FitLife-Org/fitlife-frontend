type RegisterForm = {
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
};

export function validateRegister(form: RegisterForm) {
  const errors: Record<string, string> = {};

  if (!form.username.trim()) {
    errors.username = "Tên đăng nhập là bắt buộc.";
  } else if (form.username.trim().length < 4) {
    errors.username = "Tên đăng nhập phải có ít nhất 4 ký tự.";
  }

  if (!form.fullName.trim()) {
    errors.fullName = "Họ tên là bắt buộc.";
  }

  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc.";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Email không hợp lệ.";
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

  if (!form.confirmPassword) {
    errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  return errors;
}