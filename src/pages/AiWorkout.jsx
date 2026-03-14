import { useState } from 'react';
import { Sparkles, Target, Flame, Calendar, Bot, Loader2, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const AiWorkout = () => {
    const [formData, setFormData] = useState({
        goal: 'Giảm mỡ, siết cơ',
        fitnessLevel: 'Người mới bắt đầu',
        daysPerWeek: 3,
        injuries: '',
        equipment: 'Đầy đủ thiết bị (Full Gym)'
    });

    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 1. HÀM TẠO PHÁC ĐỒ - ĐÃ TĂNG TIMEOUT LÊN 60 GIÂY
    const handleGeneratePlan = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        setGeneratedPlan(null);

        try {
            const response = await axiosInstance.post('/ai/workout-plan', {
                goal: formData.goal,
                fitnessLevel: formData.fitnessLevel,
                daysPerWeek: parseInt(formData.daysPerWeek),
                injuries: formData.injuries,
                equipment: formData.equipment
            }, {
                // QUAN TRỌNG: Đợi Backend tối đa 60 giây vì AI phản hồi lâu
                timeout: 60000
            });

            if (response.data.code === 200) {
                setGeneratedPlan(response.data.data);
            } else {
                setError(response.data.message || 'Lỗi khi tạo phác đồ.');
            }
        } catch (err) {
            console.error("Lỗi AI:", err);
            if (err.code === 'ECONNABORTED') {
                setError('AI mất quá nhiều thời gian để phản hồi (trên 60s). Vui lòng thử lại.');
            } else {
                setError(err.response?.data?.message || 'Có lỗi xảy ra khi kết nối máy chủ AI.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 2. HÀM KÍCH HOẠT LỊCH TẬP
    const handleActivatePlan = async () => {
        if (!generatedPlan || !generatedPlan.planId) {
            setError("Lỗi: Không tìm thấy ID lịch tập. Hãy thử tạo lại lịch mới.");
            return;
        }

        setIsActivating(true);
        setSuccessMessage('');
        try {
            const response = await axiosInstance.post(`/ai/activate/${generatedPlan.planId}`);
            if (response.data.code === 200) {
                setSuccessMessage("Kích hoạt thành công! Lịch tập này đã được áp dụng vào Dashboard của bạn.");
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            setError(error.response?.data?.message || "Lỗi khi kích hoạt lịch tập.");
        } finally {
            setIsActivating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 text-white p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Bot className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                        <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Trợ Lý AI Độc Quyền</h1>
                    </div>
                    <p className="text-lg text-indigo-100 mb-2">Google Gemini 2.5 Flash Integration</p>
                    <p className="text-indigo-200 text-sm max-w-xl">Hệ thống phân tích thông số sức khỏe và BMI để tạo ra giáo án cá nhân hóa dành riêng cho bạn.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cột trái: Form nhập liệu */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-primary" />
                        Thiết Lập Thông Số
                    </h2>

                    <form onSubmit={handleGeneratePlan} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mục tiêu chính</label>
                            <input type="text" name="goal" value={formData.goal} onChange={handleChange} required
                                   className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none" placeholder="VD: Giảm mỡ bụng..." />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Trình độ hiện tại</label>
                            <select name="fitnessLevel" value={formData.fitnessLevel} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none">
                                <option value="Người mới bắt đầu">Người mới (Beginner)</option>
                                <option value="Trung bình">Trung bình (Intermediate)</option>
                                <option value="Nâng cao">Nâng cao (Advanced)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Số ngày tập/tuần: <span className="text-primary font-bold">{formData.daysPerWeek}</span></label>
                            <input type="range" name="daysPerWeek" min="1" max="7" value={formData.daysPerWeek} onChange={handleChange}
                                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Chấn thương (Nếu có)</label>
                            <input type="text" name="injuries" value={formData.injuries} onChange={handleChange}
                                   className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" placeholder="VD: Đau lưng dưới..." />
                        </div>
                        <button type="submit" disabled={isLoading}
                                className="w-full mt-4 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-70">
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> ĐANG PHÂN TÍCH...</>
                            ) : (
                                <><Bot className="w-5 h-5 mr-2" /> TẠO PHÁC ĐỒ NGAY</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Cột phải: Hiển thị kết quả */}
                <div className="lg:col-span-8 bg-gray-50 p-6 md:p-8 rounded-3xl border border-gray-100 min-h-[500px] flex flex-col">
                    {error && (
                        <div className="bg-danger/10 text-danger p-4 rounded-xl border border-danger/20 font-medium mb-4 flex items-center animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 mr-2" /> {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-success/10 text-success p-4 rounded-xl border border-success/20 font-medium mb-4 flex items-center animate-in fade-in slide-in-from-top-2">
                            <CheckCircle className="w-5 h-5 mr-2" /> {successMessage}
                        </div>
                    )}

                    {!generatedPlan && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                            <Bot className="w-24 h-24 mb-4 text-gray-200" />
                            <p className="text-xl font-medium text-gray-500">Sẵn sàng thiết kế lịch tập</p>
                            <p className="text-sm mt-1 text-gray-400">Điền thông tin và AI sẽ tạo giáo án chuẩn NASM cho bạn.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center flex-1 space-y-6">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
                                <div className="absolute inset-2 rounded-full border-r-4 border-amber-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                <Bot className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-gray-700 animate-pulse">Gemini 2.5 đang thiết kế...</p>
                                <p className="text-sm text-gray-500 mt-1">Quá trình này có thể mất đến 30 giây.</p>
                            </div>
                        </div>
                    )}

                    {generatedPlan && !isLoading && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900 uppercase">Giáo Án Của Bạn</h2>
                                <button
                                    onClick={handleActivatePlan}
                                    disabled={isActivating}
                                    className="px-6 py-2 bg-dark-bg text-white font-bold rounded-xl hover:bg-black transition-all shadow-md active:scale-95 flex items-center disabled:opacity-70"
                                >
                                    {isActivating ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <CheckCircle className="w-4 h-4 mr-2"/>}
                                    ÁP DỤNG LỊCH TẬP
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start">
                                    <Flame className="w-8 h-8 text-amber-500 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mục tiêu Calo</p>
                                        <p className="text-2xl font-black text-gray-900">
                                            {generatedPlan.nutritionPlan?.targetCalories || '---'}
                                            <span className="text-base font-medium text-gray-500 ml-1">Kcal/ngày</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm flex items-start">
                                    <Activity className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                                    <p className="text-sm text-blue-900 font-medium leading-relaxed">{generatedPlan.advice}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {generatedPlan.workoutSchedule?.map((day, index) => (
                                    <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                            <h3 className="font-bold text-lg text-gray-900 flex items-center">
                                                <Calendar className="w-5 h-5 mr-2 text-primary" />
                                                {day.day}
                                            </h3>
                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase">
                                                {day.focus}
                                            </span>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {day.exercises?.map((ex, exIdx) => (
                                                <div key={exIdx} className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                                                    <div className="w-8 h-8 rounded-full bg-white text-primary font-bold flex items-center justify-center shadow-sm border border-gray-100 mr-3 flex-shrink-0">
                                                        {exIdx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{ex.name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <span className="font-semibold text-primary">{ex.sets}</span> Hiệp × <span className="font-semibold text-primary">{ex.reps}</span> Lần
                                                        </p>
                                                        {ex.notes && <p className="text-[10px] text-gray-400 mt-1 italic leading-tight">"{ex.notes}"</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10px] text-center text-gray-400 mt-6 italic">* {generatedPlan.disclaimer || "Tham khảo ý kiến bác sĩ trước khi tập luyện."}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiWorkout;