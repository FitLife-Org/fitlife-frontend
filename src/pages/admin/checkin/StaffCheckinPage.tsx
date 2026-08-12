import { useState } from "react";
import { ScanLine, UserCheck, XCircle } from "lucide-react";
import Card from "../../../components/common/Card";
import PageHeader from "../../../components/common/PageHeader";
import { checkinService } from "../../../services/checkinService";
import { getApiErrorMessage } from "../../../utils/apiError";
import toast from "react-hot-toast";

export default function StaffCheckinPage() {
    const [qrCode, setQrCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!qrCode.trim()) return;

        try {
            setLoading(true);
            setResult(null);
            
            // Assuming the QR data contains the member code or a specific token
            await checkinService.scanMemberQr({
                qrData: qrCode.trim(),
                facilityId: 1 // Default facility for now
            });
            
            toast.success("Check-in thành công!");
            setResult("SUCCESS");
            setQrCode(""); // Reset for next scan
        } catch (error) {
            toast.error(getApiErrorMessage(error));
            setResult("ERROR");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Staff Check-in"
                description="Quét mã QR của hội viên để thực hiện check-in"
            />

            <div className="flex justify-center mt-10">
                <Card className="w-full max-w-md p-8 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fit-primary to-blue-500" />
                    
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-fit-primary mb-6">
                        <ScanLine className="h-8 w-8" />
                    </div>

                    <h2 className="text-xl font-black text-slate-900 mb-2">Quét Mã QR Hội Viên</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8">
                        Sử dụng đầu đọc mã vạch hoặc nhập mã thủ công.
                    </p>

                    <form onSubmit={handleScan} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                placeholder="Quét hoặc nhập mã QR..."
                                autoFocus
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg font-mono font-bold uppercase tracking-widest outline-none focus:border-fit-primary focus:ring-2 focus:ring-fit-primary/20"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !qrCode.trim()}
                            className="w-full rounded-xl bg-fit-primary py-3 font-bold text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                            {loading ? "Đang xử lý..." : "Thực hiện Check-in"}
                        </button>
                    </form>

                    {result === "SUCCESS" && (
                        <div className="mt-6 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-3 px-4 rounded-xl">
                            <UserCheck className="w-5 h-5" />
                            <span className="font-bold">Check-in hợp lệ! Cổng đã mở.</span>
                        </div>
                    )}

                    {result === "ERROR" && (
                        <div className="mt-6 flex items-center justify-center gap-2 text-red-600 bg-red-50 py-3 px-4 rounded-xl">
                            <XCircle className="w-5 h-5" />
                            <span className="font-bold">Mã không hợp lệ hoặc lỗi!</span>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
