import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div className="relative flex h-screen overflow-hidden bg-vercel-bg">
            {/* Common Background for Internal Pages */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    src="https://aksia-travel.ru/wp-content/uploads/2023/07/uzbekistan-farhodjon-chinberdiev-lpmpsETf2BQ-unsplash.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-40 blur-[2px]"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-[#0a0a0a]/90" />
            </div>

            {/* Sidebar (z-index higher than background) */}
            <div className="relative z-20">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex-1 lg:ml-0 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 lg:p-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
