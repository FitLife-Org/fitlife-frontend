import { useState } from "react";
import { BrainCircuit, Loader2, Wrench } from "lucide-react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";

interface AiEquipmentModalProps {
    open: boolean;
    onClose: () => void;
}

export default function AiEquipmentModal({ open, onClose }: AiEquipmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setResult(null);
        try {
            // MOCK response
            setTimeout(() => {
                setResult(
                    "Theo dữ liệu thiết bị, hệ thống AI nhận định:\n\n" +
                    "- **Rủi ro cao:** Máy chạy bộ số 3 (Treadmill-03) có tỷ lệ sử dụng cao nhưng đã quá hạn bảo trì 5 ngày. Đề xuất bảo trì lập tức.\n" +
                    "- **Dự báo:** Tuần tới sẽ có 12 thiết bị tập tạ (Dumbbells & Barbells) cần kiểm tra khớp nối và thay thế đệm.\n" +
                    "- **Khuyến nghị:** Mở rộng không gian cho khu vực tập Cardio vì tần suất sử dụng vượt 85% công suất thiết kế."
                );
                setLoading(false);
            }, 2500);
            
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="AI Phân tích Thiết Bị" size="lg">
            <div className="space-y-4">
                {!result && !loading && (
                    <div className="text-center py-8">
                        <div className="bg-blue-50 text-blue-600 p-4 rounded-full inline-block mb-4">
                            <BrainCircuit className="w-12 h-12" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Phân tích bằng Trí Tuệ Nhân Tạo</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Hệ thống sẽ thu thập tình trạng hiện tại, lịch sử sử dụng và bảo trì của tất cả thiết bị để dự báo rủi ro hỏng hóc.
                        </p>
                        <Button className="mt-6 bg-blue-600" onClick={handleAnalyze}>
                            Bắt đầu phân tích
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-slate-500 animate-pulse">Đang thu thập và xử lý dữ liệu hàng ngàn điểm trạng thái...</p>
                    </div>
                )}

                {result && !loading && (
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
                                <Wrench className="w-5 h-5" />
                                Báo cáo tình trạng hệ thống thiết bị
                            </div>
                            <div className="prose prose-sm text-slate-700 whitespace-pre-wrap">
                                {result.split('\n').map((line, idx) => {
                                    if (line.startsWith('- **')) {
                                        return <p key={idx} className="mb-2" dangerouslySetInnerHTML={{ __html: line.replace('- **', '<strong class="text-slate-900">').replace(':**', '</strong>:') }} />
                                    }
                                    return <p key={idx} className="mb-2">{line}</p>
                                })}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={onClose} variant="outline">Đóng lại</Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
