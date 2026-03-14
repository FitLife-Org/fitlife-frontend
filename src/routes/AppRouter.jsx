import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// --- IMPORT CÁC TRANG (PAGES THẬT) ---
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Packages from '../pages/Packages';
import PaymentResult from '../pages/PaymentResult';
import AiWorkout from '../pages/AiWorkout'; // 1. IMPORT TRANG AI VÀO ĐÂY

// --- IMPORT BỘ KHUNG (LAYOUT THẬT) ---
import MainLayout from '../components/layout/MainLayout';

// COMPONENT BẢO VỆ TUYẾN ĐƯỜNG (Private Route)
const PrivateRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* PUBLIC ROUTES (Ai cũng vào được) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ==========================================
                    PRIVATE ROUTES (Bắt buộc phải có Token)
                    ========================================== */}

                {/* 1. TRANG CHỦ (DASHBOARD) */}
                <Route
                    path="/"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* 2. TRANG DANH SÁCH GÓI TẬP (PACKAGES) */}
                <Route
                    path="/packages"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <Packages />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* 3. TRANG TRỢ LÝ AI (AI WORKOUT) - THÊM VÀO ĐÂY */}
                <Route
                    path="/ai-pt"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <AiWorkout />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                {/* TRANG KẾT QUẢ THANH TOÁN (Cho phép VNPay gọi thẳng về) */}
                <Route path="/payment-result" element={<PaymentResult />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;