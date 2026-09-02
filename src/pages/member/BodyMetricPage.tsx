import { Plus } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import { useBodyMetric } from "../../hooks/useBodyMetric";
import { usePageAnimation } from "../../hooks/usePageAnimation";

import { BodyMetricCards } from "./components/body-metric/BodyMetricCards";
import { BodyMetricCharts } from "./components/body-metric/BodyMetricCharts";
import { BodyMetricHistory } from "./components/body-metric/BodyMetricHistory";
import { BodyMetricFormModal } from "./components/body-metric/BodyMetricFormModal";

export default function BodyMetricPage() {
  const {
    metrics,
    latestMetric,
    chartData,

    formData,
    formOpen,

    loading,
    saving,

    currentPage,
    totalPages,

    bmiLevel,
    bmiLabel,

    setField,

    openCreateForm,
    closeCreateForm,
    createMetric,

    changePage,
  } = useBodyMetric();

  const containerRef = usePageAnimation();

  const previousMetric = metrics.length > 1 ? metrics[1] : null;

  if (loading && metrics.length === 0) {
    return (
        <div className="flex h-72 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />

            <p className="text-sm font-semibold text-slate-500">
              Đang tải chỉ số cơ thể...
            </p>
          </div>
        </div>
    );
  }

  return (
      <div ref={containerRef}>
        <div className="mx-auto max-w-7xl space-y-6 pb-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center gsap-animate">
            <PageHeader
                title="Chỉ số cơ thể"
                description="Theo dõi cân nặng, BMI và sự thay đổi cơ thể theo thời gian."
            />

            <button
                type="button"
                onClick={openCreateForm}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-fit-primary px-5 py-3 font-black text-white shadow-lg shadow-emerald-600/20 transition hover:bg-fit-primaryHover active:scale-[0.98]"
            >
              <Plus className="h-5 w-5" />
              Ghi nhận chỉ số
            </button>
          </div>

          <BodyMetricCards
              latestMetric={latestMetric}
              previousMetric={previousMetric}
              bmiLevel={bmiLevel}
              bmiLabel={bmiLabel}
              openCreateForm={openCreateForm}
          />

          <BodyMetricCharts chartData={chartData} />

          <BodyMetricHistory
              metrics={metrics}
              currentPage={currentPage}
              totalPages={totalPages}
              changePage={changePage}
          />
        </div>

        <BodyMetricFormModal
            formOpen={formOpen}
            closeCreateForm={closeCreateForm}
            formData={formData}
            setField={setField}
            createMetric={createMetric}
            saving={saving}
        />
      </div>
  );
}