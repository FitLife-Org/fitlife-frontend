import {
    useState,
    type ReactNode,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    Building2,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Loader2,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";

import {
    ROUTES,
} from "../../config/routes";

import {
    showAlert,
} from "../../utils/alert";

import {
    formatCurrency,
} from "../../utils/formatCurrency";

import {
    paymentService,
} from "../../services/paymentService";

import {
    usePaymentDetail,
} from "../../hooks/usePaymentHooks";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

import type {
    PaymentMethod,
} from "../../types/payment.type";

type MemberPaymentMethod =
    Extract<
        PaymentMethod,
        "CASH" |
        "BANK_TRANSFER" |
        "VNPAY"
    >;

export default function PaymentDetailPage() {
    const {
        id,
    } =
        useParams<{
            id: string;
        }>();

    const navigate =
        useNavigate();

    const {
        invoice,
        loading,
    } =
        usePaymentDetail(
            id,
        );

    const [
        paymentMethod,
        setPaymentMethod,
    ] =
        useState<MemberPaymentMethod>(
            "VNPAY",
        );

    const [
        note,
        setNote,
    ] =
        useState("");

    const [
        processing,
        setProcessing,
    ] =
        useState(false);

    // =====================================================
    // PAYMENT
    // =====================================================

    const handlePayment =
        async (): Promise<void> => {
            if (!invoice) {
                return;
            }

            if (
                invoice.status !==
                "UNPAID"
            ) {
                void showAlert.warning(
                    "Không thể thanh toán",
                    "Hóa đơn này không còn ở trạng thái chờ thanh toán.",
                );

                return;
            }

            try {
                setProcessing(
                    true,
                );

                // ===============================================
                // VNPAY
                // ===============================================

                if (
                    paymentMethod ===
                    "VNPAY"
                ) {
                    const result =
                        await paymentService
                            .createVnpayPaymentUrl({
                                invoiceId:
                                invoice.id,
                            });

                    window.location.assign(
                        result.paymentUrl,
                    );

                    return;
                }

                // ===============================================
                // CASH / BANK TRANSFER
                // ===============================================

                const payment =
                    await paymentService
                        .createPayment({
                            invoiceId:
                            invoice.id,

                            paymentMethod,

                            note:
                                note.trim() ||
                                undefined,
                        });

                if (
                    paymentMethod ===
                    "CASH"
                ) {
                    await showAlert.success(
                        "Đã tạo yêu cầu thanh toán tiền mặt",
                        "Vui lòng đến quầy lễ tân để hoàn tất thanh toán.",
                    );
                } else {
                    await showAlert.success(
                        "Đã tạo yêu cầu chuyển khoản",
                        "Giao dịch đang chờ nhân viên xác nhận.",
                    );
                }

                navigate(
                    `${ROUTES.MEMBER_PAYMENT_RESULT}?paymentId=${payment.id}`,
                );
            } catch (
                error: unknown
                ) {
                console.error(
                    "CREATE_PAYMENT_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Không thể tạo thanh toán",
                    getApiErrorMessage(
                        error,
                        "Không thể tạo yêu cầu thanh toán.",
                    ),
                );
            } finally {
                setProcessing(
                    false,
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
              min-h-[320px]
              items-center
              justify-center
            "
            >
                <div className="text-center">
                    <Loader2
                        className="
                  mx-auto
                  h-8
                  w-8
                  animate-spin
                  text-fit-primary
                "
                    />

                    <p
                        className="
                  mt-3
                  text-sm
                  font-medium
                  text-slate-500
                "
                    >
                        Đang tải hóa đơn...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // NOT FOUND
    // =====================================================

    if (!invoice) {
        return (
            <Card
                className="
              mx-auto
              max-w-2xl
              p-10
              text-center
            "
            >
                <AlertCircle
                    className="
                mx-auto
                h-12
                w-12
                text-red-400
              "
                />

                <h2
                    className="
                mt-4
                text-xl
                font-black
                text-slate-900
              "
                >
                    Không tìm thấy hóa đơn
                </h2>

                <p
                    className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
                >
                    Hóa đơn không tồn tại hoặc không thuộc tài khoản của bạn.
                </p>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            ROUTES.MEMBER_PAYMENT,
                        )
                    }
                    className="
                mt-6
                rounded-xl
                bg-fit-primary
                px-5
                py-3
                font-bold
                text-white
              "
                >
                    Lịch sử thanh toán
                </button>
            </Card>
        );
    }

    const amount =
        invoice.finalAmount ??
        0;

    const canPay =
        invoice.status ===
        "UNPAID";

    const isPaid =
        invoice.status ===
        "PAID";

    return (
        <div
            className="
            mx-auto
            w-full
            max-w-6xl
            space-y-6
            pb-10
          "
        >
            <button
                type="button"
                onClick={() =>
                    navigate(-1)
                }
                className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-slate-500
              transition
              hover:text-fit-primary
            "
            >
                <ArrowLeft className="h-4 w-4" />

                Quay lại
            </button>

            <PageHeader
                title="Thanh toán gói tập"
                description={`Hóa đơn ${
                    invoice.invoiceCode ??
                    `#${invoice.id}`
                }`}
            />

            <div
                className="
              grid
              grid-cols-1
              gap-6
              lg:grid-cols-[minmax(0,1fr)_380px]
            "
            >
                {/* =================================================
              LEFT
          ================================================== */}

                <div className="space-y-5">
                    {/* ===============================================
                INVOICE
            ================================================ */}

                    <Card className="p-6">
                        <div
                            className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                        >
                            <div>
                                <p
                                    className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-slate-400
                      "
                                >
                                    Gói đăng ký
                                </p>

                                <h2
                                    className="
                        mt-2
                        text-2xl
                        font-black
                        text-slate-900
                      "
                                >
                                    {invoice.packageName ??
                                        "Gói tập FitLife"}
                                </h2>

                                {invoice.packageDurationName && (
                                    <p
                                        className="
                            mt-1
                            text-sm
                            font-medium
                            text-slate-500
                          "
                                    >
                                        {invoice.packageDurationName}
                                    </p>
                                )}
                            </div>

                            <Badge
                                variant={
                                    isPaid
                                        ? "success"
                                        : canPay
                                            ? "warning"
                                            : "default"
                                }
                            >
                                {isPaid
                                    ? "Đã thanh toán"
                                    : canPay
                                        ? "Chờ thanh toán"
                                        : invoice.status}
                            </Badge>
                        </div>

                        <div
                            className="
                    mt-6
                    divide-y
                    divide-slate-100
                  "
                        >
                            <InvoiceRow
                                label="Mã hóa đơn"
                                value={
                                    invoice.invoiceCode ??
                                    `INV-${invoice.id}`
                                }
                            />

                            <InvoiceRow
                                label="Hội viên"
                                value={
                                    invoice.memberName ??
                                    "-"
                                }
                            />

                            {invoice.subscriptionId && (
                                <InvoiceRow
                                    label="Mã đăng ký"
                                    value={`#${invoice.subscriptionId}`}
                                />
                            )}

                            {invoice.totalAmount !=
                                null && (
                                    <InvoiceRow
                                        label="Giá gốc"
                                        value={formatCurrency(
                                            invoice.totalAmount,
                                        )}
                                    />
                                )}

                            {invoice.discountAmount !=
                                null &&
                                invoice.discountAmount >
                                0 && (
                                    <InvoiceRow
                                        label="Giảm giá"
                                        value={`-${formatCurrency(
                                            invoice.discountAmount,
                                        )}`}
                                        accent
                                    />
                                )}

                            <InvoiceRow
                                label="Thành tiền"
                                value={formatCurrency(
                                    amount,
                                )}
                                strong
                            />
                        </div>
                    </Card>

                    {/* ===============================================
                PAYMENT METHOD
            ================================================ */}

                    {canPay && (
                        <Card className="p-6">
                            <div>
                                <p
                                    className="
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.18em]
                          text-fit-primary
                        "
                                >
                                    Bước tiếp theo
                                </p>

                                <h2
                                    className="
                          mt-1
                          text-xl
                          font-black
                          text-slate-900
                        "
                                >
                                    Chọn phương thức thanh toán
                                </h2>

                                <p
                                    className="
                          mt-1
                          text-sm
                          leading-6
                          text-slate-500
                        "
                                >
                                    Chọn hình thức phù hợp để hoàn tất đăng ký gói tập.
                                </p>
                            </div>

                            <div
                                className="
                        mt-6
                        grid
                        gap-3
                      "
                            >
                                <PaymentMethodCard
                                    active={
                                        paymentMethod ===
                                        "VNPAY"
                                    }
                                    title="VNPay"
                                    description="Thanh toán trực tuyến ngay qua cổng VNPay."
                                    icon={
                                        <CreditCard className="h-6 w-6" />
                                    }
                                    onClick={() =>
                                        setPaymentMethod(
                                            "VNPAY",
                                        )
                                    }
                                />

                                <PaymentMethodCard
                                    active={
                                        paymentMethod ===
                                        "CASH"
                                    }
                                    title="Tiền mặt tại quầy"
                                    description="Tạo yêu cầu trước và thanh toán trực tiếp với nhân viên lễ tân."
                                    icon={
                                        <Banknote className="h-6 w-6" />
                                    }
                                    onClick={() =>
                                        setPaymentMethod(
                                            "CASH",
                                        )
                                    }
                                />

                                <PaymentMethodCard
                                    active={
                                        paymentMethod ===
                                        "BANK_TRANSFER"
                                    }
                                    title="Chuyển khoản ngân hàng"
                                    description="Tạo yêu cầu chuyển khoản và chờ nhân viên xác nhận giao dịch."
                                    icon={
                                        <Building2 className="h-6 w-6" />
                                    }
                                    onClick={() =>
                                        setPaymentMethod(
                                            "BANK_TRANSFER",
                                        )
                                    }
                                />
                            </div>

                            {/* =========================================
                      NOTE
                  ========================================== */}

                            {paymentMethod !==
                                "VNPAY" && (
                                    <div className="mt-6">
                                        <label
                                            htmlFor="payment-note"
                                            className="
                              text-sm
                              font-bold
                              text-slate-700
                            "
                                        >
                                            Ghi chú
                                        </label>

                                        <textarea
                                            id="payment-note"
                                            value={note}
                                            onChange={(
                                                event,
                                            ) =>
                                                setNote(
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            rows={3}
                                            maxLength={500}
                                            placeholder={
                                                paymentMethod ===
                                                "CASH"
                                                    ? "Ví dụ: Tôi sẽ thanh toán tại quầy chiều nay..."
                                                    : "Ví dụ: Nội dung chuyển khoản hoặc ghi chú cho nhân viên..."
                                            }
                                            className="
                              mt-2
                              w-full
                              resize-none
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              p-3
                              text-sm
                              text-slate-700
                              outline-none
                              transition
                              focus:border-fit-primary
                              focus:ring-2
                              focus:ring-fit-primary/10
                            "
                                        />

                                        <div
                                            className="
                              mt-1
                              text-right
                              text-xs
                              text-slate-400
                            "
                                        >
                                            {note.length}/500
                                        </div>
                                    </div>
                                )}

                            {/* =========================================
                      METHOD INFO
                  ========================================== */}

                            <MethodNotice
                                method={
                                    paymentMethod
                                }
                            />
                        </Card>
                    )}
                </div>

                {/* =================================================
              RIGHT SUMMARY
          ================================================== */}

                <aside>
                    <Card
                        className="
                  sticky
                  top-24
                  overflow-hidden
                  border-0
                  bg-slate-950
                  p-6
                  text-white
                  shadow-xl
                "
                    >
                        <p
                            className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                        >
                            Tổng thanh toán
                        </p>

                        <p
                            className="
                    mt-3
                    break-words
                    text-3xl
                    font-black
                    text-emerald-400
                  "
                        >
                            {formatCurrency(
                                amount,
                            )}
                        </p>

                        <div
                            className="
                    mt-5
                    rounded-xl
                    bg-white/5
                    p-4
                  "
                        >
                            <p className="text-xs text-slate-400">
                                Phương thức đã chọn
                            </p>

                            <p
                                className="
                      mt-1
                      font-bold
                      text-white
                    "
                            >
                                {getPaymentMethodLabel(
                                    paymentMethod,
                                )}
                            </p>
                        </div>

                        {paymentMethod ===
                            "VNPAY" && (
                                <div
                                    className="
                        mt-5
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-slate-400
                      "
                                >
                                    <LockKeyhole className="h-4 w-4" />

                                    Giao dịch trực tuyến được xử lý qua VNPay.
                                </div>
                            )}

                        {paymentMethod !==
                            "VNPAY" && (
                                <div
                                    className="
                        mt-5
                        flex
                        items-start
                        gap-2
                        text-xs
                        leading-5
                        text-slate-400
                      "
                                >
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />

                                    Gói tập chỉ được kích hoạt sau khi nhân viên xác nhận thanh toán.
                                </div>
                            )}

                        <button
                            type="button"
                            disabled={
                                processing ||
                                !canPay
                            }
                            onClick={() => {
                                void handlePayment();
                            }}
                            className="
                    mt-6
                    flex
                    min-h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-fit-primary
                    px-4
                    font-bold
                    text-white
                    transition
                    hover:bg-fit-primaryHover
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />

                                    Đang xử lý...
                                </>
                            ) : isPaid ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />

                                    Đã thanh toán
                                </>
                            ) : (
                                <>
                                    {getActionLabel(
                                        paymentMethod,
                                    )}

                                    <ChevronRight className="h-5 w-5" />
                                </>
                            )}
                        </button>

                        {!canPay &&
                            !isPaid && (
                                <p
                                    className="
                        mt-4
                        text-center
                        text-xs
                        leading-5
                        text-slate-400
                      "
                                >
                                    Hóa đơn này không còn khả dụng để thanh toán.
                                </p>
                            )}
                    </Card>
                </aside>
            </div>
        </div>
    );
}

