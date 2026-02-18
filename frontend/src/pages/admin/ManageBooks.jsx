import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Library, Plus, Trash2, Edit3, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editBook, setEditBook] = useState(null);
    const [form, setForm] = useState({ nomi: '', muallif: '', janr: '', sahifalar_soni: '', tavsif: '' });

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/admin/catalog');
            setBooks(res.data);
        } catch (err) {
            toast.error("Kitoblarni yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...form, sahifalar_soni: form.sahifalar_soni ? parseInt(form.sahifalar_soni) : null };
            if (editBook) {
                await api.put(`/admin/catalog/${editBook.id}`, data);
                setBooks(books.map(b => b.id === editBook.id ? { ...b, ...data } : b));
                toast.success("Kitob yangilandi");
            } else {
                const res = await api.post('/admin/catalog', data);
                setBooks([res.data.kitob, ...books]);
                toast.success("Kitob qo'shildi");
            }
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.xabar || "Xatolik yuz berdi");
        }
    };

    const deleteBook = async (id) => {
        if (!confirm("Bu kitobni o'chirishni xohlaysizmi?")) return;
        try {
            await api.delete(`/admin/catalog/${id}`);
            setBooks(books.filter(b => b.id !== id));
            toast.success("Kitob o'chirildi");
        } catch (err) {
            toast.error("O'chirishda xato");
        }
    };

    const startEdit = (book) => {
        setEditBook(book);
        setForm({
            nomi: book.nomi, muallif: book.muallif,
            janr: book.janr || '', sahifalar_soni: book.sahifalar_soni || '',
            tavsif: book.tavsif || '',
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditBook(null);
        setForm({ nomi: '', muallif: '', janr: '', sahifalar_soni: '', tavsif: '' });
    };

    if (loading) return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 animate-shimmer rounded-xl" />)}</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <Library className="text-vercel-accent" size={24} />
                        Kitoblar katalogi
                    </h1>
                    <p className="text-vercel-text-secondary text-sm mt-1">Jami: {books.length} ta kitob</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:bg-white transition-all">
                    <Plus size={16} /> Yangi kitob
                </button>
            </div>

            {/* Form modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6 w-full max-w-lg animate-slide-up">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-vercel-text">
                                {editBook ? 'Kitobni tahrirlash' : "Yangi kitob qo'shish"}
                            </h3>
                            <button onClick={resetForm} className="p-1 text-vercel-text-secondary hover:text-vercel-text"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input name="nomi" value={form.nomi} onChange={handleChange} required placeholder="Kitob nomi"
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                            <input name="muallif" value={form.muallif} onChange={handleChange} required placeholder="Muallif"
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                            <div className="grid grid-cols-2 gap-3">
                                <input name="janr" value={form.janr} onChange={handleChange} placeholder="Janr (ixtiyoriy)"
                                    className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                                <input name="sahifalar_soni" type="number" value={form.sahifalar_soni} onChange={handleChange} placeholder="Sahifalar"
                                    className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                            </div>
                            <textarea name="tavsif" value={form.tavsif} onChange={handleChange} placeholder="Tavsif (ixtiyoriy)" rows={3}
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all resize-none" />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={resetForm} className="flex-1 py-2.5 bg-vercel-surface-2 border border-vercel-border rounded-lg text-sm text-vercel-text hover:bg-vercel-border transition-all">
                                    Bekor qilish
                                </button>
                                <button type="submit" className="flex-1 py-2.5 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:bg-white transition-all flex items-center justify-center gap-2">
                                    <Save size={14} /> {editBook ? 'Saqlash' : "Qo'shish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Book list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {books.map(book => (
                    <div key={book.id} className="bg-vercel-surface border border-vercel-border rounded-xl p-5 card-hover">
                        <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-vercel-text truncate">{book.nomi}</h3>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">{book.muallif}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button onClick={() => startEdit(book)}
                                    className="p-1.5 rounded-lg text-vercel-text-secondary hover:text-vercel-accent hover:bg-vercel-accent/5 transition-all">
                                    <Edit3 size={13} />
                                </button>
                                <button onClick={() => deleteBook(book.id)}
                                    className="p-1.5 rounded-lg text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/5 transition-all">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                        {book.janr && (
                            <span className="inline-block px-2 py-0.5 text-xs bg-vercel-surface-2 text-vercel-text-secondary border border-vercel-border rounded-full mt-1">{book.janr}</span>
                        )}
                        {book.sahifalar_soni && (
                            <p className="text-xs text-vercel-text-secondary mt-2">{book.sahifalar_soni} sahifa</p>
                        )}
                        {book.tavsif && (
                            <p className="text-xs text-vercel-text-secondary/70 mt-2 line-clamp-2">{book.tavsif}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
