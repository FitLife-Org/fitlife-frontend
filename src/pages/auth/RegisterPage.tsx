import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { isEmail, isVietnamesePhone } from "../../utils/validation";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ username: "", fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isEmail(form.email)) {
      setError("Email không hợp lệ.");
      return;
    }

    if (!isVietnamesePhone(form.phone)) {
      setError("Số điện thoại không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      const session = await authService.register(form);
      if (session) {
        setSession(session);
        navigate(ROUTES.MEMBER_HOME, { replace: true });
      } else {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <form className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl" onSubmit={handleSubmit}>
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">FitLife</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">Tạo tài khoản hội viên</h1>
          <p className="mt-2 text-sm text-slate-500">Bắt đầu theo dõi lịch tập, gói tập và tiến độ của bạn.</p>
        </div>

        {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tên đăng nhập" value={form.username} onChange={(event) => updateField("username", event.target.value)} required />
          <Input label="Họ tên" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
          <Input label="Số điện thoại" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
          <Input className="sm:col-span-2" label="Mật khẩu" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} required />
        </div>

        <Button className="mt-6 w-full" type="submit" isLoading={loading}>
          Đăng ký
        </Button>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link className="font-semibold text-sky-700 hover:text-sky-800" to={ROUTES.LOGIN}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </main>
  );
}