// =====================================================
// PAYMENT METHOD CARD
// =====================================================

function PaymentMethodCard({
                               active,
                               title,
                               description,
                               icon,
                               onClick,
                           }: {
    active:
        boolean;

    title:
        string;

    description:
        string;

    icon:
        ReactNode;

    onClick:
        () => void;
}) {
    return (
        <button
            type="button"
            onClick={
                onClick
            }
            className={`
            flex
            w-full
            items-center
            gap-4
            rounded-2xl
            border-2
            p-4
            text-left
            transition-all

            ${
                active
                    ? "border-fit-primary bg-emerald-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }
          `}
        >
        <span
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl

              ${
                active
                    ? "bg-fit-primary text-white"
                    : "bg-slate-100 text-slate-500"
            }
            `}
        >
          {icon}
        </span>

            <span className="min-w-0 flex-1">
          <span
              className="
                block
                font-black
                text-slate-900
              "
          >
            {title}
          </span>

          <span
              className="
                mt-1
                block
                text-xs
                leading-5
                text-slate-500
              "
          >
            {description}
          </span>
        </span>

            <span
                className={`
              h-5
              w-5
              shrink-0
              rounded-full
              border-2
              p-[3px]

              ${
                    active
                        ? "border-fit-primary"
                        : "border-slate-300"
                }
            `}
            >
          {active && (
              <span
                  className="
                    block
                    h-full
                    w-full
                    rounded-full
                    bg-fit-primary
                  "
              />
          )}
        </span>
        </button>
    );
}

// =====================================================
// METHOD NOTICE
// =====================================================

function MethodNotice({
                          method,
                      }: {
    method:
        MemberPaymentMethod;
}) {
    if (
        method ===
        "VNPAY"
    ) {
        return (
            <div
                className="
              mt-5
              flex
              items-start
              gap-3
              rounded-xl
              bg-emerald-50
              p-4
              text-sm
              text-emerald-700
            "
            >
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

                <span>
            Bạn sẽ được chuyển sang cổng VNPay. FitLife không lưu thông tin tài khoản ngân hàng hoặc thẻ của bạn.
          </span>
            </div>
        );
    }

    if (
        method ===
        "CASH"
    ) {
        return (
            <div
                className="
              mt-5
              flex
              items-start
              gap-3
              rounded-xl
              bg-amber-50
              p-4
              text-sm
              text-amber-700
            "
            >
                <Banknote className="mt-0.5 h-5 w-5 shrink-0" />

                <span>
            Sau khi tạo yêu cầu, hãy đến quầy lễ tân và cung cấp mã thanh toán. Trạng thái sẽ là chờ thanh toán cho đến khi nhân viên xác nhận.
          </span>
            </div>
        );
    }

    return (
        <div
            className="
            mt-5
            flex
            items-start
            gap-3
            rounded-xl
            bg-blue-50
            p-4
            text-sm
            text-blue-700
          "
        >
            <Building2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span>
          Yêu cầu chuyển khoản sẽ ở trạng thái chờ xác nhận cho đến khi Admin/Staff kiểm tra giao dịch.
        </span>
        </div>
    );
}

// =====================================================
// LABELS
// =====================================================

function getPaymentMethodLabel(
    method:
    MemberPaymentMethod,
): string {
    switch (method) {
        case "CASH":
            return "Tiền mặt tại quầy";

        case "BANK_TRANSFER":
            return "Chuyển khoản ngân hàng";

        case "VNPAY":
            return "VNPay";

        default:
            return method;
    }
}

function getActionLabel(
    method:
    MemberPaymentMethod,
): string {
    switch (method) {
        case "CASH":
            return "Đăng ký thanh toán tại quầy";

        case "BANK_TRANSFER":
            return "Tạo yêu cầu chuyển khoản";

        case "VNPAY":
            return "Thanh toán bằng VNPay";

        default:
            return "Tiếp tục";
    }
}

// =====================================================
// INVOICE ROW
// =====================================================

function InvoiceRow({
                        label,
                        value,
                        strong = false,
                        accent = false,
                    }: {
    label:
        string;

    value:
        string;

    strong?:
        boolean;

    accent?:
        boolean;
}) {
    return (
        <div
            className="
            flex
            items-center
            justify-between
            gap-4
            py-4
          "
        >
        <span className="text-sm text-slate-500">
          {label}
        </span>

            <span
                className={`
              text-right

              ${
                    strong
                        ? "text-lg font-black text-slate-950"
                        : accent
                            ? "font-bold text-emerald-600"
                            : "font-bold text-slate-800"
                }
            `}
            >
          {value}
        </span>
        </div>
    );
}