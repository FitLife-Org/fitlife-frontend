import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// --- IMPORT CÁC TRANG (PAGES THẬT) ---
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import Packages from '../pages/Packages';
import PaymentResult from '../pages/PaymentResult';
import AiWorkout from '../pages/AiWorkout';
import MyWorkout from '../pages/MyWorkout'; // 1. IMPORT TRANG THEO DÕI TẬP LUYỆN

// --- IMPORT BỘ KHUNG (LAYOUT THẬT) ---
import MainLayout from '../components/layout/MainLayout';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* PRIVATE ROUTES */}
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

                {/* 2. ĐƯỜNG DẪN THEO DÕI TẬP LUYỆN HÀNG NGÀY */}
                <Route
                    path="/my-workout"
                    element={
                        <PrivateRoute>
                            <MainLayout>
                                <MyWorkout />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />

                <Route path="/payment-result" element={<PaymentResult />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;