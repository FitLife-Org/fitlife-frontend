import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone, UserPlus } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            await axiosInstance.post('/auth/register', formData);
            setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4 py-8">
            <div className="max-w-md w-full bg-dark-card rounded-2xl shadow-2xl p-8 border border-dark-border">

                <div className="text-center mb-8">
                    <div className="mx-auto bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <UserPlus className="text-primary-light w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">Đăng Ký Hội Viên</h2>
                    <p className="text-gray-400 mt-2">Gia nhập gia đình FitLife ngay hôm nay</p>
                </div>

                {error && (
                    <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-success/10 border border-success text-success px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {success}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <input type="text" name="username" required value={formData.username} onChange={handleChange}
                               className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                               placeholder="Tên đăng nhập" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500" />
                        </div>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange}
                               className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                               placeholder="Mật khẩu (ít nhất 6 ký tự)" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                               className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                               placeholder="Họ và tên" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange}
                               className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                               placeholder="Địa chỉ Email" />
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-500" />
                        </div>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                               className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                               placeholder="Số điện thoại" />
                    </div>

                    <button type="submit" disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-md text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        {isLoading ? 'Đang xử lý...' : 'ĐĂNG KÝ TÀI KHOẢN'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-medium text-primary-light hover:text-white transition-colors">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;