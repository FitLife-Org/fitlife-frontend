import { useEffect, useState } from "react";
import { Search, Filter, Clock, Award, ChevronRight, User, Crown, Check, X, AlertCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { trainerService } from "../../services/trainerService";
import { memberService } from "../../services/memberService";
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
  const [myAssignments, setMyAssignments] = useState<Trainer[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  const { activeSubscription, loading: subLoading } = useMySubscription();

  useEffect(() => {
    fetchTrainers();
    fetchAssignedTrainers();
  }, []);

  const fetchAssignedTrainers = async () => {
    try {
      const list = await memberService.getMyAssignedTrainers();
      setMyAssignments(list);
    } catch (error) {
      console.error("Lỗi khi tải danh sách HLV đã chọn:", error);
    }
  };

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
    if (trainer.isAcceptingMembers === false) {
      void showAlert.error("Không thể chọn", "Hiện không thể chọn HLV này vì trainer đã kích hoạt ngưng nhận học viên mới.");
      return;
    }

    const currentThisTrainer = myAssignments.find((a) => a.id === trainer.id);
    if (currentThisTrainer?.assignmentStatus === "ACTIVE" || currentThisTrainer?.assignmentStatus === "PENDING") {
      void showAlert.warning(
        "Đã chọn HLV này",
        "Bạn đã gửi yêu cầu hoặc đang đồng hành cùng Huấn luyện viên này."
      );
      return;
    }

    const result = await showAlert.confirm(
      "Xác nhận chọn HLV",
      `Bạn có muốn gửi yêu cầu chọn Huấn luyện viên ${trainer.fullName} đồng hành cùng gói tập của bạn? Huấn luyện viên cần xác nhận trước khi bắt đầu.`
    );
    
    if (result.isConfirmed) {
      try {
        setIsActionLoading(true);
        await memberService.bookTrainer(trainer.id);
        await fetchAssignedTrainers();
        void showAlert.success(
          "Gửi yêu cầu thành công!",
          `Yêu cầu đã gửi tới HLV ${trainer.fullName}. Vui lòng chờ HLV xác nhận để bắt đầu lịch tập.`
        );
      } catch (error) {
        void showAlert.error("Lỗi khi chọn HLV", getApiErrorMessage(error));
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleCancelTrainer = async (trainer: Trainer) => {
    const assignment = myAssignments.find((a) => a.id === trainer.id);
    const isPending = assignment?.assignmentStatus === "PENDING";
    const title = isPending ? "Xác nhận hủy yêu cầu" : "Xác nhận gửi yêu cầu hủy";
    const message = isPending
      ? `Bạn có chắc muốn hủy yêu cầu chọn Huấn luyện viên ${trainer.fullName}?`
      : `Bạn có chắc muốn gửi yêu cầu dừng đồng hành cùng Huấn luyện viên ${trainer.fullName}? Huấn luyện viên cần xác nhận yêu cầu hủy này.`;

    const result = await showAlert.confirm(title, message);
    if (result.isConfirmed) {
      try {
        setIsActionLoading(true);
        await memberService.cancelTrainerBooking(trainer.id);
        await fetchAssignedTrainers();
        if (isPending) {
          void showAlert.success("Đã hủy yêu cầu!", "Bạn có thể chọn Huấn luyện viên khác.");
        } else {
          void showAlert.success(
            "Đã gửi yêu cầu hủy!",
            "Yêu cầu dừng đồng hành đã được gửi tới Huấn luyện viên (yêu cầu sẽ được xử lý song song và bạn vẫn có thể chọn Huấn luyện viên khác bình thường)."
          );
        }
      } catch (error) {
        void showAlert.error("Lỗi khi hủy HLV", getApiErrorMessage(error));
      } finally {
        setIsActionLoading(false);
      }
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
          {/* Status Banner when user has an active or pending trainer */}
          {myAssignments.length > 0 && (
            <div className="space-y-2">
              {myAssignments.map((a) => (
                <div
                  key={a.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3 shadow-sm ${
                    a.assignmentStatus === "ACTIVE"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : a.assignmentStatus === "PENDING_CANCEL"
                      ? "bg-orange-50 border-orange-200 text-orange-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div className="text-sm">
                    {a.assignmentStatus === "ACTIVE" ? (
                      <p>
                        Bạn đang đồng hành cùng Huấn luyện viên <strong className="font-bold">{a.fullName}</strong>. Để dừng đồng hành, vui lòng nhấn nút <strong className="font-bold">"Hủy HLV"</strong> tại thẻ của HLV này.
                      </p>
                    ) : a.assignmentStatus === "PENDING_CANCEL" ? (
                      <p>
                        Bạn đã gửi yêu cầu dừng đồng hành cùng HLV <strong className="font-bold">{a.fullName}</strong> (Đang chờ HLV này xác nhận hủy. Trong thời gian này, bạn vẫn có thể chọn Huấn luyện viên khác bình thường).
                      </p>
                    ) : (
                      <p>
                        Bạn đã gửi yêu cầu chọn Huấn luyện viên <strong className="font-bold">{a.fullName}</strong>. Đang <strong className="font-bold">chờ HLV xác nhận</strong> trước khi bắt đầu.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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
              filteredTrainers.map((trainer) => {
                const myAssignment = myAssignments.find((a) => a.id === trainer.id);
                const isThisTrainer = Boolean(myAssignment);
                const status = myAssignment?.assignmentStatus;

                return (
                  <Card
                    key={trainer.id}
                    className={`group relative overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isThisTrainer && status === "ACTIVE"
                        ? "border-2 border-emerald-500 shadow-md shadow-emerald-500/10"
                        : isThisTrainer && status === "PENDING"
                        ? "border-2 border-amber-500 shadow-md shadow-amber-500/10"
                        : isThisTrainer && status === "PENDING_CANCEL"
                        ? "border-2 border-orange-500 shadow-md shadow-orange-500/10"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-6 relative z-10 flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                          <User className="w-10 h-10 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{trainer.fullName}</h3>
                          <div className="flex items-center gap-1.5 flex-wrap mb-2">
                            <Badge variant="success">
                              {trainer.specialization || trainer.specialty || "Fitness Trainer"}
                            </Badge>
                            {trainer.isAcceptingMembers === false ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                Ngưng nhận học viên
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Đang nhận học viên
                              </span>
                            )}
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
                        {isThisTrainer ? (
                          status === "ACTIVE" ? (
                            /* Trạng thái 1: Đã chọn HLV này + Nút Hủy kế bên */
                            <>
                              <button
                                type="button"
                                disabled
                                className="rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 shadow-sm bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs sm:text-sm flex-1 cursor-default"
                              >
                                <Check className="w-4 h-4 text-emerald-700" /> Đã chọn HLV này
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelTrainer(trainer)}
                                disabled={isActionLoading}
                                className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 disabled:opacity-50 shadow-sm"
                                title="Gửi yêu cầu dừng đồng hành cùng HLV này"
                              >
                                <X className="w-4 h-4" />
                                <span>Hủy HLV</span>
                              </button>
                            </>
                          ) : status === "PENDING" ? (
                            /* Trạng thái 2: Đang chờ HLV xác nhận + Nút Hủy yêu cầu kế bên */
                            <>
                              <button
                                type="button"
                                disabled
                                className="rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 shadow-sm bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs sm:text-sm flex-1 cursor-default animate-pulse"
                              >
                                <Clock className="w-4 h-4 text-amber-700" /> Chờ HLV xác nhận
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCancelTrainer(trainer)}
                                disabled={isActionLoading}
                                className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-400 text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 disabled:opacity-50 shadow-sm"
                                title="Hủy yêu cầu chọn HLV"
                              >
                                <X className="w-4 h-4" />
                                <span>Hủy</span>
                              </button>
                            </>
                          ) : (
                            /* Trạng thái 3: Đang chờ HLV xác nhận hủy */
                            <button
                              type="button"
                              disabled
                              className="rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 shadow-sm w-full bg-orange-100 text-orange-900 border border-orange-300 font-black text-xs sm:text-sm cursor-default"
                            >
                              <Clock className="w-4 h-4 text-orange-700 animate-spin" /> Đang chờ HLV xác nhận hủy...
                            </button>
                          )
                        ) : trainer.isAcceptingMembers === false ? (
                          /* Trạng thái 4: HLV đã kích hoạt ngưng nhận học viên mới */
                          <div className="w-full space-y-1.5">
                            <button
                              type="button"
                              disabled
                              className="w-full rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 bg-slate-200 border border-slate-400 text-slate-800 font-black text-xs sm:text-sm cursor-not-allowed shadow-none"
                              title="Hiện không thể chọn HLV này vì trainer đã kích hoạt ngưng nhận học viên mới"
                            >
                              <X className="w-4 h-4 text-slate-600 shrink-0" />
                              <span>HLV ngưng nhận học viên</span>
                            </button>
                            <p className="text-[11px] font-bold text-rose-600 text-center leading-tight">
                              Hiện không thể chọn HLV này vì trainer đã kích hoạt ngưng nhận học viên mới
                            </p>
                          </div>
                        ) : (
                          /* Trạng thái Sẵn sàng chọn HLV: Luôn khả dụng khi trainer đang nhận học viên */
                          <button
                            type="button"
                            onClick={() => handleBookTrainer(trainer)}
                            disabled={isActionLoading}
                            className="w-full rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <span>Chọn HLV này</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <User className="w-12 h-12 text-slate-300 mb-3" />
                <p>Không tìm thấy huấn luyện viên nào phù hợp.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

