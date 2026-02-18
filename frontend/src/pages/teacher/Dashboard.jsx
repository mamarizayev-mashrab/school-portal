import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TeacherDashboard() {
    const [classes, setClasses] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedClass, setSelectedClass] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) fetchClassStats(selectedClass);
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/admin/classes');
            setClasses(res.data);
            if (res.data.length > 0) {
                setSelectedClass(res.data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassStats = async (sinf) => {
        try {
            const res = await api.get(`/stats/class/${sinf}`);
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const COLORS = ['#0070F3', '#50E3C2', '#F5A623', '#EE0000', '#7928CA', '#FF6B6B', '#4ECDC4', '#45B7D1'];

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 animate-shimmer rounded-xl" />)}</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text">O'qituvchi paneli</h1>
                    <p className="text-vercel-text-secondary text-sm mt-1">Sinf bo'yicha o'quvchilar statistikasi</p>
                </div>

                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2 bg-vercel-surface border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all">
                    {classes.map(c => <option key={c} value={c}>{c}-sinf</option>)}
                </select>
            </div>

            {stats && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-vercel-surface border border-vercel-border rounded-xl p-5 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-vercel-accent/10"><Users size={18} className="text-vercel-accent" /></div>
                                <div>
                                    <p className="text-xs text-vercel-text-secondary">O'quvchilar</p>
                                    <p className="text-xl font-bold text-vercel-text">{stats.umumiy.oquvchilar_soni}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-vercel-surface border border-vercel-border rounded-xl p-5 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-vercel-success/10"><BookOpen size={18} className="text-vercel-success" /></div>
                                <div>
                                    <p className="text-xs text-vercel-text-secondary">Jami kitoblar</p>
                                    <p className="text-xl font-bold text-vercel-text">{stats.umumiy.jami_kitoblar}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-vercel-surface border border-vercel-border rounded-xl p-5 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-lg bg-vercel-warning/10"><TrendingUp size={18} className="text-vercel-warning" /></div>
                                <div>
                                    <p className="text-xs text-vercel-text-secondary">Jami sahifalar</p>
                                    <p className="text-xl font-bold text-vercel-text">{parseInt(stats.umumiy.jami_sahifalar).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* O'quvchilar ro'yxati */}
                        <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                            <h3 className="text-sm font-medium text-vercel-text-secondary mb-4">Eng faol o'quvchilar</h3>
                            <div className="space-y-2">
                                {stats.oquvchilar?.slice(0, 10).map((s, i) => (
                                    <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-vercel-surface-2 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-vercel-text-secondary w-5">{i + 1}</span>
                                            <span className="text-sm text-vercel-text">{s.ism} {s.familiya}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-vercel-text-secondary">
                                            <span>{s.kitoblar_soni} kitob</span>
                                            <span>{parseInt(s.sahifalar).toLocaleString()} sah.</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top kitoblar */}
                        <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                            <h3 className="text-sm font-medium text-vercel-text-secondary mb-4">Eng ko'p o'qilgan kitoblar</h3>
                            {stats.top_kitoblar?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={stats.top_kitoblar.slice(0, 5)} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                                        <XAxis type="number" stroke="#888888" fontSize={12} />
                                        <YAxis type="category" dataKey="kitob_nomi" stroke="#888888" fontSize={11} width={120} tick={{ fill: '#888888' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333333', borderRadius: '8px', color: '#EDEDED', fontSize: '13px' }} />
                                        <Bar dataKey="oqilgan_soni" fill="#0070F3" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-sm text-vercel-text-secondary text-center py-8">Ma'lumot yo'q</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
