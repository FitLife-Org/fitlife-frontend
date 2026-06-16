import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || ROUTES.MEMBER_HOME;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await authService.login({ username, password });
      setSession(session);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center lg:block">
        <div className="flex h-full flex-col justify-between bg-slate-950/70 p-12 text-white">
          <div className="flex items-center gap-3 text-2xl font-black">
            <Dumbbell className="h-8 w-8 text-sky-400" />
            FitLife
          </div>
          <div className="max-w-xl">
            <h1 className="text-5xl font-black leading-tight">Quản lý phòng gym gọn gàng hơn mỗi ngày.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-200">Theo dõi hội viên, gói tập, check-in, lịch trainer và thanh toán trong một trải nghiệm thống nhất.</p>
          </div>
          <p className="text-sm text-slate-300">React + Vite + TypeScript + Tailwind</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl" onSubmit={handleSubmit}>
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">FitLife</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Đăng nhập</h2>
            <p className="mt-2 text-sm text-slate-500">Nhập tài khoản để tiếp tục vào hệ thống.</p>
          </div>

          {error && <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-4">
            <Input label="Tên đăng nhập" name="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
            <Input label="Mật khẩu" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>

          <div className="mt-4 flex justify-end">
            <Link className="text-sm font-semibold text-sky-700 hover:text-sky-800" to={ROUTES.FORGOT_PASSWORD}>
              Quên mật khẩu?
            </Link>
          </div>

          <Button className="mt-6 w-full" type="submit" isLoading={loading}>
            Đăng nhập
          </Button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link className="font-semibold text-sky-700 hover:text-sky-800" to={ROUTES.REGISTER}>
              Đăng ký
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
