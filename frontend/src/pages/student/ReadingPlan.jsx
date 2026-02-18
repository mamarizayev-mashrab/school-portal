import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CalendarDays, Plus, CheckCircle, Trash2, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReadingPlan() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ nomi: '', boshlanish_sana: '', tugash_sana: '', kitoblar: [{ kitob_nomi: '', muallif: '' }] });

    useEffect(() => { fetchPlans(); }, []);

    const fetchPlans = async () => {
        try { const res = await api.get('/plans'); setPlans(res.data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const addBookField = () => {
        setForm({ ...form, kitoblar: [...form.kitoblar, { kitob_nomi: '', muallif: '' }] });
    };

    const removeBookField = (i) => {
        setForm({ ...form, kitoblar: form.kitoblar.filter((_, idx) => idx !== i) });
    };

    const updateBookField = (i, field, value) => {
        const updated = [...form.kitoblar];
        updated[i][field] = value;
        setForm({ ...form, kitoblar: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nomi || !form.boshlanish_sana || !form.tugash_sana) {
            return toast.error("Barcha maydonlarni to'ldiring");
        }
        try {
            const res = await api.post('/plans', {
                ...form,
                maqsad_kitoblar: form.kitoblar.filter(b => b.kitob_nomi).length,
                kitoblar: form.kitoblar.filter(b => b.kitob_nomi),
            });
            setPlans([res.data.plan, ...plans]);
            setShowForm(false);
            setForm({ nomi: '', boshlanish_sana: '', tugash_sana: '', kitoblar: [{ kitob_nomi: '', muallif: '' }] });
            toast.success("Reja yaratildi! 📅");
        } catch (err) { toast.error("Reja yaratishda xato"); }
    };

    const completeBook = async (bookId, planId) => {
        try {
            await api.put(`/plans/books/${bookId}/complete`);
            setPlans(plans.map(p => p.id === planId ? {
                ...p,
                kitoblar: p.kitoblar.map(b => b.id === bookId ? { ...b, oqilgan: 1 } : b),
                oqilgan_soni: p.oqilgan_soni + 1,
                progress: ((p.oqilgan_soni + 1) / p.kitoblar.length * 100).toFixed(0),
            } : p));
            toast.success("Kitob o'qildi! ✅");
        } catch (err) { toast.error("Xatolik"); }
    };

    const deletePlan = async (id) => {
        if (!confirm("Rejani o'chirishni xohlaysizmi?")) return;
        try {
            await api.delete(`/plans/${id}`);
            setPlans(plans.filter(p => p.id !== id));
            toast.success("Reja o'chirildi");
        } catch (err) { toast.error("Xatolik"); }
    };

    if (loading) return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-40 animate-shimmer rounded-xl" />)}</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <CalendarDays className="text-vercel-accent" size={24} />
                        O'qish rejasi
                    </h1>
                    <p className="text-vercel-text-secondary text-sm mt-1">Maqsadlaringizni belgilang va kuzating</p>
                </div>
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:bg-white transition-all">
                    <Plus size={16} /> Yangi reja
                </button>
            </div>

            {/* Reja yaratish formasi */}
            {showForm && (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-vercel-text">Yangi o'qish rejasi</h3>
                        <button onClick={() => setShowForm(false)} className="text-vercel-text-secondary hover:text-vercel-text"><X size={16} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })} placeholder="Reja nomi (masalan: 1-chorak rejasi)"
                            className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all" />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-vercel-text-secondary block mb-1">Boshlanish</label>
                                <input type="date" value={form.boshlanish_sana} onChange={e => setForm({ ...form, boshlanish_sana: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all" />
                            </div>
                            <div>
                                <label className="text-xs text-vercel-text-secondary block mb-1">Tugash</label>
                                <input type="date" value={form.tugash_sana} onChange={e => setForm({ ...form, tugash_sana: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-vercel-text-secondary block mb-2">Kitoblar ro'yxati</label>
                            {form.kitoblar.map((book, i) => (
                                <div key={i} className="flex gap-2 mb-2">
                                    <input value={book.kitob_nomi} onChange={e => updateBookField(i, 'kitob_nomi', e.target.value)} placeholder="Kitob nomi"
                                        className="flex-1 px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all" />
                                    <input value={book.muallif} onChange={e => updateBookField(i, 'muallif', e.target.value)} placeholder="Muallif"
                                        className="w-1/3 px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all" />
                                    {form.kitoblar.length > 1 && (
                                        <button type="button" onClick={() => removeBookField(i)} className="p-2 text-vercel-text-secondary hover:text-vercel-error"><X size={16} /></button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addBookField}
                                className="text-xs text-vercel-accent hover:underline">+ Kitob qo'shish</button>
                        </div>

                        <button type="submit" className="w-full py-2.5 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:bg-white transition-all">
                            Reja yaratish
                        </button>
                    </form>
                </div>
            )}

            {/* Rejalar ro'yxati */}
            {plans.length === 0 && !showForm ? (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-12 text-center">
                    <CalendarDays size={40} className="mx-auto text-vercel-text-secondary/30 mb-3" />
                    <p className="text-vercel-text-secondary">Hali o'qish rejangiz yo'q</p>
                    <p className="text-vercel-text-secondary/60 text-sm mt-1">Yangi reja yarating va kitob o'qishni rejalang</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-vercel-surface border border-vercel-border rounded-xl p-6 card-hover">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-base font-semibold text-vercel-text">{plan.nomi}</h3>
                                    <p className="text-xs text-vercel-text-secondary mt-0.5">
                                        {new Date(plan.boshlanish_sana).toLocaleDateString('uz-UZ')} — {new Date(plan.tugash_sana).toLocaleDateString('uz-UZ')}
                                    </p>
                                </div>
                                <button onClick={() => deletePlan(plan.id)} className="p-1.5 text-vercel-text-secondary hover:text-vercel-error"><Trash2 size={14} /></button>
                            </div>

                            {/* Progress */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-vercel-text-secondary mb-1">
                                    <span>{plan.oqilgan_soni || 0} / {plan.kitoblar?.length || 0} kitob</span>
                                    <span>{plan.progress}%</span>
                                </div>
                                <div className="w-full bg-vercel-bg rounded-full h-2 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${parseInt(plan.progress) >= 100 ? 'bg-vercel-success' : 'bg-vercel-accent'
                                        }`} style={{ width: `${plan.progress}%` }} />
                                </div>
                            </div>

                            {/* Kitoblar */}
                            <div className="space-y-1.5">
                                {plan.kitoblar?.map(book => (
                                    <div key={book.id} className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${book.oqilgan ? 'bg-vercel-success/5' : 'bg-vercel-bg hover:bg-vercel-surface-2'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={14} className={book.oqilgan ? 'text-vercel-success' : 'text-vercel-text-secondary'} />
                                            <span className={`text-sm ${book.oqilgan ? 'text-vercel-success line-through' : 'text-vercel-text'}`}>{book.kitob_nomi}</span>
                                            {book.muallif && <span className="text-xs text-vercel-text-secondary">• {book.muallif}</span>}
                                        </div>
                                        {!book.oqilgan && (
                                            <button onClick={() => completeBook(book.id, plan.id)}
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-vercel-success bg-vercel-success/10 border border-vercel-success/20 rounded hover:bg-vercel-success/20 transition-all">
                                                <CheckCircle size={12} /> O'qidim
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
