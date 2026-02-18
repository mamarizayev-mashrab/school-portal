import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    LayoutDashboard, BookOpen, User, BookPlus, Trophy, Bell,
    Settings, LogOut, CheckCircle, GraduationCap, Users,
    BarChart2, FileText, ChevronLeft, ChevronRight, ShieldAlert,
    PlusCircle, ClipboardCheck, Award, CalendarDays, BarChart3,
    Flame, Menu, X
} from 'lucide-react';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const [streak, setStreak] = useState(0);
    const [pendingSummaries, setPendingSummaries] = useState(0);

    useEffect(() => {
        fetchNotifCount();
        fetchStreak();
    }, []);

    const fetchNotifCount = async () => {
        try {
            const res = await api.get('/notifications');
            setUnread(res.data.unreadCount);
        } catch (err) { }
    };

    const fetchStreak = async () => {
        try {
            const res = await api.get('/gamification/level');
            setStreak(res.data.streak);
        } catch (err) { }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const studentLinks = [
        { to: '/student', icon: LayoutDashboard, label: 'Bosh sahifa' },
        { to: '/student/add-book', icon: PlusCircle, label: "Kitob qo'shish" },
        { to: '/student/my-books', icon: BookOpen, label: 'Kitoblarim' },
        { to: '/student/quiz', icon: ClipboardCheck, label: 'Test topshirish' },
        { to: '/student/leaderboard', icon: Trophy, label: 'Reyting' },
        { to: '/student/badges', icon: Award, label: 'Nishonlar' },
        { to: '/student/plan', icon: CalendarDays, label: "O'qish rejasi" },
        { to: '/notifications', icon: Bell, label: 'Bildirishnomalar', badge: unread },
        { to: '/profile', icon: User, label: 'Profilim' },
    ];

    const teacherLinks = [
        { to: '/teacher', icon: LayoutDashboard, label: 'Bosh sahifa' },
        { to: '/teacher/class-stats', icon: BarChart3, label: 'Sinf statistikasi' },
        { to: '/teacher/summaries', icon: ClipboardCheck, label: 'Xulosalar' },
        { to: '/notifications', icon: Bell, label: 'Bildirishnomalar', badge: unread },
        { to: '/profile', icon: User, label: 'Profilim' },
    ];

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Boshqaruv paneli' },
        { to: '/admin/users', icon: Users, label: 'Foydalanuvchilar' },
        { to: '/admin/books', icon: BookOpen, label: 'Kitoblar' },
        { to: '/teacher/summaries', icon: FileText, label: 'Xulosalar', badge: pendingSummaries },
        ...(user?.role === 'superadmin' ? [{ to: '/admin/audit', icon: ShieldAlert, label: 'Audit Log' }] : []),
        { to: '/admin/settings', icon: Settings, label: 'Sozlamalar' }
    ];

    const links = (user?.role === 'admin' || user?.role === 'superadmin') ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks;

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-vercel-accent/10 text-vercel-accent'
            : 'text-vercel-text-secondary hover:text-vercel-text hover:bg-vercel-surface-2'
        }`;

    return (
        <>
            {/* Mobile toggle */}
            <button onClick={() => setOpen(!open)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-vercel-surface border border-vercel-border rounded-lg text-vercel-text">
                {open ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Overlay */}
            {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />}

            {/* Sidebar */}
            <aside className={`fixed lg:static top-0 left-0 z-40 w-64 h-screen bg-vercel-surface border-r border-vercel-border
        flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Logo */}
                <div className="p-5 border-b border-vercel-border">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-vercel-accent/10 rounded-lg">
                            <GraduationCap size={20} className="text-vercel-accent" />
                        </div>
                        <span className="text-base font-bold text-vercel-text tracking-tight">Kitobxon</span>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-5 py-4 border-b border-vercel-border">
                    <p className="text-sm font-medium text-vercel-text">{user?.ism} {user?.familiya}</p>
                    <p className="text-xs text-vercel-text-secondary">
                        {user?.role === 'student' ? "O'quvchi" : user?.role === 'teacher' ? "O'qituvchi" : 'Admin'}
                    </p>
                    {user?.sinf && <p className="text-xs text-vercel-text-secondary">{user.sinf}</p>}
                    {streak > 0 && user?.role === 'student' && (
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-orange-400">
                            <Flame size={12} /> {streak} kunlik streak
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {links.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink key={to} to={to} end={to === '/student' || to === '/teacher' || to === '/admin'}
                            className={linkClass} onClick={() => setOpen(false)}>
                            <Icon size={18} />
                            <span className="flex-1">{label}</span>
                            {badge > 0 && (
                                <span className="px-1.5 py-0.5 text-xs bg-vercel-error text-white rounded-full min-w-[20px] text-center">{badge}</span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-vercel-border">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/5 transition-all w-full">
                        <LogOut size={18} /> Chiqish
                    </button>
                </div>
            </aside>
        </>
    );
}
