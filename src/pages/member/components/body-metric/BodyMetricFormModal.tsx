import { X } from "lucide-react";

interface BodyMetricFormModalProps {
  formOpen: boolean;
  closeCreateForm: () => void;
  formData: {
    weightKg: string;
    heightCm: string;
    bodyFatPercent: string;
    muscleMassKg: string;
    note: string;
    recordedAt: string;
  };
  setField: (field: any, value: string) => void;
  createMetric: () => Promise<void>;
  saving: boolean;
}

export function BodyMetricFormModal({
  formOpen,
  closeCreateForm,
  formData,
  setField,
  createMetric,
  saving,
}: BodyMetricFormModalProps) {
  if (!formOpen) return null;

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateForm();
            }
          }}
      >
        <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="body-metric-form-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2
                  id="body-metric-form-title"
                  className="text-xl font-black text-slate-900"
              >
                Ghi nhận chỉ số cơ thể
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                BMI sẽ được backend tự động tính.
              </p>
            </div>

            <button
                type="button"
                onClick={closeCreateForm}
                disabled={saving}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40"
                aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Cân nặng (kg) *
                    </span>

                <input
                    type="number"
                    min="20"
                    max="300"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(event) => setField("weightKg", event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                    placeholder="Ví dụ: 61.5"
                />
              </label>

              <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Chiều cao (cm)
                    </span>

                <input
                    type="number"
                    min="50"
                    max="250"
                    step="0.1"
                    value={formData.heightCm}
                    onChange={(event) => setField("heightCm", event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                    placeholder="Ví dụ: 165"
                />

                <span className="mt-1 block text-xs text-slate-400">
                      Dùng số đo gần nhất nếu để trống.
                    </span>
              </label>

              <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Tỷ lệ mỡ (%)
                    </span>

                <input
                    type="number"
                    min="0"
                    max="80"
                    step="0.1"
                    value={formData.bodyFatPercent}
                    onChange={(event) => setField("bodyFatPercent", event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                    placeholder="Ví dụ: 18.5"
                />
              </label>

              <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Khối lượng cơ (kg)
                    </span>

                <input
                    type="number"
                    min="0"
                    max="200"
                    step="0.1"
                    value={formData.muscleMassKg}
                    onChange={(event) => setField("muscleMassKg", event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                    placeholder="Ví dụ: 47.2"
                />
              </label>
              
              <label className="block sm:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Thời gian đo
                    </span>

                <input
                    type="datetime-local"
                    value={formData.recordedAt}
                    max={new Date().toISOString().slice(0, 16)}
                    onChange={(event) => setField("recordedAt", event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-4 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                />

                <span className="mt-1 block text-xs text-slate-400">
                      Để trống để sử dụng thời gian hiện tại.
                    </span>
              </label>
            </div>

            <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Ghi chú
                  </span>

              <textarea
                  rows={2}
                  maxLength={1000}
                  value={formData.note}
                  onChange={(event) => setField("note", event.target.value)}
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-fit-primary focus:ring-4 focus:ring-fit-primary/10"
                  placeholder="Tình trạng cơ thể hoặc ghi chú cho lần đo..."
              />

              <span className="mt-1 block text-right text-xs text-slate-400">
                    {formData.note.length}/1000
                  </span>
            </label>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                  type="button"
                  onClick={closeCreateForm}
                  disabled={saving}
                  className="min-h-10 rounded-xl border border-slate-200 px-5 py-2 font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                  type="button"
                  onClick={() => void createMetric()}
                  disabled={saving}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-fit-primary px-5 py-2 font-black text-white transition hover:bg-fit-primaryHover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}

                {saving ? "Đang lưu..." : "Lưu chỉ số"}
              </button>
            </div>
          </div>
        </section>
      </div>
  );
}
