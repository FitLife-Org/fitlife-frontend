import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Invoice } from "../types/invoice.type";

export const invoiceService = {
  async getMyInvoices(): Promise<Invoice[]> {
    const response = await apiClient.get<ApiResponse<Invoice[]>>("/invoices/my");
    return response.data.data as Invoice[];
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return response.data.data as Invoice;
  },
};
