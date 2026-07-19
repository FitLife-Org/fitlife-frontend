import { useState, useEffect } from "react";
import { showAlert } from "../../../utils/alert";
import { invoiceService } from "../services/invoiceService";
import type { Invoice } from "../types/invoice.type";

export function useInvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAdminInvoices();
      setInvoices(data);
    } catch (error: any) {
      console.error("GET_ADMIN_INVOICES_ERROR:", error?.response?.data || error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvoice = async (invoiceId: number) => {
    try {
      await invoiceService.cancelInvoice(invoiceId, "Admin hủy hóa đơn");

      showAlert.success("Thành công", "Đã hủy hóa đơn");
      fetchInvoices();
    } catch (error: any) {
      console.error("CANCEL_INVOICE_ERROR:", error?.response?.data || error);

      showAlert.error(
          "Lỗi",
          error?.response?.data?.message || "Không thể hủy hóa đơn"
      );
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (!keyword) return true;
    const lowerKeyword = keyword.toLowerCase();
    return inv.invoiceCode?.toLowerCase().includes(lowerKeyword) ||
           inv.memberName?.toLowerCase().includes(lowerKeyword);
  });

  return {
    invoices,
    loading,
    keyword,
    setKeyword,
    filteredInvoices,
    handleCancelInvoice
  };
}
