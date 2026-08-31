import axios from "axios";

import {
  Check,
  Dumbbell,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Button from "../../components/common/Button";

import {
  ROUTES,
} from "../../config/routes";

import {
  usePageAnimation,
} from "../../hooks/usePageAnimation";

import {
  packageService,
} from "../../services/packageService";

import {
  subscriptionService,
} from "../../services/subscriptionService";

import type {
  GymPackage,
  PackageDuration,
} from "../../types/package.type";

import type {
  Subscription,
} from "../../types/subscription.type";

import {
  showAlert,
} from "../../utils/alert";

import {
  formatCurrency,
} from "../../utils/formatCurrency";

// =====================================================
// TYPES
// =====================================================

interface PriceInfo {
  originalPrice: number;

  discountAmount: number;

  finalPrice: number;

  discountPercent: number;
}

// =====================================================
// HELPERS
// =====================================================

function getTierLevel(
    type?: string | null,
): number {
  if (!type) {
    return 0;
  }

  switch (
      type
          .trim()
          .toUpperCase()
      ) {
    case "VIP":
      return 3;

    case "STANDARD":
      return 2;

    case "BASIC":
      return 1;

    default:
      return 0;
  }
}

function getSubscriptionPackageId(
    subscription:
        Subscription | null,
): number | null {
  if (!subscription) {
    return null;
  }

  return (
      subscription.gymPackageId ??
      subscription.package?.id ??
      null
  );
}

function renderFeatures(
    gymPackage:
    GymPackage,
): string[] {
  let features:
      string[] = [];

  if (
      gymPackage.benefits
  ) {
    features =
        gymPackage.benefits
            .split(",")
            .map(
                (feature) =>
                    feature.trim(),
            )
            .filter(Boolean);
  } else if (
      gymPackage.description
  ) {
    features =
        gymPackage.description
            .split("\n")
            .map(
                (feature) =>
                    feature
                        .replace(
                            /^-\s*/,
                            "",
                        )
                        .trim(),
            )
            .filter(Boolean);
  } else {
    features = [
      "Truy cập phòng tập",
      "Sử dụng thiết bị tập luyện",
      "Check-in không giới hạn",
    ];
  }

  if (
      gymPackage.hasAiWorkoutPlan
  ) {
    features.unshift(
        "AI hỗ trợ xây dựng giáo án",
    );
  }

  if (
      gymPackage.hasNutritionPlan
  ) {
    features.unshift(
        "Hỗ trợ kế hoạch dinh dưỡng",
    );
  }

  if (
      gymPackage.ptSessionsPerMonth >
      0
  ) {
    features.unshift(
        `${gymPackage.ptSessionsPerMonth} buổi PT/tháng`,
    );
  }

  return features;
}

// =====================================================
// PAGE
// =====================================================

export default function PackageListPage() {
  const containerRef =
      usePageAnimation();

  const navigate =
      useNavigate();

  const [
    packages,
    setPackages,
  ] =
      useState<GymPackage[]>(
          [],
      );

  const [
    durations,
    setDurations,
  ] =
      useState<
          PackageDuration[]
      >(
          [],
      );

  /**
   * Chỉ lưu MONTHS.
   *
   * KHÔNG lưu durationId toàn cục.
   *
   * Vì mỗi GymPackage có PackageDuration
   * riêng dù cùng số tháng.
   */
  const [
    selectedMonths,
    setSelectedMonths,
  ] =
      useState<
          number | null
      >(
          null,
      );

  const [
    mySubscription,
    setMySubscription,
  ] =
      useState<
          Subscription | null
      >(
          null,
      );

  const [
    loading,
    setLoading,
  ] =
      useState(
          true,
      );

  const [
    processingId,
    setProcessingId,
  ] =
      useState<
          number | null
      >(
          null,
      );

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(
      () => {
        let mounted =
            true;

        const fetchData =
            async (): Promise<void> => {
              try {
                setLoading(
                    true,
                );

                const [
                  packageData,
                  subscriptionData,
                  durationData,
                ] =
                    await Promise.all([
                      packageService
                          .getPublicPackages({
                            size: 100,
                          }),

                      subscriptionService
                          .getMySubscription(),

                      packageService
                          .getPackageDurations(),
                    ]);

                if (!mounted) {
                  return;
                }

                const activePackages =
                    packageData.filter(
                        (item) =>
                            item.status ===
                            "ACTIVE",
                    );

                const activeDurations =
                    durationData
                        .filter(
                            (item) =>
                                item.status ===
                                "ACTIVE",
                        )
                        .sort(
                            (a, b) =>
                                a.months -
                                b.months,
                        );

                setPackages(
                    activePackages,
                );

                setDurations(
                    activeDurations,
                );

                setMySubscription(
                    subscriptionData,
                );

                const monthValues =
                    Array.from(
                        new Set(
                            activeDurations
                                .map(
                                    (duration) =>
                                        duration.months,
                                )
                                .filter(
                                    (months) =>
                                        months >
                                        0,
                                ),
                        ),
                    ).sort(
                        (a, b) =>
                            a - b,
                    );

                setSelectedMonths(
                    monthValues[0] ??
                    null,
                );
              } catch (
                  error: unknown
                  ) {
                console.error(
                    "LOAD_PACKAGES_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Không thể tải gói tập",
                    "Đã xảy ra lỗi khi tải danh sách gói tập.",
                );
              } finally {
                if (
                    mounted
                ) {
                  setLoading(
                      false,
                  );
                }
              }
            };

        void fetchData();

        return () => {
          mounted =
              false;
        };
      },
      [],
  );

  // =====================================================
  // AVAILABLE MONTHS
  // =====================================================

  const availableMonths =
      useMemo(
          () =>
              Array.from(
                  new Set(
                      durations.map(
                          (duration) =>
                              duration.months,
                      ),
                  ),
              ).sort(
                  (a, b) =>
                      a - b,
              ),
          [
            durations,
          ],
      );

  // =====================================================
  // PACKAGE DURATION
  // =====================================================

  const getDurationForPackage = (
      packageId: number,
  ): PackageDuration | null => {
    if (
        selectedMonths ===
        null
    ) {
      return null;
    }

    return (
        durations.find(
            (duration) =>
                duration.gymPackageId ===
                packageId &&
                duration.months ===
                selectedMonths,
        ) ??
        null
    );
  };

  // =====================================================
  // PRICE
  // =====================================================

  const calculatePrice = (
      gymPackage:
      GymPackage,
  ): PriceInfo => {
    const duration =
        getDurationForPackage(
            gymPackage.id,
        );

    if (!duration) {
      return {
        originalPrice:
        gymPackage.basePrice,

        discountAmount:
            0,

        finalPrice:
        gymPackage.basePrice,

        discountPercent:
            0,
      };
    }

    /**
     * Ưu tiên price Backend.
     *
     * Nếu không có:
     * basePrice * months.
     */
    const originalPrice =
        duration.price != null &&
        duration.price > 0
            ? duration.price
            : gymPackage.basePrice *
            duration.months;

    /**
     * Nếu Backend đã tính discountPrice,
     * FE KHÔNG tự giảm lần thứ hai.
     */
    let finalPrice =
        duration.discountPrice !=
        null &&
        duration.discountPrice >
        0
            ? duration.discountPrice
            : originalPrice;

    const discountPercent =
        Math.max(
            0,
            duration.discountPercent ??
            0,
        );

    /**
     * Chỉ tự tính discount nếu Backend
     * không trả discountPrice.
     */
    if (
        (
            duration.discountPrice ==
            null ||
            duration.discountPrice <=
            0
        ) &&
        discountPercent >
        0
    ) {
      finalPrice =
          originalPrice *
          (
              1 -
              discountPercent /
              100
          );
    }

    finalPrice =
        Math.max(
            0,
            finalPrice,
        );

    return {
      originalPrice,

      discountAmount:
          Math.max(
              0,
              originalPrice -
              finalPrice,
          ),

      finalPrice,

      discountPercent,
    };
  };

  // =====================================================
  // PURCHASE
  // =====================================================

  const handlePurchase =
      async (
          packageId: number,
      ): Promise<void> => {
        if (
            processingId !==
            null
        ) {
          return;
        }

        const targetPackage =
            packages.find(
                (item) =>
                    item.id ===
                    packageId,
            );

        if (!targetPackage) {
          await showAlert.error(
              "Gói tập không hợp lệ",
              "Không tìm thấy gói tập đã chọn.",
          );

          return;
        }

        const packageDuration =
            getDurationForPackage(
                packageId,
            );

        if (
            !packageDuration
        ) {
          await showAlert.warning(
              "Không hỗ trợ thời hạn",
              `Gói ${targetPackage.name} không có thời hạn ${
                  selectedMonths ??
                  ""
              } tháng.`,
          );

          return;
        }

        /**
         * Double validation.
         *
         * Không được gửi duration
         * của package khác.
         */
        if (
            packageDuration
                .gymPackageId !==
            packageId
        ) {
          await showAlert.error(
              "Dữ liệu gói tập không hợp lệ",
              "Thời hạn đã chọn không thuộc gói tập này. Vui lòng tải lại trang.",
          );

          return;
        }

        try {
          setProcessingId(
              packageId,
          );

          const currentPackageId =
              getSubscriptionPackageId(
                  mySubscription,
              );

          const currentPackage =
              currentPackageId
                  ? packages.find(
                      (item) =>
                          item.id ===
                          currentPackageId,
                  )
                  : undefined;

          const currentTier =
              getTierLevel(
                  currentPackage
                      ?.packageType,
              );

          const targetTier =
              getTierLevel(
                  targetPackage
                      .packageType,
              );

          // ===============================================
          // ACTIVE SUBSCRIPTION
          // ===============================================

          if (
              mySubscription
                  ?.status ===
              "ACTIVE"
          ) {
            // ---------------------------------------------
            // SAME PACKAGE
            // ---------------------------------------------

            if (
                currentPackageId ===
                packageId
            ) {
              await showAlert.info(
                  "Gói đang hoạt động",
                  `Bạn đang sử dụng gói ${targetPackage.name}. Nếu muốn kéo dài thời hạn, hãy sử dụng chức năng gia hạn.`,
              );

              navigate(
                  ROUTES
                      .MEMBER_SUBSCRIPTION,
              );

              return;
            }

            // ---------------------------------------------
            // UPGRADE
            // ---------------------------------------------

            if (
                targetTier >
                currentTier
            ) {
              const confirmation =
                  await showAlert.confirm(
                      "Xác nhận nâng cấp",
                      `Bạn muốn nâng cấp từ ${
                          currentPackage
                              ?.name ??
                          "gói hiện tại"
                      } lên ${
                          targetPackage.name
                      } trong ${
                          packageDuration.months
                      } tháng?`,
                      {
                        confirmButtonText:
                            "Nâng cấp",

                        cancelButtonText:
                            "Hủy",
                      },
                  );

              if (
                  !confirmation
                      .isConfirmed
              ) {
                return;
              }

              const upgradedSubscription =
                  await subscriptionService
                      .upgradeSubscription(
                          mySubscription.id,

                          packageDuration.id,
                      );

              if (
                  upgradedSubscription
                      .invoiceId
              ) {
                navigate(
                    `/member/payment/${upgradedSubscription.invoiceId}`,
                );

                return;
              }

              await showAlert.success(
                  "Đã tạo yêu cầu nâng cấp",
                  "Vui lòng kiểm tra hóa đơn để tiếp tục thanh toán.",
              );

              navigate(
                  ROUTES
                      .MEMBER_SUBSCRIPTION,
              );

              return;
            }

            // ---------------------------------------------
            // DOWNGRADE / PARALLEL PACKAGE
            // ---------------------------------------------

            await showAlert.warning(
                "Không thể đăng ký",
                "Bạn đang có gói tập hoạt động. Hiện tại chỉ hỗ trợ nâng cấp lên gói cao hơn hoặc gia hạn gói hiện tại.",
            );

            return;
          }

          // ===============================================
          // PENDING PAYMENT
          // ===============================================

          if (
              mySubscription
                  ?.status ===
              "PENDING_PAYMENT"
          ) {
            /**
             * Nếu API getMySubscription()
             * trả pending hiện tại có invoiceId,
             * đưa Member quay lại đúng hóa đơn.
             *
             * Backend vẫn phải quyết định
             * reuse/cancel khi chọn gói khác.
             */
            if (
                mySubscription
                    .invoiceId
            ) {
              const pendingPackageId =
                  getSubscriptionPackageId(
                      mySubscription,
                  );

              if (
                  pendingPackageId ===
                  packageId
              ) {
                const confirmation =
                    await showAlert.confirm(
                        "Đăng ký đang chờ thanh toán",
                        "Bạn đã có đăng ký của gói này đang chờ thanh toán. Tiếp tục thanh toán hóa đơn hiện tại?",
                        {
                          confirmButtonText:
                              "Tiếp tục thanh toán",

                          cancelButtonText:
                              "Hủy",
                        },
                    );

                if (
                    confirmation
                        .isConfirmed
                ) {
                  navigate(
                      `/member/payment/${mySubscription.invoiceId}`,
                  );
                }

                return;
              }
            }
          }

          // ===============================================
          // CREATE NEW SUBSCRIPTION
          // ===============================================

          const subscription =
              await subscriptionService
                  .createSubscription({
                    gymPackageId:
                    targetPackage.id,

                    packageDurationId:
                    packageDuration.id,

                    autoRenew:
                        false,

                    note:
                        `Đăng ký ${
                            targetPackage.name
                        } - ${
                            packageDuration.name
                        }`,
                  });

          // ===============================================
          // PAYMENT
          // ===============================================

          if (
              subscription
                  .invoiceId
          ) {
            navigate(
                `/member/payment/${subscription.invoiceId}`,
            );

            return;
          }

          await showAlert.success(
              "Đã tạo đăng ký",
              "Đăng ký đã được tạo. Vui lòng kiểm tra hóa đơn để tiếp tục thanh toán.",
          );

          navigate(
              ROUTES
                  .MEMBER_SUBSCRIPTION,
          );
        } catch (
            error: unknown
            ) {
          console.error(
              "CREATE_SUBSCRIPTION_ERROR:",
              error,
          );

          let message =
              "Không thể xử lý đăng ký gói tập.";

          let code:
              number | undefined;

          if (
              axios.isAxiosError(
                  error,
              )
          ) {
            code =
                error.response
                    ?.data?.code;

            message =
                error.response
                    ?.data
                    ?.message ??
                message;
          }

          if (
              code ===
              8003
          ) {
            message =
                "Bạn đang có gói tập hoạt động. Hãy gia hạn hoặc nâng cấp gói hiện tại.";
          }

          await showAlert.error(
              "Đăng ký thất bại",
              message,
          );
        } finally {
          setProcessingId(
              null,
          );
        }
      };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
        <div
            className="
              flex
              h-[60vh]
              items-center
              justify-center
            "
        >
          <div
              className="
                flex
                flex-col
                items-center
                gap-4
              "
          >
            <Loader2
                className="
                  h-10
                  w-10
                  animate-spin
                  text-fit-primary
                "
            />

            <p
                className="
                  font-medium
                  text-fit-muted
                "
            >
              Đang tải gói tập...
            </p>
          </div>
        </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
      <div
          ref={containerRef}
          className="
            min-h-screen
            bg-slate-50
            pb-16
          "
      >
        {/* =================================================
            HERO
        ================================================== */}

        <section
            className="
              relative
              mx-4
              mt-4
              overflow-hidden
              rounded-[2rem]
              border
              border-slate-800
              bg-slate-950
              px-6
              pb-24
              pt-16
              text-white
              shadow-2xl
              md:pt-20
            "
        >
          <div
              className="
                pointer-events-none
                absolute
                right-0
                top-0
                h-[500px]
                w-[500px]
                -translate-y-1/3
                translate-x-1/3
                rounded-full
                bg-fit-primary/30
                blur-[120px]
              "
          />

          <div
              className="
                pointer-events-none
                absolute
                bottom-0
                left-0
                h-[500px]
                w-[500px]
                -translate-x-1/3
                translate-y-1/3
                rounded-full
                bg-emerald-500/20
                blur-[120px]
              "
          />

          <div
              className="
                relative
                z-10
                mx-auto
                max-w-4xl
                text-center
              "
          >
            <span
                className="
                  inline-flex
                  rounded-full
                  border
                  border-slate-600
                  bg-slate-800/80
                  px-4
                  py-1.5
                  text-xs
                  font-bold
                  uppercase
                  tracking-widest
                "
            >
              Gói hội viên FitLife
            </span>

            <h1
                className="
                  mt-5
                  text-4xl
                  font-black
                  uppercase
                  tracking-tight
                  md:text-5xl
                  lg:text-6xl
                "
            >
              Chọn gói phù hợp với{" "}

              <span className="text-fit-primary">
                mục tiêu của bạn
              </span>
            </h1>

            <p
                className="
                  mx-auto
                  mt-6
                  max-w-2xl
                  text-base
                  leading-7
                  text-slate-300
                  md:text-lg
                "
            >
              So sánh quyền lợi, thời hạn và chi phí trước khi đăng ký.
            </p>
          </div>
        </section>

        <div
            className="
              relative
              z-20
              mx-auto
              mt-8
              max-w-6xl
              px-4
            "
        >
          {/* =================================================
              MONTH SELECTOR
          ================================================== */}

          {availableMonths.length >
              0 && (
                  <div
                      className="
                    mx-auto
                    mb-12
                    flex
                    max-w-2xl
                    overflow-x-auto
                    rounded-2xl
                    border
                    border-slate-100
                    bg-white
                    p-2
                    shadow-xl
                    shadow-slate-200/50
                  "
                  >
                    {availableMonths.map(
                        (months) => {
                          const isActive =
                              selectedMonths ===
                              months;

                          const monthDurations =
                              durations.filter(
                                  (duration) =>
                                      duration.months ===
                                      months,
                              );

                          const bestDiscount =
                              monthDurations.reduce(
                                  (
                                      highest,
                                      duration,
                                  ) =>
                                      Math.max(
                                          highest,

                                          duration
                                              .discountPercent ??
                                          0,
                                      ),
                                  0,
                              );

                          return (
                              <button
                                  key={months}
                                  type="button"
                                  onClick={() =>
                                      setSelectedMonths(
                                          months,
                                      )
                                  }
                                  className={`
                                relative
                                min-w-[110px]
                                flex-1
                                rounded-xl
                                px-4
                                py-3
                                text-sm
                                font-bold
                                transition

                                ${
                                      isActive
                                          ? "bg-fit-primary text-white shadow-sm"
                                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                  }
                              `}
                              >
                                <div
                                    className="
                                  flex
                                  items-center
                                  justify-center
                                  gap-2
                                "
                                >
                              <span>
                                {months} tháng
                              </span>

                                  {bestDiscount >
                                      0 && (
                                          <span
                                              className={`
                                        rounded
                                        px-1.5
                                        py-0.5
                                        text-[10px]

                                        ${
                                                  isActive
                                                      ? "bg-white/20 text-white"
                                                      : "bg-red-100 text-red-600"
                                              }
                                      `}
                                          >
                                    -
                                            {
                                              bestDiscount
                                            }
                                            %
                                  </span>
                                      )}
                                </div>
                              </button>
                          );
                        },
                    )}
                  </div>
              )}

          {/* =================================================
              PACKAGE CARDS
          ================================================== */}

          <div
              className="
                grid
                items-stretch
                gap-6
                md:grid-cols-2
                xl:grid-cols-3
              "
          >
            {packages.map(
                (
                    item,
                    index,
                ) => {
                  const currentPackageId =
                      getSubscriptionPackageId(
                          mySubscription,
                      );

                  const isCurrent =
                      currentPackageId ===
                      item.id &&
                      mySubscription
                          ?.status ===
                      "ACTIVE";

                  const currentPackage =
                      currentPackageId
                          ? packages.find(
                              (pkg) =>
                                  pkg.id ===
                                  currentPackageId,
                          )
                          : undefined;

                  const currentTier =
                      getTierLevel(
                          currentPackage
                              ?.packageType,
                      );

                  const targetTier =
                      getTierLevel(
                          item.packageType,
                      );

                  const isUpgrade =
                      mySubscription
                          ?.status ===
                      "ACTIVE" &&
                      targetTier >
                      currentTier;

                  const packageDuration =
                      getDurationForPackage(
                          item.id,
                      );

                  const hasActiveSubscription =
                      mySubscription
                          ?.status ===
                      "ACTIVE";

                  const isDisabled =
                      !packageDuration ||
                      (
                          hasActiveSubscription &&
                          !isUpgrade
                      );

                  const isPopular =
                      item.packageType
                          ?.toUpperCase() ===
                      "STANDARD" ||
                      index ===
                      1;

                  const isPremium =
                      item.packageType
                          ?.toUpperCase() ===
                      "VIP";

                  const priceInfo =
                      calculatePrice(
                          item,
                      );

                  const features =
                      renderFeatures(
                          item,
                      );

                  return (
                      <article
                          key={item.id}
                          className={`
                            relative
                            flex
                            h-full
                            flex-col
                            rounded-[2rem]
                            border
                            p-7
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-xl

                            ${
                              isPremium
                                  ? "border-zinc-800 bg-zinc-900 text-white"
                                  : isPopular
                                      ? "border-fit-primary bg-white shadow-lg shadow-fit-primary/10"
                                      : "border-slate-200 bg-white"
                          }
                          `}
                      >
                        {isPopular &&
                            !isPremium && (
                                <span
                                    className="
                                  absolute
                                  -top-3
                                  left-1/2
                                  -translate-x-1/2
                                  rounded-full
                                  bg-fit-primary
                                  px-4
                                  py-1.5
                                  text-[10px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  text-white
                                  shadow
                                "
                                >
                              Phổ biến
                            </span>
                            )}

                        <div>
                          <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1
                                text-xs
                                font-bold
                                uppercase

                                ${
                                  isPremium
                                      ? "bg-yellow-500/10 text-yellow-400"
                                      : "bg-slate-100 text-slate-600"
                              }
                              `}
                          >
                            {isCurrent
                                ? "Đang sử dụng"
                                : item.packageType}
                          </span>

                          <h2
                              className={`
                                mt-4
                                text-2xl
                                font-black
                                uppercase

                                ${
                                  isPremium
                                      ? "text-yellow-400"
                                      : "text-slate-900"
                              }
                              `}
                          >
                            {item.name}
                          </h2>

                          <p
                              className={`
                                mt-2
                                min-h-[44px]
                                text-sm
                                leading-6

                                ${
                                  isPremium
                                      ? "text-zinc-400"
                                      : "text-slate-500"
                              }
                              `}
                          >
                            {item.description
                                    ?.split(
                                        "\n",
                                    )[0] ??
                                "Gói tập phù hợp với mục tiêu của bạn."}
                          </p>
                        </div>

                        {/* ===================================
                            PRICE
                        ==================================== */}

                        <div
                            className="
                              my-7
                              border-b
                              border-dashed
                              border-slate-300/30
                              pb-7
                            "
                        >
                          {packageDuration ? (
                              <>
                                <div
                                    className="
                                      flex
                                      flex-wrap
                                      items-baseline
                                      gap-1
                                    "
                                >
                                  <span
                                      className={`
                                        text-3xl
                                        font-black
                                        tracking-tight

                                        ${
                                          isPremium
                                              ? "text-white"
                                              : "text-slate-950"
                                      }
                                      `}
                                  >
                                    {formatCurrency(
                                        priceInfo.finalPrice,
                                    )}
                                  </span>

                                  <span
                                      className={`
                                        text-sm

                                        ${
                                          isPremium
                                              ? "text-zinc-500"
                                              : "text-slate-400"
                                      }
                                      `}
                                  >
                                    /{" "}
                                    {
                                      packageDuration.months
                                    }{" "}
                                    tháng
                                  </span>
                                </div>

                                {priceInfo.discountAmount >
                                    0 && (
                                        <div className="mt-2 space-y-1 text-sm">
                                          <p className="text-slate-400 line-through">
                                            {formatCurrency(
                                                priceInfo.originalPrice,
                                            )}
                                          </p>

                                          <p
                                              className={`
                                            font-bold

                                            ${
                                                  isPremium
                                                      ? "text-yellow-400"
                                                      : "text-fit-primary"
                                              }
                                          `}
                                          >
                                            Tiết kiệm{" "}
                                            {formatCurrency(
                                                priceInfo.discountAmount,
                                            )}

                                            {priceInfo.discountPercent >
                                                0 &&
                                                ` (${priceInfo.discountPercent}%)`}
                                          </p>
                                        </div>
                                    )}
                              </>
                          ) : (
                              <p
                                  className="
                                    text-sm
                                    font-semibold
                                    text-red-500
                                  "
                              >
                                Không hỗ trợ{" "}
                                {selectedMonths ??
                                    ""}
                                {" "}
                                tháng
                              </p>
                          )}
                        </div>

                        {/* ===================================
                            FEATURES
                        ==================================== */}

                        <div
                            className="
                              mb-8
                              flex-1
                              space-y-4
                            "
                        >
                          {features.map(
                              (
                                  feature,
                                  featureIndex,
                              ) => (
                                  <div
                                      key={`${item.id}-${featureIndex}`}
                                      className="
                                        flex
                                        items-start
                                        gap-3
                                      "
                                  >
                                    <Check
                                        className={`
                                          mt-0.5
                                          h-5
                                          w-5
                                          shrink-0

                                          ${
                                            isPremium
                                                ? "text-yellow-400"
                                                : "text-fit-primary"
                                        }
                                        `}
                                    />

                                    <span
                                        className={`
                                          text-sm
                                          leading-6

                                          ${
                                            isPremium
                                                ? "text-zinc-300"
                                                : "text-slate-700"
                                        }
                                        `}
                                    >
                                      {feature}
                                    </span>
                                  </div>
                              ),
                          )}
                        </div>

                        {/* ===================================
                            ACTION
                        ==================================== */}

                        <Button
                            className={`
                              w-full
                              rounded-xl
                              py-4
                              text-sm
                              font-bold
                              uppercase
                              tracking-wide

                              ${
                                isPremium
                                    ? "bg-gradient-to-r from-yellow-600 to-yellow-400 text-black"
                                    : isPopular
                                        ? "bg-fit-primary text-white"
                                        : "bg-slate-950 text-white"
                            }
                            `}
                            disabled={
                              isDisabled
                            }
                            isLoading={
                                processingId ===
                                item.id
                            }
                            onClick={() => {
                              void handlePurchase(
                                  item.id,
                              );
                            }}
                        >
                          {!packageDuration
                              ? "Không hỗ trợ thời hạn"
                              : isCurrent
                                  ? "Đang sử dụng"
                                  : isUpgrade
                                      ? "Nâng cấp gói"
                                      : hasActiveSubscription
                                          ? "Đã có gói tập"
                                          : "Đăng ký gói"}
                        </Button>
                      </article>
                  );
                },
            )}

            {packages.length ===
                0 && (
                    <div
                        className="
                      col-span-full
                      flex
                      flex-col
                      items-center
                      justify-center
                      rounded-3xl
                      border
                      border-dashed
                      border-slate-300
                      bg-white
                      py-20
                      text-center
                    "
                    >
                      <Dumbbell
                          className="
                        mb-4
                        h-12
                        w-12
                        text-slate-300
                      "
                      />

                      <p
                          className="
                        text-lg
                        font-bold
                        text-slate-700
                      "
                      >
                        Chưa có gói tập hoạt động
                      </p>
                    </div>
                )}
          </div>

          {/* =================================================
              COMPARISON
          ================================================== */}

          {packages.length >
              0 && (
                  <section className="mt-24">
                    <div className="mb-8 text-center">
                      <h2
                          className="
                        text-3xl
                        font-black
                        uppercase
                        tracking-tight
                        text-slate-900
                      "
                      >
                        So sánh quyền lợi
                      </h2>

                      <p className="mt-3 text-slate-500">
                        Giá theo thời hạn{" "}

                        <span className="font-bold text-fit-primary">
                      {selectedMonths
                          ? `${selectedMonths} tháng`
                          : "chưa chọn"}
                    </span>
                      </p>
                    </div>

                    <div
                        className="
                      overflow-x-auto
                      rounded-2xl
                      border
                      border-slate-100
                      bg-white
                      shadow-xl
                      shadow-slate-200/40
                    "
                    >
                      <table className="w-full min-w-[760px]">
                        <thead className="bg-slate-50">
                        <tr>
                          <th
                              className="
                            p-5
                            text-left
                            text-xs
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                          >
                            Tiêu chí
                          </th>

                          {packages.map(
                              (pkg) => (
                                  <th
                                      key={pkg.id}
                                      className="
                                    p-5
                                    text-center
                                    text-sm
                                    font-black
                                    uppercase
                                    text-slate-800
                                  "
                                  >
                                    {pkg.name}
                                  </th>
                              ),
                          )}
                        </tr>
                        </thead>

                        <tbody>
                        <ComparisonRow
                            label="Tổng thanh toán"
                            packages={packages}
                            render={(pkg) =>
                                formatCurrency(
                                    calculatePrice(
                                        pkg,
                                    ).finalPrice,
                                )
                            }
                        />

                        <ComparisonRow
                            label="AI giáo án"
                            packages={packages}
                            render={(pkg) =>
                                pkg.hasAiWorkoutPlan
                                    ? "✓"
                                    : "—"
                            }
                        />

                        <ComparisonRow
                            label="Dinh dưỡng"
                            packages={packages}
                            render={(pkg) =>
                                pkg.hasNutritionPlan
                                    ? "✓"
                                    : "—"
                            }
                        />

                        <ComparisonRow
                            label="PT cá nhân"
                            packages={packages}
                            render={(pkg) =>
                                pkg.ptSessionsPerMonth >
                                0
                                    ? `${pkg.ptSessionsPerMonth} buổi/tháng`
                                    : "—"
                            }
                        />
                        </tbody>
                      </table>
                    </div>
                  </section>
              )}
        </div>
      </div>
  );
}

// =====================================================
// COMPARISON ROW
// =====================================================

function ComparisonRow({
                         label,
                         packages,
                         render,
                       }: {
  label:
      string;

  packages:
      GymPackage[];

  render:
      (
          gymPackage:
          GymPackage,
      ) => string;
}) {
  return (
      <tr
          className="
            border-t
            border-slate-100
            transition
            hover:bg-slate-50
          "
      >
        <td
            className="
              p-5
              text-sm
              font-semibold
              text-slate-600
            "
        >
          {label}
        </td>

        {packages.map(
            (gymPackage) => (
                <td
                    key={
                      gymPackage.id
                    }
                    className="
                      p-5
                      text-center
                      text-sm
                      font-bold
                      text-slate-800
                    "
                >
                  {render(
                      gymPackage,
                  )}
                </td>
            ),
        )}
      </tr>
  );
}