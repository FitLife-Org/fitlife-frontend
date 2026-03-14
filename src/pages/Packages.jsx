import { useState, useEffect } from 'react';
import { Check, Dumbbell, Zap, Crown, Loader2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore'; // Lấy user để kiểm tra đăng nhập

const Packages = () => {
    const user = useAuthStore((state) => state.user);
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Thêm State để biết gói nào đang quay Loading
    const [processingId, setProcessingId] = useState(null);

    const fetchPackages = async () => {
        try {
            const response = await axiosInstance.get('/packages');
            const rawData = response.data?.data || response.data;
            let packageList = [];

            if (Array.isArray(rawData)) packageList = rawData;
            else if (rawData && typeof rawData === 'object') {
                if (Array.isArray(rawData.content)) packageList = rawData.content;
                else if (Array.isArray(rawData.data)) packageList = rawData.data;
            }
            setPackages(packageList);
        } catch (err) {
            setError('Không thể tải danh sách gói tập từ máy chủ. Vui lòng kiểm tra lại Backend.');
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getPackageIcon = (index) => {
        if (index % 3 === 0) return <Dumbbell className="w-8 h-8 text-blue-500" />;
        if (index % 3 === 1) return <Zap className="w-8 h-8 text-amber-500" />;
        return <Crown className="w-8 h-8 text-primary" />;
    };

    // === HÀM XỬ LÝ THANH TOÁN ===
    // === HÀM XỬ LÝ THANH TOÁN (LUỒNG 2 BƯỚC) ===
    const handlePayment = async (packageId) => {
        if (!user) {
            alert("Vui lòng đăng nhập để thực hiện thanh toán!");
            return;
        }

        setProcessingId(packageId); // Bật loading cho nút
        try {
            // LƯU Ý TỪ TECH LEAD:
            // Hiện tại BE yêu cầu memberId. Tuỳ vào cách em lưu user trong Zustand,
            // em truyền ID cho đúng nhé. (Ví dụ: user.memberId hoặc user.id)

            // BƯỚC 1: GỌI API TẠO SUBSCRIPTION (Trạng thái PENDING)
            const subResponse = await axiosInstance.post('/subscriptions', {
                packageId: packageId
            });

            // Lấy ra cái ID của gói tập vừa tạo (Ví dụ: id = 15)
            const newSubscriptionId = subResponse.data.data.id;

            // BƯỚC 2: GỌI API TẠO URL VNPAY DỰA TRÊN SUBSCRIPTION ID ĐÓ
            const payResponse = await axiosInstance.post('/payment/create-payment', null, {
                params: {
                    subscriptionId: newSubscriptionId
                }
            });

            // Lấy URL VNPay do Backend tạo ra
            const paymentUrl = payResponse.data.data.paymentUrl;

            if (paymentUrl) {
                // ĐÁ KHÁCH HÀNG SANG TRANG VNPAY ĐỂ QUẸT THẺ
                window.location.href = paymentUrl;
            } else {
                alert("Lỗi: Không nhận được đường dẫn thanh toán từ máy chủ.");
            }

        } catch (error) {
            console.error("Lỗi giao dịch:", error);
            // Bắt lỗi nếu Backend ném ra Exception (Ví dụ: Đang có gói ACTIVE rồi)
            if (error.response && error.response.data && error.response.data.message) {
                alert("Lỗi: " + error.response.data.message);
            } else {
                alert("Hệ thống thanh toán đang gặp sự cố. Vui lòng thử lại sau!");
            }
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Chọn Gói Tập Phù Hợp</h1>
                <p className="mt-4 text-lg text-gray-500">Đầu tư vào sức khỏe là khoản đầu tư sinh lời nhất. Hãy chọn gói tập để bắt đầu hành trình thay đổi bản thân.</p>
            </div>

            {error ? (
                <div className="bg-danger/10 text-danger p-4 rounded-xl text-center font-medium border border-danger/20">
                    {error}
                </div>
            ) : packages.length === 0 ? (
                <div className="text-center text-gray-500 p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px]">
                    <Dumbbell className="w-12 h-12 text-gray-300 mb-3" />
                    <p>Hiện tại phòng Gym chưa có gói tập nào được mở bán.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    {packages.map((pkg, index) => (
                        <div key={pkg.id} className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col relative">
                            {index === 1 && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                                    PHỔ BIẾN NHẤT
                                </div>
                            )}

                            <div className="p-8 flex-1">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gray-50 border border-gray-100 shadow-sm`}>
                                    {getPackageIcon(index)}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{pkg.description || 'Chưa có mô tả chi tiết cho gói tập này.'}</p>

                                <div className="flex items-baseline mb-8">
                                    <span className="text-4xl font-extrabold text-gray-900">{formatCurrency(pkg.price)}</span>
                                    <span className="text-gray-500 ml-2 font-medium">/ {pkg.durationMonths} tháng</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-sm text-gray-600"><Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />Truy cập tất cả thiết bị Gym</li>
                                    <li className="flex items-center text-sm text-gray-600"><Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />Sử dụng phòng tắm, xông hơi</li>
                                    <li className="flex items-center text-sm text-gray-600"><Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />Tự do check-in mọi khung giờ</li>
                                </ul>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
                                <button
                                    onClick={() => handlePayment(pkg.id)}
                                    disabled={processingId === pkg.id}
                                    className="w-full py-3 px-4 bg-dark-bg hover:bg-black text-white rounded-xl font-bold transition-colors shadow-sm active:scale-95 disabled:opacity-70 flex items-center justify-center"
                                >
                                    {processingId === pkg.id ? (
                                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> ĐANG KẾT NỐI...</>
                                    ) : (
                                        'MUA NGAY - VNPAY'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Packages;