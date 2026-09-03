import { useState } from "react";
import { Calendar, CreditCard, CheckCircle2, Clock, XCircle, Dumbbell, ChevronRight, RefreshCw, ArrowUpRight, Snowflake, UserCheck, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { showAlert } from "../../utils/alert";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import { formatCurrency } from "../../utils/formatCurrency";
import { useMySubscription } from "../../hooks/useMySubscription";
import { usePageAnimation } from "../../hooks/usePageAnimation";
import { subscriptionService } from "../../services/subscriptionService";
import { validateFreezeRequest, validateTransferRequest } from "../../utils/validators/packageBusinessValidator";

export default function MySubscriptionPage() {
  const containerRef = usePageAnimation();
  const { subscriptions, loading, activeSubscription, calculateDaysLeft, handleRenew, refreshSubscription } = useMySubscription();
  const navigate = useNavigate();

  // Modals state
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeDaysInput, setFreezeDaysInput] = useState<number>(7);
  const [freezeReasonInput, setFreezeReasonInput] = useState<string>("");

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [recipientCodeInput, setRecipientCodeInput] = useState<string>("");
  const [transferNoteInput, setTransferNoteInput] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRenew = async (id: number) => {
    try {
      const newSub = await handleRenew(id);
      if (newSub.invoiceId) {
        void showAlert.success("Thành công", "Đã tạo hóa đơn gia hạn.");
        navigate(`/member/payment/${newSub.invoiceId}`);
      }
    } catch {
      void showAlert.error("Đã xảy ra lỗi", "Không thể gia hạn gói tập.");
    }
  };

  const handleConfirmFreeze = async () => {
    if (!activeSubscription) return;
    const val = validateFreezeRequest(activeSubscription, freezeDaysInput, freezeReasonInput);
    if (!val.isValid) {
      void showAlert.error("Lỗi đóng băng", val.errorMessage || "Dữ liệu không hợp lệ.");
      return;
    }

    try {
      setIsSubmitting(true);
      await subscriptionService.freezeSubscription(activeSubscription.id, freezeDaysInput, freezeReasonInput);
      void showAlert.success("Đóng băng thành công", `Gói tập đã được đóng băng ${freezeDaysInput} ngày.`);
      setShowFreezeModal(false);
      setFreezeReasonInput("");
      refreshSubscription();
    } catch {
      void showAlert.error("Lỗi", "Không thể đóng băng gói tập.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!activeSubscription) return;
    const val = validateTransferRequest(activeSubscription, recipientCodeInput);
    if (!val.isValid) {
      void showAlert.error("Lỗi chuyển nhượng", val.errorMessage || "Dữ liệu không hợp lệ.");
      return;
    }

    const confirm = await showAlert.confirm(
      "Xác nhận chuyển nhượng gói",
      `Bạn có chắc muốn chuyển nhượng gói tập cho ${recipientCodeInput}?\nPhí chuyển nhượng: 200.000đ.`
    );

    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      await subscriptionService.transferSubscription(activeSubscription.id, recipientCodeInput, transferNoteInput);
      void showAlert.success("Chuyển nhượng thành công", "Yêu cầu chuyển nhượng đã được tiếp nhận.");
      setShowTransferModal(false);
      setRecipientCodeInput("");
      refreshSubscription();
    } catch {
      void showAlert.error("Lỗi", "Không thể chuyển nhượng gói tập.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" />Đang hoạt động</Badge>;
      case "FROZEN":
        return <Badge variant="info"><Snowflake className="w-3 h-3 mr-1 inline" />Đang đóng băng</Badge>;
      case "PENDING_PAYMENT":
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1 inline" />Chờ thanh toán</Badge>;
      case "EXPIRED":
        return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1 inline" />Đã hết hạn</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Gói hội viên của tôi" 
          description="Quản lý, gia hạn, nâng cấp, đóng băng và chuyển nhượng gói tập FitLife" 
        />
        <Link 
          to="/member/packages" 
          className="hidden md:flex items-center gap-2 rounded-xl bg-fit-primary px-6 py-3 font-bold text-white shadow-lg shadow-fit-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          <CreditCard className="h-5 w-5" />
          Mua gói mới / Nâng cấp
        </Link>
      </div>

      {activeSubscription ? (
        <div className="gsap-animate space-y-4">
          <Card className="p-0 overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
            <div className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  {getStatusBadge(activeSubscription.status)}
                  <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight">{activeSubscription.gymPackageName || "Gói tập FitLife"}</h2>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-300 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      Bắt đầu: {activeSubscription.startDate || "Chưa kích hoạt"}
                    </span>

                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      Hết hạn: {activeSubscription.endDate || "Chưa kích hoạt"}
                    </span>
                    {activeSubscription.packageDurationName && (
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-400" /> Thời hạn: {activeSubscription.packageDurationName}
                      </span>
                    )}
                    {activeSubscription.ptSessionsTotal !== undefined && activeSubscription.ptSessionsTotal > 0 && (
                      <span className="flex items-center gap-2 text-emerald-400 font-bold">
                        <Dumbbell className="h-4 w-4" /> PT: {activeSubscription.ptSessionsUsed || 0} / {activeSubscription.ptSessionsTotal} buổi
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-[200px] rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20 text-center">
                  <p className="text-sm font-medium text-slate-300">Thời gian còn lại</p>
                  <p className="mt-2 text-5xl font-black text-emerald-400">
                    {calculateDaysLeft(activeSubscription.endDate)} <span className="text-xl">ngày</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons for Subscription Lifecycle */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => onRenew(activeSubscription.id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-1.5 border-none px-4 py-2 text-xs"
                >
                  <RefreshCw className="w-4 h-4" /> Gia hạn ngay
                </Button>

                <Button
                  onClick={() => navigate("/member/packages")}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border-white/20 flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <ArrowUpRight className="w-4 h-4 text-amber-400" /> Nâng cấp gói
                </Button>

                <Button
                  onClick={() => setShowFreezeModal(true)}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border-white/20 flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <Snowflake className="w-4 h-4 text-cyan-400" /> Đóng băng gói
                </Button>

                <Button
                  onClick={() => setShowTransferModal(true)}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border-white/20 flex items-center gap-1.5 px-4 py-2 text-xs"
                >
                  <UserCheck className="w-4 h-4 text-purple-400" /> Chuyển nhượng
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-10 text-center border-dashed border-2 border-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900">Chưa có gói tập nào đang hoạt động</h3>
          <p className="mt-2 text-slate-500">Bạn chưa đăng ký gói tập nào hoặc gói tập đã hết hạn.</p>
          <Link 
            to="/member/packages" 
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-fit-primary px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1"
          >
            Xem các gói tập ngay
          </Link>
        </Card>
      )}

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Lịch sử đăng ký gói tập</h3>
          <div className="grid gap-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="gsap-animate">
                <Card className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-fit-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {sub.gymPackageName || "Gói tập"} {sub.packageDurationName && <span className="text-sm font-normal text-slate-500">({sub.packageDurationName})</span>}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {sub.startDate || "Chưa kích hoạt"} đến {sub.endDate || "Chưa kích hoạt"}
                      </p>
                      {sub.finalPrice !== undefined && (
                        <p className="text-sm font-medium text-fit-primary mt-1">
                          {formatCurrency(sub.finalPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    {getStatusBadge(sub.status)}
                    {sub.status === "PENDING_PAYMENT" && sub.invoiceId && (
                      <Link 
                        to={`/member/payment/${sub.invoiceId}`}
                        className="flex items-center gap-1 text-sm font-bold text-fit-primary hover:underline"
                      >
                        Thanh toán <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Freeze Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-cyan-500" /> Đóng băng gói tập
              </h3>
              <button onClick={() => setShowFreezeModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-xs text-slate-500">
              Trong thời gian đóng băng bạn sẽ không thể check-in. Ngày hết hạn gói sẽ được gia hạn thêm đúng bằng số ngày đóng băng.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số ngày đóng băng</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={freezeDaysInput}
                  onChange={(e) => setFreezeDaysInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lý do đóng băng</label>
                <textarea
                  rows={3}
                  placeholder="Nhập lý do (đi công tác, tạm nghỉ...)"
                  value={freezeReasonInput}
                  onChange={(e) => setFreezeReasonInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowFreezeModal(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleConfirmFreeze} disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold border-none">
                Xác nhận đóng băng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-500" /> Chuyển nhượng gói tập
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-purple-50 text-purple-800 p-3 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Chuyển nhượng áp dụng cho gói VIP (hoặc ưu đãi đặc biệt). Phí thủ tục cố định: <strong>200.000đ</strong>.</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã hội viên / Email nhận gói</label>
                <input
                  type="text"
                  placeholder="Ví dụ: MB123456 hoặc member@fitlife.vn"
                  value={recipientCodeInput}
                  onChange={(e) => setRecipientCodeInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú (Tùy chọn)</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm nếu có..."
                  value={transferNoteInput}
                  onChange={(e) => setTransferNoteInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowTransferModal(false)} className="rounded-xl">Hủy</Button>
              <Button onClick={handleConfirmTransfer} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold border-none">
                Chuyển nhượng gói
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
