import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Settings, Save, Database, Upload, FileText, CheckCircle, Download, ShieldCheck, Sparkles, HardDrive, Zap, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
    const [xpSettings, setXpSettings] = useState({
        xp_per_page: '1',
        xp_per_book: '50'
    });
    const [csvText, setCsvText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/admin/settings');
            if (res.data) {
                setXpSettings({
                    xp_per_page: res.data.xp_per_page || '1',
                    xp_per_book: res.data.xp_per_book || '50'
                });
            }
        } catch (err) {
            toast.error("Sozlamalarni yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveXP = async () => {
        try {
            await api.post('/admin/settings/xp', xpSettings);
            toast.success("Gamification sozlamalari saqlandi");
        } catch (err) {
            toast.error("Saqlashda xato");
        }
    };

    const handleBackup = async () => {
        try {
            const res = await api.get('/admin/backup', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `kitobxon_backup_${new Date().toISOString().slice(0, 10)}.db`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Backup yuklab olindi");
        } catch (err) {
            toast.error("Backup olishda xato");
        }
    };

    const handleImport = async () => {
        if (!csvText.trim()) return toast.error("CSV matnini kiriting");
        try {
            const res = await api.post('/admin/import-users', { csvData: csvText });
            toast.success(res.data.xabar);
            setCsvText('');
        } catch (err) {
            toast.error("Import xatosi");
        }
    };

    if (loading) return (
        <div className="space-y-4 animate-fade-in max-w-5xl mx-auto">
            <div className="h-20 animate-shimmer rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-64 animate-shimmer rounded-2xl" />)}
            </div>
            <div className="h-64 animate-shimmer rounded-2xl" />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vercel-surface via-vercel-surface to-vercel-surface-2 border border-vercel-border/60 p-6">
                <div className="absolute inset-0 dot-pattern opacity-30" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/[0.03] rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-violet-500/5 rounded-xl border border-purple-500/10">
                        <Settings className="text-purple-400" size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-vercel-text tracking-tight">Tizim Sozlamalari</h1>
                        <p className="text-vercel-text-secondary text-xs mt-0.5">
                            Xavfsizlik, Import va Gamification qoidalari
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Backup Card */}
                <div className="relative overflow-hidden bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] rounded-full blur-3xl group-hover:bg-blue-500/[0.06] transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-cyan-500/5 rounded-xl border border-blue-500/10">
                                <Database size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-vercel-text">Ma'lumotlar Bazasi</h3>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">Xavfsizlik uchun nusxa oling</p>
                            </div>
                        </div>

                        <div className="bg-vercel-bg/50 rounded-xl p-4 mb-5 border border-vercel-border/30 space-y-2">
                            <div className="flex items-center gap-2">
                                <HardDrive size={13} className="text-blue-400/60" />
                                <p className="text-xs text-vercel-text-secondary">Fayl: <code className="text-vercel-text font-medium bg-vercel-surface-2 px-1.5 py-0.5 rounded">kitobxon.db</code></p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Info size={13} className="text-blue-400/60" />
                                <p className="text-xs text-vercel-text-secondary">Foydalanuvchilar, kitoblar va statistika</p>
                            </div>
                        </div>

                        <button
                            onClick={handleBackup}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] text-sm"
                        >
                            <Download size={16} /> Bazani Yuklab Olish
                        </button>
                    </div>
                </div>

                {/* Gamification Config */}
                <div className="relative overflow-hidden bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6 group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.03] rounded-full blur-3xl group-hover:bg-purple-500/[0.06] transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/5 rounded-xl border border-purple-500/10">
                                <Sparkles size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-vercel-text">Ballar Tizimi (XP)</h3>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">Rag'batlantirish qoidalari</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-medium text-vercel-text-secondary mb-2 block uppercase tracking-wider">
                                    1 sahifa o'qigani uchun (XP)
                                </label>
                                <div className="relative">
                                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50" />
                                    <input
                                        type="number"
                                        value={xpSettings.xp_per_page}
                                        onChange={(e) => setXpSettings({ ...xpSettings, xp_per_page: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-vercel-text text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-medium text-vercel-text-secondary mb-2 block uppercase tracking-wider">
                                    Kitob tugatgani uchun bonus (XP)
                                </label>
                                <div className="relative">
                                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/50" />
                                    <input
                                        type="number"
                                        value={xpSettings.xp_per_book}
                                        onChange={(e) => setXpSettings({ ...xpSettings, xp_per_book: e.target.value })}
                                        className="w-full pl-9 pr-4 py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-vercel-text text-sm focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSaveXP}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 active:scale-[0.98] text-sm mt-1"
                            >
                                <Save size={16} /> Saqlash
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Import */}
                <div className="relative overflow-hidden bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6 lg:col-span-2 group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/[0.03] rounded-full blur-3xl group-hover:bg-emerald-500/[0.06] transition-all duration-700" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-green-500/5 rounded-xl border border-emerald-500/10">
                                <Upload size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-vercel-text">Ommaviy User Qo'shish (Import)</h3>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">CSV formatidagi ma'lumotlarni yuklash</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-[11px] font-medium text-vercel-text-secondary mb-2 block uppercase tracking-wider">
                                    CSV ma'lumotlari
                                </label>
                                <textarea
                                    value={csvText}
                                    onChange={(e) => setCsvText(e.target.value)}
                                    placeholder={`Ism,Familiya,Student_ID,Sinf\nAli,Valiyev,AV1234,7-A\nDoniyor,Toshmatov,DT5678,8-B`}
                                    className="w-full h-48 px-4 py-3 bg-vercel-bg border border-vercel-border/60 rounded-xl text-sm font-mono text-vercel-text focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none resize-none placeholder-vercel-text-secondary/30 transition-all"
                                />
                                <p className="text-[11px] text-vercel-text-secondary/60 mt-2 flex items-center gap-1">
                                    <Info size={10} />
                                    Format: <code className="bg-vercel-surface-2 px-1 py-0.5 rounded text-vercel-text-secondary">Ism,Familiya,Student_ID,Sinf</code>
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-vercel-bg/50 rounded-xl p-5 border border-vercel-border/30">
                                    <h4 className="text-xs font-semibold text-vercel-text mb-3 flex items-center gap-2">
                                        <CheckCircle size={13} className="text-emerald-400" /> Ko'rsatmalar
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {[
                                            "Student ID formati: 2 ta harf + 4 ta raqam (masalan: AV1234)",
                                            "Student ID takrorlanmasligi kerak",
                                            "Barcha yangi userlarga default parol: 123456"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <div className="w-1 h-1 rounded-full bg-emerald-400/50 mt-1.5 flex-shrink-0" />
                                                <span className="text-xs text-vercel-text-secondary leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={handleImport}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] text-sm"
                                >
                                    <FileText size={16} /> Importni Boshlash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
