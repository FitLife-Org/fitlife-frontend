import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CreditCard, ChevronRight, CheckCircle2, Clock, XCircle, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { subscriptionService } from "../../services/subscriptionService";
import type { Subscription } from "../../types/subscription.type";
import { formatCurrency } from "../../utils/formatCurrency";

export default function MySubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getMySubscriptions();
      setSubscriptions(data || []);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      // Fallback for demo when backend is down
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" />Đang hoạt động</Badge>;
      case "PENDING_PAYMENT":
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1 inline" />Chờ thanh toán</Badge>;
      case "EXPIRED":
        return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1 inline" />Đã hết hạn</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent"></div>
      </div>
    );
  }

  const activeSubscription = subscriptions.find(s => s.status === "ACTIVE");
  const otherSubscriptions = subscriptions.filter(s => s.status !== "ACTIVE");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Gói hội viên của tôi" 
          description="Quản lý và theo dõi các gói tập luyện bạn đã đăng ký" 
        />
        <Link 
          to="/member/packages" 
          className="hidden md:flex items-center gap-2 rounded-xl bg-fit-primary px-6 py-3 font-bold text-white shadow-lg shadow-fit-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          <CreditCard className="h-5 w-5" />
          Mua gói mới
        </Link>
      </div>

      {activeSubscription ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-0 overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 22h20L12 2zm0 3.83L18.17 20H5.83L12 5.83z"/>
              </svg>
            </div>
            <div className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  {getStatusBadge(activeSubscription.status)}
                  <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight">{activeSubscription.gymPackageName || "Gói tập"}</h2>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-300">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Bắt đầu: {activeSubscription.startDate}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Hết hạn: {activeSubscription.endDate}
                    </span>
                    {activeSubscription.packageDurationName && (
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Thời hạn: {activeSubscription.packageDurationName}
                      </span>
                    )}
                    {activeSubscription.ptSessionsTotal !== undefined && activeSubscription.ptSessionsTotal > 0 && (
                      <span className="flex items-center gap-2 text-emerald-400">
                        <Dumbbell className="h-4 w-4" /> PT: {activeSubscription.ptSessionsUsed} / {activeSubscription.ptSessionsTotal} buổi
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
            </div>
          </Card>
        </motion.div>
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

      {subscriptions.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Lịch sử đăng ký</h3>
          <div className="grid gap-4">
            {subscriptions.map((sub, idx) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <Card className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-fit-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {sub.gymPackageName || "Gói tập"} {sub.packageDurationName && <span className="text-sm font-normal text-slate-500">({sub.packageDurationName})</span>}
                      </h4>
                      <p className="text-sm text-slate-500">{sub.startDate} đến {sub.endDate}</p>
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
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
