import { useState, useEffect } from 'react';
import { Check, Dumbbell, Zap, Crown } from 'lucide-react';
// IMPORT ĐƯỜNG ỐNG API THẬT
import axiosInstance from '../services/axiosInstance';

const Packages = () => {
    const [packages, setPackages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // HÀM GỌI API THẬT XUỐNG SPRING BOOT
    const fetchPackages = async () => {
        try {
            const response = await axiosInstance.get('/packages');

            // 1. IN RA ĐỂ BẮT BỆNH: Xem Spring Boot thực sự gửi cái gì về
            console.log("DỮ LIỆU TỪ BACKEND TRẢ VỀ:", response.data);

            // 2. Lấy dữ liệu an toàn
            // Thông thường ApiResponse có dạng { code, message, data }
            const rawData = response.data?.data || response.data;

            let packageList = [];

            // 3. TÁCH VỎ AN TOÀN (Phòng thủ 3 lớp)
            if (Array.isArray(rawData)) {
                // Trường hợp 1: BE trả thẳng về một Mảng (List<Package>)
                packageList = rawData;
            } else if (rawData && typeof rawData === 'object') {
                // Trường hợp 2: BE trả về phân trang (Page<Package>) có chứa key 'content'
                if (Array.isArray(rawData.content)) {
                    packageList = rawData.content;
                }
                // Trường hợp 3: BE trả về một Object nhưng danh sách lại nằm trong key 'data' (lồng 2 lần)
                else if (Array.isArray(rawData.data)) {
                    packageList = rawData.data;
                }
            }

            // 4. CẬP NHẬT STATE: Đảm bảo setPackages LUÔN nhận vào một Mảng
            setPackages(packageList);

        } catch (err) {
            console.error("Lỗi khi tải gói tập:", err);
            setError('Không thể tải danh sách gói tập từ máy chủ. Vui lòng kiểm tra lại Backend.');
            // Nếu lỗi, phải set state là mảng rỗng để không bị vỡ giao diện
            setPackages([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Chạy 1 lần duy nhất khi vừa vào trang
    useEffect(() => {
        fetchPackages();
    }, []);

    // Hàm format tiền tệ VNĐ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Chọn Icon ngẫu nhiên hoặc theo hạng gói cho đẹp
    const getPackageIcon = (index) => {
        if (index % 3 === 0) return <Dumbbell className="w-8 h-8 text-blue-500" />;
        if (index % 3 === 1) return <Zap className="w-8 h-8 text-amber-500" />;
        return <Crown className="w-8 h-8 text-primary" />;
    };

    // MÀN HÌNH LOADING
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

            {/* MÀN HÌNH LỖI (Ví dụ Backend tắt) */}
            {error ? (
                <div className="bg-danger/10 text-danger p-4 rounded-xl text-center font-medium border border-danger/20">
                    {error}
                </div>
            ) : packages.length === 0 ? (

                /* MÀN HÌNH TRỐNG (Backend chạy nhưng Database chưa có gói nào) */
                <div className="text-center text-gray-500 p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px]">
                    <Dumbbell className="w-12 h-12 text-gray-300 mb-3" />
                    <p>Hiện tại phòng Gym chưa có gói tập nào được mở bán.</p>
                    <p className="text-sm mt-1">Vui lòng vào MySQL thêm dữ liệu mẫu vào bảng Packages nhé!</p>
                </div>
            ) : (

                /* MÀN HÌNH HIỂN THỊ DỮ LIỆU THẬT TỪ DB */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    {packages.map((pkg, index) => (
                        <div key={pkg.id} className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col relative">

                            {/* Tem Nổi Bật (Tự động đánh dấu gói ở giữa) */}
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
                                    <li className="flex items-center text-sm text-gray-600">
                                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                        Truy cập tất cả thiết bị Gym
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                        Sử dụng phòng tắm, xông hơi
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                                        Tự do check-in mọi khung giờ
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
                                <button className="w-full py-3 px-4 bg-dark-bg hover:bg-black text-white rounded-xl font-bold transition-colors shadow-sm active:scale-95">
                                    MUA NGAY - VNPay
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