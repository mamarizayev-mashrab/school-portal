import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BookOpen, Trash2, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data);
        } catch (err) {
            toast.error("Kitoblarni yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const deleteBook = async (id) => {
        if (!confirm("Bu kitobni o'chirishni xohlaysizmi?")) return;
        try {
            await api.delete(`/books/${id}`);
            setBooks(books.filter(b => b.id !== id));
            toast.success("Kitob o'chirildi");
        } catch (err) {
            toast.error("O'chirishda xato");
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 animate-shimmer rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text">Mening kitoblarim</h1>
                    <p className="text-vercel-text-secondary text-sm mt-1">Jami: {books.length} ta kitob</p>
                </div>
            </div>

            {books.length === 0 ? (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-12 text-center">
                    <BookOpen size={40} className="mx-auto text-vercel-text-secondary mb-4" />
                    <h3 className="text-lg font-medium text-vercel-text">Hali kitob qo'shilmagan</h3>
                    <p className="text-vercel-text-secondary text-sm mt-2">Birinchi kitobingizni qo'shing!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {books.map((book) => (
                        <div key={book.id} className="bg-vercel-surface border border-vercel-border rounded-xl p-5 card-hover">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-base font-semibold text-vercel-text truncate">{book.kitob_nomi}</h3>
                                        {book.xulosa_tasdiqlangan && (
                                            <span className="px-2 py-0.5 text-xs bg-vercel-success/10 text-vercel-success border border-vercel-success/20 rounded-full whitespace-nowrap">
                                                Tasdiqlangan
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-vercel-text-secondary">{book.muallif}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-vercel-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <FileText size={12} /> {book.sahifalar_soni} sahifa
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} /> {new Date(book.oqilgan_sana).toLocaleDateString('uz-UZ')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-vercel-text-secondary/80 mt-3 line-clamp-2">{book.xulosa}</p>
                                </div>
                                <button
                                    onClick={() => deleteBook(book.id)}
                                    className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/5 transition-all shrink-0"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
