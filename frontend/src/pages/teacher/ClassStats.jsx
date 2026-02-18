import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ClassStats() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) fetchStats(selectedClass);
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/admin/classes');
            setClasses(res.data);
            if (res.data.length > 0) setSelectedClass(res.data[0]);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchStats = async (sinf) => {
        try {
            const res = await api.get(`/stats/class/${sinf}`);
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="h-64 animate-shimmer rounded-xl" />;

    const chartData = stats?.oquvchilar?.map(s => ({
        ism: `${s.ism} ${s.familiya?.[0]}.`,
        kitoblar: parseInt(s.kitoblar_soni),
        sahifalar: parseInt(s.sahifalar),
    })) || [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <BarChart3 className="text-vercel-accent" size={24} />
                        Sinf statistikasi
                    </h1>
                </div>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-4 py-2 bg-vercel-surface border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all">
                    {classes.map(c => <option key={c} value={c}>{c}-sinf</option>)}
                </select>
            </div>

            {chartData.length > 0 && (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                    <h3 className="text-sm font-medium text-vercel-text-secondary mb-6">O'quvchilar bo'yicha kitoblar soni</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                            <XAxis dataKey="ism" stroke="#888888" fontSize={11} />
                            <YAxis stroke="#888888" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#171717', border: '1px solid #333333', borderRadius: '8px', color: '#EDEDED', fontSize: '13px' }} />
                            <Bar dataKey="kitoblar" fill="#0070F3" radius={[4, 4, 0, 0]} name="Kitoblar" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* O'quvchilar jadvali */}
            {stats?.oquvchilar && (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-vercel-border">
                                <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">#</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Ism Familiya</th>
                                <th className="text-right px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Kitoblar</th>
                                <th className="text-right px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Sahifalar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.oquvchilar.map((s, i) => (
                                <tr key={s.id} className="border-b border-vercel-border/50 hover:bg-vercel-surface-2 transition-colors">
                                    <td className="px-5 py-3 text-sm text-vercel-text-secondary">{i + 1}</td>
                                    <td className="px-5 py-3 text-sm text-vercel-text">{s.ism} {s.familiya}</td>
                                    <td className="px-5 py-3 text-sm text-vercel-text text-right">{s.kitoblar_soni}</td>
                                    <td className="px-5 py-3 text-sm text-vercel-text text-right">{parseInt(s.sahifalar).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
