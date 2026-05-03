import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, Activity, QrCode, Users, Dumbbell, CalendarDays, ClipboardCheck } from 'lucide-react';
import useAuthStore from '../store/authStore.js';

const Sidebar = () => {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const role = user?.role?.replace('ROLE_', '') || 'MEMBER';

    const menuItems = [
        { path: '/', name: 'Trang Chủ', icon: Home, roles: ['MEMBER', 'ADMIN', 'STAFF'] },
        { path: '/packages', name: 'Mua Gói Tập', icon: CreditCard, roles: ['MEMBER'] },
        { path: '/ai-pt', name: 'Trợ Lý AI (Gemini)', icon: Activity, roles: ['MEMBER'] },
        { path: '/my-workout', name: 'Lịch Tập Của Tôi', icon: ClipboardCheck, roles: ['MEMBER'] }, // THÊM MỤC NÀY
        { path: '/checkin', name: 'Mã Check-in', icon: QrCode, roles: ['MEMBER'] },
        { path: '/admin/members', name: 'Quản Lý Hội Viên', icon: Users, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/packages', name: 'Quản Lý Gói Tập', icon: CalendarDays, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/scanner', name: 'Quét Mã Check-in', icon: QrCode, roles: ['ADMIN', 'STAFF'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(role));

    return (
        <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-200 transition-all duration-300">
            <div className="flex h-20 items-center justify-center border-b border-slate-800">
                <Dumbbell className="mr-3 h-8 w-8 text-sky-500" />
                <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
                    Fit<span className="text-sky-500">Life</span>
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-2 px-4">
                    {filteredMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                                }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-slate-800 p-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
                    <p className="text-xs text-slate-400">Phiên bản 1.0.0</p>
                    <p className="mt-1 text-xs font-semibold text-sky-500">Hệ thống Gym thông minh</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;