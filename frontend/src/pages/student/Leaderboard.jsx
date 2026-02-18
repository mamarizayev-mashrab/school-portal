import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trophy, Medal, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/stats/leaderboard');
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 animate-shimmer rounded-xl" />)}</div>;
    }

    const getMedalColor = (index) => {
        if (index === 0) return 'text-yellow-400';
        if (index === 1) return 'text-gray-300';
        if (index === 2) return 'text-amber-600';
        return 'text-vercel-text-secondary';
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                    <Trophy className="text-yellow-400" size={24} />
                    Reyting jadvali
                </h1>
                <p className="text-vercel-text-secondary text-sm mt-1">Eng faol kitobxonlar</p>
            </div>

            {/* Top 3 */}
            {students.length >= 3 && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 0, 2].map(pos => {
                        const student = students[pos];
                        if (!student) return null;
                        return (
                            <div key={pos} className={`bg-vercel-surface border border-vercel-border rounded-xl p-5 text-center ${pos === 0 ? 'ring-1 ring-yellow-400/30 lg:-mt-4' : ''}`}>
                                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-vercel-surface-2 mb-3 ${getMedalColor(pos)}`}>
                                    <Medal size={20} />
                                </div>
                                <p className="text-sm font-semibold text-vercel-text">{student.ism} {student.familiya}</p>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">{student.sinf}</p>
                                <div className="mt-3 flex items-center justify-center gap-1">
                                    <TrendingUp size={14} className="text-vercel-accent" />
                                    <span className="text-lg font-bold text-vercel-accent">{parseFloat(student.reyting).toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-vercel-text-secondary mt-1">{student.kitoblar_soni} kitob</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full list */}
            <div className="bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-vercel-border">
                            <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">#</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">O'quvchi</th>
                            <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider hidden sm:table-cell">Sinf</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Kitoblar</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Sahifalar</th>
                            <th className="text-right px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Reyting</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, idx) => (
                            <tr key={student.id} className="border-b border-vercel-border/50 hover:bg-vercel-surface-2 transition-colors">
                                <td className="px-5 py-3">
                                    <span className={`text-sm font-medium ${getMedalColor(idx)}`}>{idx + 1}</span>
                                </td>
                                <td className="px-5 py-3">
                                    <span className="text-sm text-vercel-text">{student.ism} {student.familiya}</span>
                                </td>
                                <td className="px-5 py-3 hidden sm:table-cell">
                                    <span className="text-sm text-vercel-text-secondary">{student.sinf || '—'}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <span className="text-sm text-vercel-text">{student.kitoblar_soni}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <span className="text-sm text-vercel-text">{parseInt(student.jami_sahifalar).toLocaleString()}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <span className="text-sm font-semibold text-vercel-accent">{parseFloat(student.reyting).toFixed(1)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
