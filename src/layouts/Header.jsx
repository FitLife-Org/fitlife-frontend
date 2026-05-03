import { Bell, Search, LogOut, User as UserIcon } from 'lucide-react';
import useAuthStore from '../store/authStore.js';

const Header = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    return (
        <header className="z-10 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 shadow-[0_1px_0_rgba(15,23,42,0.5)] backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center">
                <div className="relative w-full max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-full border border-slate-800 bg-slate-900/90 py-2 pl-10 pr-3 text-sm leading-5 text-slate-100 placeholder:text-slate-500 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        placeholder="Tìm kiếm..."
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                <button className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-sky-400">
                    <Bell className="h-6 w-6" />
                    <span className="absolute right-1 top-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-slate-950"></span>
                </button>

                <div className="h-8 w-px bg-slate-800" />

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400">
                        <UserIcon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold text-slate-100">
                            {user?.username || 'Khách'}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                            {user?.role?.replace('ROLE_', '') || 'MEMBER'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="flex items-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                </button>
            </div>
        </header>
    );
};

export default Header;