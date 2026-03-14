import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { Users, TrendingUp, Activity, Calendar, HeartPulse, Info, Edit3, X } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);
    const role = user?.role?.replace('ROLE_', '') || 'MEMBER';
    const navigate = useNavigate();

    const [memberData, setMemberData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // State cho Modal Update Health
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMemberDashboard = async () => {
        try {
            const response = await axiosInstance.get('/members/me/dashboard');
            setMemberData(response.data.data);
            // Gán giá trị mặc định cho form từ dữ liệu hiện tại
            if (response.data.data) {
                setWeight(response.data.data.currentWeight || '');
                setHeight(response.data.data.currentHeight || '');
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu Dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (role === 'MEMBER') {
            fetchMemberDashboard();
        } else {
            setIsLoading(false);
        }
    }, [role]);

    const handleUpdateHealth = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axiosInstance.post('/health-metrics', {
                weight: parseFloat(weight),
                height: parseFloat(height)
            });
            // Thành công: Đóng modal và tải lại dữ liệu Dashboard
            setIsModalOpen(false);
            fetchMemberDashboard();
        } catch (error) {
            console.error("Lỗi cập nhật chỉ số:", error);
            alert("Có lỗi xảy ra khi cập nhật. Vui lòng kiểm tra lại!");
        } finally {
            setIsSubmitting(false);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trang Tổng Quan</h1>
                    <p className="text-gray-500 mt-1">
                        Chào mừng <span className="font-semibold text-primary">{memberData?.memberName || user?.username}</span> quay trở lại!
                    </p>
                </div>
                {role === 'MEMBER' && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all shadow-md active:scale-95"
                    >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Cập nhật số đo
                    </button>
                )}
            </div>

            {role === 'MEMBER' && memberData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thẻ Chỉ số BMI */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                <HeartPulse className="w-5 h-5 text-danger mr-2" />
                                Chỉ Số Cơ Thể (BMI)
                            </h2>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-sm mb-1">Chiều cao</p>
                                <p className="text-2xl font-bold text-gray-900">{memberData.currentHeight || 0} <span className="text-sm font-normal text-gray-500">cm</span></p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-sm mb-1">Cân nặng</p>
                                <p className="text-2xl font-bold text-gray-900">{memberData.currentWeight || 0} <span className="text-sm font-normal text-gray-500">kg</span></p>
                            </div>
                            <div className={`p-4 rounded-xl border ${
                                memberData.bmiCategory === 'Bình thường' ? 'bg-success/10 border-success/20 text-success' :
                                    (memberData.bmiCategory?.includes('Thiếu cân') || memberData.bmiCategory?.includes('Thừa cân')) ? 'bg-amber-100 border-amber-200 text-amber-600' :
                                        (!memberData.bmiCategory || memberData.bmiCategory === 'Chưa có dữ liệu') ? 'bg-gray-100 border-gray-200 text-gray-500' :
                                            'bg-danger/10 border-danger/20 text-danger'
                            }`}>
                                <p className="text-sm mb-1 opacity-80">BMI ({memberData.bmiCategory || 'Trống'})</p>
                                <p className="text-2xl font-bold">{memberData.bmi || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ Gói Tập Hiện Tại */}
                    <div className="bg-dark-card rounded-2xl shadow-lg border border-dark-border p-6 text-white flex flex-col relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 opacity-10">
                            <Activity className="w-40 h-40 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-300 flex items-center mb-6 z-10">
                            <Calendar className="w-5 h-5 mr-2 text-primary-light" />
                            Gói Tập Hiện Tại
                        </h2>
                        <div className="z-10 flex-1 flex flex-col justify-center">
                            {memberData.currentPackageName !== "Chưa có gói tập" ? (
                                <>
                                    <h3 className="text-2xl font-extrabold text-primary-light mb-2">{memberData.currentPackageName}</h3>
                                    <div className="flex items-baseline space-x-2">
                                        <span className="text-5xl font-black">{memberData.daysRemaining || 0}</span>
                                        <span className="text-gray-400 font-medium">ngày còn lại</span>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-400 mb-6">Bạn chưa đăng ký gói tập nào.</p>
                                    <button
                                        onClick={() => navigate('/packages')}
                                        className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                                    >
                                        ĐĂNG KÝ NGAY
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* === MODAL CẬP NHẬT SỨC KHỎE === */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Cập nhật chỉ số sức khỏe</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateHealth} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Chiều cao (cm)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.1"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Ví dụ: 175"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Cân nặng (kg)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Ví dụ: 70"
                                />
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu chỉ số'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;