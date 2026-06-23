type ForgotPasswordForm = {
    email: string;
};

export function validateForgotPassword(form: ForgotPasswordForm) {
    const errors: Record<string, string> = {};

    if (!form.email.trim()) {
        errors.email = "Email là bắt buộc.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        errors.email = "Email không hợp lệ.";
    }

    return errors;
}