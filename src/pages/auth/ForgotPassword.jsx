import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Bước 1: Gửi Email lấy OTP
    const handleSendEmail = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await axiosInstance.post('/auth/forgot-password', { email: email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này!');
        } finally {
            setIsLoading(false);
        }
    };

    // Bước 2: Xác nhận OTP và Đổi mật khẩu
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await axiosInstance.post('/auth/reset-password', { email, otp, newPassword });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
            <div className="max-w-md w-full bg-dark-card rounded-2xl shadow-2xl p-8 border border-dark-border">

                {step < 3 && (
                    <Link to="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại đăng nhập
                    </Link>
                )}

                <div className="text-center mb-8">
                    <div className="mx-auto bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        {step === 1 ? <Mail className="text-secondary-light w-8 h-8" /> :
                            step === 2 ? <KeyRound className="text-secondary-light w-8 h-8" /> :
                                <CheckCircle2 className="text-success w-8 h-8" />}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {step === 1 ? 'Quên mật khẩu?' :
                            step === 2 ? 'Nhập mã xác nhận' : 'Khôi phục thành công!'}
                    </h2>
                    <p className="text-gray-400 mt-2 text-sm">
                        {step === 1 ? 'Nhập email của bạn để nhận mã khôi phục.' :
                            step === 2 ? `Mã gồm 6 chữ số đã được gửi tới ${email}` :
                                'Mật khẩu của bạn đã được thay đổi an toàn.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendEmail} className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500" />
                            </div>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                   className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                   placeholder="Nhập địa chỉ email của bạn" />
                        </div>
                        <button type="submit" disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-bold text-white bg-secondary hover:bg-secondary-dark transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {isLoading ? 'Đang gửi mã...' : 'GỬI MÃ KHÔI PHỤC'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-gray-500" />
                            </div>
                            <input type="text" required maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)}
                                   className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary tracking-widest text-center text-lg font-bold transition-all"
                                   placeholder="------" />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                   className="block w-full pl-10 pr-3 py-3 border border-dark-border rounded-lg bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
                                   placeholder="Nhập mật khẩu mới" />
                        </div>

                        <button type="submit" disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-bold text-white bg-secondary hover:bg-secondary-dark transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {isLoading ? 'Đang xác nhận...' : 'ĐỔI MẬT KHẨU'}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <button onClick={() => navigate('/login')}
                            className="w-full py-3 px-4 rounded-lg font-bold text-white bg-primary hover:bg-primary-dark transition-all active:scale-95">
                        QUAY LẠI ĐĂNG NHẬP
                    </button>
                )}

            </div>
        </div>
    );
};

export default ForgotPassword;