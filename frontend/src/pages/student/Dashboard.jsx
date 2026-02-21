import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { BookOpen, FileText, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/stats/student');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const oyNomi = (oy) => {
        const oylar = { '01': 'Yan', '02': 'Fev', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Iyn', '07': 'Iyl', '08': 'Avg', '09': 'Sen', '10': 'Okt', '11': 'Noy', '12': 'Dek' };
        return oylar[oy?.split('-')[1]] || oy;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 animate-shimmer rounded-xl" />
                ))}
            </div>
        );
    }

    const cards = [
        { label: "Jami kitoblar", value: stats?.jami_kitoblar || 0, icon: BookOpen, color: 'text-vercel-accent', glow: 'shadow-glow-accent' },
        { label: "Jami sahifalar", value: stats?.jami_sahifalar?.toLocaleString() || 0, icon: FileText, color: 'text-vercel-success', glow: 'shadow-glow-success' },
        { label: "Tasdiqlangan xulosalar", value: stats?.tasdiqlangan_xulosalar || 0, icon: CheckCircle, color: 'text-emerald-400', glow: 'shadow-glow-success' },
        { label: "O'rtacha ball", value: `${stats?.ortacha_test_ball || 0}%`, icon: TrendingUp, color: 'text-vercel-warning', glow: 'shadow-glow-warning' },
    ];

    const chartData = stats?.oylik_statistika?.map(item => ({
        oy: oyNomi(item.oy),
        kitoblar: parseInt(item.kitoblar_soni),
        sahifalar: parseInt(item.sahifalar),
    })) || [];

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="animate-slide-up">
                    <h1 className="text-3xl font-bold text-vercel-text tracking-tight">
                        Salom, {user?.ism}! 👋
                    </h1>
                    <p className="text-vercel-text-secondary mt-1 text-lg">
                        Bugun qanday kitoblar o'qiymiz?
                    </p>
                </div>
                <div className="flex gap-2 animate-fade-in-delay">
                    {/* Potential action buttons like "Kitob qo'shish" could go here */}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map(({ label, value, icon: Icon, color, glow }, index) => (
                    <div
                        key={label}
                        className={`bg-vercel-surface/40 backdrop-blur-xl border border-vercel-border/50 rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 cursor-default group animate-slide-up`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-vercel-text-secondary group-hover:text-vercel-text transition-colors">{label}</p>
                                <p className="text-3xl font-bold text-vercel-text tracking-tight">{value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-vercel-surface border border-vercel-border/50 ${color} ${glow} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Line Chart */}
                    <div className="bg-vercel-surface/40 backdrop-blur-xl border border-vercel-border/50 rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-500 animate-fade-in-delay-2">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-semibold text-vercel-text">Oylik o'qilgan kitoblar</h3>
                            <div className="p-2 rounded-lg bg-vercel-accent/10 border border-vercel-accent/20">
                                <BookOpen size={18} className="text-vercel-accent" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorKitob" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0070F3" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0070F3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="oy"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(10,10,10,0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#888', marginBottom: '4px' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="kitoblar"
                                    stroke="#0070F3"
                                    strokeWidth={4}
                                    dot={{ fill: '#0070F3', r: 5, strokeWidth: 2, stroke: '#000' }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#3291FF' }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-vercel-surface/40 backdrop-blur-xl border border-vercel-border/50 rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-500 animate-fade-in-delay-3">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-semibold text-vercel-text">Oylik o'qilgan sahifalar</h3>
                            <div className="p-2 rounded-lg bg-vercel-success/10 border border-vercel-success/20">
                                <FileText size={18} className="text-vercel-success" />
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <defs>
                                    <linearGradient id="colorSahifa" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#50E3C2" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#0DA67F" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="oy"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(10,10,10,0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(12px)',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#888', marginBottom: '4px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                />
                                <Bar
                                    dataKey="sahifalar"
                                    fill="url(#colorSahifa)"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {chartData.length === 0 && (
                <div className="bg-vercel-surface/40 backdrop-blur-xl border border-vercel-border/50 rounded-2xl p-20 text-center shadow-card animate-slide-up">
                    <div className="mx-auto w-20 h-20 bg-vercel-surface border border-vercel-border rounded-full flex items-center justify-center mb-6 shadow-glow-accent">
                        <BookOpen size={40} className="text-vercel-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-vercel-text">Hali kitob qo'shilmagan</h3>
                    <p className="text-vercel-text-secondary text-lg mt-3 max-w-md mx-auto">
                        O'qigan kitoblaringizni qo'shing va o'sish dinamikangizni kuzatib boring!
                    </p>
                    <button className="mt-8 px-8 py-3 bg-vercel-accent text-white rounded-full font-semibold hover:bg-vercel-accent-hover transition-all duration-300 shadow-glow-accent hover:scale-105 active:scale-95">
                        Kitob qo'shish
                    </button>
                </div>
            )}
        </div>
    );
}
