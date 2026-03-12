import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from 'lucide-react';
import useAuthStore from '../store/authStore';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

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
                            <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-4 font-sans">
                                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full border border-gray-200">
                                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập thành công!</h1>
                                    <p className="text-gray-600 mb-6">Xin chào, <span className="font-bold text-primary">{user?.username}</span></p>

                                    <button
                                        onClick={logout}
                                        className="w-full bg-danger hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md active:scale-95"
                                    >
                                        Đăng xuất an toàn
                                    </button>
                                </div>
                            </div>
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;