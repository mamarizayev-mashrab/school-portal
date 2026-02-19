import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    ShieldAlert, Search, RefreshCw, UserPlus,
    Trash2, Edit, AlertCircle, Monitor, Clock, Filter, Activity, Shield
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
                return { label: "Foydalanuvchi qo'shildi", color: 'text-emerald-400', bg: 'bg-emerald-500/[0.08] border-emerald-500/15', icon: UserPlus };
            case 'UPDATE_USER':
                return { label: "Ma'lumot o'zgartirildi", color: 'text-amber-400', bg: 'bg-amber-500/[0.08] border-amber-500/15', icon: Edit };
            case 'DELETE_USER':
                return { label: "Foydalanuvchi o'chirildi", color: 'text-rose-400', bg: 'bg-rose-500/[0.08] border-rose-500/15', icon: Trash2 };
            default:
                return { label: action, color: 'text-slate-400', bg: 'bg-slate-500/[0.08] border-slate-500/15', icon: AlertCircle };
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

    if (loading) return (
        <div className="space-y-4 animate-fade-in">
            <div className="h-20 animate-shimmer rounded-2xl" />
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 animate-shimmer rounded-2xl" />)}
        </div>
    );

    return (
        <div className="animate-fade-in space-y-5">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vercel-surface via-vercel-surface to-vercel-surface-2 border border-vercel-border/60 p-6">
                <div className="absolute inset-0 dot-pattern opacity-30" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/[0.03] rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/10">
                            <ShieldAlert className="text-orange-400" size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-vercel-text tracking-tight">Xavfsizlik Auditi</h1>
                            <p className="text-vercel-text-secondary text-xs mt-0.5">
                                Tizimdagi barcha muhim o'zgarishlar tarixi • {filteredLogs.length} ta yozuv
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary/50" size={15} />
                            <input
                                type="text"
                                placeholder="Qidirish..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2.5 bg-vercel-bg/50 border border-vercel-border/60 rounded-xl text-sm text-vercel-text placeholder:text-vercel-text-secondary/40 focus:outline-none focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 w-full md:w-56 transition-all"
                            />
                        </div>
                        <button onClick={fetchLogs}
                            className="p-2.5 bg-vercel-bg/50 border border-vercel-border/60 rounded-xl text-vercel-text-secondary hover:text-vercel-text hover:bg-vercel-surface-2 transition-all active:scale-95">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Log entries */}
            <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-vercel-border/50 bg-vercel-surface-2/30">
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Admin</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Amal</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Tafsilotlar</th>
                                <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">IP & Vaqt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-vercel-border/30">
                            {filteredLogs.map((log, index) => {
                                const { label, color, bg, icon: Icon } = getActionConfig(log.action);
                                return (
                                    <tr key={log.id} className="table-row-hover group"
                                        style={{ animationDelay: `${index * 30}ms` }}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-vercel-accent/20 to-purple-500/10 flex items-center justify-center text-[11px] font-bold text-vercel-accent border border-vercel-accent/10">
                                                    {log.ism?.[0]}{log.familiya?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-vercel-text">{log.ism} {log.familiya}</p>
                                                    <p className="text-[11px] text-vercel-text-secondary/60">{log.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${bg} ${color}`}>
                                                <Icon size={11} />
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm text-vercel-text-secondary max-w-md truncate group-hover:whitespace-normal group-hover:break-words transition-all">
                                                {log.details.replace('Created user:', 'Yaratildi:').replace('Deleted user ID:', "O'chirildi ID:").replace('Updated user ID:', "O'zgartirildi ID:")}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5 text-[11px] text-vercel-text-secondary/60 font-mono">
                                                    <Monitor size={11} />
                                                    {log.ip_address === '::1' ? 'Localhost' : log.ip_address}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-vercel-text-secondary/60">
                                                    <Clock size={11} />
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
                    <div className="p-16 text-center flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-vercel-surface-2/50">
                            <Shield className="text-vercel-text-secondary/20" size={36} />
                        </div>
                        <p className="text-sm text-vercel-text-secondary">Hozircha hech qanday log topilmadi</p>
                        <p className="text-xs text-vercel-text-secondary/50">Admin faoliyatlari bu yerda ko'rinadi</p>
                    </div>
                )}
            </div>
        </div>
    );
}
