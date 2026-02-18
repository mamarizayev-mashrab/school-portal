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
                    <div key={label} className="bg-vercel-surface border border-vercel-border rounded-xl p-5 card-hover">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-vercel-text-secondary">{label}</p>
                                <p className="text-2xl font-bold text-vercel-text mt-1">{value}</p>
                            </div>
                            <div className={`p-2.5 rounded-lg bg-vercel-surface-2 ${color}`}>
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
                    <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                        <h3 className="text-sm font-medium text-vercel-text-secondary mb-6">Oylik o'qilgan kitoblar</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                                <XAxis dataKey="oy" stroke="#888888" fontSize={12} />
                                <YAxis stroke="#888888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333333', borderRadius: '8px', color: '#EDEDED', fontSize: '13px' }}
                                />
                                <Line type="monotone" dataKey="kitoblar" stroke="#0070F3" strokeWidth={2} dot={{ fill: '#0070F3', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                        <h3 className="text-sm font-medium text-vercel-text-secondary mb-6">Oylik o'qilgan sahifalar</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                                <XAxis dataKey="oy" stroke="#888888" fontSize={12} />
                                <YAxis stroke="#888888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333333', borderRadius: '8px', color: '#EDEDED', fontSize: '13px' }}
                                />
                                <Bar dataKey="sahifalar" fill="#50E3C2" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {chartData.length === 0 && (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-12 text-center">
                    <BookOpen size={40} className="mx-auto text-vercel-text-secondary mb-4" />
                    <h3 className="text-lg font-medium text-vercel-text">Hali kitob qo'shilmagan</h3>
                    <p className="text-vercel-text-secondary text-sm mt-2">
                        Birinchi kitobingizni qo'shib, statistikangizni ko'ring!
                    </p>
                </div>
            )}
        </div>
    );
}
