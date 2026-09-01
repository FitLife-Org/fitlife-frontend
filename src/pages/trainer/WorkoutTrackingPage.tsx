import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Scale,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

import {
  ROUTES,
} from "../../config/routes";

import {
  trainerService,
} from "../../services/trainerService";

import type {
  WorkoutProgress,
} from "../../types/trainer.type";

export default function WorkoutTrackingPage() {
  const [
    progress,
    setProgress,
  ] =
      useState<WorkoutProgress | null>(
          null,
      );

  const [
    loading,
    setLoading,
  ] =
      useState(true);

  const [
    error,
    setError,
  ] =
      useState<string | null>(
          null,
      );

  useEffect(() => {
    const fetchProgress =
        async () => {
          try {
            setLoading(true);
            setError(null);

            /*
             * Trang /trainer/workouts hiện chưa có memberId trong URL.
             * Vì vậy không nên hard-code MOCK_MEMBER_ID nữa.
             *
             * Progress của từng Member nên được mở từ:
             * Trainer -> Hội viên của tôi -> Member -> Workout/Progress.
             */
            setProgress(null);
          } catch (fetchError) {
            console.error(
                "TRAINER_WORKOUT_PROGRESS_ERROR:",
                fetchError,
            );

            setError(
                "Không thể tải dữ liệu theo dõi bài tập.",
            );
          } finally {
            setLoading(false);
          }
        };

    void fetchProgress();
  }, []);

  if (loading) {
    return (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Đang tải dữ liệu theo dõi...
            </p>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="space-y-6">
          <PageHeader
              title="Theo dõi bài tập"
              description="Theo dõi tiến độ luyện tập của hội viên được phân công."
          />

          <Card className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-black text-slate-900">
              Không thể tải dữ liệu
            </h2>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {error}
            </p>
          </Card>
        </div>
    );
  }

  if (!progress) {
    return (
        <div className="space-y-6">
          <PageHeader
              title="Theo dõi bài tập"
              description="Chọn hội viên được phân công để xem tiến độ luyện tập và chỉ số cơ thể."
          />

          <Card className="flex min-h-[360px] flex-col items-center justify-center border-2 border-dashed border-slate-200 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Users className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
              Chưa chọn hội viên
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Trang theo dõi cần một hội viên cụ thể. Hãy mở danh sách
              hội viên của bạn, chọn hội viên cần theo dõi rồi truy cập
              giáo án hoặc tiến độ của hội viên đó.
            </p>

            <Link
                to={ROUTES.TRAINER_MEMBERS}
                className="
              mt-6
              inline-flex
              min-h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-600
              px-5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-emerald-700
            "
            >
              Chọn hội viên

              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <PageHeader
            title="Theo dõi tiến độ"
            description={`Hội viên #${progress.memberId}`}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
              icon={
                <Scale className="h-5 w-5" />
              }
              label="Cân nặng hiện tại"
              value={`${progress.weight ?? "—"} kg`}
              className="bg-blue-50 text-blue-600"
          />

          <MetricCard
              icon={
                <Activity className="h-5 w-5" />
              }
              label="Tỷ lệ mỡ"
              value={`${progress.bodyFatPercentage ?? "—"} %`}
              className="bg-emerald-50 text-emerald-600"
          />

          <MetricCard
              icon={
                <TrendingUp className="h-5 w-5" />
              }
              label="Khối lượng cơ"
              value={`${progress.muscleMass ?? "—"} kg`}
              className="bg-orange-50 text-orange-600"
          />

          <MetricCard
              icon={
                <Target className="h-5 w-5" />
              }
              label="Mục tiêu cân nặng"
              value={
                progress.goals?.targetWeight != null
                    ? `${progress.goals.targetWeight} kg`
                    : "—"
              }
              className="bg-violet-50 text-violet-600"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-600" />

              <h2 className="text-lg font-black text-slate-900">
                Mục tiêu huấn luyện
              </h2>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-600">
                {progress.goals?.description ||
                    "Hội viên chưa cập nhật mục tiêu huấn luyện."}
              </p>
            </div>

            {progress.lastUpdated && (
                <p className="mt-4 text-right text-xs text-slate-400">
                  Cập nhật gần nhất: {progress.lastUpdated}
                </p>
            )}
          </Card>

          <Card className="flex min-h-[220px] flex-col items-center justify-center border-2 border-dashed border-slate-200 p-6 text-center">
            <Activity className="h-10 w-10 text-slate-300" />

            <h2 className="mt-3 font-black text-slate-800">
              Lịch sử tiến độ
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Có thể xem chi tiết Body Metric của hội viên từ hồ sơ hội viên.
            </p>
          </Card>
        </section>
      </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  className: string;
}

function MetricCard({
                      icon,
                      label,
                      value,
                      className,
                    }: MetricCardProps) {
  return (
      <Card className="min-w-0 p-5">
        <div className="flex items-center gap-3">
          <div
              className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${className}
          `}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-400">
              {label}
            </p>

            <p className="mt-1 truncate text-xl font-black text-slate-900">
              {value}
            </p>
          </div>
        </div>
      </Card>
  );
}