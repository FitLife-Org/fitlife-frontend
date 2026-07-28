import {
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { z } from "zod";

import {
    authService,
    extractErrorMessage,
} from "../../services/authService";
import { ROUTES } from "../../config/routes";
import { showAlert } from "../alert";
import {
    validateConfirmPassword,
    validatePassword,
} from "./passwordPolicy";

const registerSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(4, "Tên đăng nhập phải có ít nhất 4 ký tự.")
            .max(50, "Tên đăng nhập không được vượt quá 50 ký tự.")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Tên đăng nhập chỉ gồm chữ cái, chữ số và dấu gạch dưới.",
            ),
        fullName: z
            .string()
            .trim()
            .min(1, "Vui lòng nhập họ tên.")
            .max(100, "Họ tên không được vượt quá 100 ký tự."),
        email: z.string().trim().email("Email không đúng định dạng."),
        phone: z
            .string()
            .trim()
            .max(20, "Số điện thoại không được vượt quá 20 ký tự.")
            .refine(
                (value) => value.length === 0 || /^[0-9+\-\s()]+$/.test(value),
                "Số điện thoại không đúng định dạng.",
            ),
        password: z.string(),
        confirmPassword: z.string(),
    })
    .superRefine((data, context) => {
        const passwordError = validatePassword(data.password);
        if (passwordError) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["password"],
                message: passwordError,
            });
        }

        const confirmError = validateConfirmPassword(
            data.password,
            data.confirmPassword,
        );
        if (confirmError) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: confirmError,
            });
        }
    });

export type RegisterFormData = z.infer<typeof registerSchema>;
type RegisterFieldErrors = Partial<
    Record<keyof RegisterFormData, string>
>;

const initialForm: RegisterFormData = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

export function useRegisterLogic() {
    const navigate = useNavigate();
    const [form, setForm] = useState<RegisterFormData>(initialForm);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const introRef = useRef<HTMLElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const updateField = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        const fieldName = name as keyof RegisterFormData;

        setForm((previous) => ({
            ...previous,
            [fieldName]: value,
        }));

        if (fieldErrors[fieldName]) {
            setFieldErrors((previous) => ({
                ...previous,
                [fieldName]: undefined,
            }));
        }
        if (error) setError("");
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        event.preventDefault();
        setError("");
        setFieldErrors({});

        const validationResult = registerSchema.safeParse(form);
        if (!validationResult.success) {
            const errors = validationResult.error.flatten().fieldErrors;
            setFieldErrors({
                username: errors.username?.[0],
                fullName: errors.fullName?.[0],
                email: errors.email?.[0],
                phone: errors.phone?.[0],
                password: errors.password?.[0],
                confirmPassword: errors.confirmPassword?.[0],
            });
            return;
        }

        try {
            setLoading(true);
            const data = validationResult.data;

            await authService.register({
                username: data.username.trim().toLowerCase(),
                fullName: data.fullName.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone.trim() || undefined,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });

            showAlert.success(
                "Đăng ký thành công",
                "Vui lòng kiểm tra email để xác minh tài khoản.",
            );

            navigate(ROUTES.CHECK_EMAIL, {
                replace: true,
                state: { email: data.email.trim().toLowerCase() },
            });
        } catch (registerError: unknown) {
            const message = extractErrorMessage(registerError);
            setError(message);
            showAlert.error("Đăng ký thất bại", message);
        } finally {
            setLoading(false);
        }
    };

    useGSAP(
        () => {
            const timeline = gsap.timeline();
            if (introRef.current) {
                timeline.fromTo(
                    introRef.current.children,
                    { opacity: 0, x: 50 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        stagger: 0.2,
                        ease: "power3.out",
                    },
                );
            }

            if (formRef.current) {
                timeline.fromTo(
                    formRef.current,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        ease: "power3.out",
                    },
                    "-=0.4",
                );
            }
        },
        { scope: containerRef },
    );

    return {
        form,
        error,
        fieldErrors,
        loading,
        containerRef,
        introRef,
        formRef,
        updateField,
        handleSubmit,
    };
}
