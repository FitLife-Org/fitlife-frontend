import { useState, type ChangeEvent, type FormEvent } from "react";
import { z } from "zod";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { authService } from "../../features/auth/services/authService";

export const resetPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email là bắt buộc.")
        .email("Email không hợp lệ.")
        .trim(),
    otp: z
        .string()
        .min(1, "OTP là bắt buộc.")
        .regex(/^\d{6}$/, "OTP phải gồm 6 chữ số.")
        .trim(),
    newPassword: z
        .string()
        .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    confirmPassword: z
        .string()
        .min(1, "Vui lòng xác nhận mật khẩu.")
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type ResetPasswordLocationState = {
    email?: string;
};

export function useResetPasswordLogic() {
    const navigate = useNavigate();
    const location = useLocation();

    const locationState = location.state as ResetPasswordLocationState | null;

    const [form, setForm] = useState<ResetPasswordFormData>({
        email: locationState?.email || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const updateField = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        const nextValue = name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value;

        setForm((prev) => ({
            ...prev,
            [name]: nextValue,
        }));

        if (fieldErrors[name as keyof ResetPasswordFormData]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccessMessage("");
        setFieldErrors({});

        // Validate với Zod
        const validationResult = resetPasswordSchema.safeParse(form);

        if (!validationResult.success) {
            const formattedErrors = validationResult.error.flatten().fieldErrors;
            setFieldErrors({
                email: formattedErrors.email?.[0],
                otp: formattedErrors.otp?.[0],
                newPassword: formattedErrors.newPassword?.[0],
                confirmPassword: formattedErrors.confirmPassword?.[0],
            });
            return;
        }

        setLoading(true);

        try {
            const validData = validationResult.data;

            const message = await authService.resetPassword({
                email: validData.email,
                otp: validData.otp,
                newPassword: validData.newPassword,
                confirmPassword: validData.confirmPassword,
            });

            setSuccessMessage(message);

            setTimeout(() => {
                navigate(ROUTES.LOGIN, {
                    replace: true,
                });
            }, 1000);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể đặt lại mật khẩu. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        form,
        fieldErrors,
        error,
        successMessage,
        loading,
        updateField,
        handleSubmit,
    };
}