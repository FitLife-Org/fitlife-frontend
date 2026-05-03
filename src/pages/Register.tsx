import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Dumbbell, Loader2, Lock, Mail, Phone, UserPlus } from 'lucide-react';
import { register as registerApi, type RegisterRequest } from '../api/authApi';

interface RegisterFormState extends RegisterRequest {
	confirmPassword: string;
}

const initialFormState: RegisterFormState = {
	username: '',
	fullName: '',
	phone: '',
	email: '',
	password: '',
	confirmPassword: '',
};

export default function Register() {
	const navigate = useNavigate();
	const [form, setForm] = useState<RegisterFormState>(initialFormState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		const { name, value } = event.target;
		setForm((current) => ({ ...current, [name]: value }));
	};

	const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		setErrorMessage('');

		if (form.password !== form.confirmPassword) {
			setErrorMessage('Mật khẩu xác nhận không khớp.');
			return;
		}

		setIsSubmitting(true);

		try {
			await registerApi({
				username: form.username,
				fullName: form.fullName,
				phone: form.phone,
				email: form.email,
				password: form.password,
			});

			navigate('/login', { replace: true });
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Không thể tạo tài khoản. Vui lòng thử lại.';
			setErrorMessage(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="grid min-h-screen lg:grid-cols-2">
				<section className="relative hidden overflow-hidden border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col lg:justify-between">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />
					<div className="relative z-10 p-12">
						<div className="inline-flex items-center gap-3 rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300">
							<UserPlus className="h-4 w-4" /> Join FitLife
						</div>
						<h1 className="mt-10 max-w-xl text-5xl font-black tracking-tight text-white leading-tight">
							Build your gym profile.
							<span className="block text-sky-400">Start today.</span>
						</h1>
						<p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
							Register to unlock personalized workouts, membership tools, and a cleaner training workflow.
						</p>
					</div>
					<div className="relative z-10 p-12 text-sm text-slate-400">
						Dark, modern, and responsive across every device.
					</div>
				</section>

				<section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
					<div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur sm:p-8">
						<div className="mb-8 text-center">
							<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 ring-1 ring-sky-500/20">
								<Dumbbell className="h-7 w-7" />
							</div>
							<h2 className="mt-4 text-3xl font-bold tracking-tight text-white">Create account</h2>
							<p className="mt-2 text-sm text-slate-300">Set up your membership in a few quick steps.</p>
						</div>

						{errorMessage ? (
							<div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
								<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
								<span>{errorMessage}</span>
							</div>
						) : null}

						<form onSubmit={handleSubmit} className="space-y-4">
							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-200">Username</span>
								<input
									name="username"
									type="text"
									value={form.username}
									onChange={handleChange}
									className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
									placeholder="fitlife_member"
									required
								/>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-200">Full name</span>
								<input
									name="fullName"
									type="text"
									value={form.fullName}
									onChange={handleChange}
									className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
									placeholder="Nguyen Van A"
									required
								/>
							</label>

							<div className="grid gap-4 sm:grid-cols-2">
								<label className="block">
									<span className="mb-2 block text-sm font-medium text-slate-200">Phone</span>
									<div className="relative">
										<Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										<input
											name="phone"
											type="tel"
											value={form.phone}
											onChange={handleChange}
											className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
											placeholder="0901234567"
											required
										/>
									</div>
								</label>

								<label className="block">
									<span className="mb-2 block text-sm font-medium text-slate-200">Email</span>
									<div className="relative">
										<Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
										<input
											name="email"
											type="email"
											value={form.email}
											onChange={handleChange}
											className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
											placeholder="you@example.com"
											required
										/>
									</div>
								</label>
							</div>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-200">Password</span>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
									<input
										name="password"
										type="password"
										value={form.password}
										onChange={handleChange}
										className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-11 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
										placeholder="Create a strong password"
										required
									/>
								</div>
							</label>

							<label className="block">
								<span className="mb-2 block text-sm font-medium text-slate-200">Confirm password</span>
								<input
									name="confirmPassword"
									type="password"
									value={form.confirmPassword}
									onChange={handleChange}
									className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
									placeholder="Repeat your password"
									required
								/>
							</label>

							<button
								type="submit"
								disabled={isSubmitting}
								className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
								{isSubmitting ? 'Creating account...' : 'Create account'}
							</button>
						</form>

						<p className="mt-6 text-center text-sm text-slate-300">
							Already have an account?{' '}
							<Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300">
								Sign in
							</Link>
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}


