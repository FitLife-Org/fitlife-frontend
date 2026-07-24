import axios from "axios";
import {
  Check,
  Dumbbell,
  Loader2,
  Star,
  Zap,
  Crown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { showAlert } from "../../utils/alert";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
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

        setPackages(activePackages);
        setDurations(activeDurations);
        setMySubscription(sub);

        if (activeDurations.length > 0) {
          setSelectedDurationId(activeDurations[0].id);
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

  const getDurationLabel = (): string => {
    if (!selectedDuration) {
      return "Giá cơ bản";
    }

    return selectedDuration.name;
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

  const renderBoolean = (value: boolean): string => {
    return value ? "Có" : "Không";
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
      <div className="pb-12">
        <div className="mb-10 pt-8 text-center">
          <h1 className="mb-4 text-4xl font-black tracking-tight text-fit-text md:text-5xl">
            Nâng tầm{" "}
            <span className="bg-gradient-to-r from-sky-400 to-green-500 bg-clip-text text-transparent">
            Sức khoẻ của bạn
          </span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-fit-muted">
            Lựa chọn gói hội viên phù hợp để bắt đầu hành trình thay đổi vóc dáng
            và sức khỏe với hệ thống phòng tập đẳng cấp 5 sao.
          </p>
        </div>

        {durations.length > 0 && (
            <div className="mx-auto mb-16 mt-8 flex flex-col items-center">
              <div className="mb-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-fit-primary">
                  Chọn thời hạn
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                  Linh hoạt theo mục tiêu tập luyện
                </h2>
              </div>

              <div className="relative flex w-full max-w-4xl flex-wrap justify-center gap-2 rounded-3xl bg-slate-100/80 p-2 shadow-inner backdrop-blur sm:flex-nowrap sm:rounded-full">
                {durations.map((duration) => {
                  const active = selectedDurationId === duration.id;
                  const isRecommended = duration.months >= 6;

                  return (
                      <button
                          key={duration.id}
                          onClick={() => setSelectedDurationId(duration.id)}
                          className={`relative flex-1 rounded-2xl sm:rounded-full px-4 py-4 sm:py-5 text-center transition-colors ${
                              active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                          }`}
                          style={{ minWidth: "150px" }}
                      >
                        {active && (
                            <motion.div
                                layoutId="active-duration-pill"
                                className="absolute inset-0 rounded-2xl sm:rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-200/50"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                          <span className="text-base font-black sm:text-lg">{duration.name}</span>
                          <span className="text-xs font-medium opacity-80">{duration.months} tháng</span>
                          
                          {/* Discount Badge */}
                          <div className="mt-1 h-5">
                            {duration.discountPercent > 0 && (
                                <motion.span 
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                      active 
                                        ? "bg-emerald-100 text-emerald-700 shadow-sm" 
                                        : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  Giảm {duration.discountPercent}%
                                </motion.span>
                            )}
                          </div>
                        </div>
                        
                        {/* Ping effect for recommended options */}
                        {isRecommended && !active && (
                            <div className="absolute right-2 top-2 z-20 flex h-2.5 w-2.5 sm:right-4 sm:top-4">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fit-primary opacity-75"></span>
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fit-primary"></span>
                            </div>
                        )}
                      </button>
                  );
                })}
              </div>
            </div>
        )}

        <div className="mx-auto max-w-6xl">
          <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
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
                  item.basePrice > 500000;

              const priceInfo = calculatePrice(item);

              let cardStyle =
                  "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg hover:-translate-y-1 rounded-3xl";
              let headerStyle = "text-slate-800";
              let priceStyle = "text-slate-900";
              let buttonClass =
                  "bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm";
              let buttonVariant: "primary" | "outline" | "ghost" | "danger" =
                  "outline";
              let featureIconStyle = "bg-slate-100 text-slate-500";
              let featureTextStyle = "text-slate-600";

              if (isPopular) {
                cardStyle =
                    "border-fit-primary bg-gradient-to-b from-emerald-50/50 to-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-3 ring-2 ring-fit-primary/20 rounded-3xl";
                headerStyle = "text-fit-primary";
                priceStyle = "text-fit-primary";
                buttonClass =
                    "bg-gradient-to-r from-emerald-600 to-emerald-700 border-0 text-white shadow-lg shadow-emerald-600/30 hover:-translate-y-0.5 hover:shadow-emerald-600/40";
                buttonVariant = "primary";
                featureIconStyle = "bg-emerald-100 text-emerald-600";
                featureTextStyle = "text-slate-700 font-medium";
              } else if (isPremium) {
                cardStyle =
                    "bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-3 rounded-none rounded-tr-[3rem] rounded-bl-[3rem]";
                headerStyle =
                    "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-sm";
                priceStyle =
                    "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500";
                buttonClass =
                    "bg-gradient-to-r from-yellow-500 to-yellow-700 border-0 !text-black font-black uppercase shadow-lg shadow-yellow-600/40 hover:-translate-y-0.5 hover:shadow-yellow-600/50";
                buttonVariant = "primary";
                featureIconStyle = "bg-yellow-500/20 text-yellow-400";
                featureTextStyle = "text-white font-medium";
              }

              if (isCurrent) {
                cardStyle =
                    "border-sky-500 bg-sky-50 ring-2 ring-sky-500 hover:-translate-y-1 rounded-3xl";
                headerStyle = "text-sky-700";
                priceStyle = "text-sky-600";
                buttonClass =
                    "bg-white text-sky-600 border-2 border-sky-500 hover:bg-sky-50 shadow-sm";
                buttonVariant = "outline";
                featureIconStyle = "bg-sky-100 text-sky-600";
                featureTextStyle = "text-sky-900";
              }

              return (
                  <motion.div
                      variants={itemVariants}
                      key={item.id}
                      className="h-full pt-4"
                  >
                    <Card
                        className={`group relative flex h-full min-h-[550px] flex-col transition-all duration-500 ${cardStyle}`}
                    >
                      {item.thumbnailUrl && (
                          <div
                              className={`relative h-48 w-full overflow-hidden ${
                                  isPremium ? "rounded-tr-[3rem]" : "rounded-t-3xl"
                              }`}
                          >
                            <img
                                src={item.thumbnailUrl}
                                alt={item.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            <div
                                className={`absolute inset-0 bg-gradient-to-t ${
                                    isPremium
                                        ? "from-gray-900"
                                        : "from-white via-white/20"
                                } to-transparent`}
                            />
                          </div>
                      )}

                      <div
                          className={`flex flex-1 flex-col p-8 ${
                              item.thumbnailUrl ? "pt-2" : ""
                          }`}
                      >
                        {isPopular && !isCurrent && (
                            <div
                                className={`absolute ${
                                    item.thumbnailUrl ? "top-4" : "-top-4"
                                } left-1/2 z-10 w-full -translate-x-1/2 text-center`}
                            >
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-800 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-700/30">
                          <Star className="h-3.5 w-3.5 fill-current" /> Phổ
                          biến nhất
                        </span>
                            </div>
                        )}

                        {isPremium && !isPopular && !isCurrent && (
                            <div
                                className={`absolute ${
                                    item.thumbnailUrl ? "top-4" : "-top-4"
                                } left-1/2 z-10 w-full -translate-x-1/2 text-center`}
                            >
                        <span className="inline-flex items-center gap-1.5 rounded-none rounded-bl-xl rounded-tr-xl border border-yellow-400 bg-gradient-to-r from-yellow-500 to-yellow-700 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-yellow-600/40">
                          <Crown className="h-4 w-4 fill-current" /> Dành cho
                          VIP
                        </span>
                            </div>
                        )}

                        {isCurrent && (
                            <div
                                className={`absolute ${
                                    item.thumbnailUrl ? "top-4" : "-top-4"
                                } left-1/2 z-10 w-full -translate-x-1/2 text-center`}
                            >
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-fit-blue px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                          Gói hiện tại của bạn
                        </span>
                            </div>
                        )}

                        <div className="mb-2 mt-2 text-center">
                          <div className="mb-2 flex items-center justify-center gap-2">
                        <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isPremium
                                    ? "border-yellow-500/30 bg-yellow-500/20 text-yellow-400"
                                    : "border-gray-200 bg-gray-100 text-gray-500"
                            }`}
                        >
                          {item.packageType || "BASIC"}
                        </span>

                            <span
                                className={`font-mono text-[10px] ${
                                    isPremium ? "text-gray-300" : "text-gray-400"
                                }`}
                            >
                          {item.code}
                        </span>
                          </div>

                          <h2 className={`text-3xl font-black ${headerStyle}`}>
                            {item.name}
                          </h2>

                          <p
                              className={`mt-3 text-sm ${
                                  isPremium ? "text-white" : "text-fit-muted"
                              }`}
                          >
                            {item.description
                                ? item.description.split("\n")[0]
                                : "Tuyệt vời để bắt đầu tập luyện."}
                          </p>
                        </div>

                        <div className="my-6 text-center">
                          <div className="flex items-end justify-center gap-1 h-12 overflow-hidden">
                            <AnimatePresence mode="popLayout">
                              <motion.span 
                                key={priceInfo.finalPrice}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className={`text-4xl font-black ${priceStyle}`}
                              >
                                {formatCurrency(priceInfo.finalPrice)}
                              </motion.span>
                            </AnimatePresence>
                          </div>

                          {selectedDuration && priceInfo.discountAmount > 0 && (
                              <p
                                  className={`mt-2 text-sm line-through ${
                                      isPremium ? "text-gray-400" : "text-slate-400"
                                  }`}
                              >
                                {formatCurrency(priceInfo.originalPrice)}
                              </p>
                          )}

                          <p
                              className={`mt-2 text-sm font-medium ${
                                  isPremium ? "text-gray-300" : "text-fit-muted"
                              }`}
                          >
                            / {getDurationLabel()}
                          </p>

                          {selectedDuration && priceInfo.discountAmount > 0 && (
                              <p className="mt-1 text-xs font-bold text-yellow-500">
                                Tiết kiệm {formatCurrency(priceInfo.discountAmount)}
                              </p>
                          )}
                        </div>

                        <div className="mb-8 flex-1 space-y-4">
                          {renderFeatures(item).map((feature, idx) => (
                              <div
                                  className={`group/item flex items-start gap-3 text-sm ${featureTextStyle}`}
                                  key={`${item.id}-${idx}`}
                              >
                          <span
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover/item:scale-110 ${featureIconStyle}`}
                          >
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>

                                <span className="leading-snug">{feature}</span>
                              </div>
                          ))}
                        </div>

                        <Button
                            className={`mt-auto w-full rounded-2xl py-3 text-base font-bold transition-all duration-300 ${buttonClass}`}
                            variant={buttonVariant}
                            disabled={isCurrent || !selectedDurationId}
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
                <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-fit-border bg-white py-16 text-center text-fit-muted">
                  <Dumbbell className="mb-4 h-12 w-12 text-fit-border" />
                  <p className="text-lg">
                    Hiện tại chưa có gói tập nào đang hoạt động.
                  </p>
                  <p className="mt-2 text-sm">Vui lòng quay lại sau.</p>
                </div>
            )}
          </motion.div>
        </div>

        {packages.length > 0 && (
            <div className="mx-auto mt-16 max-w-6xl">
              <div className="mb-6 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-fit-primary">
                  So sánh nhanh
                </p>

                <h2 className="mt-1 text-3xl font-black text-slate-900">
                  Chọn gói phù hợp với nhu cầu của bạn
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Giá bên dưới được tính theo thời hạn:{" "}
                  <span className="font-bold text-fit-primary">
                {selectedDuration?.name || "Chưa chọn"}
              </span>
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
                  <div className="p-4">Tiêu chí</div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-4 text-center">
                        {pkg.name}
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 border-b border-slate-100 text-sm">
                  <div className="p-4 font-semibold text-slate-600">Giá</div>
                  {packages.map((pkg) => {
                    const priceInfo = calculatePrice(pkg);

                    return (
                        <div
                            key={pkg.id}
                            className="p-4 text-center font-black text-fit-primary"
                        >
                          {formatCurrency(priceInfo.finalPrice)}
                        </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-4 border-b border-slate-100 text-sm">
                  <div className="p-4 font-semibold text-slate-600">
                    AI lịch tập
                  </div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-4 text-center">
                        {renderBoolean(pkg.hasAiWorkoutPlan)}
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 border-b border-slate-100 text-sm">
                  <div className="p-4 font-semibold text-slate-600">
                    Gợi ý dinh dưỡng
                  </div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-4 text-center">
                        {renderBoolean(pkg.hasNutritionPlan)}
                      </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 text-sm">
                  <div className="p-4 font-semibold text-slate-600">
                    PT mỗi tháng
                  </div>
                  {packages.map((pkg) => (
                      <div key={pkg.id} className="p-4 text-center">
                        {pkg.ptSessionsPerMonth > 0
                            ? `${pkg.ptSessionsPerMonth} buổi`
                            : "Không"}
                      </div>
                  ))}
                </div>
              </div>
            </div>
        )}

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-16 max-w-[700px]"
        >
          <div className="group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-8 text-white shadow-xl md:flex-row">
            <div className="pointer-events-none absolute right-1/2 top-0 translate-x-1/2 -translate-y-4 p-4 opacity-10 transition-transform duration-700 group-hover:scale-110">
              <Zap className="h-48 w-48 text-yellow-400" />
            </div>

            <div className="relative z-10 mb-8 text-center md:mb-0 md:mr-8 md:text-left">
            <span className="mb-4 inline-flex rounded-full border border-yellow-400/30 bg-yellow-400/20 px-3 py-1 text-xs font-bold text-yellow-400 shadow-sm">
              Ưu đãi giới hạn
            </span>

              <h2 className="mt-1 text-3xl font-black leading-tight text-white">
                Deal sốc mùa hè
                <br />
                Đốt mỡ cực bốc
              </h2>

              <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row md:items-baseline">
              <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-5xl font-black text-transparent drop-shadow-sm">
                -20%
              </span>

                <span className="mt-2 text-left text-sm text-gray-300 sm:mt-0">
                Áp dụng cho tất cả gói tập khi đăng ký theo năm.
                <br />
                Nhanh tay lên!
              </span>
              </div>
            </div>

            <div className="relative z-10 flex w-full flex-col items-center md:w-auto">
              <div className="mb-6 grid w-full grid-cols-4 gap-2 text-center">
                {["06 Ng", "23 Gi", "48 Ph", "12 Gi"].map((time) => (
                    <div
                        className="rounded-xl border border-white/10 bg-white/10 p-3 shadow-inner backdrop-blur-md"
                        key={time}
                    >
                      <div className="text-xl font-bold text-white">
                        {time.split(" ")[0]}
                      </div>
                      <div className="mt-1 text-[10px] font-medium uppercase text-gray-400">
                        {time.split(" ")[1]}
                      </div>
                    </div>
                ))}
              </div>

              <Button className="w-full border-0 bg-yellow-400 font-black text-gray-900 shadow-lg transition-all hover:bg-yellow-500 hover:shadow-xl">
                Nhận ưu đãi ngay
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto mt-12 max-w-2xl">
          <Card className="border-fit-border bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-colors hover:border-fit-primary/30">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fit-primarySoft text-fit-primary">
                  <Dumbbell className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-fit-text">
                    Cần tư vấn thêm?
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-fit-muted">
                    Để lại thông tin, HLV của chúng tôi sẽ liên hệ bạn ngay lập
                    tức.
                  </p>
                </div>
              </div>

              <Button
                  className="w-full shrink-0 border-2 border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 md:w-auto"
                  variant="outline"
              >
                Chat với Tư vấn viên
              </Button>
            </div>
          </Card>
        </div>

        {packages.length > 0 && (
            <div className="mx-auto mt-20 max-w-5xl text-center">
              <h2 className="mb-8 text-2xl font-black text-fit-text">
                Tất cả các gói đều đi kèm tiện ích đẳng cấp
              </h2>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {[
                  {
                    icon: "🕒",
                    title: "Hoạt động 24/7",
                    desc: "Tập bất cứ khi nào bạn muốn",
                  },
                  {
                    icon: "🚿",
                    title: "Phòng tắm cao cấp",
                    desc: "Đầy đủ tiện nghi xông hơi",
                  },
                  {
                    icon: "🧘",
                    title: "Khu vực Yoga",
                    desc: "Không gian yên tĩnh, thư giãn",
                  },
                  {
                    icon: "🚗",
                    title: "Bãi đỗ xe miễn phí",
                    desc: "An toàn và rộng rãi",
                  },
                ].map((feature) => (
                    <div
                        key={feature.title}
                        className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-fit-border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <span className="text-4xl">{feature.icon}</span>

                      <div>
                        <h3 className="text-base font-bold text-fit-text">
                          {feature.title}
                        </h3>

                        <p className="mt-1 text-xs text-fit-muted">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  );
}