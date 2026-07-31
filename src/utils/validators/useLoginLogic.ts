import {
    useCallback,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";

import type {
    CredentialResponse,
} from "@react-oauth/google";

import {
    useNavigate,
} from "react-router-dom";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { z } from "zod";

import {
    authService,
    extractErrorCode,
    extractErrorMessage,
} from "../../services/authService";

import { useAuthStore } from "../../store/authStore";

import {
    getRedirectPathByRoles,
} from "../authRedirect";

import { showAlert } from "../alert";

import { ROUTES } from "../../config/routes";

import type {
    AuthSession,
} from "../../types/auth.type";

const EMAIL_NOT_VERIFIED_CODE = 5018;

const REMEMBERED_IDENTIFIER_KEY =
    "fitlife.rememberedIdentifier";

const LEGACY_IDENTIFIER_KEY =
    "fitlife_remembered_identifier";

const loginSchema = z.object({
    identifier: z
        .string()
        .trim()
        .min(
            1,
            "Vui lòng nhập thông tin đăng nhập",
        )
        .refine(
            (value) => {
                if (value.includes(" ")) {
                    return false;
                }

                const validEmail =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                        value,
                    );

                const validUsername =
                    /^[a-zA-Z0-9_]+$/.test(
                        value,
                    );

                return (
                    validEmail ||
                    validUsername
                );
            },
            {
                message:
                    "Chỉ được nhập tên tài khoản hoặc email",
            },
        ),

    password: z
        .string()
        .min(
            1,
            "Vui lòng nhập mật khẩu",
        ),
});

type LoginFormData =
    z.infer<typeof loginSchema>;

type LoginFieldErrors =
    Partial<
        Record<
            keyof LoginFormData,
            string
        >
    >;

function canUseWindow(): boolean {
    return (
        typeof window !== "undefined"
    );
}

function getRememberedIdentifier():
    string {
    if (!canUseWindow()) {
        return "";
    }

    const currentIdentifier =
        window.localStorage.getItem(
            REMEMBERED_IDENTIFIER_KEY,
        );

    if (currentIdentifier) {
        return currentIdentifier;
    }

    const legacyIdentifier =
        window.localStorage.getItem(
            LEGACY_IDENTIFIER_KEY,
        );

    if (legacyIdentifier) {
        window.localStorage.setItem(
            REMEMBERED_IDENTIFIER_KEY,
            legacyIdentifier,
        );

        window.localStorage.removeItem(
            LEGACY_IDENTIFIER_KEY,
        );

        return legacyIdentifier;
    }

    return "";
}

function normalizeIdentifier(
    identifier: string,
): string {
    const normalized =
        identifier.trim();

    return normalized.includes("@")
        ? normalized.toLowerCase()
        : normalized;
}

