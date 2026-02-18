import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Settings, Save, Database, Upload, FileText, CheckCircle, Download, ShieldCheck } from 'lucide-react';
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

    if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-40 animate-shimmer rounded-xl" />)}</div>;

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
            <div>
                <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                    <Settings className="text-vercel-accent" size={24} />
                    Tizim Sozlamalari
                </h1>
                <p className="text-vercel-text-secondary text-sm mt-1">
                    Xavfsizlik, Import va Gamification qoidalari
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Backup Card */}
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-vercel-text">Ma'lumotlar Bazasi (Backup)</h3>
                            <p className="text-sm text-vercel-text-secondary">Xavfsizlik uchun nusxa oling</p>
                        </div>
                    </div>
                    <div className="bg-vercel-surface-2 p-4 rounded-lg mb-6 text-sm text-vercel-text-secondary">
                        <p>Oxirgi marta saqlangan sana: <strong>Bugun</strong></p>
                        <p className="mt-2">Tizimdagi barcha foydalanuvchilar, kitoblar va statistika <code>kitobxon.db</code> faylida saqlanadi.</p>
                    </div>
                    <button
                        onClick={handleBackup}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={18} /> Bazani Yuklab Olish (.db)
                    </button>
                </div>

                {/* 2. Gamification Config */}
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-vercel-text">Ballar Tizimi (XP)</h3>
                            <p className="text-sm text-vercel-text-secondary">Rag'batlantirish qoidalari</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-vercel-text-secondary block mb-1.5">1 sahifa o'qigani uchun (XP)</label>
                            <input
                                type="number"
                                value={xpSettings.xp_per_page}
                                onChange={(e) => setXpSettings({ ...xpSettings, xp_per_page: e.target.value })}
                                className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text focus:border-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-vercel-text-secondary block mb-1.5">Kitob tugatgani uchun bonus (XP)</label>
                            <input
                                type="number"
                                value={xpSettings.xp_per_book}
                                onChange={(e) => setXpSettings({ ...xpSettings, xp_per_book: e.target.value })}
                                className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text focus:border-purple-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleSaveXP}
                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                        >
                            <Save size={18} /> Saqlash
                        </button>
                    </div>
                </div>

                {/* 3. User Import */}
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6 lg:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <Upload size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-vercel-text">Ommaviy User Qo'shish (Import)</h3>
                            <p className="text-sm text-vercel-text-secondary">CSV formatidagi ma'lumotlarni yuklash</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <textarea
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                                placeholder={`Ism,Familiya,Student_ID,Sinf\nAli,Valiyev,AV1234,7-A\nDoniyor,Toshmatov,DT5678,8-B`}
                                className="w-full h-48 px-4 py-3 bg-vercel-bg border border-vercel-border rounded-lg text-sm font-mono text-vercel-text focus:border-emerald-500 outline-none resize-none placeholder-vercel-text-secondary/50"
                            />
                            <p className="text-xs text-vercel-text-secondary mt-2">Format: <code>Ism,Familiya,Student_ID,Sinf</code> (Har bir user yangi qatorda)</p>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-vercel-surface-2 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-vercel-text mb-2 flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Ko'rsatmalar:</h4>
                                <ul className="text-xs text-vercel-text-secondary space-y-1 list-disc list-inside">
                                    <li>Student ID formati: 2 ta harf + 4 ta raqam (masalan: AV1234).</li>
                                    <li>Student ID takrorlanmasligi kerak.</li>
                                    <li>Barcha yangi userlarga default parol: <code>123456</code> beriladi.</li>
                                </ul>
                            </div>
                            <button
                                onClick={handleImport}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <FileText size={18} /> Importni Boshlash
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
