export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export type PasswordChecks = {
    notBlank: boolean;
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
    return {
        notBlank: password.trim().length > 0,
        minLength: password.length >= PASSWORD_MIN_LENGTH,
        hasLetter: /[A-Za-z]/.test(password),
        hasNumber: /\d/.test(password),
    };
}

export function validatePassword(password: string): string | null {
    const checks = getPasswordChecks(password);

    if (!checks.notBlank) {
        return "Mật khẩu không được để trống hoặc chỉ gồm khoảng trắng.";
    }
    if (!checks.minLength) {
        return "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (!checks.hasLetter) {
        return "Mật khẩu phải có ít nhất một chữ cái.";
    }
    if (!checks.hasNumber) {
        return "Mật khẩu phải có ít nhất một chữ số.";
    }
    return null;
}

export function validateConfirmPassword(
    password: string,
    confirmPassword: string,
): string | null {
    if (!confirmPassword.trim()) {
        return "Vui lòng nhập xác nhận mật khẩu.";
    }
    if (password !== confirmPassword) {
        return "Mật khẩu và xác nhận mật khẩu không khớp.";
    }
    return null;
}
