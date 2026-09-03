import type { GymPackage, PackageDuration, Promotion } from "../../types/package.type";
import type { Subscription, UpgradeCalculationResult } from "../../types/subscription.type";
import { showAlert } from "../alert";

/**
 * Tính toán khấu trừ giá trị còn lại khi nâng cấp gói (Phần 6 - Nâng cấp)
 * Ví dụ: Standard còn 60 ngày -> Nâng Premium:
 * Tính giá trị Standard còn lại -> trừ vào giá Premium -> trả phần chênh lệch.
 */
export function calculateUpgradeCredit(
  currentSub: Subscription,
  targetDuration: PackageDuration,
  targetPackage: GymPackage
): UpgradeCalculationResult {
  const now = new Date();
  const endDate = currentSub.endDate ? new Date(currentSub.endDate) : now;
  const startDate = currentSub.startDate ? new Date(currentSub.startDate) : now;

  const totalDurationMs = Math.max(1, endDate.getTime() - startDate.getTime());
  const remainingMs = Math.max(0, endDate.getTime() - now.getTime());

  const totalDays = Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  const originalPaidPrice = currentSub.finalPrice ?? currentSub.originalPrice ?? 0;

  // Tính pro-rata giá trị còn lại
  const dailyRate = originalPaidPrice / (totalDays || 1);
  const remainingValueCredit = Math.round(dailyRate * daysRemaining);

  const targetPrice = targetDuration.discountPrice ?? targetDuration.sellingPrice ?? targetDuration.price ?? targetPackage.basePrice * targetDuration.months;
  const finalAmountToPay = Math.max(0, targetPrice - remainingValueCredit);

  return {
    currentSubscriptionId: currentSub.id,
    currentPackageName: currentSub.gymPackageName || "Gói hiện tại",
    daysRemaining,
    remainingValueCredit,
    targetPackageName: `${targetPackage.name} (${targetDuration.name || targetDuration.months + " tháng"})`,
    targetPackagePrice: targetPrice,
    finalAmountToPay,
  };
}

/**
 * Validates request freeze eligibility (Phần 6 - Đóng băng)
 * Chỉ áp dụng cho gói đủ điều kiện (Premium, VIP).
 */
export function validateFreezeRequest(
  subscription: Subscription,
  freezeDays: number,
  reason: string
): { isValid: boolean; errorMessage?: string } {
  if (subscription.status !== "ACTIVE") {
    return { isValid: false, errorMessage: "Chỉ gói tập đang hoạt động mới được đóng băng." };
  }

  const level = (subscription.packageLevel || "").toUpperCase();
  const isEligible = subscription.isFreezable || level === "PREMIUM" || level === "VIP";

  if (!isEligible) {
    return {
      isValid: false,
      errorMessage: "Gói tập hiện tại không hỗ trợ đóng băng (Chỉ áp dụng cho gói Premium và VIP).",
    };
  }

  const maxAllowed = (subscription.freezeDaysTotal ?? 30) - (subscription.freezeDaysUsed ?? 0);

  if (freezeDays <= 0) {
    return { isValid: false, errorMessage: "Số ngày đóng băng phải lớn hơn 0." };
  }

  if (freezeDays > maxAllowed) {
    return {
      isValid: false,
      errorMessage: `Số ngày đóng băng tối đa còn lại là ${maxAllowed} ngày.`,
    };
  }

  if (!reason || reason.trim().length < 5) {
    return { isValid: false, errorMessage: "Vui lòng nhập lý do đóng băng (tối thiểu 5 ký tự)." };
  }

  return { isValid: true };
}

/**
 * Validates transfer eligibility (Phần 6 - Chuyển nhượng)
 * Chỉ VIP hoặc chương trình cho phép mới được chuyển nhượng. Phí: 200.000đ
 */
export function validateTransferRequest(
  subscription: Subscription,
  recipientMemberCode: string
): { isValid: boolean; errorMessage?: string } {
  if (subscription.status !== "ACTIVE") {
    return { isValid: false, errorMessage: "Chỉ gói tập đang hoạt động mới được phép chuyển nhượng." };
  }

  const level = (subscription.packageLevel || "").toUpperCase();
  const isEligible = subscription.isTransferable || level === "VIP";

  if (!isEligible) {
    return {
      isValid: false,
      errorMessage: "Gói tập này không hỗ trợ chuyển nhượng (Chỉ áp dụng cho gói VIP).",
    };
  }

  if ((subscription.transfersLeft ?? 1) <= 0) {
    return { isValid: false, errorMessage: "Gói tập đã hết số lần chuyển nhượng cho phép (Tối đa 1 lần)." };
  }

  if (!recipientMemberCode || recipientMemberCode.trim().length === 0) {
    return { isValid: false, errorMessage: "Vui lòng nhập mã hoặc Email/SĐT người nhận." };
  }

  return { isValid: true };
}

/**
 * Validates & calculates promotion code discount (Phần 5 - Khuyến mãi)
 * Quy tắc:
 * - 1 mã giảm giá / 1 đơn hàng
 * - % giảm phải có mức giảm tối đa (maximumDiscount)
 * - Yêu cầu đơn tối thiểu (minimumOrderValue)
 */
export function calculatePromotionDiscount(
  originalPrice: number,
  promotion: Promotion,
  gymPackageId?: number
): { isValid: boolean; discountAmount: number; finalPrice: number; message?: string } {
  if (!promotion.active) {
    return { isValid: false, discountAmount: 0, finalPrice: originalPrice, message: "Mã khuyến mãi không khả dụng." };
  }

  const now = new Date();
  if (promotion.startAt && new Date(promotion.startAt) > now) {
    return { isValid: false, discountAmount: 0, finalPrice: originalPrice, message: "Chương trình khuyến mãi chưa bắt đầu." };
  }
  if (promotion.endAt && new Date(promotion.endAt) < now) {
    return { isValid: false, discountAmount: 0, finalPrice: originalPrice, message: "Mã khuyến mãi đã hết hạn." };
  }

  if (promotion.minimumOrderValue && originalPrice < promotion.minimumOrderValue) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: originalPrice,
      message: `Đơn hàng tối thiểu để áp dụng mã là ${promotion.minimumOrderValue.toLocaleString("vi-VN")}đ.`,
    };
  }

  if (
    promotion.applicablePackageIds &&
    promotion.applicablePackageIds.length > 0 &&
    gymPackageId &&
    !promotion.applicablePackageIds.includes(gymPackageId)
  ) {
    return {
      isValid: false,
      discountAmount: 0,
      finalPrice: originalPrice,
      message: "Mã khuyến mãi không áp dụng cho gói tập này.",
    };
  }

  let discount = 0;
  if (promotion.discountType === "PERCENT") {
    discount = (originalPrice * promotion.discountValue) / 100;
    if (promotion.maximumDiscount && discount > promotion.maximumDiscount) {
      discount = promotion.maximumDiscount;
    }
  } else {
    discount = promotion.discountValue;
  }

  discount = Math.min(discount, originalPrice);
  const finalPrice = Math.max(0, originalPrice - discount);

  return {
    isValid: true,
    discountAmount: Math.round(discount),
    finalPrice: Math.round(finalPrice),
    message: `Đã áp dụng mã ${promotion.promotionCode}: Giảm ${Math.round(discount).toLocaleString("vi-VN")}đ`,
  };
}
