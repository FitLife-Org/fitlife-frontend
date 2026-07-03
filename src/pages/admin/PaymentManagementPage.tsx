import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import { showAlert } from "../../utils/alert";
import { formatCurrency } from "../../utils/formatCurrency";
import { paymentService } from "../../services/paymentService";
import type { PaymentResult } from "../../types/payment.type";

export default function PaymentManagementPage() {
    const [payments, setPayments] = useState<PaymentResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async (): Promise<void> => {
        try {
            setLoading(true);

            const data = await paymentService.getAdminPayments({
                status: "PENDING",
            });

            setPayments(data);
        } catch (error: unknown) {
            console.error("GET_ADMIN_PAYMENTS_ERROR:", error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (error: unknown, fallback: string): string => {
        if (axios.isAxiosError(error)) {
            return error.response?.data?.message || fallback;
        }

        return fallback;
    };

    const handleConfirm = async (paymentId: number): Promise<void> => {
        try {
            await paymentService.confirmPayment(paymentId, {
                transactionNo: `ADMIN-${Date.now()}`,
                note: "Admin/Staff xác nhận đã nhận thanh toán",
            });

            showAlert.success("Thành công", "Đã xác nhận thanh toán");
            fetchPayments();
        } catch (error: unknown) {
            console.error("CONFIRM_PAYMENT_ERROR:", error);

            showAlert.error(
                "Lỗi",
                getErrorMessage(error, "Không thể xác nhận thanh toán")
            );
        }
    };

    const handleFail = async (paymentId: number): Promise<void> => {
        try {
            await paymentService.failPayment(
                paymentId,
                "Không tìm thấy giao dịch thanh toán"
            );

            showAlert.success("Thành công", "Đã từ chối thanh toán");
            fetchPayments();
        } catch (error: unknown) {
            console.error("FAIL_PAYMENT_ERROR:", error);

            showAlert.error(
                "Lỗi",
                getErrorMessage(error, "Không thể từ chối thanh toán")
            );
        }
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "SUCCESS":
                return <Badge variant="success">Thành công</Badge>;
            case "PENDING":
                return <Badge variant="warning">Chờ xác nhận</Badge>;
            case "FAILED":
                return <Badge variant="danger">Thất bại</Badge>;
            case "CANCELLED":
                return <Badge variant="danger">Đã hủy</Badge>;
            default:
                return <Badge variant="default">{status || "-"}</Badge>;
        }
    };

    const columns = [
        {
            key: "paymentCode",
            header: "Mã thanh toán",
            render: (row: PaymentResult) => (
                <span className="font-mono font-bold text-sm">
          {row.paymentCode || `PAY-${row.id}`}
        </span>
            ),
        },
        {
            key: "invoiceCode",
            header: "Hóa đơn",
            render: (row: PaymentResult) => (
                <span>{row.invoiceCode || `Invoice #${row.invoiceId}`}</span>
            ),
        },
        {
            key: "member",
            header: "Hội viên",
            render: (row: PaymentResult) => (
                <span>{row.memberName || `Member #${row.memberId || "-"}`}</span>
            ),
        },
        {
            key: "amount",
            header: "Số tiền",
            render: (row: PaymentResult) => (
                <span className="font-bold text-fit-primary">
          {formatCurrency(row.amount)}
        </span>
            ),
        },
        {
            key: "paymentMethod",
            header: "Phương thức",
            render: (row: PaymentResult) => <span>{row.paymentMethod}</span>,
        },
        {
            key: "status",
            header: "Trạng thái",
            render: (row: PaymentResult) =>
                getStatusBadge(row.paymentStatus ?? row.status),
        },
        {
            key: "actions",
            header: "Thao tác",
            render: (row: PaymentResult) => {
                const status = row.paymentStatus ?? row.status;

                if (status !== "PENDING") {
                    return <span className="text-sm text-slate-400">Không thao tác</span>;
                }

                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleConfirm(row.id)}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"
                            title="Xác nhận thanh toán"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => handleFail(row.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Từ chối thanh toán"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <PageHeader
                title="Quản lý thanh toán"
                description="Xác nhận hoặc từ chối các yêu cầu thanh toán của hội viên"
            />

            <Card className="overflow-hidden mt-6">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    <Table columns={columns} data={payments} />
                )}
            </Card>
        </>
    );
}