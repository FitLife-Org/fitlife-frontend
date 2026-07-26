import {
    useState,
    useRef,
    useCallback,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type { CredentialResponse } from "@react-oauth/google";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { z } from "zod";

import {
    authService,
    extractErrorCode,
    extractErrorMessage,
} from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { getRedirectPathByRoles } from "../authRedirect";
import { showAlert } from "../../utils/alert";
import { ROUTES } from "../../config/routes";

const EMAIL_NOT_VERIFIED_CODE = 5018;

const loginSchema = z.object({
    identifier: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập thông tin đăng nhập")
        .refine(
            (value) => {
                if (value.includes(" ")) return false;
                const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                const validUsername = /^[a-zA-Z0-9_]+$/.test(value);
                return validEmail || validUsername;
            },
            { message: "Chỉ được nhập tên tài khoản hoặc email" },
        ),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginLogic() {
    const navigate = useNavigate();
    const setSession = useAuthStore((state) => state.setSession);
    const [formData, setFormData] = useState<LoginFormData>({
        identifier: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<keyof LoginFormData, string>>
    >({});
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const introRef = useRef<HTMLElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((previous) => ({ ...previous, [name]: value }));
        const fieldName = name as keyof LoginFormData;
        if (fieldErrors[fieldName]) {
            setFieldErrors((previous) => ({
                ...previous,
                [fieldName]: undefined,
            }));
        }
        if (error) setError("");
    };

    const handleGoogleSuccess = useCallback(
        async (credentialResponse: CredentialResponse) => {
            try {
                setLoading(true);
                setError("");
                const idToken = credentialResponse.credential;
                if (!idToken) {
                    throw new Error("Không nhận được ID token từ Google.");
                }
                const session = await authService.googleLogin(idToken);
                setSession(session);
                showAlert.success("Thành công", "Đăng nhập Google thành công!");
                navigate(getRedirectPathByRoles(session.user.roles), {
                    replace: true,
                });
            } catch (googleError: unknown) {
                const message = extractErrorMessage(googleError);
                setError(message);
                showAlert.error("Đăng nhập thất bại", message);
            } finally {
                setLoading(false);
            }
        },
        [navigate, setSession],
    );

    const handleGoogleError = useCallback(() => {
        const message = "Đăng nhập Google thất bại. Vui lòng thử lại.";
        setError(message);
        showAlert.error("Đăng nhập thất bại", message);
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setFieldErrors({});

        const validationResult = loginSchema.safeParse(formData);
        if (!validationResult.success) {
            const errors = validationResult.error.flatten().fieldErrors;
            setFieldErrors({
                identifier: errors.identifier?.[0],
                password: errors.password?.[0],
            });
            return;
        }

        setLoading(true);
        try {
            const data = validationResult.data;
            const session = await authService.login({
                identifier: data.identifier.trim().toLowerCase(),
                password: data.password,
            });
            setSession(session);
            showAlert.success("Thành công", "Đăng nhập thành công!");
            navigate(getRedirectPathByRoles(session.user.roles), {
                replace: true,
            });
        } catch (loginError: unknown) {
            const errorCode = extractErrorCode(loginError);
            const message = extractErrorMessage(loginError);
            if (errorCode === EMAIL_NOT_VERIFIED_CODE) {
                showAlert.warning("Email chưa xác minh", message);
                navigate(ROUTES.CHECK_EMAIL, {
                    state: {
                        email: formData.identifier.includes("@")
                            ? formData.identifier.trim().toLowerCase()
                            : "",
                    },
                });
                return;
            }
            setError(message);
            showAlert.error("Đăng nhập thất bại", message);
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
                    { opacity: 0, x: -50 },
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
        formData,
        error,
        fieldErrors,
        loading,
        containerRef,
        introRef,
        formRef,
        handleInputChange,
        handleGoogleSuccess,
        handleGoogleError,
        handleSubmit,
        setError,
    };
}
