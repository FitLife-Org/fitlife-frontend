import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BadgeCheck, Dumbbell, Loader2, Mail, Phone, Scale, User } from 'lucide-react';
import { getMyProfile, type MemberProfileResponse } from '../../api/memberApi';

const statClasses = 'rounded-2xl border border-slate-800 bg-slate-950/70 p-4';

const InfoRow = ({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) => (
  <div className={statClasses}>
    <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
      <span className="text-sky-400">{icon}</span>
      <span>{label}</span>
    </div>
    <div className="text-sm font-semibold text-slate-100">{value}</div>
  </div>
);

const Profile = () => {
  const [profile, setProfile] = useState<MemberProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getMyProfile();
        setProfile(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ cá nhân.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const bmiLabel = useMemo(() => {
    if (!profile?.bmi) return 'Chưa có dữ liệu';
    if (profile.bmi < 18.5) return 'Thiếu cân';
    if (profile.bmi < 25) return 'Bình thường';
    if (profile.bmi < 30) return 'Thừa cân';
    return 'Cần theo dõi';
  }, [profile?.bmi]);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-slate-800 bg-slate-900/90">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          <p>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl shadow-slate-950/60">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300">
              <BadgeCheck className="h-4 w-4" />
              Protected member profile
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Hồ sơ hội viên của bạn
            </h1>
            <p className="text-sm leading-7 text-slate-300 md:text-base">
              Trang này gọi trực tiếp `GET /members/me` để xác nhận token hoạt động sau khi đăng nhập.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/ai-pt"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-500/20 bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              <Dumbbell className="h-4 w-4" />
              AI Workout
            </Link>
            <Link
              to="/my-workout"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
              My Workout
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/40">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm text-slate-400">FitLife Member</p>
              <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
              <p className="text-sm text-slate-400">{profile.status}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Email" value={profile.email} icon={<Mail className="h-4 w-4" />} />
            <InfoRow label="Phone" value={profile.phone} icon={<Phone className="h-4 w-4" />} />
            <InfoRow label="Height" value={profile.height ? `${profile.height} cm` : 'Chưa cập nhật'} icon={<Activity className="h-4 w-4" />} />
            <InfoRow label="Weight" value={profile.weight ? `${profile.weight} kg` : 'Chưa cập nhật'} icon={<Scale className="h-4 w-4" />} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">BMI status</p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <div className="text-4xl font-black text-white">{profile.bmi?.toFixed(2) ?? '--'}</div>
                <p className="mt-2 text-sm text-slate-400">{bmiLabel}</p>
              </div>
              <div className="rounded-2xl bg-sky-500/10 p-4 text-sky-400 ring-1 ring-sky-500/20">
                <Activity className="h-7 w-7" />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-6 shadow-xl shadow-slate-950/40">
            <p className="text-sm text-slate-400">Fitness goal</p>
            <p className="mt-3 text-lg font-semibold text-slate-100">
              {profile.fitnessGoal || 'Chưa cập nhật'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


