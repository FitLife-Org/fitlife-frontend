import { create } from 'zustand';

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
        return null;
    }
};

const getStoredToken = () => localStorage.getItem('token') || localStorage.getItem('auth_token') || null;

const useAuthStore = create((set) => ({
    // Trạng thái ban đầu: Lấy từ LocalStorage xem trước đó có đăng nhập chưa
    user: getStoredUser(),
    token: getStoredToken(),
    isAuthenticated: !!getStoredToken(),

    // Hàm xử lý khi Đăng nhập thành công
    login: (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
        set({ user: userData, token, isAuthenticated: true });
    },

    // Hàm xử lý khi Đăng xuất
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;