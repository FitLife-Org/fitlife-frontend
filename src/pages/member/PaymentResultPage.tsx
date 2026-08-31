import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Loader2,
    RefreshCw,
    Store,
    XCircle,
} from "lucide-react";

import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

import {
    ROUTES,
} from "../../config/routes";

import {
    paymentService,
} from "../../services/paymentService";

import type {
    PaymentMethod,
    PaymentResult,
    PaymentStatus,
} from "../../types/payment.type";

import {
    getApiErrorMessage,
} from "../../utils/apiError";

// =====================================================
// TYPES
// =====================================================

type ResultState =
    | "loading"
    | "success"
    | "pending"
    | "failed"
    | "error";

// =====================================================
// HELPERS
// =====================================================

function resolveResultState(
    status:
    PaymentStatus,
): ResultState {
    switch (status) {
        case "SUCCESS":
            return "success";

        case "PENDING":
            return "pending";

        case "FAILED":
        case "CANCELLED":
        case "REFUNDED":
            return "failed";

        default:
            return "error";
    }
}

function resolveMessage(
    payment:
    PaymentResult,
): string {
    const {
        paymentStatus,
        paymentMethod,
    } =
        payment;

    if (
        paymentStatus ===
        "SUCCESS"
    ) {
        if (
            paymentMethod ===
            "CASH"
        ) {
            return "Thanh toán tiền mặt đã được xác nhận. Gói tập của bạn đã được kích hoạt.";
        }

        if (
            paymentMethod ===
            "BANK_TRANSFER"
        ) {
            return "Thanh toán chuyển khoản đã được xác nhận. Gói tập của bạn đã được kích hoạt.";
        }

        return "Thanh toán VNPay đã được xác nhận. Gói tập của bạn đã được kích hoạt.";
    }

    if (
        paymentStatus ===
        "PENDING"
    ) {
        if (
            paymentMethod ===
            "CASH"
        ) {
            return "Yêu cầu thanh toán đã được tạo. Vui lòng đến quầy lễ tân FitLife để thanh toán tiền mặt.";
        }

        if (
            paymentMethod ===
            "BANK_TRANSFER"
        ) {
            return "Giao dịch chuyển khoản đang chờ nhân viên xác nhận.";
        }

        return "Giao dịch VNPay đang chờ hệ thống xác nhận.";
    }

    if (
        paymentStatus ===
        "FAILED"
    ) {
        return (
            payment.failedReason ||
            "Giao dịch thanh toán không thành công."
        );
    }

    if (
        paymentStatus ===
        "CANCELLED"
    ) {
        return "Giao dịch thanh toán đã bị hủy.";
    }

    if (
        paymentStatus ===
        "REFUNDED"
    ) {
        return "Giao dịch đã được hoàn tiền.";
    }

    return "Không xác định được trạng thái giao dịch.";
}

function getPaymentStatusLabel(
    status:
    PaymentStatus,
): string {
    switch (status) {
        case "SUCCESS":
            return "Thành công";

        case "PENDING":
            return "Chờ thanh toán";

        case "FAILED":
            return "Thất bại";

        case "CANCELLED":
            return "Đã hủy";

        case "REFUNDED":
            return "Đã hoàn tiền";

        default:
            return status;
    }
}

