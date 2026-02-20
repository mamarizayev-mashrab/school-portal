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
        { label: "Jami kitoblar", value: stats?.jami_kitoblar || 0, icon: BookOpen, color: 'text-vercel-accent' },
        { label: "Jami sahifalar", value: stats?.jami_sahifalar?.toLocaleString() || 0, icon: FileText, color: 'text-vercel-success' },
        { label: "Tasdiqlangan xulosalar", value: stats?.tasdiqlangan_xulosalar || 0, icon: CheckCircle, color: 'text-emerald-400' },
        { label: "O'rtacha test ball", value: `${stats?.ortacha_test_ball || 0}%`, icon: TrendingUp, color: 'text-vercel-warning' },
    ];

    const chartData = stats?.oylik_statistika?.map(item => ({
        oy: oyNomi(item.oy),
        kitoblar: parseInt(item.kitoblar_soni),
        sahifalar: parseInt(item.sahifalar),
    })) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-vercel-text">
                    Salom, {user?.ism}! 👋
                </h1>
                <p className="text-vercel-text-secondary mt-1">
                    Kitob o'qish statistikangiz
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 card-hover shadow-lg transition-transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-white/70">{label}</p>
                                <p className="text-2xl font-bold text-white mt-1">{value}</p>
                            </div>
                            <div className={`p-2.5 rounded-lg bg-white/5 ${color} shadow-inner`}>
                                <Icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Line Chart */}
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
                        <h3 className="text-sm font-medium text-white/70 mb-6">Oylik o'qilgan kitoblar</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="oy" stroke="rgba(255,255,255,0.5)" fontSize={12} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', backdropFilter: 'blur(4px)' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#aaa' }}
                                />
                                <Line type="monotone" dataKey="kitoblar" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
                        <h3 className="text-sm font-medium text-white/70 mb-6">Oylik o'qilgan sahifalar</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="oy" stroke="rgba(255,255,255,0.5)" fontSize={12} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tick={{ fill: 'rgba(255,255,255,0.7)' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '13px', backdropFilter: 'blur(4px)' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#aaa' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="sahifalar" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {chartData.length === 0 && (
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center shadow-lg">
                    <BookOpen size={40} className="mx-auto text-white/50 mb-4" />
                    <h3 className="text-lg font-medium text-white">Hali kitob qo'shilmagan</h3>
                    <p className="text-white/60 text-sm mt-2">
                        Birinchi kitobingizni qo'shib, statistikangizni ko'ring!
                    </p>
                </div>
            )}
        </div>
    );
}
