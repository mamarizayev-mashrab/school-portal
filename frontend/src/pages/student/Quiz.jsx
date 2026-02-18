import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ClipboardCheck, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quiz() {
    const [books, setBooks] = useState([]);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data);
        } catch (err) {
            toast.error("Xatolik");
        } finally {
            setLoading(false);
        }
    };

    const generateQuiz = async (logId) => {
        setGenerating(true);
        try {
            const res = await api.post(`/quizzes/generate/${logId}`);
            const quiz = res.data.quiz;
            const savollar = typeof quiz.savollar === 'string' ? JSON.parse(quiz.savollar) : quiz.savollar;
            setActiveQuiz({ ...quiz, savollar });
            setAnswers({});
            setResult(null);
            toast.success("Test yaratildi!");
        } catch (err) {
            toast.error(err.response?.data?.xabar || "Test yaratishda xato");
        } finally {
            setGenerating(false);
        }
    };

    const submitQuiz = async () => {
        try {
            const javoblar = activeQuiz.savollar.map((_, i) => answers[i] || '');
            const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, { javoblar });
            setResult(res.data.natija);
            toast.success(`Natija: ${res.data.natija.ball.toFixed(0)}%`);
        } catch (err) {
            toast.error("Javob topshirishda xato");
        }
    };

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 animate-shimmer rounded-xl" />)}</div>;
    }

    // Agar test ochiq bo'lsa
    if (activeQuiz) {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in">
                <h1 className="text-2xl font-bold text-vercel-text mb-6 flex items-center gap-3">
                    <ClipboardCheck className="text-vercel-accent" size={24} />
                    Test
                </h1>

                {result ? (
                    <div className="bg-vercel-surface border border-vercel-border rounded-xl p-8 text-center">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${result.ball >= 70 ? 'bg-vercel-success/10' : 'bg-vercel-error/10'}`}>
                            {result.ball >= 70 ? <CheckCircle size={40} className="text-vercel-success" /> : <XCircle size={40} className="text-vercel-error" />}
                        </div>
                        <h2 className="text-3xl font-bold text-vercel-text">{result.ball.toFixed(0)}%</h2>
                        <p className="text-vercel-text-secondary mt-2">
                            {result.togri_javoblar} / {result.jami_savollar} to'g'ri javob
                        </p>
                        <button onClick={() => { setActiveQuiz(null); setResult(null); }}
                            className="mt-6 px-6 py-2.5 bg-vercel-surface-2 border border-vercel-border rounded-lg text-sm text-vercel-text hover:bg-vercel-border transition-all">
                            Ortga qaytish
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeQuiz.savollar.map((savol, idx) => (
                            <div key={savol.id} className="bg-vercel-surface border border-vercel-border rounded-xl p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-xs font-mono px-2 py-1 bg-vercel-surface-2 rounded text-vercel-text-secondary">
                                        {savol.turi === 'mcq' ? 'Tanlash' : savol.turi === 'tf' ? "T/N" : 'Qisqa'}
                                    </span>
                                    <p className="text-sm text-vercel-text flex-1">{savol.savol}</p>
                                </div>

                                {savol.turi === 'mcq' && savol.variantlar && (
                                    <div className="space-y-2 ml-8">
                                        {savol.variantlar.map((v, vi) => (
                                            <label key={vi} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm
                        ${answers[idx] === v ? 'bg-vercel-accent/10 border border-vercel-accent/30' : 'hover:bg-vercel-surface-2 border border-transparent'}`}>
                                                <input type="radio" name={`q-${idx}`} value={v} checked={answers[idx] === v}
                                                    onChange={() => setAnswers({ ...answers, [idx]: v })}
                                                    className="accent-vercel-accent" />
                                                <span className="text-vercel-text">{v}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {savol.turi === 'tf' && (
                                    <div className="flex gap-3 ml-8">
                                        {["to'g'ri", "noto'g'ri"].map(v => (
                                            <label key={v} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all text-sm
                        ${answers[idx] === v ? 'bg-vercel-accent/10 border border-vercel-accent/30' : 'hover:bg-vercel-surface-2 border border-transparent'}`}>
                                                <input type="radio" name={`q-${idx}`} value={v} checked={answers[idx] === v}
                                                    onChange={() => setAnswers({ ...answers, [idx]: v })}
                                                    className="accent-vercel-accent" />
                                                <span className="text-vercel-text capitalize">{v}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {savol.turi === 'short' && (
                                    <div className="ml-8">
                                        <input type="text" value={answers[idx] || ''} placeholder="Javobingizni yozing..."
                                            onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                                            className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent transition-all" />
                                    </div>
                                )}
                            </div>
                        ))}

                        <button onClick={submitQuiz}
                            className="w-full py-2.5 bg-vercel-text text-vercel-bg rounded-lg font-medium text-sm hover:bg-white transition-all">
                            Javoblarni topshirish
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-vercel-text mb-2">Test topshirish</h1>
            <p className="text-vercel-text-secondary text-sm mb-8">Kitob asosida test yarating va o'z bilimingizni tekshiring</p>

            {books.length === 0 ? (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-12 text-center">
                    <ClipboardCheck size={40} className="mx-auto text-vercel-text-secondary mb-4" />
                    <p className="text-vercel-text">Avval kitob qo'shishingiz kerak</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {books.map(book => (
                        <div key={book.id} className="bg-vercel-surface border border-vercel-border rounded-xl p-5 flex items-center justify-between card-hover">
                            <div>
                                <h3 className="text-sm font-medium text-vercel-text">{book.kitob_nomi}</h3>
                                <p className="text-xs text-vercel-text-secondary mt-0.5">{book.muallif}</p>
                            </div>
                            <button onClick={() => generateQuiz(book.id)} disabled={generating}
                                className="flex items-center gap-2 px-4 py-2 bg-vercel-accent/10 text-vercel-accent border border-vercel-accent/20 rounded-lg text-sm hover:bg-vercel-accent/20 transition-all disabled:opacity-50">
                                <PlayCircle size={16} />
                                {generating ? 'Yaratilmoqda...' : 'Test boshlash'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
