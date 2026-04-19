import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

// ĐÃ XÓA MOCK DATA VÀ MỞ IMPORT THẬT
import axiosInstance from '../../services/axiosInstance.js';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
    const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
    const [transactionId, setTransactionId] = useState('');

    // Khóa chống React StrictMode gọi API 2 lần
    const hasCalledAPI = useRef(false);

    useEffect(() => {
        const verifyPayment = async () => {
            // Chốt chặn: Nếu đã gọi API rồi thì không gọi nữa
            if (hasCalledAPI.current) return;
            hasCalledAPI.current = true;

            try {
                // 1. GOM TOÀN BỘ PARAMETER TRÊN URL DO VNPAY TRẢ VỀ
                const params = Object.fromEntries([...searchParams]);

                // Nếu không có tham số nào, có thể user tự gõ URL vào
                if (Object.keys(params).length === 0) {
                    setStatus('error');
                    setMessage('Không tìm thấy thông tin giao dịch.');
                    return;
                }

                setTransactionId(params.vnp_TransactionNo || '');

                // 2. GỬI XUỐNG BACKEND THẬT ĐỂ KIỂM TRA CHỮ KÝ VÀ LƯU DATABASE
                const response = await axiosInstance.get('/payment/vnpay-return', {
                    params: params
                });

                // 3. XỬ LÝ KẾT QUẢ TỪ BACKEND
                if (response.data.code === 200) {
                    setStatus('success');
                    setMessage('Thanh toán thành công! Gói tập của bạn đã được kích hoạt.');
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Thanh toán thất bại hoặc đã bị hủy.');
                }

            } catch (error) {
                console.error("Lỗi verify thanh toán:", error);
                setStatus('error');
                setMessage('Giao dịch thất bại: Khách hàng hủy thanh toán hoặc sai chữ ký bảo mật.');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full text-center relative overflow-hidden">

                {/* HIỆU ỨNG TRANG TRÍ MỜ MỜ CHUYỂN MÀU THEO TRẠNG THÁI */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-10 blur-3xl ${
                    status === 'success' ? 'bg-success' : status === 'error' ? 'bg-danger' : 'bg-primary'
                }`}></div>

                {status === 'processing' && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-20 h-20 text-primary animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xác thực giao dịch</h2>
                        <p className="text-gray-500">Hệ thống đang kiểm tra với VNPay, vui lòng không đóng trình duyệt...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <CheckCircle className="w-24 h-24 text-success mb-6" />
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Thanh toán thành công!</h2>
                        <p className="text-gray-600 mb-6">{message}</p>

                        {transactionId && (
                            <div className="bg-gray-50 p-4 rounded-xl w-full mb-8 text-sm text-gray-600 flex justify-between border border-gray-200">
                                <span className="font-semibold">Mã giao dịch:</span>
                                <span className="font-mono font-bold text-primary">{transactionId}</span>
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 bg-success text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-md active:scale-95 flex items-center justify-center"
                        >
                            Đến trang Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                        <XCircle className="w-24 h-24 text-danger mb-6" />
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Giao dịch thất bại</h2>
                        <p className="text-gray-600 mb-8">{message}</p>

                        <div className="flex flex-col w-full space-y-3">
                            <button
                                onClick={() => navigate('/packages')}
                                className="w-full py-4 bg-dark-bg text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-md active:scale-95"
                            >
                                Thử thanh toán lại
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Quay về trang chủ
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PaymentResult;