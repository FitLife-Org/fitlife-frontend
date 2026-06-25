import { Check, Dumbbell, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";
import { packageService } from "../../services/packageService";
import { subscriptionService } from "../../services/subscriptionService";
import { paymentService } from "../../services/paymentService";
import type { GymPackage } from "../../types/package.type";
import type { Subscription } from "../../types/subscription.type";

export default function PackageListPage() {
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [mySubscription, setMySubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pkgs, sub] = await Promise.all([
          packageService.getPackages(),
          subscriptionService.getMySubscription()
        ]);
        setPackages(pkgs.filter(p => p.status === "ACTIVE"));
        setMySubscription(sub);
      } catch (error) {
        toast.error("Không thể tải danh sách gói tập");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePurchase = async (pkgId: number) => {
    try {
      setProcessingId(pkgId);
      const result = await paymentService.createPayment({
        packageId: pkgId,
        method: "VNPAY"
      });
      
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        toast.success("Đăng ký thành công!");
        const sub = await subscriptionService.getMySubscription();
        setMySubscription(sub);
      }
    } catch (error) {
      toast.error("Lỗi khi xử lý thanh toán");
    } finally {
      setProcessingId(null);
    }
  };

  const renderFeatures = (pkg: GymPackage) => {
    if (!pkg.description) return ["Truy cập phòng tập", "Sử dụng thiết bị cơ bản", "Check-in hàng ngày"];
    return pkg.description.split('\n').map(f => f.replace(/^- /, '').trim()).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fit-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Gói tập" description="Chọn gói hội viên phù hợp với mục tiêu của bạn" />
      <div className="mb-6 inline-flex rounded-3xl border border-fit-border bg-white p-1 shadow-soft">
        {["Theo tháng", "Theo quý -10%", "Theo năm -20%"].map((item, index) => (
          <button className={`rounded-2xl px-8 py-3 text-sm font-bold ${index === 0 ? "bg-fit-primary text-white" : "text-fit-muted"}`} key={item} type="button">{item}</button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {packages.map((item) => {
              const isCurrent = mySubscription?.package.id === item.id && mySubscription?.status === "ACTIVE";
              const isPopular = item.name.toLowerCase().includes("standard") || item.name.toLowerCase().includes("phổ biến");

              return (
                <Card className={`relative flex flex-col p-6 ${isPopular ? "border-fit-primary" : ""} ${isCurrent ? "border-fit-admin" : ""}`} key={item.id}>
                  {isPopular && !isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="success">Phổ biến nhất</Badge></div>}
                  {isCurrent && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge variant="info">Gói hiện tại</Badge></div>}
                  <h2 className="mt-3 text-2xl font-black text-fit-text">{item.name}</h2>
                  <p className={`mt-4 text-3xl font-black ${isCurrent ? "text-fit-admin" : "text-fit-primary"}`}>
                    {formatCurrency(item.price)}
                    <span className="text-sm font-medium text-fit-muted"> / {item.durationDays} ngày</span>
                  </p>
                  <div className="mt-6 flex-1 space-y-4">
                    {renderFeatures(item).map((feature, idx) => (
                      <div className="flex items-start gap-3 text-sm text-fit-text" key={idx}>
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fit-primarySoft text-fit-primary">
                          <Check className="h-3 w-3" />
                        </span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 border-t border-fit-border pt-5 text-sm text-fit-muted">
                    Thời hạn: {item.durationDays} ngày
                  </div>
                  <Button 
                    className="mt-5 w-full" 
                    variant={isCurrent ? "outline" : "primary"}
                    disabled={isCurrent}
                    isLoading={processingId === item.id}
                    onClick={() => handlePurchase(item.id)}
                  >
                    {isCurrent ? "Gói hiện tại" : "Chọn gói"}
                  </Button>
                </Card>
              );
            })}
            
            {packages.length === 0 && (
              <div className="col-span-full py-12 text-center text-fit-muted">
                Hiện tại chưa có gói tập nào đang hoạt động.
              </div>
            )}
          </div>
          
          {packages.length > 0 && (
            <Card className="mt-6 overflow-x-auto p-6">
              <h2 className="text-xl font-bold text-fit-text">So sánh nhanh các gói</h2>
              <div className={`mt-5 grid gap-3 text-sm min-w-[600px]`} style={{ gridTemplateColumns: `1fr repeat(${packages.length}, 1fr)` }}>
                <p className="font-bold text-fit-text">Tính năng</p>
                {packages.map(p => <p className="font-bold text-fit-text" key={p.id}>{p.name}</p>)}
                
                <p className="text-fit-muted">Giá</p>
                {packages.map(p => <p className="text-fit-primary font-medium" key={p.id}>{formatCurrency(p.price)}</p>)}
                
                <p className="text-fit-muted">Thời gian</p>
                {packages.map(p => <p className="text-fit-primary font-medium" key={p.id}>{p.durationDays} ngày</p>)}
                
                {/* Additional simulated comparisons */}
                <p className="text-fit-muted">Check-in không giới hạn</p>
                {packages.map(p => <p className="text-fit-primary" key={p.id}>✓</p>)}
              </div>
            </Card>
          )}
        </div>
        <aside className="space-y-6">
          <Card className="overflow-hidden bg-gradient-to-b from-fit-primarySoft to-fit-trainerSoft p-6">
            <h2 className="text-xl font-black text-fit-text">Ưu đãi mùa hè</h2>
            <p className="mt-4 text-4xl font-black text-fit-trainer">GIẢM 20%</p>
            <p className="mt-3 text-fit-muted">Áp dụng cho tất cả gói tập khi đăng ký theo năm</p>
            <div className="mt-5 grid grid-cols-4 gap-2 text-center">
              {["06 Ngày", "23 Giờ", "48 Phút", "12 Giây"].map((time) => (
                <div className="rounded-xl bg-white p-3 font-bold text-fit-text text-xs" key={time}>{time}</div>
              ))}
            </div>
            <Button className="mt-6 w-full">Đăng ký ngay</Button>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-fit-text">Cần tư vấn gói tập phù hợp?</h2>
            <div className="mt-4 flex items-center gap-3 text-fit-primary">
              <Dumbbell className="h-8 w-8 shrink-0" />
              <span className="text-sm text-fit-muted">Đội ngũ FitLife luôn sẵn sàng hỗ trợ bạn.</span>
            </div>
            <Button className="mt-5 w-full" variant="outline">Chat với tư vấn viên</Button>
          </Card>
        </aside>
      </div>
    </>
  );
}
