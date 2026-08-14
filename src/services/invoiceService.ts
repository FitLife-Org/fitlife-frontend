import apiClient from "./apiClient";

import type {
    ApiResponse,
    PageResponse,
} from "../types/common.type";

import type {
    Invoice,
    InvoiceAuditLog,
    InvoiceCancelRequest,
    InvoiceEmailRequest,
    InvoiceGenerateRequest,
    InvoiceHistory,
    InvoicePayment,
    InvoiceQueryParams,
    InvoiceRefundRequest,
} from "../types/invoice.type";

function requireData<T>(
    response: ApiResponse<T>,
    message: string,
): T {
    if (
        response.data === null ||
        response.data === undefined
    ) {
        throw new Error(message);
    }

    return response.data;
}

export const invoiceService = {
    // =====================================================
    // MEMBER
    // =====================================================

    async getMyInvoices(
        params: {
            page?: number;
            size?: number;
            sort?: string;
        } = {},
    ): Promise<PageResponse<Invoice>> {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<Invoice>
                >
            >("/invoices/my", {
                params: {
                    page:
                        params.page ?? 0,

                    size:
                        params.size ?? 10,

                    sort:
                        params.sort ??
                        "issuedAt,desc",
                },
            });

        return requireData(
            response.data,
            "Không nhận được danh sách hóa đơn.",
        );
    },

    async getMyInvoiceById(
        id: number,
    ): Promise<Invoice> {
        const response =
            await apiClient.get<
                ApiResponse<Invoice>
            >(`/invoices/${id}`);

        return requireData(
            response.data,
            "Không nhận được chi tiết hóa đơn.",
        );
    },

    async getInvoiceByPaymentId(
        paymentId: string,
    ): Promise<Invoice> {
        const response =
            await apiClient.get<
                ApiResponse<Invoice>
            >(`/invoices/by-payment/${paymentId}`);

        return requireData(
            response.data,
            "Không nhận được hóa đơn từ giao dịch này.",
        );
    },

    async getMyInvoiceHistory(
        id: number,
    ): Promise<InvoiceHistory[]> {
        const response =
            await apiClient.get<
                ApiResponse<
                    InvoiceHistory[]
                >
            >(`/invoices/${id}/history`);

        return requireData(
            response.data,
            "Không nhận được lịch sử hóa đơn.",
        );
    },

    async emailMyInvoice(
        id: number,
    ): Promise<void> {
        await apiClient.post<
            ApiResponse<void>
        >(`/invoices/${id}/email`);
    },

    // =====================================================
    // ADMIN
    // =====================================================

    async getAdminInvoices(
        params: InvoiceQueryParams = {},
    ): Promise<PageResponse<Invoice>> {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<Invoice>
                >
            >("/admin/invoices", {
                params: {
                    page:
                        params.page ?? 0,

                    size:
                        params.size ?? 10,

                    keyword:
                        params.keyword?.trim() ||
                        undefined,

                    memberId:
                    params.memberId,

                    status:
                    params.status,

                    fromDate:
                    params.fromDate,

                    toDate:
                    params.toDate,

                    sort:
                        params.sort ??
                        "issuedAt,desc",
                },
            });

        return requireData(
            response.data,
            "Không nhận được danh sách hóa đơn.",
        );
    },

    async getAdminInvoiceById(
        id: number,
    ): Promise<Invoice> {
        const response =
            await apiClient.get<
                ApiResponse<Invoice>
            >(`/admin/invoices/${id}`);

        return requireData(
            response.data,
            "Không nhận được chi tiết hóa đơn.",
        );
    },

    async cancelInvoice(
        id: number,
        reason: string,
    ): Promise<Invoice> {
        const payload:
            InvoiceCancelRequest = {
            reason: reason.trim(),
        };

        const response =
            await apiClient.patch<
                ApiResponse<Invoice>
            >(
                `/admin/invoices/${id}/cancel`,
                payload,
            );

        return requireData(
            response.data,
            "Không nhận được hóa đơn sau khi hủy.",
        );
    },

    async refundInvoice(
        id: number,
        reason: string,
    ): Promise<Invoice> {
        const payload:
            InvoiceRefundRequest = {
            reason: reason.trim(),
        };

        const response =
            await apiClient.patch<
                ApiResponse<Invoice>
            >(
                `/admin/invoices/${id}/refund`,
                payload,
            );

        return requireData(
            response.data,
            "Không nhận được hóa đơn sau khi hoàn tiền.",
        );
    },

    async generateInvoice(
        subscriptionId: number,
        note?: string,
    ): Promise<Invoice> {
        const payload:
            InvoiceGenerateRequest = {
            subscriptionId,

            note:
                note?.trim() ||
                undefined,
        };

        const response =
            await apiClient.post<
                ApiResponse<Invoice>
            >(
                "/admin/invoices/generate",
                payload,
            );

        return requireData(
            response.data,
            "Không nhận được hóa đơn vừa tạo.",
        );
    },

    async getInvoicePayments(
        id: number,
        params: {
            page?: number;
            size?: number;
        } = {},
    ): Promise<
        PageResponse<InvoicePayment>
    > {
        const response =
            await apiClient.get<
                ApiResponse<
                    PageResponse<InvoicePayment>
                >
            >(
                `/admin/invoices/${id}/payments`,
                {
                    params: {
                        page:
                            params.page ?? 0,

                        size:
                            params.size ?? 20,
                    },
                },
            );

        return requireData(
            response.data,
            "Không nhận được lịch sử thanh toán.",
        );
    },

    async getInvoiceHistoryForAdmin(
        id: number,
    ): Promise<InvoiceHistory[]> {
        const response =
            await apiClient.get<
                ApiResponse<
                    InvoiceHistory[]
                >
            >(
                `/admin/invoices/${id}/history`,
            );

        return requireData(
            response.data,
            "Không nhận được lịch sử hóa đơn.",
        );
    },

    async getInvoiceAuditLogs(
        id: number,
    ): Promise<InvoiceAuditLog[]> {
        const response =
            await apiClient.get<
                ApiResponse<
                    InvoiceAuditLog[]
                >
            >(
                `/admin/invoices/${id}/audit-logs`,
            );

        return requireData(
            response.data,
            "Không nhận được nhật ký hóa đơn.",
        );
    },

    async emailInvoiceForAdmin(
        id: number,
        email?: string,
    ): Promise<void> {
        const payload:
            InvoiceEmailRequest = {
            email:
                email?.trim() ||
                undefined,
        };

        await apiClient.post<
            ApiResponse<void>
        >(
            `/admin/invoices/${id}/email`,
            payload,
        );
    },
};