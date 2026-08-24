import {
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";
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

import type {
    ApiErrorResponse,
    ValidationErrorData,
} from "../../types/common.type";

/* ============================================================
 * CONSTANT
 * ============================================================ */

const VIETNAM_PHONE_REGEX =
    /^(?:0(?:3|5|7|8|9)[0-9]{8}|\+84(?:3|5|7|8|9)[0-9]{8})$/;

const USERNAME_REGEX =
    /^[a-zA-Z0-9._]+$/;

/* ============================================================
 * BACKEND VALIDATION MESSAGE MAP
 * ============================================================ */

const backendValidationMessageMap: Record<string, string> = {
    "Username is required":
        "Vui lòng nhập tên đăng nhập.",

    "Username must be between 4 and 50 characters":
        "Tên đăng nhập phải từ 4 đến 50 ký tự.",

    "Username may only contain letters, numbers, dots and underscores":
        "Tên đăng nhập chỉ gồm chữ cái, chữ số, dấu chấm và dấu gạch dưới.",

    "Email is required":
        "Vui lòng nhập email.",

    "Email is invalid":
        "Email không đúng định dạng.",

    "Email must not exceed 150 characters":
        "Email không được vượt quá 150 ký tự.",

    "Password is required":
        "Vui lòng nhập mật khẩu.",

    "Confirm password is required":
        "Vui lòng nhập lại mật khẩu.",

    "Full name is required":
        "Vui lòng nhập họ tên.",

    "Full name must be between 2 and 100 characters":
        "Họ tên phải từ 2 đến 100 ký tự.",

    "Phone number is invalid":
        "Số điện thoại không hợp lệ.",
};

/* ============================================================
 * VALIDATION SCHEMA
 * ============================================================ */

const registerSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(
                4,
                "Tên đăng nhập phải có ít nhất 4 ký tự.",
            )
            .max(
                50,
                "Tên đăng nhập không được vượt quá 50 ký tự.",
            )
            .regex(
                USERNAME_REGEX,
                "Tên đăng nhập chỉ gồm chữ cái, chữ số, dấu chấm và dấu gạch dưới.",
            ),

        fullName: z
            .string()
            .trim()
            .min(
                2,
                "Họ tên phải có ít nhất 2 ký tự.",
            )
            .max(
                100,
                "Họ tên không được vượt quá 100 ký tự.",
            ),

        email: z
            .string()
            .trim()
            .min(
                1,
                "Vui lòng nhập email.",
            )
            .email(
                "Email không đúng định dạng.",
            )
            .max(
                150,
                "Email không được vượt quá 150 ký tự.",
            ),

        phone: z
            .string()
            .trim()
            .refine(
                (value) =>
                    value.length === 0 ||
                    VIETNAM_PHONE_REGEX.test(
                        value,
                    ),
                "Số điện thoại không hợp lệ. Ví dụ: 0912345678.",
            ),

        password:
            z.string(),

        confirmPassword:
            z.string(),
    })
    .superRefine(
        (
            data,
            context,
        ) => {
            const passwordError =
                validatePassword(
                    data.password,
                );

            if (passwordError) {
                context.addIssue({
                    code:
                    z.ZodIssueCode
                        .custom,

                    path: [
                        "password",
                    ],

                    message:
                    passwordError,
                });
            }

            const confirmError =
                validateConfirmPassword(
                    data.password,
                    data.confirmPassword,
                );

            if (confirmError) {
                context.addIssue({
                    code:
                    z.ZodIssueCode
                        .custom,

                    path: [
                        "confirmPassword",
                    ],

                    message:
                    confirmError,
                });
            }
        },
    );

/* ============================================================
 * TYPES
 * ============================================================ */

export type RegisterFormData =
    z.infer<
        typeof registerSchema
    >;

type RegisterFieldErrors =
    Partial<
        Record<
            keyof RegisterFormData,
            string
        >
    >;

/* ============================================================
 * INITIAL FORM
 * ============================================================ */

const initialForm:
    RegisterFormData = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

/* ============================================================
 * HELPERS
 * ============================================================ */

function translateBackendMessage(
    message: string,
): string {
    return (
        backendValidationMessageMap[
            message
            ] ??
        message
    );
}

function normalizeBackendField(
    field: string,
):
    | keyof RegisterFormData
    | null {
    switch (
        field
        ) {
        case "username":
        case "fullName":
        case "email":
        case "phone":
        case "password":
        case "confirmPassword":
            return field;

        default:
            return null;
    }
}

function extractBackendValidationErrors(
    error: unknown,
): RegisterFieldErrors | null {
    if (
        !axios.isAxiosError<
            ApiErrorResponse<
                ValidationErrorData
            >
        >(error)
    ) {
        return null;
    }

    const response =
        error.response?.data;

    if (
        !response ||
        response.code !== 1001 ||
        !response.data ||
        typeof response.data !==
        "object" ||
        Array.isArray(
            response.data,
        )
    ) {
        return null;
    }

    const fieldErrors:
        RegisterFieldErrors = {};

    Object.entries(
        response.data,
    ).forEach(
        (
            [
                backendField,
                backendMessage,
            ],
        ) => {
            const field =
                normalizeBackendField(
                    backendField,
                );

            if (!field) {
                return;
            }

            fieldErrors[field] =
                translateBackendMessage(
                    String(
                        backendMessage,
                    ),
                );
        },
    );

    return Object.keys(
        fieldErrors,
    ).length > 0
        ? fieldErrors
        : null;
}