function getPaymentMethodLabel(
    method:
    PaymentMethod,
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

function formatCurrency(
    value: number,
): string {
    return new Intl.NumberFormat(
        "vi-VN",
        {
            style:
                "currency",

            currency:
                "VND",

            maximumFractionDigits:
                0,
        },
    ).format(
        value,
    );
}

// =====================================================
// PAGE
// =====================================================

export default function PaymentResultPage() {
    const navigate =
        useNavigate();

    const [
        searchParams,
    ] =
        useSearchParams();

    const [
        payment,
        setPayment,
    ] =
        useState<
            PaymentResult | null
        >(null);

    const [
        state,
        setState,
    ] =
        useState<ResultState>(
            "loading",
        );

    const [
        message,
        setMessage,
    ] =
        useState(
            "Đang kiểm tra trạng thái thanh toán...",
        );

    const rawPaymentId =
        searchParams.get(
            "paymentId",
        ) ??
        searchParams.get(
            "payment_id",
        );

    // =================================================
    // LOAD PAYMENT
    // =================================================

    const loadPayment =
        useCallback(
            async (): Promise<void> => {
                const paymentId =
                    Number(
                        rawPaymentId,
                    );

                if (
                    !Number.isInteger(
                        paymentId,
                    ) ||
                    paymentId <= 0
                ) {
                    setPayment(
                        null,
                    );

                    setState(
                        "error",
                    );

                    setMessage(
                        "Không tìm thấy mã giao dịch thanh toán hợp lệ.",
                    );

                    return;
                }

                try {
                    setState(
                        "loading",
                    );

                    setMessage(
                        "Đang kiểm tra trạng thái giao dịch...",
                    );

                    const result =
                        await paymentService
                            .getPaymentById(
                                paymentId,
                            );

                    setPayment(
                        result,
                    );

                    setState(
                        resolveResultState(
                            result.paymentStatus,
                        ),
                    );

                    setMessage(
                        resolveMessage(
                            result,
                        ),
                    );
                } catch (error) {
                    setPayment(
                        null,
                    );

                    setState(
                        "error",
                    );

                    setMessage(
                        getApiErrorMessage(
                            error,
                            "Không thể kiểm tra trạng thái giao dịch.",
                        ),
                    );
                }
            },
            [
                rawPaymentId,
            ],
        );

    useEffect(
        () => {
            void loadPayment();
        },
        [
            loadPayment,
        ],
    );

    // =================================================
    // VNPAY PENDING AUTO REFRESH
    // =================================================

    /**
     * Chỉ polling tự động cho VNPay.
     *
     * CASH không polling liên tục vì trạng thái
     * chỉ thay đổi khi Staff/Admin xác nhận tại quầy.
     */
    useEffect(
        () => {
            if (
                state !==
                "pending" ||
                payment?.paymentMethod !==
                "VNPAY"
            ) {
                return;
            }

            const timeout =
                window.setTimeout(
                    () => {
                        void loadPayment();
                    },
                    3000,
                );

            return () => {
                window.clearTimeout(
                    timeout,
                );
            };
        },
        [
            state,
            payment?.paymentMethod,
            loadPayment,
        ],
    );

    // =================================================
    // RENDER
    // =================================================

    return (
        <div
            className="
                mx-auto
                flex
                min-h-[70vh]
                w-full
                max-w-2xl
                items-center
                justify-center
                px-4
                py-10
            "
        >
            <Card
                className="
                    w-full
                    overflow-hidden
                    text-center
                "
            >
                <div
                    className="
                        p-7
                        sm:p-10
                    "
                >
                    <ResultIcon
                        state={
                            state
                        }
                        payment={
                            payment
                        }
                    />

                    <h1
                        className="
                            mt-6
                            text-2xl
                            font-black
                            tracking-tight
                            text-slate-950
                            sm:text-3xl
                        "
                    >
                        {getTitle(
                            state,
                            payment,
                        )}
                    </h1>

                    <p
                        className="
                            mx-auto
                            mt-3
                            max-w-lg
                            text-sm
                            leading-6
                            text-slate-500
                        "
                    >
                        {message}
                    </p>

                    {/* =================================
                        CASH INSTRUCTION
                    ================================== */}

                    {payment?.paymentMethod ===
                        "CASH" &&
                        payment.paymentStatus ===
                        "PENDING" && (
                            <div
                                className="
                                    mt-6
                                    rounded-2xl
                                    border
                                    border-amber-200
                                    bg-amber-50
                                    p-5
                                    text-left
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-3
                                    "
                                >
                                    <Store
                                        className="
                                            mt-0.5
                                            h-5
                                            w-5
                                            shrink-0
                                            text-amber-600
                                        "
                                    />

                                    <div>
                                        <p
                                            className="
                                                font-bold
                                                text-amber-900
                                            "
                                        >
                                            Thanh toán tại quầy
                                        </p>

                                        <p
                                            className="
                                                mt-1
                                                text-sm
                                                leading-6
                                                text-amber-700
                                            "
                                        >
                                            Vui lòng cung cấp mã thanh toán
                                            cho nhân viên lễ tân và thanh toán
                                            số tiền bên dưới. Gói tập chỉ được
                                            kích hoạt sau khi nhân viên xác
                                            nhận đã nhận tiền.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* =================================
                        PAYMENT INFORMATION
                    ================================== */}

                    {payment && (
                        <div
                            className="
                                mt-7
                                rounded-2xl
                                border
                                border-slate-100
                                bg-slate-50
                                p-5
                                text-left
                            "
                        >
                            <ResultRow
                                label="Mã thanh toán"
                                value={
                                    payment.paymentCode ??
                                    `#${payment.id}`
                                }
                            />

                            {payment.invoiceCode && (
                                <ResultRow
                                    label="Mã hóa đơn"
                                    value={
                                        payment.invoiceCode
                                    }
                                />
                            )}

                            <ResultRow
                                label="Số tiền"
                                value={
                                    formatCurrency(
                                        payment.amount,
                                    )
                                }
                            />

                            <ResultRow
                                label="Phương thức"
                                value={
                                    getPaymentMethodLabel(
                                        payment.paymentMethod,
                                    )
                                }
                            />

                            <ResultRow
                                label="Trạng thái"
                                value={
                                    getPaymentStatusLabel(
                                        payment.paymentStatus,
                                    )
                                }
                            />

                            {payment.transactionNo && (
                                <ResultRow
                                    label="Mã giao dịch"
                                    value={
                                        payment.transactionNo
                                    }
                                />
                            )}

                            {payment.paidAt && (
                                <ResultRow
                                    label="Thanh toán lúc"
                                    value={
                                        new Date(
                                            payment.paidAt,
                                        ).toLocaleString(
                                            "vi-VN",
                                        )
                                    }
                                />
                            )}

                            {payment.failedReason && (
                                <ResultRow
                                    label="Lý do"
                                    value={
                                        payment.failedReason
                                    }
                                />
                            )}
                        </div>
                    )}

                    {/* =================================
                        ACTIONS
                    ================================== */}

                    <div
                        className="
                            mt-8
                            flex
                            flex-col
                            gap-3
                            sm:flex-row
                            sm:flex-wrap
                            sm:justify-center
                        "
                    >
                        {state ===
                            "pending" && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        void loadPayment();
                                    }}
                                >
                                    <RefreshCw
                                        className="
                                        h-4
                                        w-4
                                    "
                                    />

                                    Kiểm tra trạng thái
                                </Button>
                            )}

                        {state ===
                            "error" && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        void loadPayment();
                                    }}
                                >
                                    <RefreshCw
                                        className="
                                        h-4
                                        w-4
                                    "
                                    />

                                    Thử lại
                                </Button>
                            )}

                        {state ===
                            "success" && (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        navigate(
                                            ROUTES
                                                .MEMBER_SUBSCRIPTION,
                                        )
                                    }
                                >
                                    Xem gói tập
                                </Button>
                            )}

                        {state ===
                            "failed" && (
                                <Button
                                    variant="primary"
                                    onClick={() =>
                                        navigate(
                                            ROUTES
                                                .MEMBER_PACKAGES,
                                        )
                                    }
                                >
                                    Chọn lại gói
                                </Button>
                            )}

                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    ROUTES
                                        .MEMBER_PAYMENT,
                                )
                            }
                        >
                            Lịch sử thanh toán
                        </Button>
                    </div>

                    <p
                        className="
                            mt-6
                            text-[11px]
                            leading-5
                            text-slate-400
                        "
                    >
                        Trạng thái thanh toán được lấy trực tiếp
                        từ hệ thống FitLife. Gói tập chỉ được kích
                        hoạt sau khi giao dịch được xác nhận thành công.
                    </p>
                </div>
            </Card>
        </div>
    );
}

