import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// --- IMPORT CÁC TRANG (PAGES THẬT) ---
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/admin/Dashboard.jsx';
import Packages from '../pages/payment/Packages.jsx';
import PaymentResult from '../pages/payment/PaymentResult.jsx';
import AiWorkout from '../pages/member/AiWorkout.jsx';
import MyWorkout from '../pages/member/MyWorkout.jsx'; // 1. IMPORT TRANG THEO DÕI TẬP LUYỆN

// --- IMPORT BỘ KHUNG (LAYOUT THẬT) ---
import MainLayout from '../layouts/MainLayout';

import AdminGymPackage from '../pages/admin/AdminGymPackage';
import AdminMember from "../pages/admin/AdminMember.jsx";

// -- UI test
import AiWorkoutMock from '../pages/showcase/AiWorkout';
import Subscription from "../pages/showcase/Subscription.jsx";
import Paymentresult from '../pages/payment/Paymentresult.jsx';
import Progress from '../pages/showcase/Progress.jsx';

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

                {/* USER ROUTES */}
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

                {/* 3. ADMIN ROUTES (Bọc bằng AdminLayout) */}
                <Route
                    path="/admin/packages"
                    element={
                        <PrivateRoute>
                            {/* Cần tạo component AdminLayout (chứa Sidebar đen, Header Admin) */}
                            <MainLayout>
                                <AdminGymPackage />
                            </MainLayout>
                        </PrivateRoute>
                    }
                />
                <Route path="/admin/members" element={ <PrivateRoute><MainLayout><AdminMember /></MainLayout></PrivateRoute> } />


                <Route path="/mock-ai" element={<AiWorkoutMock />} />
                <Route path="/mock-subscription" element={<Subscription />} />
                <Route path="/mock-payment-result" element={<Paymentresult />} />
                <Route path={"/mock-progress"} element={<Progress />} />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;