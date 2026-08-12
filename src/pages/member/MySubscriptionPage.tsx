import { Calendar, CreditCard, CheckCircle2, Clock, XCircle, Dumbbell, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";
import { useMySubscription } from "../../hooks/useMySubscription";
import { usePageAnimation } from "../../hooks/usePageAnimation";

export default function MySubscriptionPage() {
  const containerRef = usePageAnimation();
  const { subscriptions, loading, activeSubscription, calculateDaysLeft, handleRenew } = useMySubscription();
  const navigate = useNavigate();

  const onRenew = async (id: number) => {
    try {
      const newSub = await handleRenew(id);
      if (newSub.invoiceId) {
        toast.success("Đã tạo hóa đơn gia hạn.");
        navigate(`/member/payment/${newSub.invoiceId}`);
      }
    } catch (error) {
      toast.error("Không thể gia hạn gói tập.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1 inline" />Äang hoáº¡t Ä‘á»™ng</Badge>;
      case "PENDING_PAYMENT":
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1 inline" />Chá» thanh toĂ¡n</Badge>;
      case "EXPIRED":
        return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1 inline" />ÄĂ£ háº¿t háº¡n</Badge>;
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
          title="GĂ³i há»™i viĂªn cá»§a tĂ´i" 
          description="Quáº£n lĂ½ vĂ  theo dĂµi cĂ¡c gĂ³i táº­p luyá»‡n báº¡n Ä‘Ă£ Ä‘Äƒng kĂ½" 
        />
        <Link 
          to="/member/packages" 
          className="hidden md:flex items-center gap-2 rounded-xl bg-fit-primary px-6 py-3 font-bold text-white shadow-lg shadow-fit-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          <CreditCard className="h-5 w-5" />
          Mua gĂ³i má»›i
        </Link>
      </div>

      {activeSubscription ? (
        <div className="gsap-animate">
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
                  <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight">{activeSubscription.gymPackageName || "GĂ³i táº­p"}</h2>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-300">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Báº¯t Ä‘áº§u: {activeSubscription.startDate || "ChÆ°a kĂ­ch hoáº¡t"}
                    </span>

                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Háº¿t háº¡n: {activeSubscription.endDate || "ChÆ°a kĂ­ch hoáº¡t"}
                    </span>
                    {activeSubscription.packageDurationName && (
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Thá»i háº¡n: {activeSubscription.packageDurationName}
                      </span>
                    )}
                    {activeSubscription.ptSessionsTotal !== undefined && activeSubscription.ptSessionsTotal > 0 && (
                      <span className="flex items-center gap-2 text-emerald-400">
                        <Dumbbell className="h-4 w-4" /> PT: {activeSubscription.ptSessionsUsed} / {activeSubscription.ptSessionsTotal} buá»•i
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-[200px] rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20 text-center">
                  <p className="text-sm font-medium text-slate-300">Thá»i gian cĂ²n láº¡i</p>
                  <p className="mt-2 text-5xl font-black text-emerald-400">
                    {calculateDaysLeft(activeSubscription.endDate)} <span className="text-xl">ngĂ y</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-10 text-center border-dashed border-2 border-slate-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900">ChÆ°a cĂ³ gĂ³i táº­p nĂ o Ä‘ang hoáº¡t Ä‘á»™ng</h3>
          <p className="mt-2 text-slate-500">Báº¡n chÆ°a Ä‘Äƒng kĂ½ gĂ³i táº­p nĂ o hoáº·c gĂ³i táº­p Ä‘Ă£ háº¿t háº¡n.</p>
          <Link 
            to="/member/packages" 
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-fit-primary px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1"
          >
            Xem cĂ¡c gĂ³i táº­p ngay
          </Link>
        </Card>
      )}

      {subscriptions.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Lá»‹ch sá»­ Ä‘Äƒng kĂ½</h3>
          <div className="grid gap-4">
            {subscriptions.map((sub, idx) => (
              <div
                key={sub.id}
                className="gsap-animate"
              >
                <Card className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-fit-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
                        {sub.gymPackageName || "GĂ³i táº­p"} {sub.packageDurationName && <span className="text-sm font-normal text-slate-500">({sub.packageDurationName})</span>}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {sub.startDate || "ChÆ°a kĂ­ch hoáº¡t"} Ä‘áº¿n {sub.endDate || "ChÆ°a kĂ­ch hoáº¡t"}
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
                        Thanh toĂ¡n <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



