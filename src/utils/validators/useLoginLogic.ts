import { useState, useRef, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { type CredentialResponse } from "@react-oauth/google";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { getRedirectPathByRoles } from "../authRedirect";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z
      .string()
      .min(1, "Vui lòng nhập thông tin đăng nhập")
      .trim()
      .refine(
          (val) => {
            if (val.includes(" ")){
              return false
            }
            const emailvalidate = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
            const usernamevalidate = /^[a-zA-Z0-9_]+$/ .test(val);
            return emailvalidate || usernamevalidate;
          },
          {
            message: "Chỉ được nhập tên tài khoản hoặc email",
          }
      ),

  password: z
      .string()
      .min(6, "Vui lòng nhập mật khẩu của bạn")
});

type LoginFormData = z.infer<typeof loginSchema>;

export function useLoginLogic() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  // Form state
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

//animation
  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  //
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };



  // Google handler
  const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError("");

      const idToken = credentialResponse.credential;

      if (!idToken) {
        throw new Error("Không nhận được ID token từ Google.");
      }

      const session = await authService.googleLogin(idToken);
      setSession(session);

      const redirectPath = getRedirectPathByRoles(session.user.roles);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Đăng nhập Google thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, setSession]);

  const handleGoogleError = useCallback(() => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  }, []);

  // Traditional login handler
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const validationResult = loginSchema.safeParse(formData);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        identifier: formattedErrors.identifier?.[0] || "",
        password: formattedErrors.password?.[0] || "",
      });
      return;
    }

    setLoading(true);

    try {
      const validData = validationResult.data;

      const session = await authService.login({
        identifier: validData.identifier, // Dùng validData thay vì formData
        password: validData.password,
      });

      console.log("Login session:", session);
      console.log("Login roles:", session.user.roles);
      setSession(session);
      const redirectPath = getRedirectPathByRoles(session.user.roles);
      console.log("Redirect path:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline();

    if (introRef.current) {
      tl.fromTo(
        introRef.current.children,
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );
    }

    if (formRef.current) {
      tl.fromTo(
        formRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
        "-=0.4"
      );

      tl.fromTo(
        formRef.current.querySelectorAll(".gsap-form-element"),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, { scope: containerRef });

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
