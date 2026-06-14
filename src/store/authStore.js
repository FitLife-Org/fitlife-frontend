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

    user: getStoredUser(),
    token: getStoredToken(),
    isAuthenticated: !!getStoredToken(),

    login: (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
        set({ user: userData, token, isAuthenticated: true });
    },


    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
    },
}));

export default useAuthStore;