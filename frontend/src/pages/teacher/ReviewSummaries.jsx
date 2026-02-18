import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { CheckCircle, XCircle, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewSummaries() {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummaries();
    }, []);

    const fetchSummaries = async () => {
        try {
            const res = await api.get('/admin/summaries/pending');
            setSummaries(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const approve = async (id) => {
        try {
            await api.put(`/admin/summaries/${id}/approve`);
            setSummaries(summaries.filter(s => s.id !== id));
            toast.success("Xulosa tasdiqlandi");
        } catch (err) {
            toast.error("Tasdiqlashda xato");
        }
    };

    if (loading) return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 animate-shimmer rounded-xl" />)}</div>;

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                    <ClipboardCheck className="text-vercel-accent" size={24} />
                    Xulosalarni tasdiqlash
                </h1>
                <p className="text-vercel-text-secondary text-sm mt-1">
                    {summaries.length} ta tasdiqlanmagan xulosa
                </p>
            </div>

            {summaries.length === 0 ? (
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-12 text-center">
                    <CheckCircle size={40} className="mx-auto text-vercel-success mb-4" />
                    <h3 className="text-lg font-medium text-vercel-text">Barcha xulosalar tasdiqlangan</h3>
                    <p className="text-vercel-text-secondary text-sm mt-2">Kutilayotgan xulosalar yo'q</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {summaries.map((item) => (
                        <div key={item.id} className="bg-vercel-surface border border-vercel-border rounded-xl p-6 card-hover">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <h3 className="text-base font-semibold text-vercel-text">{item.kitob_nomi}</h3>
                                    <p className="text-sm text-vercel-text-secondary">{item.muallif}</p>
                                    <p className="text-xs text-vercel-text-secondary mt-1">
                                        {item.ism} {item.familiya} • {item.sinf}
                                    </p>
                                </div>
                                <button onClick={() => approve(item.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-vercel-success/10 text-vercel-success border border-vercel-success/20 rounded-lg text-sm hover:bg-vercel-success/20 transition-all shrink-0">
                                    <CheckCircle size={16} />
                                    Tasdiqlash
                                </button>
                            </div>

                            <div className="bg-vercel-bg border border-vercel-border rounded-lg p-4 mt-3">
                                <p className="text-sm text-vercel-text-secondary leading-relaxed">{item.xulosa}</p>
                            </div>

                            <div className="flex items-center gap-4 mt-3 text-xs text-vercel-text-secondary">
                                <span>{item.sahifalar_soni} sahifa</span>
                                <span>•</span>
                                <span>{new Date(item.oqilgan_sana).toLocaleDateString('uz-UZ')}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
