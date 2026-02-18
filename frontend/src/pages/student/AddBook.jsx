import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { BookPlus, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddBook() {
    const [form, setForm] = useState({
        kitob_nomi: '', muallif: '', sahifalar_soni: '', oqilgan_sana: '', xulosa: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const wordCount = form.xulosa.trim().split(/\s+/).filter(Boolean).length;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (wordCount < 100) {
            toast.error(`Xulosa kamida 100 so'zdan iborat bo'lishi kerak (hozir: ${wordCount})`);
            return;
        }
        setLoading(true);
        try {
            await api.post('/books', {
                ...form,
                sahifalar_soni: parseInt(form.sahifalar_soni),
            });
            toast.success("Kitob muvaffaqiyatli qo'shildi!");
            navigate('/student/my-books');
        } catch (err) {
            const errors = err.response?.data?.xatolar;
            if (errors) {
                errors.forEach(e => toast.error(e));
            } else {
                toast.error(err.response?.data?.xabar || "Xatolik yuz berdi");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                    <BookPlus className="text-vercel-accent" size={24} />
                    Kitob qo'shish
                </h1>
                <p className="text-vercel-text-secondary mt-1 text-sm">O'qigan kitobingiz haqida ma'lumot kiriting</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-vercel-surface border border-vercel-border rounded-xl p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Kitob nomi</label>
                        <input name="kitob_nomi" value={form.kitob_nomi} onChange={handleChange} required placeholder="Kitob nomini kiriting"
                            className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Muallif</label>
                        <input name="muallif" value={form.muallif} onChange={handleChange} required placeholder="Muallif ismi"
                            className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Sahifalar soni</label>
                        <input name="sahifalar_soni" type="number" min="1" value={form.sahifalar_soni} onChange={handleChange} required placeholder="Masalan: 320"
                            className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">O'qilgan sana</label>
                        <input name="oqilgan_sana" type="date" value={form.oqilgan_sana} onChange={handleChange} required
                            className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm" />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-vercel-text-secondary">
                            Xulosa
                        </label>
                        <span className={`text-xs ${wordCount >= 100 ? 'text-vercel-success' : 'text-vercel-text-secondary'}`}>
                            {wordCount}/100 so'z {wordCount >= 100 ? '✓' : ''}
                        </span>
                    </div>
                    <textarea
                        name="xulosa"
                        value={form.xulosa}
                        onChange={handleChange}
                        required
                        rows={8}
                        placeholder="Kitob haqida kamida 100 so'zdan iborat xulosa yozing..."
                        className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm resize-none"
                    />
                    {wordCount > 0 && wordCount < 100 && (
                        <div className="flex items-center gap-1.5 mt-2 text-vercel-warning">
                            <AlertCircle size={14} />
                            <span className="text-xs">Yana {100 - wordCount} so'z qo'shing</span>
                        </div>
                    )}
                </div>

                <button type="submit" disabled={loading || wordCount < 100}
                    className="w-full py-2.5 bg-vercel-text text-vercel-bg rounded-lg font-medium text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-vercel-bg border-t-transparent rounded-full animate-spin" />
                            Qo'shilmoqda...
                        </span>
                    ) : "Kitobni qo'shish"}
                </button>
            </form>
        </div>
    );
}
