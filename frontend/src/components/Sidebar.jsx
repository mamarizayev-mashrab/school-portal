import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    LayoutDashboard, BookOpen, User, Trophy, Bell,
    Settings, LogOut, GraduationCap, Users,
    FileText, ShieldAlert,
    PlusCircle, ClipboardCheck, Award, CalendarDays, BarChart3,
    Flame, Menu, X, Library, Sparkles, Crown
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
        { to: '/student/library', icon: Library, label: 'Kutubxona' },
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
        { to: '/teacher/library', icon: Library, label: 'Kutubxona' },
        { to: '/notifications', icon: Bell, label: 'Bildirishnomalar', badge: unread },
        { to: '/profile', icon: User, label: 'Profilim' },
    ];

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Boshqaruv paneli' },
        { to: '/admin/users', icon: Users, label: 'Foydalanuvchilar' },
        { to: '/admin/library', icon: Library, label: 'Kutubxona' },
        { to: '/teacher/summaries', icon: FileText, label: 'Xulosalar', badge: pendingSummaries },
        ...(user?.role === 'superadmin' ? [{ to: '/admin/audit', icon: ShieldAlert, label: 'Audit Log' }] : []),
        { to: '/admin/settings', icon: Settings, label: 'Sozlamalar' },
        { to: '/profile', icon: User, label: 'Profilim' }
    ];

    const links = (user?.role === 'admin' || user?.role === 'superadmin') ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    const linkClass = ({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative ${isActive
            ? 'bg-vercel-accent/[0.08] text-vercel-accent shadow-sm'
            : 'text-vercel-text-secondary hover:text-vercel-text hover:bg-white/[0.04]'
        }`;

    return (
        <>
            {/* Mobile toggle */}
            <button onClick={() => setOpen(!open)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 glass rounded-xl text-vercel-text shadow-lg">
                {open ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Overlay */}
            {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />}

            {/* Sidebar */}
            <aside className={`fixed lg:static top-0 left-0 z-40 w-[260px] h-screen bg-black/40 backdrop-blur-xl border-r border-white/10
                flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Brand & Profile Section */}
                <div className="p-3 mb-2 space-y-4">
                    {/* Brand */}


                    {/* Profile Card */}
                    <div className="relative group overflow-hidden rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] transition-all duration-300">
                        <div className="p-3 flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-b from-gray-700 to-black p-[1px]">
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                                        {/* Gradient Background for Avatar */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-vercel-accent/40 to-purple-500/40 opacity-50" />
                                        <span className="relative z-10 font-bold text-white text-sm">{user?.ism?.[0]}</span>
                                    </div>
                                </div>
                                {/* Online Dot */}
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-white/90 truncate leading-tight mb-1">
                                    {user?.ism} {user?.familiya}
                                </h3>
                                {/* Badges Row */}
                                <div className="flex flex-wrap gap-1.5">
                                    {/* Role Badge */}
                                    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] border ${isAdmin
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        : user?.role === 'teacher'
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        }`}>
                                        {isAdmin && <Crown size={9} />}
                                        <span className="text-[9px] font-bold uppercase tracking-wider">
                                            {isAdmin ? 'Super Admin' : user?.role === 'teacher' ? 'O\'qituvchi' : 'O\'quvchi'}
                                        </span>
                                    </div>

                                    {/* Class Badge (Student) */}
                                    {user?.sinf && (
                                        <div className="inline-flex items-center px-1.5 py-0.5 rounded-[6px] border bg-white/[0.05] border-white/10 text-white/60">
                                            <span className="text-[9px] font-medium">{user.sinf}</span>
                                        </div>
                                    )}

                                    {/* Streak (Student) */}
                                    {streak > 0 && user?.role === 'student' && (
                                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[6px] border bg-orange-500/10 border-orange-500/20 text-orange-400">
                                            <Flame size={8} />
                                            <span className="text-[9px] font-bold">{streak}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent mx-4 mb-2" />

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
                    {isAdmin && (
                        <div className="px-3 py-2">
                            <span className="text-[10px] font-semibold text-vercel-text-secondary/60 uppercase tracking-[0.1em]">Boshqaruv</span>
                        </div>
                    )}
                    {links.map(({ to, icon: Icon, label, badge }) => (
                        <NavLink key={to} to={to} end={to === '/student' || to === '/teacher' || to === '/admin'}
                            className={linkClass} onClick={() => setOpen(false)}>
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-vercel-accent rounded-r-full" />
                                    )}
                                    <Icon size={17} className={isActive ? 'text-vercel-accent' : 'text-vercel-text-secondary group-hover:text-vercel-text'} />
                                    <span className="flex-1 truncate">{label}</span>
                                    {badge > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-vercel-error text-white rounded-full min-w-[18px] text-center leading-tight">
                                            {badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-vercel-border/50">
                    <button onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/[0.06] transition-all w-full group">
                        <LogOut size={17} className="group-hover:text-vercel-error transition-colors" />
                        <span>Chiqish</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
