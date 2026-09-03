import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Dumbbell, Shield, Sparkles, Crown, Zap, Gift, Tag, ArrowRight, Activity, Calendar } from "lucide-react";
import Button from "../../../components/common/Button";
import { ROUTES } from "../../../config/routes";
import { usePageAnimation } from "../../../hooks/usePageAnimation";
import { packageService } from "../../../services/packageService";
import { subscriptionService } from "../../../services/subscriptionService";
import type { GymPackage, PackageDuration, PTPackage, AddonService, Promotion } from "../../../types/package.type";
import type { Subscription } from "../../../types/subscription.type";
import { showAlert } from "../../../utils/alert";
import { formatCurrency } from "../../../utils/formatCurrency";
import { calculatePromotionDiscount, calculateUpgradeCredit } from "../../../utils/validators/packageBusinessValidator";

type ActiveTab = "MEMBERSHIP" | "PT_PACKAGES" | "ADDONS";

const DEFAULT_GYM_PACKAGES: GymPackage[] = [
  {
    id: 1,
    code: "PKG_BASIC",
    name: "Basic",
    packageLevel: "BASIC",
    packageType: "BASIC",
    accessType: "LIMITED_TIME",
    basePrice: 399000,
    shortDescription: "Dành cho người mới tập, học sinh - sinh viên.",
    description: "Giờ  tập 08:00 - 16:00, máy tập, cardio, phòng thay đồ, check-in QR.",
    targetAudience: "Người mới tập, HSSV",
    hasAiWorkoutPlan: false,
    hasNutritionPlan: false,
    ptSessionsPerMonth: 0,
    benefits: "Máy tập & Cardio,Check-in QR nhanh chóng,Phòng thay đồ riêng,Khung giờ 08:00 - 16:00",
    status: "ACTIVE",
  },
  {
    id: 2,
    code: "PKG_STANDARD",
    name: "Standard",
    packageLevel: "STANDARD",
    packageType: "STANDARD",
    accessType: "FULL_TIME",
    basePrice: 599000,
    shortDescription: "Toàn thời gian cho người tập luyện thường xuyên.",
    description: "Tập toàn thời gian, tham gia lớpp Yoga/Zumba/Aerobic, gợi ý từ FitLife AI.",
    targetAudience: "Người tập thường xuyên",
    hasAiWorkoutPlan: true,
    hasNutritionPlan: true,
    ptSessionsPerMonth: 0,
    benefits: "Tập toàn thời gian 24/7,Lớp nhóm Yoga/Zumba/Aerobic,Đo chỉ số cơ thể hàng tháng,Lịch tập & FitLife AI gợi ý",
    status: "ACTIVE",
    featured: true,
  },
  {
    id: 3,
    code: "PKG_PREMIUM",
    name: "Premium",
    packageLevel: "PREMIUM",
    packageType: "PREMIUM",
    accessType: "FULL_TIME",
    basePrice: 999000,
    shortDescription: "Dành cho người có mục tiêu cụ thể, tặng 2 buổi PT/tháng.",
    description: "PT 2 buổi/tháng, khăn tập miễn phí, kế hoạch tập & dinh dưỡng cá nhân, hỗ trợ đóng băng.",
    targetAudience: "Người có mục tiêu tăng cơ / giảm cân",
    hasAiWorkoutPlan: true,
    hasNutritionPlan: true,
    ptSessionsPerMonth: 2,
    benefits: "PT cá nhân 2 buổi/tháng,Đánh giá thể trạng chuyên sâu,Khăn tập miễn phí mỗi buổi,Khu vực phục hồi cơ bản,Quyền lợi đóng băng gói",
    status: "ACTIVE",
  },
  {
    id: 4,
    code: "PKG_VIP",
    name: "VIP",
    packageLevel: "VIP",
    packageType: "VIP",
    accessType: "FULL_TIME",
    basePrice: 3190000,
    shortDescription: "Gói cao cấpp nhấpt vớpi 8 buổi PT/tháng và đặc quyền riêng biệt.",
    description: "8 buổi PT/tháng, PT chính theo dõi 1-1, tủ đồ cố định, nước uống, quyền chuyển nhượng.",
    targetAudience: "Hội viên cao cấp, cần PT theo dõi 1-1",
    hasAiWorkoutPlan: true,
    hasNutritionPlan: true,
    ptSessionsPerMonth: 8,
    benefits: "8 buổi PT/tháng với 1 PT chính 1-1,Tủ đồ cố định & Khăn tập riêng,Ưu tiên đặt lịch & Nước uống miễn phí,Đánh giá cơ thể 2 lần/tháng,Quyềnn chuyển nhượng 1 lần",
    status: "ACTIVE",
  },
];

