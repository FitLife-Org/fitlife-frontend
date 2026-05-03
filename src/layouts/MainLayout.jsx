import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-200">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
                <Header />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;