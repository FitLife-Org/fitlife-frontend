import { HeartPulse, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../../../components/common/Card";
import type { BodyMetric } from "../../../../types/bodyMetric.type";
import { formatNumber, formatDateTime } from "./bodyMetricUtils";

interface BodyMetricHistoryProps {
  metrics: BodyMetric[];
  currentPage: number;
  totalPages: number;
  changePage: (page: number) => void;
}

export function BodyMetricHistory({ metrics, currentPage, totalPages, changePage }: BodyMetricHistoryProps) {
  return (
      <Card className="overflow-hidden gsap-animate">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-black text-slate-900">
            Lịch sử chỉ số
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Các lần đo mới nhất được hiển thị trước.
          </p>
        </div>

        {metrics.length === 0 ? (
            <div className="py-14 text-center">
              <HeartPulse className="mx-auto h-10 w-10 text-slate-300" />

              <p className="mt-3 font-bold text-slate-600">
                Chưa có lịch sử đo
              </p>
            </div>
        ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-bold text-slate-600">
                    Thời gian
                  </th>

                  <th className="px-5 py-3 text-left font-bold text-slate-600">
                    Cân nặng
                  </th>

                  <th className="px-5 py-3 text-left font-bold text-slate-600">
                    Chiều cao
                  </th>

                  <th className="px-5 py-3 text-left font-bold text-slate-600">
                    BMI
                  </th>

                  <th className="px-5 py-3 text-left font-bold text-slate-600">
                    Mỡ
                  </th>

                  <th className="px-5 py-3 text-left font-bold text-slate-600">
                    Cơ
                  </th>

                  <th className="px-5 py-3 text-left font-bold text-slate-600">
                    Ghi chú
                  </th>
                </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                {metrics.map((metric) => (
                    <tr
                        key={metric.id}
                        className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                        {formatDateTime(metric.recordedAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-black text-slate-900">
                        {formatNumber(metric.weightKg)} kg
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatNumber(metric.heightCm)} cm
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-fit-primary">
                        {formatNumber(metric.bmi, 2)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatNumber(metric.bodyFatPercent)} %
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatNumber(metric.muscleMassKg)} kg
                      </td>

                      <td className="max-w-xs truncate px-5 py-4 text-slate-500">
                        {metric.note || "--"}
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}

        {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
              <p className="text-sm font-medium text-slate-500">
                Trang {currentPage + 1} / {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => changePage(currentPage - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => changePage(currentPage + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
        )}
      </Card>
  );
}
