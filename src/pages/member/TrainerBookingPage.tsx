import { useEffect, useState } from "react";
import { Search, Filter, Star, Clock, Award, ChevronRight, User, Crown, Check, Eye } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import TrainerDetailModal from "../../components/common/TrainerDetailModal";
import { trainerService } from "../../services/trainerService";
import type { Trainer } from "../../types/trainer.type";
import { showAlert } from "../../utils/alert";
import { getApiErrorMessage } from "../../utils/apiError";
import { useMySubscription } from "../../hooks/useMySubscription";
import { Link } from "react-router-dom";
import { ROUTES } from "../../config/routes";

export default function TrainerBookingPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
  const [detailTrainer, setDetailTrainer] = useState<Trainer | null>(null);
  
  const { activeSubscription, loading: subLoading } = useMySubscription();

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await trainerService.getTrainers();
      setTrainers(data);
    } catch (error) {
      void showAlert.error("Không thể tải danh sách HLV", getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrainer = async (trainer: Trainer) => {
    const result = await showAlert.confirm(
      "Xác nhận chọn HLV",
      `Bạn có muốn chọn Huấn luyện viên ${trainer.fullName} đồng hành cùng gói VIP của bạn? Quản lý phòng tập sẽ liên hệ để sắp xếp lịch tập cụ thể.`
    );
    
    if (result.isConfirmed) {
      setSelectedTrainerId(trainer.id);
      void showAlert.success(
        "Gửi yêu cầu thành công!",
        "Chúng tôi đã ghi nhận lựa chọn của bạn. Nhân viên sẽ sớm liên hệ để thống nhất lịch tập."
      );
    }
  };

  const isVip = activeSubscription?.gymPackageName?.toLowerCase().includes("vip") || (activeSubscription?.ptSessionsTotal ?? 0) > 0;
  
  const filteredTrainers = trainers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialization || t.specialty || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPageLoading = loading || subLoading;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Huấn Luyện Viên"
        description="Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng đồng hành cùng bạn."
      />

      {isPageLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : !isVip ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 shadow-sm px-4">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <Crown className="w-12 h-12 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Đặc quyền dành riêng cho gói VIP</h3>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            Tính năng xem và chọn Huấn luyện viên cá nhân chỉ khả dụng cho các hội viên đang sử dụng gói tập VIP hoặc gói có kèm PT.
          </p>
          <Link to={ROUTES.MEMBER_PACKAGES}>
            <Button className="px-8 flex items-center gap-2">
              Xem các gói tập <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-full sm:w-96 relative">
              <Input
                placeholder="Tìm kiếm theo tên hoặc chuyên môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              <Filter className="w-4 h-4" /> Lọc theo chuyên môn
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.length > 0 ? (
              filteredTrainers.map((trainer) => (
                <Card
                  key={trainer.id}
                  className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-6 relative z-10 flex flex-col h-full">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                        <User className="w-10 h-10 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{trainer.fullName}</h3>
                        <Badge variant="success" className="mb-2">
                          {trainer.specialization || trainer.specialty || "Fitness Trainer"}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
                          {/* Rating and review count placeholder removed as it's not provided by backend */}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-slate-500">Kinh nghiệm</p>
                          <p className="text-sm font-semibold text-slate-700">{trainer.experienceYears ? `${trainer.experienceYears}+ năm` : "Chưa cập nhật"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-slate-500">Chứng chỉ</p>
                          <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                            {trainer.certifications ? trainer.certifications.split(',')[0] : "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-6 line-clamp-3 flex-1">
                      {trainer.bio || "Chưa có thông tin giới thiệu."}
                    </p>

                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setDetailTrainer(trainer)}
                        className="rounded-xl px-3 py-2 flex items-center gap-1 text-slate-600 border-slate-200 hover:bg-slate-50"
                        title="Xem chi tiết HLV"
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
                      </Button>

                      {selectedTrainerId === trainer.id ? (
                        <Button
                          disabled
                          className="rounded-xl px-3 py-2 flex items-center gap-1 shadow-sm flex-1 justify-center bg-emerald-50 text-emerald-700 border-none opacity-100 text-sm"
                        >
                          <Check className="w-4 h-4" /> Đã chọn
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleBookTrainer(trainer)}
                          className="rounded-xl px-3 py-2 flex items-center gap-1 shadow-lg shadow-emerald-600/20 flex-1 justify-center text-sm"
                        >
                          Chọn HLV <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <User className="w-12 h-12 text-slate-300 mb-3" />
                <p>Không tìm thấy huấn luyện viên nào phù hợp.</p>
              </div>
            )}
          </div>

          <TrainerDetailModal
            open={Boolean(detailTrainer)}
            onClose={() => setDetailTrainer(null)}
            trainer={detailTrainer}
            onBook={handleBookTrainer}
            isBooked={detailTrainer ? selectedTrainerId === detailTrainer.id : false}
          />
        </>
      )}
    </div>
  );
}
