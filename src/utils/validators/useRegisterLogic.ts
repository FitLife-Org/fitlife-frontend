import { useState, useRef, useCallback, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { type CredentialResponse } from "@react-oauth/google";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { getRedirectPathByRoles } from "../authRedirect";
import { z } from "zod";


const registerSchema = z.object({
  username: z
      .string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .regex(/^[a-zA-Z0-9_]+$/, "Chỉ chứa chữ cái không dấu, số và dấu gạch dưới")
      .trim(),
  fullName: z
      .string()
      .min(1, "Vui lòng nhập họ và tên")
      .trim(),
  email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Định dạng email không hợp lệ")
      .trim(),
  phone: z
      .string()
      .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ")
      .trim(),
  password: z
      .string()
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu")
}).refine((data) => data.password === data.confirmPassword, {
  //boolean dữ liệu
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"], // Gắn lỗi này vào ô nhập confirmPassword
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function useRegisterLogic() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState<RegisterFormData>({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const updateField = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name as keyof RegisterFormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    // 3. Validate bằng Zod
    const validationResult = registerSchema.safeParse(form);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.flatten().fieldErrors;
      setFieldErrors({
        username: formattedErrors.username?.[0],
        fullName: formattedErrors.fullName?.[0],
        email: formattedErrors.email?.[0],
        phone: formattedErrors.phone?.[0],
        password: formattedErrors.password?.[0],
        confirmPassword: formattedErrors.confirmPassword?.[0],
      });
      return; // Dừng lại nếu có lỗi
    }

    setLoading(true);
    try {
      // 4. Lấy dữ liệu đã được làm sạch (đã trim) từ Zod
      const validData = validationResult.data;

      // Chuẩn bị payload gửi lên server (bỏ confirmPassword đi)
      const registerData = {
        username: validData.username,
        fullName: validData.fullName,
        email: validData.email,
        phone: validData.phone,
        password: validData.password,
      };

      const authSession = await authService.register(registerData);
      setSession(authSession);
      alert("Đăng ký thành công!");
      navigate(ROUTES.MEMBER_HOME, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Đăng ký bằng Google thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate, setSession]);

  // Các hiệu ứng GSAP giữ nguyên
  useGSAP(() => {
    const tl = gsap.timeline();

    if (introRef.current) {
      tl.fromTo(
          introRef.current.children,
          { opacity: 0, x: 50 },
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
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" },
          "-=0.4"
      );
    }
  }, { scope: containerRef });

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