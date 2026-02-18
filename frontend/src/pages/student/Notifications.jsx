import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';

export default function Notifications() {
    const [data, setData] = useState({ notifications: [], unreadCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchNotifications(); }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setData(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const readAll = async () => {
        try {
            await api.put('/notifications/read-all');
            setData({ ...data, notifications: data.notifications.map(n => ({ ...n, oqilgan: 1 })), unreadCount: 0 });
        } catch (err) { console.error(err); }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setData({ ...data, notifications: data.notifications.filter(n => n.id !== id) });
        } catch (err) { console.error(err); }
    };

    const formatTime = (dateStr) => {
        // SQLite vaqtini (UTC) JS Date obyektiga o'tkazish
        const date = new Date(dateStr.replace(' ', 'T') + 'Z');
        const now = new Date();

        const isToday = date.toDateString() === now.toDateString();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeStr = date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

        if (isToday) return `Bugun, ${timeStr}`;
        if (isYesterday) return `Kecha, ${timeStr}`;

        return date.toLocaleDateString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-shimmer rounded-xl" />)}</div>;

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <Bell className="text-vercel-accent" size={24} />
                        Bildirishnomalar
                    </h1>
                    {data.unreadCount > 0 && (
                        <p className="text-sm text-vercel-text-secondary mt-1">{data.unreadCount} ta o'qilmagan</p>
                    )}
                </div>
                {data.unreadCount > 0 && (
                    <button onClick={readAll}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-vercel-accent bg-vercel-accent/5 border border-vercel-accent/20 rounded-lg hover:bg-vercel-accent/10 transition-all">
                        <CheckCheck size={14} /> Barchasini o'qish
                    </button>
                )}
            </div>

            {data.notifications.length === 0 ? (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-12 text-center">
                    <Bell size={40} className="mx-auto text-vercel-text-secondary/30 mb-3" />
                    <p className="text-vercel-text-secondary">Bildirishnomalar yo'q</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {data.notifications.map(n => (
                        <div key={n.id} className={`group flex items-start gap-3 p-4 rounded-xl border transition-all ${n.oqilgan ? 'bg-vercel-surface border-vercel-border/50' : 'bg-vercel-surface border-vercel-accent/20 border-l-2 border-l-vercel-accent'
                            }`}>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${n.oqilgan ? 'text-vercel-text-secondary' : 'text-vercel-text'}`}>{n.xabar}</p>
                                <p className="text-xs text-vercel-text-secondary/60 mt-1">{formatTime(n.created_at)}</p>
                            </div>
                            <button onClick={() => deleteNotification(n.id)}
                                className="p-1.5 rounded-lg text-vercel-text-secondary/40 hover:text-vercel-error hover:bg-vercel-error/5 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
