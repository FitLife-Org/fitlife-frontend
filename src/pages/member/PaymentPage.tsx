import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import { showAlert } from "../../utils/alert";
import { formatCurrency } from "../../utils/formatCurrency";
import { invoiceService } from "../../services/invoiceService";
import { paymentService } from "../../services/paymentService";
import type { Invoice } from "../../types/invoice.type";
import type { PaymentResult } from "../../types/payment.type";
import { validatePaymentForm } from "../../utils/validators/paymentValidator";

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<PaymentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [note, setNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          const invData = await invoiceService.getInvoiceById(Number(id));
          setInvoice(invData);
        } else {
          const paymentsData = await paymentService.getMyPayments();
          setPayments(paymentsData || []);
        }
      } catch (error) {
        console.error("Failed to load payment data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePayment = async () => {
    if (!invoice) return;
    
    const payload = {
      invoiceId: invoice.id,
      paymentMethod: paymentMethod,
      note: note.trim() || undefined
    };

    if (!validatePaymentForm(payload)) {
      return;
    }

    try {
      setProcessing(true);
      const result = await paymentService.createPayment(payload);
      
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        // Fallback for mock backend
        showAlert.success("Thành công", "Thanh toán giả lập thành công!");
        navigate("/member/subscriptions");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      showAlert.error("Lỗi", "Có lỗi xảy ra khi thanh toán.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent"></div>
      </div>
    );
  }

  // 1. PAYMENT FLOW (Paying a specific invoice)
  if (id && invoice) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-fit-muted hover:text-fit-primary transition-colors font-medium mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        
        <PageHeader 
          title="Thanh toán hóa đơn" 
          description={`Mã hóa đơn: ${invoice.invoiceCode || `INV-${invoice.id}`}`} 
        />
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-fit-text mb-6">Chi tiết thanh toán</h2>
              
              <div className="space-y-4 divide-y divide-slate-100">
                <div className="flex justify-between pb-4">
                  <span className="text-slate-500 font-medium">Gói hội viên</span>
                  <span className="font-bold text-slate-800">Đăng ký mới</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-slate-500 font-medium">Khách hàng</span>
                  <span className="font-bold text-slate-800">{invoice.memberName}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-slate-500 font-medium">Tổng tiền</span>
                  <span className="text-2xl font-black text-fit-primary">{formatCurrency(invoice.amount)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-fit-text mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${paymentMethod === 'VNPAY' ? 'border-fit-primary bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="VNPAY" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="h-4 w-4 text-fit-primary focus:ring-fit-primary" />
                    <span className="font-bold text-slate-800">Thanh toán qua VNPAY</span>
                  </div>
                  <img src="https://vnpay.vn/s1/vnpay/asset/images/logo-vnpay.png" alt="VNPay" className="h-6 object-contain" />
                </label>
                
                <label className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${paymentMethod === 'MOMO' ? 'border-pink-500 bg-pink-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="MOMO" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} className="h-4 w-4 text-pink-500 focus:ring-pink-500" />
                    <span className="font-bold text-slate-800">Ví MoMo</span>
                  </div>
                  <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-6 object-contain" />
                </label>
              </div>
              <div className="pt-6 flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Ghi chú thanh toán (Tùy chọn)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-fit-primary focus:outline-none focus:ring-1 focus:ring-fit-primary resize-none"
                  rows={2}
                  placeholder="Nhập ghi chú cho quản trị viên (nếu có)..."
                />
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="p-6 sticky top-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white border-none shadow-xl">
              <h3 className="text-lg font-bold mb-4">Tổng cộng</h3>
              <div className="flex justify-between items-end mb-8">
                <span className="text-slate-400">Cần thanh toán</span>
                <span className="text-3xl font-black text-emerald-400">{formatCurrency(invoice.amount)}</span>
              </div>
              
              <button 
                onClick={handlePayment}
                disabled={processing || invoice.status === 'PAID'}
                className="w-full rounded-xl bg-fit-primary py-4 font-bold text-white transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {processing ? (
                  <><div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> Đang xử lý...</>
                ) : invoice.status === 'PAID' ? (
                  <><CheckCircle2 className="w-5 h-5" /> Đã thanh toán</>
                ) : (
                  <>Thanh toán ngay <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
              
              <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> Giao dịch được bảo mật an toàn
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // 2. TRANSACTION HISTORY FLOW
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader title="Giao dịch của tôi" description="Quản lý lịch sử thanh toán và hóa đơn" />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-bold text-fit-text mb-6">Lịch sử giao dịch</h2>
            
            {(Array.isArray(payments) ? payments : []).length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                  <CreditCard className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-bold text-slate-700">Chưa có giao dịch nào</h3>
                <p className="text-sm text-slate-500 mt-1">Các giao dịch thanh toán của bạn sẽ hiện ở đây.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(payments) && payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-2xl border border-fit-border p-4 hover:border-fit-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        {payment.status === 'SUCCESS' ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <CreditCard className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Thanh toán hóa đơn #{payment.invoiceId}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-slate-500">{payment.createdAt || "Vừa xong"}</p>
                          <span className="text-xs text-slate-300">•</span>
                          <p className="text-xs font-medium text-slate-500">{payment.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurrency(payment.amount)}</p>
                      <Badge variant={payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'danger' : 'warning'} className="mt-1 inline-block">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
        
        <div>
          <Card className="p-6 md:p-8 sticky top-24">
            <p className="text-slate-500 font-medium">Cần hỗ trợ thanh toán?</p>
            <p className="text-sm text-slate-600 mt-2">
              Nếu bạn gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ lễ tân tại cơ sở hoặc gọi hotline hỗ trợ.
            </p>
            <div className="mt-6 rounded-xl bg-slate-100 p-4">
              <p className="text-sm font-bold text-slate-800">Hotline: 1900 1234</p>
              <p className="text-xs text-slate-500 mt-1">Hoạt động từ 6:00 - 22:00</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
