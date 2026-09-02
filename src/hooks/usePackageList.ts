import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { showAlert } from "../utils/alert";
import { packageService } from "../services/packageService";
import { subscriptionService } from "../services/subscriptionService";
import type { GymPackage, PackageDuration } from "../types/package.type";
import type { Subscription } from "../types/subscription.type";

export type PriceInfo = {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
};

export function usePackageList() {
  const navigate = useNavigate();

  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [durations, setDurations] = useState<PackageDuration[]>([]);
  const [selectedDurationId, setSelectedDurationId] = useState<number | null>(null);
  const [mySubscription, setMySubscription] = useState<Subscription | null>(null);
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

        const activePackages = pkgs.filter((pkg) => pkg.status === "ACTIVE");
        const activeDurations = durationData.filter((duration) => duration.status === "ACTIVE");

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

  const selectedDuration = durations.find((duration) => duration.id === selectedDurationId);

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
    return { originalPrice, discountAmount, finalPrice };
  };

  const getDurationLabel = (): string => {
    if (!selectedDuration) return "Giá cơ bản";
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
      showAlert.success("Đã tạo đăng ký", "Vui lòng kiểm tra hóa đơn và tiếp tục thanh toán.");
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
        message = "Bạn đã có gói tập đang hoạt động, không thể đăng ký thêm gói mới.";
      }
      showAlert.error("Lỗi", message);
    } finally {
      setProcessingId(null);
    }
  };

  return {
    packages,
    durations,
    selectedDurationId,
    setSelectedDurationId,
    mySubscription,
    loading,
    processingId,
    selectedDuration,
    calculatePrice,
    getDurationLabel,
    handlePurchase
  };
}