function enrichPackageData(backendPkgs: GymPackage[]): GymPackage[] {
  if (!backendPkgs || backendPkgs.length === 0) {
    return DEFAULT_GYM_PACKAGES;
  }

  const enrichedDefaults: GymPackage[] = DEFAULT_GYM_PACKAGES.map((defPkg) => {
    const defCode = (defPkg.code || "").toUpperCase();
    const defLevel = (defPkg.packageLevel || defPkg.packageType || defPkg.name || "").toUpperCase();

    const match = backendPkgs.find((b) => {
      const bCode = (b.code || "").toUpperCase();
      const bLevel = (b.packageLevel || b.packageType || b.name || "").toUpperCase();
      return (
        (bCode && bCode === defCode) ||
        (bLevel && (bLevel.includes(defLevel) || defLevel.includes(bLevel)))
      );
    });

    if (!match) return defPkg;

    return {
      ...defPkg,
      ...match,
      name: match.name || defPkg.name,
      packageLevel: match.packageLevel || match.packageType || defPkg.packageLevel,
      packageType: match.packageType || match.packageLevel || defPkg.packageType,
      shortDescription: (match.shortDescription && match.shortDescription.trim() !== "") ? match.shortDescription : defPkg.shortDescription,
      description: (match.description && match.description.trim() !== "") ? match.description : defPkg.description,
      targetAudience: (match.targetAudience && match.targetAudience.trim() !== "") ? match.targetAudience : defPkg.targetAudience,
      benefits: (match.benefits && match.benefits.trim() !== "") ? match.benefits : defPkg.benefits,
      ptSessionsPerMonth: (match.ptSessionsPerMonth !== undefined && match.ptSessionsPerMonth !== null && match.ptSessionsPerMonth > 0) ? match.ptSessionsPerMonth : defPkg.ptSessionsPerMonth,
      hasAiWorkoutPlan: match.hasAiWorkoutPlan !== undefined ? match.hasAiWorkoutPlan : defPkg.hasAiWorkoutPlan,
      hasNutritionPlan: match.hasNutritionPlan !== undefined ? match.hasNutritionPlan : defPkg.hasNutritionPlan,
    };
  });

  const extraBackendPkgs = backendPkgs.filter((b) => {
    const bCode = (b.code || "").toUpperCase();
    const bLevel = (b.packageLevel || b.packageType || b.name || "").toUpperCase();
    return !DEFAULT_GYM_PACKAGES.some((d) => {
      const dCode = (d.code || "").toUpperCase();
      const dLevel = (d.packageLevel || d.packageType || d.name || "").toUpperCase();
      return (bCode && dCode === bCode) || (bLevel && bLevel.includes(dLevel));
    });
  }).map((b) => ({
    ...b,
    shortDescription: b.shortDescription || b.description || "Gói tập FitLife cao cấp",
    benefits: b.benefits || "Máy tập & Cardio,Check-in QR nhanh chóng,Phòng thay đồ riêng",
    packageLevel: b.packageLevel || b.packageType || "STANDARD",
    packageType: b.packageType || b.packageLevel || "STANDARD",
  }));

  return [...enrichedDefaults, ...extraBackendPkgs];
}

function getTierLevelNumber(type?: string | null): number {
  if (!type) return 0;
  const upper = type.trim().toUpperCase();
  if (upper.includes("VIP")) return 4;
  if (upper.includes("PREMIUM")) return 3;
  if (upper.includes("STANDARD")) return 2;
  if (upper.includes("BASIC")) return 1;
  return 0;
}

