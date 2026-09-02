import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";   
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email là bắt buộc.")
        .email("Email không hợp lệ.")
        .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function useForgotPasswordLogic() {
    const navigate = useNavigate();

    const [form, setForm] = useState<ForgotPasswordFormData>({
        email: "",
    });

    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ForgotPasswordFormData, string>>>({});
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const updateField = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (fieldErrors[name as keyof ForgotPasswordFormData]) {
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

        const validationResult = forgotPasswordSchema.safeParse(form);

        if (!validationResult.success) {
            const formattedErrors = validationResult.error.flatten().fieldErrors;
            setFieldErrors({
                email: formattedErrors.email?.[0],
            });
            return;
        }

        setLoading(true);

        try {
            const validData = validationResult.data;

            const message = await authService.forgotPassword({
                email: validData.email,
            });

            setSuccessMessage(message);

            setTimeout(() => {
                navigate(ROUTES.RESET_PASSWORD, {
                    state: {
                        email: validData.email,
                    },
                });
            }, 800);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể gửi OTP. Vui lòng thử lại."
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