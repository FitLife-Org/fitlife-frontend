import { useEffect, useState } from "react";
import { QrCode, ScanLine } from "lucide-react";
import QRCode from "react-qr-code";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { memberService } from "../../services/memberService";
import { getApiErrorMessage } from "../../utils/apiError";
import { showAlert } from "../../utils/alert";

interface QrData {
    memberCode: string;
    qrData: string;
}

export default function MemberQRPage() {
    const [qrInfo, setQrInfo] = useState<QrData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadQrCode = async () => {
        try {
            setLoading(true);
            const data = await memberService.getMyQr();
            setQrInfo(data);
        } catch (error) {
            void showAlert.error("Đã xảy ra lỗi", getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadQrCode();
        
        // Auto refresh QR every 60 seconds for security
        const interval = setInterval(() => {
            void loadQrCode();
        }, 60000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Mã QR Check-in"
                description="Sử dụng mã QR này để check-in tại các phòng tập FitLife"
            />

            <div className="flex justify-center mt-10">
                <Card className="w-full max-w-sm p-8 text-center relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-fit-primary to-blue-500" />
                    
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-fit-primary mb-6">
                        <QrCode className="h-8 w-8" />
                    </div>

                    <h2 className="text-xl font-black text-slate-900 mb-2">Thẻ Thành Viên</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8">
                        Vui lòng đưa mã này cho lễ tân hoặc quét tại cổng tự động.
                    </p>

                    <div className="bg-white p-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.05)] border border-slate-100 relative mx-auto w-fit">
                        {loading && !qrInfo ? (
                            <div className="flex h-[200px] w-[200px] items-center justify-center bg-slate-50 rounded-xl">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-fit-primary border-t-transparent" />
                            </div>
                        ) : qrInfo ? (
                            <div className="relative group/qr">
                                <QRCode
                                    value={qrInfo.qrData}
                                    size={200}
                                    level="H"
                                    className="rounded-lg"
                                />
                                <div className="absolute inset-0 bg-white/60 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-opacity rounded-lg backdrop-blur-[1px]">
                                    <ScanLine className="w-10 h-10 text-fit-primary" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-[200px] w-[200px] items-center justify-center bg-slate-50 rounded-xl">
                                <p className="text-sm text-slate-400 font-medium">Không thể tải mã QR</p>
                            </div>
                        )}
                    </div>

                    {qrInfo && (
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Mã Hội Viên</p>
                            <p className="text-2xl font-black font-mono tracking-widest text-slate-800">
                                {qrInfo.memberCode}
                            </p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={loadQrCode}
                            disabled={loading}
                            className="text-xs font-semibold text-slate-500 hover:text-fit-primary flex items-center gap-1.5 transition-colors"
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Mã tự động làm mới sau mỗi phút
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
