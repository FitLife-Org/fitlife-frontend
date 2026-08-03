import axios from "axios";
import {
  Check,
  Dumbbell,
  Loader2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { showAlert } from "../../utils/alert";
import Button from "../../components/common/Button";
import { formatCurrency } from "../../utils/formatCurrency";
import { packageService } from "../../services/packageService";
import { subscriptionService } from "../../services/subscriptionService";
import type { GymPackage, PackageDuration } from "../../types/package.type";
import type { Subscription } from "../../types/subscription.type";

type PriceInfo = {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
};

export default function PackageListPage() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [durations, setDurations] = useState<PackageDuration[]>([]);
  const [selectedDurationId, setSelectedDurationId] = useState<number | null>(
      null
  );
  const [mySubscription, setMySubscription] = useState<Subscription | null>(
      null
  );
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        const [pkgs, sub, durationData] = await Promise.all([
          packageService.getPublicPackages(),
          subscriptionService.getMySubscription(),
          packageService.getPackageDurations(),
        ]);

        const activePackages = pkgs.filter(
            (pkg) => pkg.status === "ACTIVE"
        );

        const activeDurations = durationData.filter(
            (duration) => duration.status === "ACTIVE"
        );

        const uniqueDurationsMap = new Map<number, PackageDuration>();
        for (const d of activeDurations) {
           if (!uniqueDurationsMap.has(d.months)) {
               uniqueDurationsMap.set(d.months, d);
           } else {
               const existing = uniqueDurationsMap.get(d.months)!;
               if (d.discountPercent > existing.discountPercent) {
                   uniqueDurationsMap.set(d.months, d);
               }
           }
        }
        const uniqueDurations = Array.from(uniqueDurationsMap.values());

        uniqueDurations.sort((a, b) => a.months - b.months);

        setPackages(activePackages);
        setDurations(uniqueDurations);
        setMySubscription(sub);

        if (uniqueDurations.length > 0) {
          setSelectedDurationId(uniqueDurations[0].id);
        }
      } catch (error: unknown) {
        console.error("LOAD_PACKAGES_ERROR:", error);
        showAlert.error("Lỗi", "Không thể tải danh sách gói tập");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedDuration = durations.find(
      (duration) => duration.id === selectedDurationId
  );

  const calculatePrice = (pkg: GymPackage): PriceInfo => {
    if (!selectedDuration) {
      return {
        originalPrice: pkg.basePrice,
        discountAmount: 0,
        finalPrice: pkg.basePrice,
      };
    }

    const originalPrice = pkg.basePrice * selectedDuration.months;
    const discountPercent = selectedDuration.discountPercent || 0;
    const discountAmount = originalPrice * (discountPercent / 100);
    const finalPrice = originalPrice - discountAmount;

    return {
      originalPrice,
      discountAmount,
      finalPrice,
    };
  };

  const handlePurchase = async (pkgId: number): Promise<void> => {
    if (!selectedDurationId) {
      showAlert.error("Lỗi", "Vui lòng chọn thời hạn gói tập.");
      return;
    }

    try {
      setProcessingId(pkgId);

      const subscription = await subscriptionService.createSubscription({
        gymPackageId: pkgId,
        packageDurationId: selectedDurationId,
        autoRenew: false,
        note: `Đăng ký gói tập ${selectedDuration?.name || ""}`,
      });

      if (subscription?.invoiceId) {
        navigate(`/member/payment/${subscription.invoiceId}`);
        return;
      }

      showAlert.success(
          "Đã tạo đăng ký",
          "Vui lòng kiểm tra hóa đơn và tiếp tục thanh toán."
      );

      navigate("/member/subscription");
    } catch (error: unknown) {
      console.error("CREATE_SUBSCRIPTION_ERROR:", error);

      let code: number | undefined;
      let message = "Lỗi khi xử lý đăng ký";

      if (axios.isAxiosError(error)) {
        code = error.response?.data?.code;
        message = error.response?.data?.message || message;
      }

      if (code === 8003) {
        message =
            "Bạn đã có gói tập đang hoạt động, không thể đăng ký thêm gói mới.";
      }

      showAlert.error("Lỗi", message);
    } finally {
      setProcessingId(null);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const renderFeatures = (pkg: GymPackage): string[] => {
    let features: string[] = [];

    if (pkg.benefits) {
      features = pkg.benefits
          .split(",")
          .map((feature) => feature.trim())
          .filter(Boolean);
    } else if (pkg.description) {
      features = pkg.description
          .split("\n")
          .map((feature) => feature.replace(/^- /, "").trim())
          .filter(Boolean);
    } else {
      features = [
        "Truy cập phòng tập 24/7",
        "Sử dụng thiết bị cao cấp",
        "Check-in không giới hạn",
        "Tủ đồ cá nhân",
        "Phòng tắm & xông hơi",
      ];
    }

    if (pkg.hasAiWorkoutPlan) {
      features.unshift("Tích hợp AI tạo lịch tập");
    }

    if (pkg.hasNutritionPlan) {
      features.unshift("Tích hợp gợi ý dinh dưỡng");
    }

    if (pkg.ptSessionsPerMonth > 0) {
      features.unshift(
          `Tặng ${pkg.ptSessionsPerMonth} buổi PT cá nhân/tháng`
      );
    }

    return features;
  };

  if (loading) {
    return (
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-fit-primary" />
            <p className="animate-pulse font-medium text-fit-muted">
              Đang tải gói tập...
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="bg-slate-50 min-h-screen pb-16 font-sans">

        <div className="relative bg-slate-950 text-white pt-20 pb-28 mb-12 rounded-[2rem] mx-4 mt-4 overflow-hidden shadow-2xl border border-slate-800">
          {/* Subtle luxury glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fit-primary/30 rounded-full blur-[120px] mix-blend-screen translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-slate-600 bg-slate-800/80 backdrop-blur-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-white">
                  Thẻ Hội Viên Cao Cấp
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-6 text-white leading-tight drop-shadow-md">
                Nâng Tầm <span className="text-fit-primary drop-shadow-[0_0_15px_rgba(5,150,105,0.4)]">Đẳng Cấp</span>
              </h1>
              <p className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
                Đặc quyền thượng lưu tại hệ thống phòng tập 5 sao. Không gian sang trọng, thiết bị tối tân và dịch vụ chuyên nghiệp.
              </p>
            </motion.div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="max-w-6xl mx-auto px-4 mt-8 relative z-20">
          {/* DURATION SELECTOR (SLEEK & COMPACT TABS) */}
          {durations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-2 max-w-2xl mx-auto mb-12 flex items-center border border-slate-100"
            >
              {durations.map((duration) => {
                const isActive = selectedDurationId === duration.id;
                return (
                  <button
                    key={duration.id}
                    onClick={() => setSelectedDurationId(duration.id)}
                    className={`relative flex-1 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-300 ${
                      isActive ? "text-white" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="duration-tab-indicator"
                        className="absolute inset-0 bg-fit-primary rounded-xl"
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-center gap-2">
                      <span>{duration.months} Tháng</span>
                      {duration.discountPercent > 0 && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>
                          -{duration.discountPercent}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* PACKAGE CARDS */}
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-end"
          >
            {packages.map((item, index) => {
              const isCurrent =
                  (mySubscription?.gymPackageId === item.id ||
                      mySubscription?.package?.id === item.id) &&
                  mySubscription?.status === "ACTIVE";

              const isPopular =
                  item.name.toLowerCase().includes("standard") ||
                  item.name.toLowerCase().includes("phổ biến") ||
                  index === 1;

              const isPremium =
                  item.name.toLowerCase().includes("vip") ||
                  item.name.toLowerCase().includes("premium") ||
                  item.name.toLowerCase().includes("centuryon") ||
                  item.basePrice > 500000;

              const priceInfo = calculatePrice(item);
              const pricePerMonth = priceInfo.finalPrice / (selectedDuration?.months || 1);

              // STYLING VARIANTS
              let cardBg = "bg-white border-slate-200";
              let titleColor = "text-slate-900";
              let badgeColor = "bg-slate-100 text-slate-600";
              let priceColor = "text-slate-900";
              let btnClass = "bg-white text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white";
              
              if (isPremium) {
                cardBg = "bg-zinc-900 border-zinc-800 text-white shadow-2xl shadow-zinc-900/50";
                titleColor = "text-yellow-500";
                badgeColor = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
                priceColor = "text-white";
                btnClass = "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black border-0 hover:from-yellow-500 hover:to-yellow-400 font-bold shadow-lg shadow-yellow-500/20";
              } else if (isPopular) {
                cardBg = "bg-white border-fit-primary shadow-xl shadow-fit-primary/10 ring-1 ring-fit-primary";
                titleColor = "text-fit-primary";
                badgeColor = "bg-fit-primary/10 text-fit-primary";
                priceColor = "text-slate-900";
                btnClass = "bg-fit-primary text-white border-0 hover:bg-emerald-600 shadow-md shadow-fit-primary/20";
              }

              if (isCurrent) {
                btnClass = "bg-slate-100 text-slate-500 border-0 cursor-not-allowed";
              }

              return (
                  <motion.div
                      variants={itemVariants}
                      key={item.id}
                      className="relative h-full"
                  >
                    {isPopular && !isPremium && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center z-20">
                        <span className="bg-fit-primary text-white text-[10px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-md">
                          Lựa chọn phổ biến
                        </span>
                      </div>
                    )}

                    <div className={`h-full rounded-[2rem] border p-8 flex flex-col transition-transform duration-500 hover:-translate-y-2 ${cardBg}`}>
                      {/* Badge & Title */}
                      <div className="mb-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${badgeColor}`}>
                          {isCurrent ? "Đang sử dụng" : item.packageType || "MEMBER"}
                        </span>
                        <h2 className={`text-3xl font-black uppercase ${titleColor}`}>
                          {item.name}
                        </h2>
                        <p className={`mt-2 text-sm ${isPremium ? 'text-zinc-400' : 'text-slate-500'}`}>
                          {item.description ? item.description.split("\n")[0] : "Khởi đầu hoàn hảo cho bạn."}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="mb-8 border-b border-dashed border-slate-300/30 pb-8">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black tracking-tight ${priceColor}`}>
                            {formatCurrency(priceInfo.finalPrice)}
                          </span>
                          <span className={`text-sm font-medium ${isPremium ? 'text-zinc-500' : 'text-slate-400'}`}>
                            / {selectedDuration?.months || 1} tháng
                          </span>
                        </div>
                        
                        {selectedDuration && priceInfo.discountAmount > 0 ? (
                          <div className="mt-2 flex flex-col gap-1 text-sm">
                            <span className="line-through text-slate-400">
                              Giá gốc: {formatCurrency(priceInfo.originalPrice)}
                            </span>
                            <span className={`${isPremium ? 'text-yellow-500' : 'text-fit-primary'} font-bold`}>
                              Tiết kiệm: {formatCurrency(priceInfo.discountAmount)} ({selectedDuration.discountPercent}%)
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 flex flex-col gap-1 text-sm opacity-0">
                            <span>Placeholder</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="flex-1 mb-8 space-y-4">
                        {renderFeatures(item).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className={`w-5 h-5 shrink-0 ${isPremium ? 'text-yellow-500' : 'text-fit-primary'}`} />
                            <span className={`text-sm leading-relaxed ${isPremium ? 'text-zinc-300' : 'text-slate-700'}`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button
                          className={`w-full py-4 rounded-xl text-sm uppercase tracking-wider transition-all ${btnClass}`}
                          disabled={isCurrent || !selectedDurationId}
                          isLoading={processingId === item.id}
                          onClick={() => handlePurchase(item.id)}
                      >
                        {isCurrent ? "Đang sử dụng" : "Đăng ký gói này"}
                      </Button>
                    </div>
                  </motion.div>
              );
            })}

            {packages.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-slate-400">
                  <Dumbbell className="mb-4 h-12 w-12 opacity-50" />
                  <p className="text-lg font-medium text-slate-600">
                    Hiện tại chưa có gói tập nào đang hoạt động.
                  </p>
                  <p className="mt-2 text-sm">Vui lòng quay lại sau.</p>
                </div>
            )}
          </motion.div>
        </div>

        {/* COMPARISON TABLE */}
        {packages.length > 0 && (
            <div className="mx-auto mt-24 max-w-5xl px-4">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                  So sánh quyền lợi
                </h2>
                <p className="mt-3 text-slate-500">
                  Bảng giá tính theo thời hạn: <span className="font-bold text-fit-primary">{selectedDuration?.name || "Chưa chọn"}</span>
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/40 border border-slate-100">
                <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-100">
                  <div className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Tiêu chí</div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-5 text-center font-bold text-slate-800 uppercase tracking-wide text-sm">
                        {pkg.name}
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 border-b border-slate-50 text-sm hover:bg-slate-50 transition-colors">
                  <div className="p-5 font-semibold text-slate-600">Tổng thanh toán</div>
                  {packages.map((pkg) => {
                    const priceInfo = calculatePrice(pkg);
                    return (
                        <div key={pkg.id} className="p-5 text-center font-bold text-slate-900">
                          {formatCurrency(priceInfo.finalPrice)}
                        </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-4 border-b border-slate-50 text-sm hover:bg-slate-50 transition-colors">
                  <div className="p-5 font-semibold text-slate-600">Phân tích AI</div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-5 text-center flex justify-center">
                        {pkg.hasAiWorkoutPlan ? <Check className="w-5 h-5 text-fit-primary" /> : <span className="text-slate-300">-</span>}
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 border-b border-slate-50 text-sm hover:bg-slate-50 transition-colors">
                  <div className="p-5 font-semibold text-slate-600">Dinh dưỡng</div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-5 text-center flex justify-center">
                        {pkg.hasNutritionPlan ? <Check className="w-5 h-5 text-fit-primary" /> : <span className="text-slate-300">-</span>}
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 text-sm hover:bg-slate-50 transition-colors">
                  <div className="p-5 font-semibold text-slate-600">PT Kèm riêng</div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-5 text-center font-medium text-slate-700">
                        {pkg.ptSessionsPerMonth > 0 ? `${pkg.ptSessionsPerMonth} buổi/tháng` : <span className="text-slate-300">-</span>}
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}

      </div>
  );
}