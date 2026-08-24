import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import { memberService } from "../../services/memberService";
import { bodyMetricService } from "../../services/bodyMetricService";
import type { MemberProfile } from "../../types/member.type";
import type { BodyMetric } from "../../types/bodyMetric.type";

import { BodyMetricCards } from "../member/components/body-metric/BodyMetricCards";
import { getBmiLevel, getBmiLabel } from "../../hooks/useBodyMetric";
import { showAlert } from "../../utils/alert";

export default function AdminBodyMetricPage() {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  
  const [latestMetric, setLatestMetric] = useState<BodyMetric | null>(null);
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        // Lấy danh sách member, có thể tuỳ chỉnh page/size
        const res = await memberService.getMembers({ size: 100 });
        setMembers(res.content);
      } catch (err) {
        console.error(err);
        showAlert.error("Lỗi", "Không thể tải danh sách hội viên");
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!selectedMemberId) {
      setLatestMetric(null);
      setMetrics([]);
      return;
    }

    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);
        const [latestRes, listRes] = await Promise.allSettled([
          bodyMetricService.getAdminMemberLatestBodyMetric(selectedMemberId),
          bodyMetricService.getAdminMemberBodyMetrics(selectedMemberId, { size: 10 })
        ]);

        if (latestRes.status === "fulfilled") {
          setLatestMetric(latestRes.value);
        } else {
          setLatestMetric(null);
        }

        if (listRes.status === "fulfilled") {
          setMetrics(listRes.value.content);
        } else {
          setMetrics([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [selectedMemberId]);

  const previousMetric = metrics.length > 1 ? metrics[1] : null;
  const bmiLevel = getBmiLevel(latestMetric?.bmi);
  const bmiLabel = getBmiLabel(bmiLevel);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <PageHeader
        title="Quản lý Chỉ số cơ thể"
        description="Xem và theo dõi chỉ số cơ thể của các hội viên."
        eyebrow="Admin / Body Metrics"
      />

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar chọn Member */}
        <div className="space-y-4 md:col-span-1">
          <Card className="p-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">
              Chọn Hội Viên
            </h3>
            
            {loadingMembers ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-fit-primary" />
              </div>
            ) : (
              <div className="max-h-[600px] space-y-2 overflow-y-auto pr-2">
                {members.length === 0 && (
                  <p className="text-sm text-slate-500">Không có hội viên nào.</p>
                )}
                {members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`w-full rounded-xl px-4 py-3 text-left transition-all ${
                      selectedMemberId === member.id
                        ? "bg-fit-primary text-white shadow-md"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <p className="font-bold">{member.fullName}</p>
                    <p className={`text-xs ${selectedMemberId === member.id ? "text-white/80" : "text-slate-500"}`}>
                      {member.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Nội dung Body Metric */}
        <div className="space-y-6 md:col-span-3">
          {!selectedMemberId ? (
            <Card className="flex h-64 flex-col items-center justify-center text-slate-500">
              <Search className="mb-4 h-10 w-10 opacity-20" />
              <p>Vui lòng chọn một hội viên để xem chỉ số cơ thể.</p>
            </Card>
          ) : loadingMetrics ? (
            <Card className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-fit-primary" />
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">
                  Thông tin chỉ số
                </h2>
              </div>

              <BodyMetricCards
                latestMetric={latestMetric}
                previousMetric={previousMetric}
                bmiLevel={bmiLevel}
                bmiLabel={bmiLabel}
                openCreateForm={() => {
                  showAlert.info("Thông báo", "Chức năng thêm mới đang được phát triển cho Admin.");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
