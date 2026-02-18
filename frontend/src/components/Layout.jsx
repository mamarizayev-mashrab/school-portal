import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-vercel-bg">
            <Sidebar />
            <main className="flex-1 lg:ml-0 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
