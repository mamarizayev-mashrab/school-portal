import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    LayoutDashboard, Users, BookOpen, FileText,
    Send, MessageSquare, Trophy, Medal,
    TrendingUp, Activity, Zap, ArrowUpRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-vercel-surface-2/95 backdrop-blur-md border border-vercel-border rounded-xl px-4 py-3 shadow-2xl">
                <p className="text-xs text-vercel-text-secondary mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-sm font-semibold text-vercel-text">
                        {entry.value} {entry.name || 'ta'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [deepStats, setDeepStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [res1, res2] = await Promise.all([
                api.get('/stats/school'),
                api.get('/admin/stats/deep')
            ]);
            setStats(res1.data);
            setDeepStats(res2.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return toast.error("Xabar matnini kiriting");
        setSending(true);
        try {
            const res = await api.post('/admin/broadcast', { message: broadcastMsg, target: broadcastTarget });
            toast.success(res.data.xabar);
            setBroadcastMsg('');
        } catch (err) {
            toast.error(err.response?.data?.xabar || "Xatolik yuz berdi");
        } finally {
            setSending(false);
        }
    };

    const announceWinner = async () => {
        if (!deepStats?.winner) return;
        if (!confirm(`${deepStats.winner.ism} ni g'olib deb e'lon qilasizmi?`)) return;
        try {
            const res = await api.post('/admin/gamification/announce-winner', {
                winnerId: deepStats.winner.id,
                ism: deepStats.winner.ism,
                kitobSoni: deepStats.winner.kitob_soni
            });
            toast.success(res.data.xabar);
        } catch (err) {
            toast.error("Xatolik");
        }
    };

    const oyNomi = (oy) => {
        const oylar = { '01': 'Yan', '02': 'Fev', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Iyn', '07': 'Iyl', '08': 'Avg', '09': 'Sen', '10': 'Okt', '11': 'Noy', '12': 'Dek' };
        return oylar[oy?.split('-')[1]] || oy;
    };

    const PIE_COLORS = ['#818CF8', '#34D399', '#FBBF24', '#F97316', '#A78BFA', '#F472B6', '#22D3EE'];

    if (loading) return (
        <div className="space-y-4 animate-fade-in">
            <div className="h-20 animate-shimmer rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-28 animate-shimmer rounded-2xl" />)}
            </div>
            <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-64 animate-shimmer rounded-2xl" />)}
            </div>
        </div>
    );

    const cards = [
        { label: "O'quvchilar", value: stats?.umumiy?.jami_oquvchilar || 0, icon: Users, gradient: 'from-blue-500/10 to-cyan-500/5', iconColor: 'text-blue-400', borderColor: 'border-blue-500/10', trend: '+12%' },
        { label: "O'qituvchilar", value: stats?.umumiy?.jami_oqituvchilar || 0, icon: Users, gradient: 'from-emerald-500/10 to-green-500/5', iconColor: 'text-emerald-400', borderColor: 'border-emerald-500/10', trend: '+3%' },
        { label: "Jami kitoblar", value: stats?.umumiy?.jami_kitoblar || 0, icon: BookOpen, gradient: 'from-purple-500/10 to-violet-500/5', iconColor: 'text-purple-400', borderColor: 'border-purple-500/10', trend: '+28%' },
        { label: "Jami sahifalar", value: parseInt(stats?.umumiy?.jami_sahifalar || 0).toLocaleString(), icon: FileText, gradient: 'from-amber-500/10 to-orange-500/5', iconColor: 'text-amber-400', borderColor: 'border-amber-500/10', trend: '+45%' },
    ];

    const monthlyData = stats?.oylik_faollik?.map(item => ({
        oy: oyNomi(item.oy),
        kitoblar: parseInt(item.kitoblar_soni),
    })) || [];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vercel-surface via-vercel-surface to-vercel-surface-2 border border-vercel-border/60 p-6">
                <div className="absolute inset-0 dot-pattern opacity-40" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-vercel-accent/[0.03] rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-vercel-accent/20 to-vercel-accent/5 rounded-xl border border-vercel-accent/10">
                                <LayoutDashboard className="text-vercel-accent" size={22} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-vercel-text tracking-tight">Boshqaruv Markazi</h1>
                                <p className="text-vercel-text-secondary text-xs mt-0.5">
                                    Analitika, Gamification va Tizim boshqaruvi
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-vercel-success/[0.08] border border-vercel-success/10">
                            <div className="w-1.5 h-1.5 bg-vercel-success rounded-full pulse-dot" />
                            <span className="text-xs text-vercel-success font-medium">Tizim faol</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ label, value, icon: Icon, gradient, iconColor, borderColor, trend }, idx) => (
                    <div key={label}
                        className={`relative overflow-hidden bg-gradient-to-br ${gradient} border ${borderColor} rounded-2xl p-5 group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg animate-fade-in`}
                        style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">{label}</p>
                                <p className="text-2xl font-bold text-vercel-text mt-2 stat-value">{value}</p>
                            </div>
                            <div className={`p-2.5 rounded-xl bg-vercel-bg/40 ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon size={18} />
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-3">
                            <div className="flex items-center gap-0.5 text-emerald-400">
                                <TrendingUp size={12} />
                                <span className="text-[11px] font-semibold">{trend}</span>
                            </div>
                            <span className="text-[11px] text-vercel-text-secondary">bu oyda</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Winner & Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Weekly Winner */}
                <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 p-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.06] via-orange-500/[0.04] to-transparent" />
                    <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/[0.05] rounded-full blur-3xl group-hover:bg-yellow-500/[0.08] transition-all duration-700" />
                    <div className="absolute top-4 right-4 opacity-[0.04] rotate-12 group-hover:rotate-0 group-hover:opacity-[0.08] transition-all duration-700"><Trophy size={120} /></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/10">
                                <Trophy size={16} className="text-yellow-500" />
                            </div>
                            <h3 className="text-sm font-bold text-yellow-500 tracking-tight">Hafta Kitobxoni</h3>
                        </div>

                        {deepStats?.winner ? (
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-yellow-500/20 border-2 border-yellow-400/20">
                                        {deepStats.winner.ism[0]}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-vercel-text">{deepStats.winner.ism} {deepStats.winner.familiya}</p>
                                        <p className="text-xs text-yellow-500/70 font-medium">{deepStats.winner.sinf}-sinf a'zosi</p>
                                    </div>
                                </div>
                                <div className="bg-vercel-bg/40 backdrop-blur-sm rounded-xl p-3 mb-4 border border-yellow-500/10">
                                    <p className="text-xs text-vercel-text-secondary">
                                        Ushbu haftada <span className="text-vercel-text font-bold text-sm">{deepStats.winner.kitob_soni} ta</span> kitob o'qidi
                                    </p>
                                </div>
                                <button onClick={announceWinner}
                                    className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 hover:shadow-yellow-500/30 active:scale-[0.98]">
                                    <Medal size={15} /> G'olibni E'lon Qilish
                                </button>
                            </div>
                        ) : (
                            <div className="h-36 flex flex-col items-center justify-center text-center">
                                <div className="p-3 bg-yellow-500/[0.06] rounded-2xl mb-3">
                                    <Trophy size={28} className="text-yellow-500/30" />
                                </div>
                                <p className="text-sm text-vercel-text-secondary">Bu hafta o'qilgan kitoblar yetarli emas</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Genre Pie Chart */}
                <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-vercel-text">Janrlar Trendi</h3>
                            <p className="text-xs text-vercel-text-secondary mt-0.5">Eng ko'p o'qilgan janrlar</p>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/10">
                            <Activity size={16} className="text-purple-400" />
                        </div>
                    </div>
                    <div className="h-[200px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={deepStats?.genres} dataKey="value" nameKey="janr" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                                    {deepStats?.genres?.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {deepStats?.genres && deepStats.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {deepStats.genres.slice(0, 5).map((g, i) => (
                                <div key={g.janr} className="flex items-center gap-1.5 text-[11px] text-vercel-text-secondary">
                                    <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    {g.janr}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {/* Monthly Activity */}
                    <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-semibold text-vercel-text">Oylik faollik</h3>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">O'qilgan kitoblar dinamikasi</p>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/10">
                                <TrendingUp size={16} className="text-blue-400" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorKitoblar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0070F3" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#0070F3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                <XAxis dataKey="oy" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="kitoblar" stroke="#0070F3" strokeWidth={2.5} fill="url(#colorKitoblar)" dot={{ fill: '#0070F3', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#0070F3', stroke: '#000', strokeWidth: 2 }} name="Kitoblar" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Class Statistics */}
                    {stats?.sinf_statistika?.length > 0 && (
                        <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-vercel-text">Sinf bo'yicha kitoblar</h3>
                                    <p className="text-xs text-vercel-text-secondary mt-0.5">Har bir sinf nechta kitob o'qigan</p>
                                </div>
                                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/10">
                                    <Zap size={16} className="text-emerald-400" />
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={stats.sinf_statistika} barSize={24}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#50E3C2" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#50E3C2" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="sinf" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="kitoblar" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Kitoblar" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Broadcast */}
                <div className="space-y-5">
                    <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/10">
                                <MessageSquare size={16} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-vercel-text">Ommaviy Xabar</h3>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">Barcha foydalanuvchilarga xabar</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[11px] font-medium text-vercel-text-secondary mb-1.5 block uppercase tracking-wider">Kimga yuborilsin?</label>
                                <select
                                    value={broadcastTarget}
                                    onChange={(e) => setBroadcastTarget(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-sm text-vercel-text focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 outline-none transition-all cursor-pointer"
                                >
                                    <option value="all">Barchaga</option>
                                    <option value="students">O'quvchilarga</option>
                                    <option value="teachers">O'qituvchilarga</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[11px] font-medium text-vercel-text-secondary mb-1.5 block uppercase tracking-wider">Xabar matni</label>
                                <textarea
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Muhim e'lon..."
                                    rows={4}
                                    className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-sm text-vercel-text focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 outline-none resize-none placeholder:text-vercel-text-secondary/40 transition-all"
                                />
                            </div>

                            <button
                                onClick={handleBroadcast}
                                disabled={sending}
                                className="w-full py-2.5 bg-vercel-text text-vercel-bg rounded-xl text-sm font-semibold hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98]"
                            >
                                <Send size={14} /> {sending ? 'Yuborilmoqda...' : 'Xabarni Yuborish'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-vercel-text mb-4">Tezkor harakatlar</h3>
                        <div className="space-y-2">
                            {[
                                { label: "Foydalanuvchilar", href: "/admin/users", icon: Users, color: "text-blue-400" },
                                { label: "Kutubxona", href: "/admin/library", icon: BookOpen, color: "text-purple-400" },
                                { label: "Sozlamalar", href: "/admin/settings", icon: Zap, color: "text-amber-400" },
                            ].map(item => (
                                <a key={item.label} href={item.href}
                                    className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-vercel-bg/50 hover:bg-vercel-surface-2 border border-vercel-border/40 hover:border-vercel-border transition-all group">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={15} className={item.color} />
                                        <span className="text-sm text-vercel-text-secondary group-hover:text-vercel-text transition-colors">{item.label}</span>
                                    </div>
                                    <ArrowUpRight size={14} className="text-vercel-text-secondary/40 group-hover:text-vercel-text-secondary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
