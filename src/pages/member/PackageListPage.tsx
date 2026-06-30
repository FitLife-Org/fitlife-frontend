import { Check, Dumbbell, Loader2, Star, Zap, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { showAlert } from "../../utils/alert";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
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
  const [billingCycle, setBillingCycle] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pkgs, sub] = await Promise.all([
          packageService.getPublicPackages(),
          subscriptionService.getMySubscription()
        ]);
        setPackages(pkgs.filter(p => p.status === "ACTIVE"));
        setMySubscription(sub);
      } catch (_error) {
        showAlert.error("Lỗi", "Không thể tải danh sách gói tập");
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
        showAlert.success("Thành công", "Đăng ký thành công!");
        const sub = await subscriptionService.getMySubscription();
        setMySubscription(sub);
      }
    } catch (_error) {
      showAlert.error("Lỗi", "Lỗi khi xử lý thanh toán");
    } finally {
      setProcessingId(null);
    }
  };

  const renderFeatures = (pkg: GymPackage) => {
    if (!pkg.description) return ["Truy cập phòng tập 24/7", "Sử dụng thiết bị cao cấp", "Check-in không giới hạn", "Tủ đồ cá nhân", "Phòng tắm & xông hơi"];
    return pkg.description.split('\n').map(f => f.replace(/^- /, '').trim()).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-fit-primary" />
          <p className="text-fit-muted font-medium animate-pulse">Đang tải gói tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-10 text-center pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-fit-text tracking-tight mb-4">
  Nâng tầm <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-green-500">Sức khoẻ của bạn</span>
</h1>
        <p className="text-lg text-fit-muted max-w-2xl mx-auto">
          Lựa chọn gói hội viên phù hợp để bắt đầu hành trình thay đổi vóc dáng và sức khỏe với hệ thống phòng tập đẳng cấp 5 sao.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex rounded-full border border-fit-border bg-white p-1 shadow-sm">
          {["Theo tháng", "Theo quý (-10%)", "Theo năm (-20%)"].map((item, index) => (
            <button 
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${billingCycle === index ? "bg-fit-text text-white shadow-md" : "text-fit-muted hover:text-fit-text hover:bg-gray-50"}`} 
              key={item} 
              type="button"
              onClick={() => setBillingCycle(index)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px] items-start">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((item, index) => {
            const isCurrent = mySubscription?.package.id === item.id && mySubscription?.status === "ACTIVE";
            const isPopular = item.name.toLowerCase().includes("standard") || item.name.toLowerCase().includes("phổ biến") || index === 1; // Fallback highlight
            const isPremium = item.name.toLowerCase().includes("vip") || item.name.toLowerCase().includes("premium") || item.price > 500000;

            let cardStyle = "border-fit-border hover:border-fit-primary/50 hover:shadow-xl";
            const headerStyle = "text-fit-text";
            let priceStyle = "text-fit-primary";
            let buttonClass = "";
            let buttonVariant: "primary" | "outline" | "ghost" | "danger" = "outline";
            
            if (isPopular) {
              cardStyle = "border-fit-primary ring-2 ring-fit-primary shadow-[0_8px_30px_rgb(5,150,105,0.15)] transform md:-translate-y-4 hover:shadow-[0_8px_40px_rgb(5,150,105,0.25)]";
              buttonClass = "bg-gradient-to-r from-fit-primary to-fit-blue border-0 text-white hover:from-fit-primaryHover hover:to-blue-700 shadow-md";
              buttonVariant = "primary";
            } else if (isPremium) {
              cardStyle = "border-fit-purple ring-1 ring-fit-purple shadow-[0_8px_30px_rgb(124,58,237,0.1)] hover:shadow-[0_8px_40px_rgb(124,58,237,0.2)]";
              priceStyle = "text-fit-purple";
              buttonClass = "bg-fit-purple hover:bg-purple-700 text-white shadow-md focus:ring-fit-purple border-fit-purple";
              buttonVariant = "primary";
            }
            if (isCurrent) {
              cardStyle = "border-fit-blue bg-fit-blueSoft/30 ring-2 ring-fit-blue";
              priceStyle = "text-fit-blue";
              buttonClass = "bg-white text-fit-blue border-2 border-fit-blue hover:bg-fit-blueSoft shadow-sm";
              buttonVariant = "outline";
            }

            return (
              <Card className={`relative flex flex-col transition-all duration-500 group bg-white overflow-hidden ${cardStyle}`} key={item.id}>
                {item.thumbnailUrl && (
                  <div className="h-48 w-full overflow-hidden relative">
                    <img 
                      src={item.thumbnailUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                  </div>
                )}
                
                <div className={`p-8 flex-1 flex flex-col ${item.thumbnailUrl ? 'pt-2' : ''}`}>
                  {isPopular && !isCurrent && (
                    <div className={`absolute ${item.thumbnailUrl ? 'top-4' : '-top-4'} left-1/2 -translate-x-1/2 w-full text-center z-10`}>
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-fit-primary to-fit-blue text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 fill-current" /> Phổ biến nhất
                      </span>
                    </div>
                  )}
                  {isPremium && !isPopular && !isCurrent && (
                    <div className={`absolute ${item.thumbnailUrl ? 'top-4' : '-top-4'} left-1/2 -translate-x-1/2 w-full text-center z-10`}>
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-fit-purple to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                        <Crown className="w-3.5 h-3.5 fill-current" /> Dành cho VIP
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className={`absolute ${item.thumbnailUrl ? 'top-4' : '-top-4'} left-1/2 -translate-x-1/2 w-full text-center z-10`}>
                      <span className="inline-flex items-center gap-1.5 bg-fit-blue text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                        Gói hiện tại của bạn
                      </span>
                    </div>
                  )}

                  <div className="mb-2 mt-2 text-center">
                    <div className="flex justify-center items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wider border border-gray-200">
                        {item.packageType || "BASIC"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">{item.code}</span>
                    </div>
                    <h2 className={`text-2xl font-black ${headerStyle}`}>{item.name}</h2>
                    <p className="text-fit-muted text-sm mt-2">{item.description ? item.description.split('\n')[0] : "Tuyệt vời để bắt đầu tập luyện."}</p>
                  </div>
                  
                  <div className="my-6 text-center">
                    <div className="flex justify-center items-end gap-1">
                      <span className={`text-4xl font-black ${priceStyle}`}>
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-fit-muted mt-2">
                      / {item.durationDays} ngày sử dụng
                    </p>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                    {renderFeatures(item).map((feature, idx) => (
                      <div className="flex items-start gap-3 text-sm text-fit-text group/item" key={idx}>
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover/item:scale-110 ${isPremium ? 'bg-fit-purpleSoft text-fit-purple' : 'bg-fit-primarySoft text-fit-primary'}`}>
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`mt-auto w-full py-3 text-base font-bold transition-all duration-300 rounded-2xl ${buttonClass}`} 
                    variant={buttonVariant}
                    disabled={isCurrent}
                    isLoading={processingId === item.id}
                    onClick={() => handlePurchase(item.id)}
                  >
                    {isCurrent ? "Đang sử dụng" : "Đăng ký ngay"}
                  </Button>
                </div>
              </Card>
            );
          })}
          
          {packages.length === 0 && (
            <div className="col-span-full py-16 text-center text-fit-muted flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-fit-border">
              <Dumbbell className="h-12 w-12 text-fit-border mb-4" />
              <p className="text-lg">Hiện tại chưa có gói tập nào đang hoạt động.</p>
              <p className="text-sm mt-2">Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
        
        <aside className="space-y-6 md:sticky md:top-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-8 text-white shadow-xl group">
            <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-32 h-32 text-yellow-400" />
            </div>
            
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 mb-4 shadow-sm">
              Ưu đãi giới hạn
            </span>
            
            <h2 className="text-2xl font-black text-white relative z-10 leading-tight mt-1">Deal sốc mùa hè<br />Đốt mỡ cực bốc</h2>
            <div className="mt-4 flex items-baseline gap-2 relative z-10">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-sm">
                -20%
              </span>
            </div>
            <p className="mt-3 text-gray-300 text-sm relative z-10">Áp dụng cho tất cả gói tập khi đăng ký theo năm. Nhanh tay lên!</p>
            
            <div className="mt-6 grid grid-cols-4 gap-2 text-center relative z-10">
              {["06 Ng", "23 Gi", "48 Ph", "12 Gi"].map((time, i) => (
                <div className="rounded-xl bg-white/10 backdrop-blur-md p-2 border border-white/10 shadow-inner" key={i}>
                  <div className="font-bold text-white text-lg">{time.split(" ")[0]}</div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase mt-1">{time.split(" ")[1]}</div>
                </div>
              ))}
            </div>
            
            <Button className="mt-6 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black border-0 shadow-lg hover:shadow-xl transition-all">
              Nhận ưu đãi ngay
            </Button>
          </div>

          <Card className="p-6 border-fit-border hover:border-fit-primary/30 transition-colors shadow-sm">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-fit-primarySoft text-fit-primary flex items-center justify-center shrink-0">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-fit-text">Cần tư vấn thêm?</h2>
                <p className="mt-1 text-sm text-fit-muted leading-relaxed">Để lại thông tin, HLV của chúng tôi sẽ liên hệ bạn.</p>
              </div>
            </div>
            <Button className="mt-5 w-full bg-white text-fit-text border border-fit-border hover:bg-gray-50 shadow-sm" variant="outline">
              Chat với Tư vấn viên
            </Button>
          </Card>
        </aside>
      </div>

      {packages.length > 0 && (
        <div className="mt-20 text-center max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-fit-text mb-8">Tất cả các gói đều đi kèm tiện ích đẳng cấp</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🕒', title: 'Hoạt động 24/7', desc: 'Tập bất cứ khi nào bạn muốn' },
              { icon: '🚿', title: 'Phòng tắm cao cấp', desc: 'Đầy đủ tiện nghi xông hơi' },
              { icon: '🧘', title: 'Khu vực Yoga', desc: 'Không gian yên tĩnh, thư giãn' },
              { icon: '🚗', title: 'Bãi đỗ xe miễn phí', desc: 'An toàn và rộng rãi' },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-fit-border flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <span className="text-4xl">{feature.icon}</span>
                <div>
                  <h3 className="font-bold text-base text-fit-text">{feature.title}</h3>
                  <p className="text-xs text-fit-muted mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
