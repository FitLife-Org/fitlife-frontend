import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Dumbbell, Loader2, Lock, Mail } from 'lucide-react';
import { login as loginApi, type LoginRequest } from '../../api/authApi';
import useAuthStore from '../../store/authStore';

interface LoginFormState extends LoginRequest {}

const initialFormState: LoginFormState = {
  username: '',
  password: '',
};

export default function Login() {
  const navigate = useNavigate();
  const storeLogin = useAuthStore((state) => state.login);

  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await loginApi(form);
      const payload = response.data;

      if (!payload?.token) {
        setErrorMessage(response.message || 'Đăng nhập thất bại.');
        return;
      }

      storeLogin(
        {
          username: payload.username,
          role: payload.role,
        },
        payload.token,
      );

      navigate('/me', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đăng nhập. Vui lòng thử lại.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />
          <div className="relative z-10 p-12">
            <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300">
              <Dumbbell className="h-4 w-4" /> FitLife Modern Gym
            </div>
            <h1 className="mt-10 max-w-xl text-5xl font-black leading-tight tracking-tight text-white">
              Train harder.
              <span className="block text-sky-400">Log in faster.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Access your workout plans, membership details, and progress tracking in one secure place.
            </p>
          </div>
          <div className="relative z-10 p-12 text-sm text-slate-400">
            Built for a professional, energetic dark gym experience.
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/20">
                <Dumbbell className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-300">Sign in to continue your training journey.</p>
            </div>

            {errorMessage ? (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Email or Username</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-300">
              No account yet?{' '}
              <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300">
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

