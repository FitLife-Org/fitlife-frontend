import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Invoice } from "../types/invoice.type";

export const invoiceService = {
  async getMyInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get<ApiResponse<any>>("/invoices/my");
    const data = response.data.data;

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.data)) return data.data;

    return [];
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    const response = await apiClient.get<ApiResponse<Invoice>>(
        `/invoices/${id}`
    );

    return response.data.data as Invoice;
  },

  async getAdminInvoices(params?: {
    page?: number;
    size?: number;
    status?: string;
    memberId?: number;
  }): Promise<Invoice[]> {
    const response = await apiClient.get<ApiResponse<any>>(
        "/admin/invoices",
        { params }
    );

    const data = response.data.data;

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.data)) return data.data;

    return [];
  },

  async cancelInvoice(id: number, reason: string): Promise<Invoice> {
    const response = await apiClient.patch<ApiResponse<Invoice>>(
        `/admin/invoices/${id}/cancel`,
        { reason }
    );

    return response.data.data as Invoice;
  },
};