export function useLoginLogic() {
    const navigate =
        useNavigate();

    const setSession =
        useAuthStore(
            (state) =>
                state.setSession,
        );

    const rememberedIdentifier =
        getRememberedIdentifier();

    const [
        formData,
        setFormData,
    ] = useState<LoginFormData>({
        identifier:
        rememberedIdentifier,

        password: "",
    });

    const [
        rememberMe,
        setRememberMe,
    ] = useState(
        Boolean(
            rememberedIdentifier,
        ),
    );

    const [
        error,
        setError,
    ] = useState("");

    const [
        fieldErrors,
        setFieldErrors,
    ] = useState<LoginFieldErrors>(
        {},
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const containerRef =
        useRef<HTMLElement>(null);

    const introRef =
        useRef<HTMLElement>(null);

    const formRef =
        useRef<HTMLDivElement>(null);

    const handleInputChange =
        useCallback(
            (
                event:
                ChangeEvent<HTMLInputElement>,
            ) => {
                const {
                    name,
                    value,
                } = event.target;

                const fieldName =
                    name as keyof LoginFormData;

                setFormData(
                    (previous) => ({
                        ...previous,
                        [fieldName]:
                        value,
                    }),
                );

                setFieldErrors(
                    (previous) => ({
                        ...previous,
                        [fieldName]:
                        undefined,
                    }),
                );

                setError("");
            },
            [],
        );

    const handleRememberMeChange =
        useCallback(
            (
                checked: boolean,
            ) => {
                setRememberMe(
                    checked,
                );

                if (
                    !checked &&
                    canUseWindow()
                ) {
                    window.localStorage
                        .removeItem(
                            REMEMBERED_IDENTIFIER_KEY,
                        );

                    window.localStorage
                        .removeItem(
                            LEGACY_IDENTIFIER_KEY,
                        );
                }
            },
            [],
        );

    const persistRememberedIdentifier =
        useCallback(
            (
                identifier: string,
            ) => {
                if (!canUseWindow()) {
                    return;
                }

                if (rememberMe) {
                    window.localStorage.setItem(
                        REMEMBERED_IDENTIFIER_KEY,
                        identifier,
                    );
                } else {
                    window.localStorage.removeItem(
                        REMEMBERED_IDENTIFIER_KEY,
                    );
                }

                window.localStorage.removeItem(
                    LEGACY_IDENTIFIER_KEY,
                );
            },
            [
                rememberMe,
            ],
        );

    const completeLogin =
        useCallback(
            (
                session: AuthSession,
                shouldRemember:
                boolean,
            ) => {
                setSession(
                    session,
                    shouldRemember,
                );

                navigate(
                    getRedirectPathByRoles(
                        session.user.roles,
                    ),
                    {
                        replace: true,
                    },
                );
            },
            [
                navigate,
                setSession,
            ],
        );

    const handleGoogleSuccess =
        useCallback(
            async (
                credentialResponse:
                CredentialResponse,
            ) => {
                if (loading) {
                    return;
                }

                setLoading(true);
                setError("");
                setFieldErrors({});

                try {
                    const idToken =
                        credentialResponse
                            .credential;

                    if (!idToken) {
                        throw new Error(
                            "Google không trả về ID Token.",
                        );
                    }

                    const session =
                        await authService
                            .googleLogin(
                                idToken,
                            );

                    completeLogin(
                        session,
                        rememberMe,
                    );

                    showAlert.success(
                        "Thành công",
                        "Đăng nhập Google thành công!",
                    );
                } catch (
                    googleError: unknown
                    ) {
                    const message =
                        extractErrorMessage(
                            googleError,
                        );

                    setError(
                        message,
                    );

                    showAlert.error(
                        "Đăng nhập thất bại",
                        message,
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                completeLogin,
                loading,
                rememberMe,
            ],
        );

    const handleGoogleError =
        useCallback(() => {
            const message =
                "Đăng nhập Google thất bại. Vui lòng thử lại.";

            setError(message);

            showAlert.error(
                "Đăng nhập thất bại",
                message,
            );
        }, []);

    const handleSubmit =
        useCallback(
            async (
                event:
                FormEvent<HTMLFormElement>,
            ) => {
                event.preventDefault();

                if (loading) {
                    return;
                }

                setError("");
                setFieldErrors({});

                const validationResult =
                    loginSchema.safeParse(
                        formData,
                    );

                if (
                    !validationResult.success
                ) {
                    const errors =
                        validationResult
                            .error
                            .flatten()
                            .fieldErrors;

                    setFieldErrors({
                        identifier:
                            errors.identifier?.[0],

                        password:
                            errors.password?.[0],
                    });

                    return;
                }

                setLoading(true);

                const normalizedIdentifier =
                    normalizeIdentifier(
                        validationResult
                            .data
                            .identifier,
                    );

                try {
                    const session =
                        await authService.login({
                            identifier:
                            normalizedIdentifier,

                            password:
                            validationResult
                                .data
                                .password,
                        });

                    persistRememberedIdentifier(
                        normalizedIdentifier,
                    );

                    completeLogin(
                        session,
                        rememberMe,
                    );

                    showAlert.success(
                        "Thành công",
                        "Đăng nhập thành công!",
                    );
                } catch (
                    loginError: unknown
                    ) {
                    const errorCode =
                        extractErrorCode(
                            loginError,
                        );

                    const message =
                        extractErrorMessage(
                            loginError,
                        );

                    if (
                        errorCode ===
                        EMAIL_NOT_VERIFIED_CODE
                    ) {
                        showAlert.warning(
                            "Email chưa xác minh",
                            message,
                        );

                        navigate(
                            ROUTES.CHECK_EMAIL,
                            {
                                state: {
                                    email:
                                        normalizedIdentifier
                                            .includes("@")
                                            ? normalizedIdentifier
                                            : "",
                                },
                            },
                        );

                        return;
                    }

                    setError(message);

                    showAlert.error(
                        "Đăng nhập thất bại",
                        message,
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                completeLogin,
                formData,
                loading,
                navigate,
                persistRememberedIdentifier,
                rememberMe,
            ],
        );

    useGSAP(
        () => {
            const timeline =
                gsap.timeline();

            if (
                introRef.current
            ) {
                timeline.fromTo(
                    introRef.current
                        .children,
                    {
                        opacity: 0,
                        x: -50,
                    },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        stagger: 0.2,
                        ease:
                            "power3.out",
                    },
                );
            }

            if (
                formRef.current
            ) {
                timeline.fromTo(
                    formRef.current,
                    {
                        opacity: 0,
                        y: 30,
                        scale: 0.95,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        ease:
                            "power3.out",
                    },
                    "-=0.4",
                );
            }
        },
        {
            scope:
            containerRef,
        },
    );

    return {
        formData,
        error,
        fieldErrors,
        loading,
        rememberMe,

        containerRef,
        introRef,
        formRef,

        handleInputChange,
        handleRememberMeChange,
        handleGoogleSuccess,
        handleGoogleError,
        handleSubmit,

        setError,
    };
}