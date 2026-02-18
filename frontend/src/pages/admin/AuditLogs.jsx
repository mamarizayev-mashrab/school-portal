import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    ShieldAlert, Search, RefreshCw, UserPlus,
    Trash2, Edit, AlertCircle, Monitor, Clock, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/audit');
            setLogs(res.data);
        } catch (err) {
            toast.error("Audit loglarini yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const getActionConfig = (action) => {
        switch (action) {
            case 'CREATE_USER':
                return { label: "Foydalanuvchi qo'shildi", color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: UserPlus };
            case 'UPDATE_USER':
                return { label: "Ma'lumot o'zgartirildi", color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Edit };
            case 'DELETE_USER':
                return { label: "Foydalanuvchi o'chirildi", color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: Trash2 };
            default:
                return { label: action, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', icon: AlertCircle };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('uz-UZ', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log =>
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.ism?.toLowerCase().includes(search.toLowerCase()) ||
        log.email?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="space-y-4 p-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-20 animate-pulse bg-vercel-surface-2 rounded-xl" />)}</div>;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <ShieldAlert className="text-vercel-accent" size={28} />
                        Xavfsizlik Auditi
                    </h1>
                    <p className="text-vercel-text-secondary mt-1">Tizimdagi barcha muhim o'zgarishlar tarixi</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-vercel-surface border border-vercel-border rounded-lg text-sm text-vercel-text placeholder:text-vercel-text-secondary focus:ring-1 focus:ring-vercel-text focus:border-vercel-text outline-none w-full md:w-64"
                        />
                    </div>
                    <button onClick={fetchLogs} className="p-2 bg-vercel-surface border border-vercel-border rounded-lg text-vercel-text hover:bg-vercel-surface-2 transition-colors">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-vercel-border bg-vercel-surface-2/30">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-vercel-text-secondary uppercase tracking-wider">Admin</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-vercel-text-secondary uppercase tracking-wider">Amal</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-vercel-text-secondary uppercase tracking-wider">Tafsilotlar</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-vercel-text-secondary uppercase tracking-wider">IP & Vaqt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vercel-border/50">
                            {filteredLogs.map(log => {
                                const { label, color, icon: Icon } = getActionConfig(log.action);
                                return (
                                    <tr key={log.id} className="group hover:bg-vercel-surface-2/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-vercel-accent/10 flex items-center justify-center text-vercel-accent text-xs font-bold">
                                                    {log.ism?.[0]}{log.familiya?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-vercel-text">{log.ism} {log.familiya}</p>
                                                    <p className="text-xs text-vercel-text-secondary">{log.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
                                                <Icon size={12} />
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-vercel-text-secondary max-w-md truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                                {log.details.replace('Created user:', 'Yaratildi:').replace('Deleted user ID:', "O'chirildi ID:").replace('Updated user ID:', "O'zgartirildi ID:")}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs text-vercel-text-secondary font-mono">
                                                    <Monitor size={12} />
                                                    {log.ip_address === '::1' ? 'Localhost' : log.ip_address}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-vercel-text-secondary">
                                                    <Clock size={12} />
                                                    {formatDate(log.created_at)}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="p-12 text-center flex flex-col items-center gap-3">
                        <Filter className="text-vercel-text-secondary w-12 h-12 opacity-20" />
                        <p className="text-vercel-text-secondary text-sm">Hozircha hech qanday log topilmadi</p>
                    </div>
                )}
            </div>
        </div>
    );
}
