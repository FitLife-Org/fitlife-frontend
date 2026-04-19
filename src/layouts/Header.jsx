import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import useAuthStore from '../store/authStore.js';

const Header = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    return (
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">

            {/* Thanh tìm kiếm */}
            <div className="flex-1 flex items-center">
                <div className="relative w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                        placeholder="Tìm kiếm..."
                    />
                </div>
            </div>

            {/* Thông tin User & Nút Đăng xuất */}
            <div className="flex items-center space-x-6">

                <button className="relative p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-300"></div>

                {/* Avatar User */}
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
                        <UserIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 leading-tight">
                            {user?.username || 'Khách'}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                            {user?.role?.replace('ROLE_', '') || 'MEMBER'}
                        </span>
                    </div>
                </div>

                {/* Đăng xuất */}
                <button
                    onClick={logout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 rounded-lg transition-colors border border-danger/20"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                </button>
            </div>
        </header>
    );
};

export default Header;