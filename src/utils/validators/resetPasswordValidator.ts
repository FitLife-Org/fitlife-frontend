type ResetPasswordForm = {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
};

export function validateResetPassword(form: ResetPasswordForm) {
    const errors: Record<string, string> = {};

    if (!form.email.trim()) {
        errors.email = "Email là bắt buộc.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Email không hợp lệ.";
    }

    if (!form.otp.trim()) {
        errors.otp = "OTP là bắt buộc.";
    } else if (!/^\d{6}$/.test(form.otp.trim())) {
        errors.otp = "OTP phải gồm 6 chữ số.";
    }

    if (!form.newPassword) {
        errors.newPassword = "Mật khẩu mới là bắt buộc.";
    } else if (form.newPassword.length < 6) {
        errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự.";
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (form.newPassword !== form.confirmPassword) {
        errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    return errors;
}