export default function PricingSection() {
  const containerRef = usePageAnimation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>("MEMBERSHIP");
  const [packages, setPackages] = useState<GymPackage[]>(DEFAULT_GYM_PACKAGES);
  const [durations, setDurations] = useState<PackageDuration[]>([]);
  const [ptPackages, setPtPackages] = useState<PTPackage[]>([]);
  const [addonServices, setAddonServices] = useState<AddonService[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [mySubscription, setMySubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Promotion State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoMessage, setPromoMessage] = useState<{ isSuccess: boolean; text: string } | null>(null);

  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      const orderA = getTierLevelNumber(a.packageType || a.packageLevel || a.code || a.name);
      const orderB = getTierLevelNumber(b.packageType || b.packageLevel || b.code || b.name);
      return orderA - orderB;
    });
  }, [packages]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const [pkgRes, subRes, durRes, ptRes, addonRes] = await Promise.all([
          packageService.getPublicPackages({ size: 100 }),
          subscriptionService.getMySubscription(),
          packageService.getPackageDurations(),
          packageService.getPTPackages(),
          packageService.getAddonServices(),
        ]);

        if (!isMounted) return;

        if (pkgRes && pkgRes.length > 0) {
          setPackages(enrichPackageData(pkgRes));
        }
        setMySubscription(subRes);
        if (durRes && durRes.length > 0) setDurations(durRes);
        if (ptRes) setPtPackages(ptRes);
        if (addonRes) setAddonServices(addonRes);

        const availableMonths = Array.from(new Set(durRes.map((d) => d.months || d.durationMonths || 1))).sort((a, b) => a - b);
        if (availableMonths.length > 0) {
          setSelectedMonths(availableMonths[0]);
        }
      } catch (err) {
        console.error("LOAD_PACKAGES_ERROR:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoMessage({ isSuccess: false, text: "Vui lòng nhập mã khuyến mãi." });
      return;
    }
    const promo = await packageService.verifyPromotion(promoCodeInput.trim());
    if (promo) {
      setAppliedPromo(promo);
      setPromoMessage({ isSuccess: true, text: `Áp dụng thành công: ${promo.promotionName}` });
    } else {
      setAppliedPromo(null);
      setPromoMessage({ isSuccess: false, text: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn (Thử FITNEW10, FITGROUP15, FITSTUDENT10)." });
    }
  };

  const getDurationForPackage = (packageId: number): PackageDuration | null => {
    const found = durations.find(
      (d) => d.gymPackageId === packageId && (d.months === selectedMonths || d.durationMonths === selectedMonths)
    );
    if (found) return found;

    // Synthetic duration fallback
    return {
      id: packageId * 10 + selectedMonths,
      code: `DUR_${packageId}_${selectedMonths}M`,
      name: `${selectedMonths} tháng`,
      months: selectedMonths,
      durationMonths: selectedMonths,
      discountPercent: selectedMonths === 12 ? 25 : selectedMonths === 6 ? 15 : selectedMonths === 3 ? 10 : 0,
      gymPackageId: packageId,
      status: "ACTIVE",
    };
  };

  const calculateFinalPackagePrice = (gymPackage: GymPackage) => {
    const duration = getDurationForPackage(gymPackage.id);
    const months = duration ? (duration.months || duration.durationMonths || 1) : selectedMonths;
    const baseOriginal = duration?.price || duration?.originalPrice || (gymPackage.basePrice * months);

    let priceAfterDurationDiscount = duration?.discountPrice || duration?.sellingPrice || baseOriginal;
    if (!duration?.discountPrice && !duration?.sellingPrice && duration?.discountPercent) {
      priceAfterDurationDiscount = baseOriginal * (1 - duration.discountPercent / 100);
    }

    let finalPrice = priceAfterDurationDiscount;
    let promoDiscountAmount = 0;

    if (appliedPromo) {
      const promoResult = calculatePromotionDiscount(priceAfterDurationDiscount, appliedPromo, gymPackage.id);
      if (promoResult.isValid) {
        promoDiscountAmount = promoResult.discountAmount;
        finalPrice = promoResult.finalPrice;
      }
    }

    return {
      originalPrice: baseOriginal,
      durationPrice: priceAfterDurationDiscount,
      promoDiscountAmount,
      finalPrice: Math.round(finalPrice),
      monthlyRate: Math.round(finalPrice / months),
    };
  };

  const handlePurchase = async (pkg: GymPackage) => {
    if (processingId !== null) return;

    const duration = getDurationForPackage(pkg.id);
    if (!duration) {
      void showAlert.error("Lỗi", "Không tìm thấy thời hạn phù hợp.");
      return;
    }

    try {
      setProcessingId(pkg.id);
      const currentPkgLevel = getTierLevelNumber(mySubscription?.packageLevel || mySubscription?.gymPackageName);
      const targetPkgLevel = getTierLevelNumber(pkg.packageLevel || pkg.packageType);

      if (mySubscription?.status === "ACTIVE") {
        if (mySubscription.gymPackageId === pkg.id) {
          const confirm = await showAlert.confirm(
            "Gia hạn gói tập",
            `Bạn đang sử dụng gói ${pkg.name}. Bạn có muốn tiếp tục gia hạn thêm ${selectedMonths} tháng?`
          );
          if (confirm.isConfirmed) {
            const renewed = await subscriptionService.renewSubscription(mySubscription.id);
            if (renewed.invoiceId) navigate(`/member/payment/${renewed.invoiceId}`);
          }
          return;
        }

        if (targetPkgLevel > currentPkgLevel) {
          const upgradeCalc = calculateUpgradeCredit(mySubscription, duration, pkg);
          const confirm = await showAlert.confirm(
            "Xác nhận nâng cấp gói",
            `Gói hiện tại còn ${upgradeCalc.daysRemaining} ngày (giá trị khấu trừ ${formatCurrency(upgradeCalc.remainingValueCredit)}).\n\n` +
            `Số tiềnn cần thanh toán cho gói ${pkg.name}: ${formatCurrency(upgradeCalc.finalAmountToPay)}.`
          );
          if (confirm.isConfirmed) {
            const upgraded = await subscriptionService.upgradeSubscription(mySubscription.id, duration.id);
            if (upgraded.invoiceId) navigate(`/member/payment/${upgraded.invoiceId}`);
            else navigate(ROUTES.MEMBER_SUBSCRIPTION);
          }
          return;
        }

        void showAlert.warning("Không thể thao tác", "Bạn đang có gói tập hoạt động. Hiện chỉ hỗ trợ nâng cấp gói cao hơn hoặc gia hạn.");
        return;
      }

      // Create new subscription
      const newSub = await subscriptionService.createSubscription({
        gymPackageId: pkg.id,
        packageDurationId: duration.id,
        promotionCode: appliedPromo?.promotionCode,
      });

      if (newSub.invoiceId) {
        navigate(`/member/payment/${newSub.invoiceId}`);
      } else {
        void showAlert.success("Đăng ký thành công", "Vui lòng kiểm tra danh sách hóa đơn.");
        navigate(ROUTES.MEMBER_SUBSCRIPTION);
      }
    } catch (err: unknown) {
      console.error(err);
      void showAlert.error("Lỗi", "Không thể hoàn tất đăng ký. Vui lòng thử lại.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 md:p-12 text-white shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Dumbbell className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Bảng giá & Dịch vụ FitLife
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Đầu tư cho sức khỏe & Vóc dáng
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Lựa chọn gói tập linh hoạt theo nhu cầu, Đăng ký HLV cá nhân 1-1 hoặc trải nghiệm các dịch vụ bổ sung cao cấpp.
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setActiveTab("MEMBERSHIP")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "MEMBERSHIP"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-600" /> Gói Tập Hội Viên
          </button>
          <button
            onClick={() => setActiveTab("PT_PACKAGES")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "PT_PACKAGES"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Dumbbell className="w-4 h-4 text-amber-500" /> Gói PT Cá Nhân
          </button>
          <button
            onClick={() => setActiveTab("ADDONS")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "ADDONS"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4 text-blue-500" /> Dịch Vụ Bổ Sung
          </button>
        </div>

        {/* Promotion Input */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mã giảm giá (ví dụ: FITNEW10)"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-semibold"
            />
          </div>
          <Button onClick={handleApplyPromo} variant="outline" className="rounded-xl font-bold px-4 py-2 text-xs">
            Áp dụng
          </Button>
        </div>
      </div>

      {promoMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
            promoMessage.isSuccess ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <Gift className="w-4 h-4 shrink-0" />
          <span>{promoMessage.text}</span>
        </div>
      )}

      {/* TAB 1: MEMBERSHIP PACKAGES */}
      {activeTab === "MEMBERSHIP" && (
        <div className="space-y-8">
          {/* Duration Selector */}
          <div className="flex items-center justify-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl max-w-md mx-auto">
            {[1, 3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonths(m)}
                className={`flex-1 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  selectedMonths === m
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {m} Tháng {m === 12 && <span className="text-[10px] text-amber-400 font-extrabold ml-1">HOT</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedPackages.map((pkg) => {
              const pricing = calculateFinalPackagePrice(pkg);
              const isVip = pkg.packageLevel?.toUpperCase() === "VIP" || pkg.packageType?.toUpperCase() === "VIP";
              const isPremium = pkg.packageLevel?.toUpperCase() === "PREMIUM" || pkg.packageType?.toUpperCase() === "PREMIUM" || pkg.code?.toUpperCase().includes("PREMIUM");
              const isPopular = (pkg.featured || pkg.packageLevel?.toUpperCase() === "STANDARD") && !isPremium && !isVip;
              const benefitList = pkg.benefits ? pkg.benefits.split(",").map((b) => b.trim()) : [];

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 ${
                    isVip
                      ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white ring-2 ring-amber-400/70 shadow-2xl shadow-amber-500/10"
                      : isPremium
                      ? "bg-gradient-to-b from-slate-950 via-purple-950/90 to-indigo-950 text-white ring-2 ring-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.35)] backdrop-blur-md"
                      : isPopular
                      ? "bg-slate-900 text-white shadow-xl ring-1 ring-emerald-500/30"
                      : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:border-slate-300"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-5 rounded-full shadow-lg z-10 whitespace-nowrap">
                      Phổ biến nhất
                    </div>
                  )}
                  {isPremium && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-5 rounded-full flex items-center gap-1.5 shadow-xl shadow-purple-500/40 border border-purple-300/50 z-10 whitespace-nowrap">
                      <Sparkles className="w-4 h-4 fill-current text-purple-200 animate-pulse" /> Gói Premium
                    </div>
                  )}
                  {isVip && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 text-[11px] font-black uppercase tracking-wider py-1.5 px-5 rounded-full flex items-center gap-1.5 shadow-xl shadow-amber-500/30 border border-amber-200/50 z-10 whitespace-nowrap">
                      <Crown className="w-4 h-4 fill-current text-slate-950" /> Gói VIP
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2 mt-1">
                      <h3 className={`text-2xl font-black ${isPremium ? "bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent" : isVip ? "text-amber-300" : ""}`}>
                        {pkg.name}
                      </h3>
                      {isVip ? (
                        <Crown className="w-6 h-6 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      ) : isPremium ? (
                        <Sparkles className="w-6 h-6 text-purple-300 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                      ) : (
                        <Shield className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>

                    <p className={`text-xs min-h-[32px] mb-6 ${isPremium ? "text-purple-200/90 font-medium" : isVip || isPopular ? "text-slate-300" : "text-slate-500"}`}>
                      {pkg.shortDescription || pkg.description}
                    </p>

                    <div className="mb-6 pb-6 border-b border-slate-200/20">
                      {pricing.promoDiscountAmount > 0 && (
                        <div className="text-xs text-slate-400 line-through font-semibold mb-1">
                          {formatCurrency(pricing.originalPrice)}
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-black ${isPremium ? "text-white filter drop-shadow-[0_0_10px_rgba(192,132,252,0.3)]" : ""}`}>
                          {formatCurrency(pricing.finalPrice)}
                        </span>
                        <span className={`text-xs font-medium ${isPremium ? "text-purple-300" : isVip || isPopular ? "text-slate-400" : "text-slate-500"}`}>
                          / {selectedMonths} tháng
                        </span>
                      </div>
                      <div className={`mt-1 text-[11px] font-semibold ${isPremium ? "text-purple-300" : "text-emerald-400"}`}>
                        ~ {formatCurrency(pricing.monthlyRate)}/tháng
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-8">
                      {pkg.ptSessionsPerMonth > 0 && (
                        <li className={`flex items-center gap-2 text-xs font-extrabold px-3 py-1.5 rounded-xl border ${
                          isPremium 
                            ? "text-purple-200 bg-purple-500/20 border-purple-400/30 shadow-inner" 
                            : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                        }`}>
                          <Dumbbell className={`w-4 h-4 shrink-0 ${isPremium ? "text-purple-300 animate-pulse" : ""}`} />
                          <span>Tặng {pkg.ptSessionsPerMonth} buổi PT/tháng</span>
                        </li>
                      )}
                      {benefitList.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isVip
                                ? "text-amber-400"
                                : isPremium
                                ? "text-purple-400"
                                : isPopular
                                ? "text-emerald-400"
                                : "text-emerald-500"
                            }`}
                          />
                          <span className={isPremium ? "text-purple-100" : isVip || isPopular ? "text-slate-200" : "text-slate-700"}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={processingId === pkg.id}
                    className={`w-full rounded-2xl py-3 text-sm font-bold transition-all ${
                      isVip
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 hover:brightness-110 border-none shadow-lg shadow-amber-500/25"
                        : isPremium
                        ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 border-none shadow-xl shadow-purple-600/35 hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98]"
                        : isPopular
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {processingId === pkg.id ? "Đang xử lý..." : "Đăng ký ngay"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SEPARATE PT PACKAGES */}
      {activeTab === "PT_PACKAGES" && (
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-amber-500" /> Gói Tập Cùng HLV Cá Nhân (PT)
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                PT được quản lý độc lập và có thể mua kèm bất kỳ gói hội viên nào. Mỗi buổi kéo dài 50-60 phút.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ptPackages.map((pt) => (
              <div key={pt.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50">
                      {pt.sessions} Buổi PT
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Hạn {pt.durationDays} ngày
                    </span>
                  </div>

                  <h4 className="text-2xl font-black text-slate-900 mb-2">{pt.name}</h4>
                  <p className="text-xs text-slate-500 mb-6">{pt.description}</p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="text-3xl font-black text-slate-900">{formatCurrency(pt.price)}</div>
                    <div className="text-xs font-medium text-emerald-600 mt-1">
                      Chỉ ~ {formatCurrency(pt.perSessionPrice)}/buổi
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(ROUTES.MEMBER_BOOKING)}
                  className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold border-none"
                >
                  Mua gói PT này
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADD-ON SERVICES */}
      {activeTab === "ADDONS" && (
        <div className="space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-3xl">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-500" /> Dịch Vụ Bổ Sung & Tiện Ích
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Đo chỉ số InBody, Đăng ký tủ đồ riêng, mua vé trải nghiệm lớpp hoặc gia hạn Đóng băng gói.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addonServices.map((addon) => (
              <div key={addon.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {addon.category}
                    </span>
                    <span className="text-xs font-bold text-blue-600">{addon.unit}</span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 mb-1">{addon.name}</h4>
                  <p className="text-xs text-slate-500 mb-4">{addon.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xl font-black text-slate-900">{formatCurrency(addon.price)}</span>
                  <Button
                    variant="outline"
                    className="rounded-xl font-bold text-xs px-3 py-1.5"
                    onClick={() => showAlert.info("Dịch vụ bổ sung", `Liên hệ lễ tân hoặc chọn dịch vụ ${addon.name} khi check-in.`)}
                  >
                    Đăng ký <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}