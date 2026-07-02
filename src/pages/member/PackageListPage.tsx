import { Check, Dumbbell, Loader2, Star, Zap, Crown, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
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

  const navigate = useNavigate();

  const handlePurchase = async (pkgId: number) => {
    try {
      setProcessingId(pkgId);
      const sub = await subscriptionService.createSubscription({
        gymPackageId: pkgId,
        packageDurationId: 1,
        autoRenew: false
      });

      if (sub && sub.invoiceId) {
        navigate(`/member/payment/${sub.invoiceId}`);
      } else {
        showAlert.success("Thành công", "Đăng ký thành công!");
        const activeSub = await subscriptionService.getMySubscription();
        setMySubscription(activeSub);
      }
    } catch (_error) {
      showAlert.error("Lỗi", "Lỗi khi xử lý đăng ký");
    } finally {
      setProcessingId(null);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const renderFeatures = (pkg: GymPackage) => {
    let features: string[] = [];
    if (pkg.benefits) {
      features = pkg.benefits.split(',').map(f => f.trim()).filter(Boolean);
    } else if (pkg.description) {
      features = pkg.description.split('\n').map(f => f.replace(/^- /, '').trim()).filter(Boolean);
    } else {
      features = ["Truy cập phòng tập 24/7", "Sử dụng thiết bị cao cấp", "Check-in không giới hạn", "Tủ đồ cá nhân", "Phòng tắm & xông hơi"];
    }

    if (pkg.hasAiWorkoutPlan) features.unshift("Tích hợp AI tạo Lịch tập");
    if (pkg.hasNutritionPlan) features.unshift("Tích hợp Gợi ý Dinh dưỡng");
    if (pkg.ptSessionsPerMonth > 0) features.unshift(`Tặng ${pkg.ptSessionsPerMonth} buổi PT cá nhân/tháng`);

    return features;
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

        <div className="max-w-6xl mx-auto">
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {packages.map((item, index) => {
              const isCurrent = mySubscription?.package?.id === item.id && mySubscription?.status === "ACTIVE";
              const isPopular = item.name.toLowerCase().includes("standard") || item.name.toLowerCase().includes("phổ biến") || index === 1; // Fallback highlight
              const isPremium = item.name.toLowerCase().includes("vip") || item.name.toLowerCase().includes("premium") || item.basePrice > 500000;

              // Basic styles
              let cardStyle = "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 rounded-3xl";
              let headerStyle = "text-slate-800";
              let priceStyle = "text-slate-900";
              let buttonClass = "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm";
              let buttonVariant: "primary" | "outline" | "ghost" | "danger" = "outline";
              let featureIconStyle = "bg-slate-100 text-slate-500";
              let featureTextStyle = "text-slate-600";

              if (isPopular) {
                // Standard styles (Brand colors)
                cardStyle = "border-fit-primary bg-gradient-to-b from-emerald-50/50 to-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-3 ring-2 ring-fit-primary/20 rounded-3xl";
                headerStyle = "text-fit-primary";
                priceStyle = "text-fit-primary";
                buttonClass = "bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 text-white shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 hover:shadow-emerald-600/40";
                buttonVariant = "primary";
                featureIconStyle = "bg-emerald-100 text-emerald-600";
                featureTextStyle = "text-slate-700 font-medium";
              } else if (isPremium) {
                // VIP styles (Dark theme, metallic gold, spiky/cool frame)
                cardStyle = "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-3 rounded-none rounded-tr-[3rem] rounded-bl-[3rem]";
                headerStyle = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-sm";
                priceStyle = "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500";
                buttonClass = "bg-gradient-to-r from-yellow-500 to-yellow-700 border-0 !text-black font-black uppercase shadow-lg shadow-yellow-600/40 hover:-translate-y-0.5 hover:shadow-yellow-600/50";
                buttonVariant = "primary";
                featureIconStyle = "bg-yellow-500/20 text-yellow-400";
                featureTextStyle = "text-white font-medium";
              }
              if (isCurrent) {
                cardStyle = "border-sky-500 bg-sky-50 ring-2 ring-sky-500 hover:-translate-y-1 rounded-3xl";
                headerStyle = "text-sky-700";
                priceStyle = "text-sky-600";
                buttonClass = "bg-white text-sky-600 border-2 border-sky-500 hover:bg-sky-50 shadow-sm";
                buttonVariant = "outline";
                featureIconStyle = "bg-sky-100 text-sky-600";
                featureTextStyle = "text-sky-900";
              }

              return (
                  <motion.div variants={itemVariants} key={item.id} className="h-full pt-4">
                    <Card className={`h-full min-h-[550px] relative flex flex-col transition-all duration-500 group ${cardStyle}`}>
                      {item.thumbnailUrl && (
                          <div className={`h-48 w-full overflow-hidden relative ${isPremium ? 'rounded-tr-[3rem]' : 'rounded-t-3xl'}`}>
                            <img
                                src={item.thumbnailUrl}
                                alt={item.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${isPremium ? 'from-gray-900' : 'from-white via-white/20'} to-transparent`} />
                          </div>
                      )}

                      <div className={`p-8 flex-1 flex flex-col ${item.thumbnailUrl ? 'pt-2' : ''}`}>
                        {isPopular && !isCurrent && (
                            <div className={`absolute ${item.thumbnailUrl ? 'top-4' : '-top-4'} left-1/2 -translate-x-1/2 w-full text-center z-10`}>
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg shadow-emerald-700/30 uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 fill-current" /> Phổ biến nhất
                      </span>
                            </div>
                        )}
                        {isPremium && !isPopular && !isCurrent && (
                            <div className={`absolute ${item.thumbnailUrl ? 'top-4' : '-top-4'} left-1/2 -translate-x-1/2 w-full text-center z-10`}>
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white text-xs font-white px-5 py-2 rounded-none rounded-tr-xl rounded-bl-xl shadow-lg shadow-yellow-600/40 uppercase tracking-wider border border-yellow-400">
                        <Crown className="w-4 h-4 fill-current" /> Dành cho VIP
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
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isPremium ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {item.packageType || "BASIC"}
                      </span>
                            <span className={`text-[10px] font-mono ${isPremium ? 'text-gray-300' : 'text-gray-400'}`}>{item.code}</span>
                          </div>
                          <h2 className={`text-3xl font-black ${headerStyle}`}>{item.name}</h2>
                          <p className={`text-sm mt-3 ${isPremium ? 'text-white' : 'text-fit-muted'}`}>{item.description ? item.description.split('\n')[0] : "Tuyệt vời để bắt đầu tập luyện."}</p>
                        </div>

                        <div className="my-6 text-center">
                          <div className="flex justify-center items-end gap-1">
                      <span className={`text-4xl font-black ${priceStyle}`}>
                        {formatCurrency(item.basePrice)}
                      </span>
                          </div>
                          <p className={`text-sm font-medium mt-2 ${isPremium ? 'text-gray-300' : 'text-fit-muted'}`}>
                            / Giá cơ bản
                          </p>
                        </div>

                        <div className="flex-1 space-y-4 mb-8">
                          {renderFeatures(item).map((feature, idx) => (
                              <div className={`flex items-start gap-3 text-sm group/item ${featureTextStyle}`} key={idx}>
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover/item:scale-110 ${featureIconStyle}`}>
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
                  </motion.div>
              );
            })}

            {packages.length === 0 && (
                <div className="col-span-full py-16 text-center text-fit-muted flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-fit-border">
                  <Dumbbell className="h-12 w-12 text-fit-border mb-4" />
                  <p className="text-lg">Hiện tại chưa có gói tập nào đang hoạt động.</p>
                  <p className="text-sm mt-2">Vui lòng quay lại sau.</p>
                </div>
            )}
          </motion.div>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 max-w-[700px] mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-8 text-white shadow-xl group flex flex-col md:flex-row items-center justify-between">
            <div className="absolute top-0 right-1/2 p-4 opacity-10 transform translate-x-1/2 -translate-y-4 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Zap className="w-48 h-48 text-yellow-400" />
            </div>

            <div className="relative z-10 text-center md:text-left mb-8 md:mb-0 md:mr-8">
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-bold bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 mb-4 shadow-sm">
              Ưu đãi giới hạn
            </span>
              <h2 className="text-3xl font-black text-white leading-tight mt-1">Deal sốc mùa hè<br />Đốt mỡ cực bốc</h2>
              <div className="mt-4 flex flex-col sm:flex-row items-center md:items-baseline gap-3">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-sm">
                -20%
              </span>
                <span className="text-gray-300 text-sm mt-2 sm:mt-0 text-left">Áp dụng cho tất cả gói tập khi đăng ký theo năm.<br/>Nhanh tay lên!</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center w-full md:w-auto">
              <div className="grid grid-cols-4 gap-2 text-center mb-6 w-full">
                {["06 Ng", "23 Gi", "48 Ph", "12 Gi"].map((time, i) => (
                    <div className="rounded-xl bg-white/10 backdrop-blur-md p-3 border border-white/10 shadow-inner" key={i}>
                      <div className="font-bold text-white text-xl">{time.split(" ")[0]}</div>
                      <div className="text-[10px] text-gray-400 font-medium uppercase mt-1">{time.split(" ")[1]}</div>
                    </div>
                ))}
              </div>
              <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black border-0 shadow-lg hover:shadow-xl transition-all">
                Nhận ưu đãi ngay
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 max-w-2xl mx-auto">
          <Card className="p-6 border-fit-border hover:border-fit-primary/30 transition-colors shadow-sm bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-fit-primarySoft text-fit-primary flex items-center justify-center shrink-0">
                  <Dumbbell className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-fit-text">Cần tư vấn thêm?</h2>
                  <p className="mt-1 text-sm text-fit-muted leading-relaxed">Để lại thông tin, HLV của chúng tôi sẽ liên hệ bạn ngay lập tức.</p>
                </div>
              </div>
              <Button className="w-full md:w-auto shrink-0 bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm" variant="outline">
                Chat với Tư vấn viên
              </Button>
            </div>
          </Card>
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