// =====================================================
// RESULT ICON
// =====================================================

function ResultIcon({
                        state,
                        payment,
                    }: {
    state:
        ResultState;

    payment:
        PaymentResult | null;
}) {
    const className =
        "mx-auto h-14 w-14";

    if (
        state ===
        "loading"
    ) {
        return (
            <Loader2
                className={`
                    ${className}
                    animate-spin
                    text-blue-500
                `}
            />
        );
    }

    if (
        state ===
        "success"
    ) {
        return (
            <CheckCircle2
                className={`
                    ${className}
                    text-emerald-500
                `}
            />
        );
    }

    if (
        state ===
        "pending" &&
        payment?.paymentMethod ===
        "CASH"
    ) {
        return (
            <Store
                className={`
                    ${className}
                    text-amber-500
                `}
            />
        );
    }

    if (
        state ===
        "pending"
    ) {
        return (
            <Clock3
                className={`
                    ${className}
                    text-amber-500
                `}
            />
        );
    }

    if (
        state ===
        "failed"
    ) {
        return (
            <XCircle
                className={`
                    ${className}
                    text-red-500
                `}
            />
        );
    }

    return (
        <AlertTriangle
            className={`
                ${className}
                text-slate-400
            `}
        />
    );
}

// =====================================================
// TITLE
// =====================================================

function getTitle(
    state:
    ResultState,

    payment:
        PaymentResult | null,
): string {
    if (
        state ===
        "loading"
    ) {
        return "Đang kiểm tra thanh toán";
    }

    if (
        state ===
        "success"
    ) {
        return "Thanh toán thành công";
    }

    if (
        state ===
        "pending"
    ) {
        if (
            payment?.paymentMethod ===
            "CASH"
        ) {
            return "Chờ thanh toán tại quầy";
        }

        if (
            payment?.paymentMethod ===
            "BANK_TRANSFER"
        ) {
            return "Chờ xác nhận chuyển khoản";
        }

        return "Đang chờ VNPay xác nhận";
    }

    if (
        state ===
        "failed"
    ) {
        if (
            payment?.paymentStatus ===
            "CANCELLED"
        ) {
            return "Giao dịch đã hủy";
        }

        if (
            payment?.paymentStatus ===
            "REFUNDED"
        ) {
            return "Giao dịch đã hoàn tiền";
        }

        return "Thanh toán chưa thành công";
    }

    return "Không thể xác nhận giao dịch";
}

// =====================================================
// RESULT ROW
// =====================================================

function ResultRow({
                       label,
                       value,
                   }: {
    label:
        string;

    value:
        string;
}) {
    return (
        <div
            className="
                flex
                items-start
                justify-between
                gap-4
                border-b
                border-slate-100
                py-3
                last:border-0
            "
        >
            <span
                className="
                    shrink-0
                    text-sm
                    text-slate-500
                "
            >
                {label}
            </span>

            <span
                className="
                    min-w-0
                    break-all
                    text-right
                    text-sm
                    font-bold
                    text-slate-800
                "
            >
                {value}
            </span>
        </div>
    );
}