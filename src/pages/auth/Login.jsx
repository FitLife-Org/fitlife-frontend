import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, LogIn, Dumbbell } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance from '../../services/axiosInstance';
import useAuthStore from '../../store/authStore';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const navigate = useNavigate();
    const loginFn = useAuthStore((state) => state.login);

    // Luồng 1: Đăng nhập truyền thống
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axiosInstance.post('/auth/login', { username, password });
            const { token, role, username: resUsername } = response.data.data;

            loginFn({ username: resUsername, role }, token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Sai tên đăng nhập hoặc mật khẩu!');
        } finally {
            setIsLoading(false);
        }
    };

    // Luồng 2: Đăng nhập bằng Google
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setError('');
            setIsGoogleLoading(true);
            try {
                // Gửi Token của Google xuống Spring Boot
                const response = await axiosInstance.post('/auth/google', {
                    token: codeResponse.access_token
                });

                const { token, role, username: resUsername } = response.data.data;
                loginFn({ username: resUsername, role }, token);
                navigate('/');
            } catch (err) {
                setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
                console.error("Google Auth Error:", err);
            } finally {
                setIsGoogleLoading(false);
            }
        },
        onError: (error) => {
            setError('Đăng nhập Google bị hủy hoặc có lỗi xảy ra.');
            console.log('Login Failed:', error);
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-8">
            <div className="max-w-md w-full bg-dark-card rounded-2xl shadow-2xl p-8 border border-dark-border">

                <div className="text-center mb-8">
                    <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Dumbbell className="text-primary-light w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">FitLife Gym</h2>
                    <p className="text-gray-400 mt-2">Đăng nhập để bắt đầu tập luyện</p>
                </div>

                {error && (
                    <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg mb-6 text-sm text-center">
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
                                   className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                   placeholder="Nhập username của bạn" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">Mật khẩu</label>
                            <Link to="/forgot-password" className="text-sm text-secondary-light hover:text-white transition-colors">Quên mật khẩu?</Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                   className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                   placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading || isGoogleLoading}
                            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {isLoading ? 'Đang xử lý...' : <><LogIn className="w-5 h-5 mr-2" /> ĐĂNG NHẬP</>}
                    </button>
                </form>

                {/* Vạch kẻ ngăn cách */}
                <div className="mt-6 flex items-center justify-center">
                    <div className="h-px bg-dark-border flex-1"></div>
                    <span className="px-4 text-sm text-gray-500 font-medium">HOẶC TIẾP TỤC VỚI</span>
                    <div className="h-px bg-dark-border flex-1"></div>
                </div>

                {/* Nút Đăng nhập Google Custom */}
                <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    disabled={isGoogleLoading || isLoading}
                    className="mt-6 w-full flex justify-center items-center py-3 px-4 rounded-lg bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all shadow-md active:scale-95 disabled:opacity-70"
                >
                    {isGoogleLoading ? 'Đang kết nối Google...' : (
                        <>
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                <path fill="none" d="M0 0h48v48H0z" />
                            </svg>
                            Đăng nhập với Google
                        </>
                    )}
                </button>

                <p className="mt-8 text-center text-sm text-gray-400">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-medium text-primary-light hover:text-white transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;