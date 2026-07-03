import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Search, Clock } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import { formatCurrency } from "../../utils/formatCurrency";
import { showAlert } from "../../utils/alert";
import type { Invoice } from "../../types/invoice.type";
import apiClient from "../../services/apiClient";
import {invoiceService} from "../../services/invoiceService";

export default function InvoiceManagementPage() {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">Đã thanh toán</Badge>;
      case "UNPAID":
        return <Badge variant="warning">Chưa thanh toán</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">Đã hủy</Badge>;
      case "REFUNDED":
        return <Badge variant="default">Hoàn tiền</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceCode?.toLowerCase().includes(keyword.toLowerCase()) ||
    inv.memberName?.toLowerCase().includes(keyword.toLowerCase())
  );

  const columns = [
    {
      key: "invoiceCode",
      header: "Mã hóa đơn",
      render: (row: Invoice) => (
        <span className="font-mono font-bold text-sm text-fit-text">
          {row.invoiceCode || `INV-${row.id}`}
        </span>
      ),
    },
    {
      key: "memberName",
      header: "Hội viên",
      render: (row: Invoice) => (
        <span className="font-semibold text-fit-text">{row.memberName || `Hội viên #${row.memberId}`}</span>
      ),
    },
    {
      key: "amount",
      header: "Số tiền",
      render: (row: Invoice) => (
          <span className="font-bold text-fit-primary">
      {formatCurrency(row.finalAmount ?? row.amount ?? 0)}
    </span>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      render: (row: Invoice) => (
          <span className="text-sm text-fit-muted">
      {row.issuedAt || row.createdAt || "-"}
    </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Invoice) => getStatusBadge(row.status),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: Invoice) => (
          <div className="flex items-center gap-2">
            {row.status === "UNPAID" && (
                <button
                    onClick={() => handleCancelInvoice(row.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hủy hóa đơn"
                >
                  <XCircle className="w-5 h-5" />
                </button>
            )}

            {row.status === "PAID" && (
                <button
                    className="p-2 text-slate-300 cursor-not-allowed"
                    title="Đã thanh toán"
                    disabled
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
            )}
          </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <PageHeader title="Quản lý hóa đơn" description="Tra cứu và quản lý hóa đơn thanh toán của hội viên" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã HĐ hoặc tên hội viên..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fit-primary/20 focus:border-fit-primary transition-all"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent"></div>
          </div>
        ) : (
          <Table columns={columns} data={filteredInvoices} />
        )}
      </Card>
    </>
  );
}
