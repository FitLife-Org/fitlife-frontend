import { Link, useLocation } from 'react-router-dom';
import { Home, CreditCard, Activity, QrCode, Users, Dumbbell, CalendarDays, ClipboardCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';

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
        <div className="flex flex-col w-64 bg-dark-bg text-white h-full border-r border-dark-border transition-all duration-300">
            <div className="flex items-center justify-center h-20 border-b border-dark-border">
                <Dumbbell className="w-8 h-8 text-primary-light mr-3" />
                <h1 className="text-2xl font-bold uppercase tracking-wider text-white">
                    Fit<span className="text-primary-light">Life</span>
                </h1>
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <nav className="px-4 space-y-2">
                    {filteredMenu.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'text-gray-400 hover:bg-dark-card hover:text-white'
                                }`}
                            >
                                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-light'}`} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-dark-border">
                <div className="bg-dark-card rounded-xl p-4 text-center border border-dark-border">
                    <p className="text-xs text-gray-400">Phiên bản 1.0.0</p>
                    <p className="text-xs text-primary-light font-semibold mt-1">Hệ thống Gym thông minh</p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;