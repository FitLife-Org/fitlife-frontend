import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Circle, Dumbbell, Info, Loader2, Trophy, Clock, X } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const MyWorkout = () => {
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isToggling, setIsToggling] = useState(false);
    const [todaySession, setTodaySession] = useState(null);

    // State cho hệ thống thông báo tự chế (thay thế react-hot-toast)
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ ...notification, show: false }), 3000);
    };

    const fetchCurrentPlan = async () => {
        try {
            const response = await axiosInstance.get('/workout/current');
            const workoutPlan = response.data.data;
            setPlan(workoutPlan);

            if (workoutPlan && workoutPlan.sessions) {
                const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                const dayName = days[new Date().getDay()];
                const session = workoutPlan.sessions.find(s => s.dayOfWeek === dayName);
                setTodaySession(session);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch tập:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentPlan();
    }, []);

    const handleToggleExercise = async (detailId) => {
        if (isToggling) return;
        setIsToggling(true);
        try {
            await axiosInstance.patch(`/workout/detail/${detailId}/toggle`);
            await fetchCurrentPlan();
            showToast("Đã cập nhật tiến độ tập luyện!", "success");
        } catch (error) {
            showToast("Không thể cập nhật trạng thái.", "error");
        } finally {
            setIsToggling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-gray-500 font-medium">Đang tải lịch tập hôm nay...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="max-w-2xl mx-auto mt-10 bg-white p-10 rounded-3xl border border-dashed border-gray-300 text-center">
                <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có lịch tập nào</h2>
                <p className="text-gray-500 mb-6">Hãy sử dụng AI PT để thiết kế một lịch tập cá nhân hóa cho bạn ngay nhé!</p>
                <button
                    onClick={() => window.location.href='/ai-pt'}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/30 transition-all"
                >
                    TẠO LỊCH TẬP VỚI AI
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
            {/* Hệ thống Toast tự chế */}
            {notification.show && (
                <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
                    notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
                }`}>
                    {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <Info className="w-5 h-5 mr-3" />}
                    <span className="font-bold text-sm">{notification.message}</span>
                    <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="bg-gradient-to-br from-indigo-900 to-primary p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-primary-light bg-white/10 w-fit px-3 py-1 rounded-full mb-4">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Mục tiêu hôm nay</span>
                    </div>
                    <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">{plan.name}</h1>
                    <p className="text-white/80 text-sm max-w-lg">{plan.description}</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">Buổi tập của bạn</h2>
                            <p className="text-xs text-gray-500">Hoàn thành để đạt kết quả tốt nhất</p>
                        </div>
                    </div>
                    {todaySession && (
                        <span className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-full uppercase tracking-widest">
                            {todaySession.focusArea}
                        </span>
                    )}
                </div>

                <div className="p-6">
                    {!todaySession ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Info className="w-10 h-10 text-blue-400" />
                            </div>
                            <p className="text-gray-600 font-bold text-lg">Hôm nay là ngày nghỉ ngơi!</p>
                            <p className="text-sm text-gray-400 mt-1">Cơ bắp cần thời gian phục hồi để phát triển.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todaySession.details?.map((ex) => (
                                <div
                                    key={ex.id}
                                    onClick={() => handleToggleExercise(ex.id)}
                                    className={`group flex items-center p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                                        ex.isCompleted
                                            ? 'bg-emerald-50 border-emerald-100 shadow-inner'
                                            : 'bg-white border-gray-100 hover:border-primary/30 hover:shadow-lg'
                                    }`}
                                >
                                    <div className="mr-4 flex-shrink-0">
                                        {ex.isCompleted ? (
                                            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200 animate-in zoom-in duration-300">
                                                <CheckCircle2 className="w-6 h-6 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 border-2 border-gray-200 rounded-full group-hover:border-primary transition-colors"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-bold text-lg transition-all truncate ${
                                            ex.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                                        }`}>
                                            {ex.exercise_name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1">
                                            <div className="flex items-center text-primary font-bold text-sm">
                                                <Dumbbell className="w-3 h-3 mr-1" />
                                                {ex.sets} hiệp × {ex.reps} lần
                                            </div>
                                            {ex.notes && (
                                                <div className="text-xs text-gray-400 italic flex items-center">
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full mr-2"></span>
                                                    {ex.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Mẹo: Tập trung vào kỹ thuật chuẩn (form) thay vì mức tạ quá nặng. Hãy tick vào bài tập ngay sau khi bạn hoàn thành hiệp cuối cùng.
                </p>
            </div>
        </div>
    );
};

export default MyWorkout;