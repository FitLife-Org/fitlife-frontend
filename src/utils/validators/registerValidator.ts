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
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) {
    errors.username = "Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới.";
  }

  if (!form.fullName.trim()) {
    errors.fullName = "Họ tên là bắt buộc.";
  }

  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Email không hợp lệ.";
  }

  if (form.phone && !/^(0|\+84)[0-9]{9,10}$/.test(form.phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (!form.password) {
    errors.password = "Mật khẩu là bắt buộc.";
  } else if (form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
  }

  return errors;
}