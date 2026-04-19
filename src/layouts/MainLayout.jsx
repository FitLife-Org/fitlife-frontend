import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Cột trái: Sidebar cố định */}
            <Sidebar />

            {/* Cột phải: Header + Nội dung chính */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                {/* Vùng chứa nội dung các trang (Dashboard, Packages,...) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;