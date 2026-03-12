import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Thêm import Link ở đây
import { User, Lock, LogIn, Dumbbell } from 'lucide-react';
import { create } from 'zustand';
import axios from 'axios';

// --- MOCK CÁC DEPENDENCY ĐỂ PREVIEW UI HOẠT ĐỘNG ---
// 1. Mock Zustand Store
const useAuthStore = create((set) => ({
    user: null,
    login: (userData, token) => set({ user: userData }),
}));

// 2. Mock Axios Instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api/v1',
});
// ----------------------------------------------------

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // Đã hết gạch đỏ
    const loginFn = useAuthStore((state) => state.login);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/auth/login', {
                username,
                password
            });

            const { token, role, username: resUsername } = response.data.data;
            loginFn({ username: resUsername, role }, token);

            // Xử lý mock cho preview
            alert("Đăng nhập thành công! (Mô phỏng chuyển hướng)");
            // Trong code thật: navigate('/');
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.message || 'Sai tên đăng nhập hoặc mật khẩu!');
            } else {
                setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">

                <div className="text-center mb-8">
                    <div className="mx-auto bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                        <Dumbbell className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">FitLife Gym</h2>
                    <p className="text-gray-400 mt-2">Đăng nhập để bắt đầu tập luyện</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tên đăng nhập</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                                   className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                   placeholder="Nhập username của bạn" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">Mật khẩu</label>
                            {/* ĐÃ FIX: Chỉ dùng Link to="", KHÔNG dùng href="#" */}
                            <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Quên mật khẩu?</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                   placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {isLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;