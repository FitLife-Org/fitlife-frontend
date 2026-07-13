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

import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { showAlert } from "../alert";
import { getRedirectPathByRoles } from "../authRedirect";

const registerSchema = z
    .object({
      username: z
          .string()
          .trim()
          .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
          .regex(
              /^[a-zA-Z0-9_]+$/,
              "Chỉ chứa chữ cái không dấu, số và dấu gạch dưới",
          ),

      fullName: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập họ và tên"),

      email: z
          .string()
          .trim()
          .min(1, "Vui lòng nhập email")
          .email("Định dạng email không hợp lệ"),

      phone: z
          .string()
          .trim()
          .regex(
              /^(0|\+84)[35789][0-9]{8}$/,
              "Số điện thoại không hợp lệ",
          ),

      password: z
          .string()
          .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),

      confirmPassword: z
          .string()
          .min(1, "Vui lòng xác nhận mật khẩu"),
    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
          message: "Mật khẩu xác nhận không khớp",
          path: ["confirmPassword"],
        },
    );

type RegisterFormData = z.infer<
    typeof registerSchema
>;

export function useRegisterLogic() {
  const navigate = useNavigate();

  /*
   * Chỉ dùng setSession cho Google login.
   * Đăng ký LOCAL không tạo session.
   */
  const setSession = useAuthStore(
      (state) => state.setSession,
  );

  const [form, setForm] =
      useState<RegisterFormData>({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] =
      useState<
          Partial<
              Record<keyof RegisterFormData, string>
          >
      >({});

  const [loading, setLoading] =
      useState(false);

  const containerRef =
      useRef<HTMLElement>(null);

  const introRef =
      useRef<HTMLElement>(null);

  const formRef =
      useRef<HTMLDivElement>(null);

  const updateField = (
      event: ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    const fieldName =
        name as keyof RegisterFormData;

    if (fieldErrors[fieldName]) {
      setFieldErrors((previous) => ({
        ...previous,
        [fieldName]: undefined,
      }));
    }

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (
      event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setFieldErrors({});

    const validationResult =
        registerSchema.safeParse(form);

    if (!validationResult.success) {
      const formattedErrors =
          validationResult.error.flatten()
              .fieldErrors;

      setFieldErrors({
        username:
            formattedErrors.username?.[0],
        fullName:
            formattedErrors.fullName?.[0],
        email:
            formattedErrors.email?.[0],
        phone:
            formattedErrors.phone?.[0],
        password:
            formattedErrors.password?.[0],
        confirmPassword:
            formattedErrors.confirmPassword?.[0],
      });

      return;
    }

    setLoading(true);

    try {
      const validData =
          validationResult.data;

      const normalizedEmail =
          validData.email
              .trim()
              .toLowerCase();

      await authService.register({
        username: validData.username
            .trim()
            .toLowerCase(),

        fullName:
            validData.fullName.trim(),

        email: normalizedEmail,

        phone: validData.phone.trim(),

        password: validData.password,
      });

      showAlert.success(
          "Đăng ký thành công",
          "Vui lòng kiểm tra email để xác minh tài khoản.",
      );

      /*
       * Không setSession.
       * Không chuyển MEMBER_HOME.
       */
      navigate(ROUTES.CHECK_EMAIL, {
        replace: true,
        state: {
          email: normalizedEmail,
        },
      });
    } catch (submitError: unknown) {
      const message =
          submitError instanceof Error
              ? submitError.message
              : "Đăng ký thất bại.";

      setError(message);

      showAlert.error(
          "Đăng ký thất bại",
          message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback(
      async (
          credentialResponse: CredentialResponse,
      ) => {
        try {
          setLoading(true);
          setError("");

          const idToken =
              credentialResponse.credential;

          if (!idToken) {
            throw new Error(
                "Không nhận được ID token từ Google.",
            );
          }

          /*
           * Google email đã được xác minh,
           * vì vậy Google login vẫn tạo session.
           */
          const session =
              await authService.googleLogin(
                  idToken,
              );

          setSession(session);

          showAlert.success(
              "Thành công",
              "Đăng nhập Google thành công!",
          );

          const redirectPath =
              getRedirectPathByRoles(
                  session.user.roles,
              );

          navigate(redirectPath, {
            replace: true,
          });
        } catch (googleError: unknown) {
          const message =
              googleError instanceof Error
                  ? googleError.message
                  : "Đăng ký bằng Google thất bại.";

          setError(message);

          showAlert.error(
              "Google login thất bại",
              message,
          );
        } finally {
          setLoading(false);
        }
      },
      [navigate, setSession],
  );

  useGSAP(
      () => {
        const timeline = gsap.timeline();

        if (introRef.current) {
          timeline.fromTo(
              introRef.current.children,
              {
                opacity: 0,
                x: 50,
              },
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
                ease: "power3.out",
              },
              "-=0.4",
          );

          timeline.fromTo(
              formRef.current.querySelectorAll(
                  ".gsap-form-element",
              ),
              {
                opacity: 0,
                y: 15,
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power2.out",
              },
              "-=0.4",
          );
        }
      },
      {
        scope: containerRef,
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
    handleGoogleSuccess,
    setError,
  };
}