/* ============================================================
 * HOOK
 * ============================================================ */

export function useRegisterLogic() {
    const navigate =
        useNavigate();

    const [
        form,
        setForm,
    ] =
        useState<
            RegisterFormData
        >(
            initialForm,
        );

    const [
        error,
        setError,
    ] =
        useState("");

    const [
        fieldErrors,
        setFieldErrors,
    ] =
        useState<
            RegisterFieldErrors
        >({});

    const [
        loading,
        setLoading,
    ] =
        useState(false);

    const containerRef =
        useRef<HTMLElement>(
            null,
        );

    const introRef =
        useRef<HTMLElement>(
            null,
        );

    const formRef =
        useRef<HTMLDivElement>(
            null,
        );

    /* ========================================================
     * FIELD CHANGE
     * ======================================================== */

    const updateField = (
        event:
        ChangeEvent<HTMLInputElement>,
    ): void => {
        const {
            name,
            value,
        } =
            event.target;

        const fieldName =
            name as keyof RegisterFormData;

        setForm(
            (
                previous,
            ) => ({
                ...previous,
                [fieldName]:
                value,
            }),
        );

        if (
            fieldErrors[
                fieldName
                ]
        ) {
            setFieldErrors(
                (
                    previous,
                ) => ({
                    ...previous,
                    [fieldName]:
                    undefined,
                }),
            );
        }

        if (error) {
            setError("");
        }
    };

    /* ========================================================
     * SUBMIT
     * ======================================================== */

    const handleSubmit =
        async (
            event:
            FormEvent<HTMLFormElement>,
        ): Promise<void> => {
            event.preventDefault();

            if (loading) {
                return;
            }

            setError("");
            setFieldErrors(
                {},
            );

            const validationResult =
                registerSchema.safeParse(
                    form,
                );

            /*
             * FE validation.
             *
             * Không gửi request nếu dữ liệu
             * đã sai ngay từ client.
             */
            if (
                !validationResult.success
            ) {
                const errors =
                    validationResult.error
                        .flatten()
                        .fieldErrors;

                setFieldErrors({
                    username:
                        errors
                            .username?.[
                            0
                            ],

                    fullName:
                        errors
                            .fullName?.[
                            0
                            ],

                    email:
                        errors
                            .email?.[
                            0
                            ],

                    phone:
                        errors
                            .phone?.[
                            0
                            ],

                    password:
                        errors
                            .password?.[
                            0
                            ],

                    confirmPassword:
                        errors
                            .confirmPassword?.[
                            0
                            ],
                });

                return;
            }

            try {
                setLoading(
                    true,
                );

                const data =
                    validationResult.data;

                await authService.register(
                    {
                        username:
                            data.username
                                .trim()
                                .toLowerCase(),

                        fullName:
                            data.fullName
                                .trim(),

                        email:
                            data.email
                                .trim()
                                .toLowerCase(),

                        phone:
                            data.phone
                                .trim() ||
                            undefined,

                        password:
                        data.password,

                        confirmPassword:
                        data.confirmPassword,
                    },
                );

                /*
                 * Đăng ký thành công.
                 */
                await showAlert.success(
                    "Đăng ký thành công",
                    "Vui lòng kiểm tra email để xác minh tài khoản.",
                );

                navigate(
                    ROUTES.CHECK_EMAIL,
                    {
                        replace:
                            true,

                        state: {
                            email:
                                data.email
                                    .trim()
                                    .toLowerCase(),
                        },
                    },
                );
            } catch (
                registerError:
                unknown
                ) {
                /*
                 * Validation lỗi từ BE.
                 *
                 * Ví dụ:
                 *
                 * {
                 *   code: 1001,
                 *   message: "Validation failed",
                 *   data: {
                 *     phone:
                 *       "Phone number is invalid"
                 *   }
                 * }
                 */
                const backendFieldErrors =
                    extractBackendValidationErrors(
                        registerError,
                    );

                if (
                    backendFieldErrors
                ) {
                    setFieldErrors(
                        backendFieldErrors,
                    );

                    /*
                     * Không bật popup
                     * "Validation failed".
                     *
                     * Lỗi sẽ hiển thị
                     * trực tiếp dưới input.
                     */
                    return;
                }

                /*
                 * Business/system error.
                 */
                const message =
                    extractErrorMessage(
                        registerError,
                    );

                setError(
                    message,
                );

                await showAlert.error(
                    "Đăng ký thất bại",
                    message,
                );
            } finally {
                setLoading(
                    false,
                );
            }
        };

    /* ========================================================
     * ANIMATION
     * ======================================================== */

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
                        opacity:
                            0,
                        x: 50,
                    },

                    {
                        opacity:
                            1,
                        x: 0,
                        duration:
                            0.8,
                        stagger:
                            0.2,
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
                        opacity:
                            0,
                        y: 30,
                        scale:
                            0.95,
                    },

                    {
                        opacity:
                            1,
                        y: 0,
                        scale:
                            1,
                        duration:
                            0.8,
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