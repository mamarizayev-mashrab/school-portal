import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Award, Lock, Flame, Zap, Star, TrendingUp } from 'lucide-react';

export default function Badges() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            const res = await api.get('/gamification/badges');
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 animate-shimmer rounded-xl" />)}</div>;
    if (!data) return null;

    const earnedCount = data.allBadges.filter(b => b.earned).length;
    const totalCount = data.allBadges.length;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <Award className="text-yellow-400" size={24} />
                        Nishonlar va Yutuqlar
                    </h1>
                    <p className="text-vercel-text-secondary text-sm mt-1">
                        {earnedCount} / {totalCount} nishon qo'lga kiritildi
                    </p>
                </div>
            </div>

            {/* Level & XP */}
            <div className="bg-gradient-to-r from-vercel-surface to-vercel-surface-2 border border-vercel-border rounded-xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">{data.level?.icon}</div>
                        <div>
                            <p className="text-xs text-vercel-text-secondary uppercase tracking-wider">Darajangiz</p>
                            <p className="text-xl font-bold text-vercel-text">{data.level?.name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Zap size={16} />
                                <span className="text-lg font-bold">{data.xp}</span>
                            </div>
                            <p className="text-xs text-vercel-text-secondary">XP</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center gap-1 text-orange-400">
                                <Flame size={16} />
                                <span className="text-lg font-bold">{data.streak}</span>
                            </div>
                            <p className="text-xs text-vercel-text-secondary">Streak</p>
                        </div>
                    </div>
                </div>

                {/* XP Progress */}
                {data.nextLevel && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-vercel-text-secondary mb-1">
                            <span>{data.level?.name}</span>
                            <span>{data.nextLevel?.name} gacha {data.nextLevel?.minXP - data.xp} XP</span>
                        </div>
                        <div className="w-full bg-vercel-bg rounded-full h-2.5 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-vercel-accent to-cyan-400 rounded-full transition-all duration-1000"
                                style={{ width: `${data.progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Level ma'lumotlari */}
            <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                <h3 className="text-sm font-medium text-vercel-text-secondary mb-4 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Darajalar tizimi
                </h3>
                <div className="flex flex-wrap gap-3">
                    {data.allBadges && data.level && ['🌱 Yangi', "📖 O'quvchi", '📚 Kitobxon', '🧠 Bilimdon', '🎓 Ustoz', '👑 Akademik', '⭐ Legenda'].map((l, i) => {
                        const [icon, name] = [l.slice(0, 2), l.slice(3)];
                        const isActive = data.level?.name === name;
                        const isPassed = ['Yangi', "O'quvchi", 'Kitobxon', 'Bilimdon', 'Ustoz', 'Akademik', 'Legenda'].indexOf(data.level?.name) >= i;
                        return (
                            <div key={name} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                ${isActive ? 'bg-vercel-accent/10 border-vercel-accent text-vercel-accent scale-105' :
                                    isPassed ? 'bg-vercel-surface-2 border-vercel-border text-vercel-text' :
                                        'bg-vercel-bg border-vercel-border/50 text-vercel-text-secondary/50'}`}>
                                <span className="mr-1.5">{icon}</span>{name}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Nishonlar gridi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {data.allBadges.map((badge) => (
                    <div key={badge.key}
                        className={`relative rounded-xl p-5 border transition-all duration-300 ${badge.earned
                                ? 'bg-vercel-surface border-vercel-border card-hover'
                                : 'bg-vercel-bg border-vercel-border/30 opacity-50 grayscale'
                            }`}>
                        {!badge.earned && (
                            <Lock size={14} className="absolute top-3 right-3 text-vercel-text-secondary/40" />
                        )}
                        <div className="text-3xl mb-3">{badge.icon}</div>
                        <h4 className="text-sm font-semibold text-vercel-text">{badge.name}</h4>
                        <p className="text-xs text-vercel-text-secondary mt-1">{badge.desc}</p>
                        {badge.earned && (
                            <div className="mt-3 flex items-center gap-1">
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-yellow-400">Qo'lga kiritildi</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
