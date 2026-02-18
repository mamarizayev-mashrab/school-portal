import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    LayoutDashboard, Users, BookOpen, FileText,
    UserPlus, Download, Trash2, Send, MessageSquare,
    CheckCircle, AlertTriangle, Trophy, Gift, Medal, Coins
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [deepStats, setDeepStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Broadcast state
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [broadcastTarget, setBroadcastTarget] = useState('all');
    const [sending, setSending] = useState(false);

    // Manual Award state
    const [awardUserId, setAwardUserId] = useState('');
    const [awardAmount, setAwardAmount] = useState('');
    const [awardReason, setAwardReason] = useState("Faollik uchun");

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



    const handleGiveAward = async () => {
        if (!awardUserId || !awardAmount) return toast.error("Barcha maydonlarni to'ldiring");
        try {
            const res = await api.post('/admin/gamification/award', { userId: awardUserId, amount: awardAmount, reason: awardReason });
            toast.success(res.data.xabar);
            setAwardUserId('');
            setAwardAmount('');
        } catch (err) {
            toast.error("Mukofotlashda xatolik");
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

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) return <div className="space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-24 animate-shimmer rounded-xl" />)}</div>;

    const cards = [
        { label: "O'quvchilar", value: stats?.umumiy?.jami_oquvchilar || 0, icon: Users, color: 'text-vercel-accent' },
        { label: "O'qituvchilar", value: stats?.umumiy?.jami_oqituvchilar || 0, icon: Users, color: 'text-emerald-400' },
        { label: "Jami kitoblar", value: stats?.umumiy?.jami_kitoblar || 0, icon: BookOpen, color: 'text-vercel-success' },
        { label: "Jami sahifalar", value: parseInt(stats?.umumiy?.jami_sahifalar || 0).toLocaleString(), icon: FileText, color: 'text-vercel-warning' },
    ];

    const monthlyData = stats?.oylik_faollik?.map(item => ({
        oy: oyNomi(item.oy),
        kitoblar: parseInt(item.kitoblar_soni),
    })) || [];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-vercel-surface border border-vercel-border rounded-xl p-5 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <div className="p-2 bg-vercel-accent/10 rounded-lg">
                            <LayoutDashboard className="text-vercel-accent" size={24} />
                        </div>
                        Boshqaruv Markazi
                    </h1>
                    <p className="text-vercel-text-secondary text-sm mt-1 ml-1">
                        Analitika, Gamification va Tizim boshqaruvi
                    </p>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-vercel-surface border border-vercel-border rounded-xl p-5 card-hover transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-vercel-text-secondary">{label}</p>
                                <p className="text-2xl font-bold text-vercel-text mt-1">{value}</p>
                            </div>
                            <div className={`p-2.5 rounded-lg bg-vercel-surface-2 ${color}`}><Icon size={20} /></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Deep Analytics & Gamification Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Weekly Winner Card */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500"><Trophy size={100} /></div>
                    <h3 className="text-base font-bold text-yellow-500 mb-4 flex items-center gap-2 relative z-10"><Trophy size={18} /> Hafta Kitobxoni</h3>

                    {deepStats?.winner ? (
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-vercel-bg shadow-lg">
                                    {deepStats.winner.ism[0]}
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-vercel-text">{deepStats.winner.ism} {deepStats.winner.familiya}</p>
                                    <p className="text-sm text-yellow-500/80 font-medium">{deepStats.winner.sinf}-sinf a'zosi</p>
                                </div>
                            </div>
                            <div className="bg-vercel-bg/50 rounded-lg p-3 mb-4 backdrop-blur-sm border border-yellow-500/10">
                                <p className="text-sm text-vercel-text-secondary">Ushbu haftada <span className="text-vercel-text font-bold">{deepStats.winner.kitob_soni} ta</span> kitob o'qidi.</p>
                            </div>
                            <button onClick={announceWinner} className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg text-sm transition-colors shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2">
                                <Medal size={16} /> G'olibni E'lon Qilish
                            </button>
                        </div>
                    ) : (
                        <div className="relative z-10 h-32 flex items-center justify-center text-center">
                            <p className="text-vercel-text-secondary">Bu hafta o'qilgan kitoblar yetarli emas</p>
                        </div>
                    )}
                </div>

                {/* Genre Pie Chart */}
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-vercel-text-secondary mb-4">Janrlar Trendi</h3>
                    <div className="h-[200px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={deepStats?.genres} dataKey="value" nameKey="janr" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                                    {deepStats?.genres?.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333333', borderRadius: '8px', color: '#EDEDED', fontSize: '13px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>



            </div>

            {/* Main Content Grid (Charts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Oylik grafik */}
                    <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                        <h3 className="text-sm font-medium text-vercel-text-secondary mb-6">Oylik faollik</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                                <XAxis dataKey="oy" stroke="#888888" fontSize={12} />
                                <YAxis stroke="#888888" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333333', borderRadius: '8px', color: '#EDEDED', fontSize: '13px' }} />
                                <Line type="monotone" dataKey="kitoblar" stroke="#0070F3" strokeWidth={2} dot={{ fill: '#0070F3', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sinf statistikasi */}
                    {stats?.sinf_statistika?.length > 0 && (
                        <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                            <h3 className="text-sm font-medium text-vercel-text-secondary mb-6">Sinf bo'yicha kitoblar</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats.sinf_statistika}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                                    <XAxis dataKey="sinf" stroke="#888888" fontSize={12} />
                                    <YAxis stroke="#888888" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333333', borderRadius: '8px', color: '#EDEDED', fontSize: '13px' }} />
                                    <Bar dataKey="kitoblar" fill="#50E3C2" radius={[4, 4, 0, 0]} name="Kitoblar" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Right Column: Tools */}
                <div className="space-y-6">



                    {/* Broadcast */}
                    <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                        <h3 className="text-sm font-medium text-vercel-text mb-4 flex items-center gap-2">
                            <MessageSquare size={16} className="text-vercel-warning" /> Ommaviy Xabar
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-vercel-text-secondary mb-1.5 block">Kimga yuborilsin?</label>
                                <select
                                    value={broadcastTarget}
                                    onChange={(e) => setBroadcastTarget(e.target.value)}
                                    className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:border-vercel-accent outline-none"
                                >
                                    <option value="all">Barchaga</option>
                                    <option value="students">O'quvchilarga</option>
                                    <option value="teachers">O'qituvchilarga</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-vercel-text-secondary mb-1.5 block">Xabar matni</label>
                                <textarea
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Muhim e'lon..."
                                    rows={4}
                                    className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:border-vercel-accent outline-none resize-none"
                                />
                            </div>

                            <button
                                onClick={handleBroadcast}
                                disabled={sending}
                                className="w-full py-2.5 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Send size={16} /> {sending ? 'Yuborilmoqda...' : 'Xabarni Yuborish'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
