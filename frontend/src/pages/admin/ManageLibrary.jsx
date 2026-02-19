import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    BookOpen, Plus, Search, Edit3, Trash2, Upload, X, FileText,
    Calendar, HardDrive, Eye, Loader2, AlertTriangle,
    CheckCircle, BookMarked, Layers, Info
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

const CATEGORIES = [
    'Badiiy adabiyot', 'Sarguzasht', 'Detektiv', 'Fantastika', 'Diniy-ma\'rifiy',
    'Psixologiya', 'Biznes va Moliya', 'Tarix', 'Biografiya', 'Bolalar adabiyoti',
    'Matematika', 'Fizika', 'Kimyo', 'Biologiya', 'Geografiya',
    'Ona tili', 'Ingliz tili', 'Rus tili', 'Informatika',
    'Iqtisodiyot', 'Huquq', 'Falsafa', 'Jamiyat',
    'She\'riyat', 'Salomatlik', 'Texnologiya', 'San\'at va Madaniyat',
    'Hujjatli', 'Boshqa'
];

const categoryColors = {
    'Badiiy adabiyot': '#F472B6',
    'Sarguzasht': '#FB923C',
    'Detektiv': '#60A5FA',
    'Fantastika': '#818CF8',
    'Diniy-ma\'rifiy': '#34D399',
    'Psixologiya': '#A78BFA',
    'Biznes va Moliya': '#FBBF24',
    'Tarix': '#B45309',
    'Biografiya': '#EC4899',
    'Bolalar adabiyoti': '#F87171',
    'Matematika': '#3B82F6',
    'Fizika': '#EF4444',
    'Kimyo': '#14B8A6',
    'Biologiya': '#22C55E',
    'Geografiya': '#EAB308',
    'Ona tili': '#DB2777',
    'Ingliz tili': '#0EA5E9',
    'Rus tili': '#6366F1',
    'Informatika': '#06B6D4',
    'Iqtisodiyot': '#854D0E',
    'Huquq': '#7C3AED',
    'Falsafa': '#71717A',
    'Jamiyat': '#78716C',
    'She\'riyat': '#E879F9',
    'Salomatlik': '#84CC16',
    'Texnologiya': '#0284C7',
    'San\'at va Madaniyat': '#D946EF',
    'Hujjatli': '#64748B',
    'Boshqa': '#9CA3AF'
};

export default function ManageLibrary() {
    const [books, setBooks] = useState([]);
    const [kategoriyalar, setKategoriyalar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const [formData, setFormData] = useState({
        nomi: '',
        tavsif: '',
        kategoriya: 'Badiiy adabiyot'
    });
    const [pdfFile, setPdfFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchBooks();
    }, [selectedCategory]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (selectedCategory !== 'all') params.kategoriya = selectedCategory;
            const res = await api.get('/library', { params });
            setBooks(res.data.kitoblar);
            if (res.data.kategoriyalar) setKategoriyalar(res.data.kategoriyalar);
        } catch (err) {
            toast.error("Kutubxona ma'lumotlarini yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ nomi: '', tavsif: '', kategoriya: 'Matematika' });
        setPdfFile(null);
        setEditingBook(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (book) => {
        setEditingBook(book);
        setFormData({
            nomi: book.nomi,
            tavsif: book.tavsif || '',
            kategoriya: book.kategoriya
        });
        setPdfFile(null);
        setShowModal(true);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else {
            toast.error('Faqat PDF fayl qabul qilinadi');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
        } else if (file) {
            toast.error('Faqat PDF fayl qabul qilinadi');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nomi.trim()) {
            toast.error('Kitob nomini kiriting');
            return;
        }
        if (!editingBook && !pdfFile) {
            toast.error('PDF faylni yuklang');
            return;
        }
        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('nomi', formData.nomi.trim());
            data.append('tavsif', formData.tavsif.trim());
            data.append('kategoriya', formData.kategoriya);
            if (pdfFile) {
                data.append('pdf', pdfFile);
            }
            if (editingBook) {
                await api.put(`/library/${editingBook.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Kitob yangilandi');
            } else {
                await api.post('/library', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Kitob muvaffaqiyatli yuklandi');
            }
            setShowModal(false);
            resetForm();
            fetchBooks();
        } catch (err) {
            toast.error(err.response?.data?.xabar || 'Xato yuz berdi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setDeleting(id);
            await api.delete(`/library/${id}`);
            toast.success("Kitob o'chirildi");
            setShowDeleteConfirm(null);
            fetchBooks();
        } catch (err) {
            toast.error(err.response?.data?.xabar || "O'chirishda xato");
        } finally {
            setDeleting(null);
        }
    };

    const totalSize = books.reduce((sum, b) => sum + (b.fayl_hajmi || 0), 0);

    return (
        <div className="space-y-5 pb-8 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vercel-surface via-vercel-surface to-vercel-surface-2 border border-vercel-border/60 p-6">
                <div className="absolute inset-0 dot-pattern opacity-30" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/[0.03] rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/10">
                            <BookOpen size={22} className="text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-vercel-text tracking-tight">Kutubxona boshqaruvi</h1>
                            <p className="text-sm text-vercel-text-secondary mt-0.5 text-xs">
                                Kitoblarni yuklash, tahrirlash va boshqarish
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-vercel-accent text-black text-sm font-semibold rounded-xl hover:bg-vercel-accent/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-vercel-accent/15"
                    >
                        <Plus size={16} />
                        Kitob yuklash
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: BookMarked, color: 'indigo', value: books.length, label: 'Jami kitoblar' },
                    { icon: Layers, color: 'purple', value: kategoriyalar.length, label: 'Kategoriyalar' },
                    { icon: FileText, color: 'cyan', value: 'PDF', label: 'Fayl formati' },
                    { icon: HardDrive, color: 'emerald', value: formatFileSize(totalSize), label: 'Jami hajm' },
                ].map(({ icon: Icon, color, value, label }, idx) => (
                    <div key={label} className={`bg-vercel-surface border border-vercel-border/60 rounded-2xl p-4 group transition-all duration-300 hover:-translate-y-0.5`}
                        style={{ animationDelay: `${idx * 60}ms` }}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl bg-${color}-500/10 border border-${color}-500/10`}>
                                <Icon size={16} className={`text-${color}-400`} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-vercel-text">{value}</p>
                                <p className="text-[11px] text-vercel-text-secondary">{label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary/50" />
                    <input
                        type="text"
                        placeholder="Kitob qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-vercel-surface border border-vercel-border/60 rounded-xl text-sm text-vercel-text placeholder-vercel-text-secondary/40 focus:outline-none focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 transition-all"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 bg-vercel-surface border border-vercel-border/60 rounded-xl text-sm text-vercel-text focus:outline-none focus:border-vercel-accent/50 cursor-pointer transition-all"
                >
                    <option value="all">Barcha kategoriyalar</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Books Table */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 animate-shimmer rounded-2xl" />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-vercel-surface border border-vercel-border/60 rounded-2xl">
                    <div className="p-4 rounded-2xl bg-vercel-surface-2/50 mb-4">
                        <BookOpen size={36} className="text-vercel-text-secondary/20" />
                    </div>
                    <h3 className="text-base font-semibold text-vercel-text mb-1">Kitoblar yo'q</h3>
                    <p className="text-sm text-vercel-text-secondary mb-5">
                        Kutubxonaga birinchi kitobni qo'shing
                    </p>
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-vercel-accent text-black text-sm font-semibold rounded-xl hover:bg-vercel-accent/90 transition-all active:scale-[0.98]"
                    >
                        <Plus size={15} /> Kitob yuklash
                    </button>
                </div>
            ) : (
                <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-vercel-border/50 bg-vercel-surface-2/30">
                                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">#</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Kitob</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider hidden sm:table-cell">Kategoriya</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider hidden md:table-cell">Hajmi</th>
                                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider hidden lg:table-cell">Yuklangan</th>
                                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-vercel-border/30">
                                {books.map((book, index) => (
                                    <tr key={book.id} className="table-row-hover group">
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary/50">{index + 1}</td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/10">
                                                    <FileText size={15} className="text-indigo-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-vercel-text truncate max-w-xs">{book.nomi}</p>
                                                    {book.tavsif && (
                                                        <p className="text-[11px] text-vercel-text-secondary/60 truncate max-w-xs">{book.tavsif}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 hidden sm:table-cell">
                                            <span
                                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                                                style={{
                                                    background: `${categoryColors[book.kategoriya] || '#50E3C2'}10`,
                                                    color: categoryColors[book.kategoriya] || '#50E3C2',
                                                    border: `1px solid ${categoryColors[book.kategoriya] || '#50E3C2'}15`
                                                }}
                                            >
                                                {book.kategoriya}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary/60 hidden md:table-cell">
                                            {formatFileSize(book.fayl_hajmi)}
                                        </td>
                                        <td className="px-5 py-3.5 hidden lg:table-cell">
                                            <div className="flex items-center gap-1.5 text-[11px] text-vercel-text-secondary/50">
                                                <Calendar size={11} />
                                                {formatDate(book.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a
                                                    href={`${API_BASE}/library/${book.id}/file?token=${localStorage.getItem('token')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-vercel-text-secondary hover:text-cyan-400 hover:bg-cyan-400/[0.06] rounded-lg transition-all"
                                                    title="Ko'rish"
                                                >
                                                    <Eye size={14} />
                                                </a>
                                                <button
                                                    onClick={() => openEditModal(book)}
                                                    className="p-2 text-vercel-text-secondary hover:text-vercel-accent hover:bg-vercel-accent/[0.06] rounded-lg transition-all"
                                                    title="Tahrirlash"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(book)}
                                                    className="p-2 text-vercel-text-secondary hover:text-red-400 hover:bg-red-400/[0.06] rounded-lg transition-all"
                                                    title="O'chirish"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => !submitting && setShowModal(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative z-10 w-full max-w-lg mx-4 bg-vercel-surface border border-vercel-border/60 rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
                        onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-vercel-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-vercel-accent/10 rounded-xl border border-vercel-accent/10">
                                    {editingBook ? <Edit3 size={15} className="text-vercel-accent" /> : <Upload size={15} className="text-vercel-accent" />}
                                </div>
                                <h2 className="text-base font-semibold text-vercel-text">
                                    {editingBook ? 'Kitobni tahrirlash' : 'Yangi kitob yuklash'}
                                </h2>
                            </div>
                            <button
                                onClick={() => !submitting && setShowModal(false)}
                                className="p-2 text-vercel-text-secondary hover:text-vercel-text hover:bg-vercel-surface-2 rounded-xl transition-all"
                                disabled={submitting}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-medium text-vercel-text-secondary mb-1.5 uppercase tracking-wider">
                                    Kitob nomi <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nomi}
                                    onChange={(e) => setFormData({ ...formData, nomi: e.target.value })}
                                    placeholder="Masalan: Algebra 9-sinf"
                                    className="w-full px-4 py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-sm text-vercel-text placeholder-vercel-text-secondary/40 focus:outline-none focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-vercel-text-secondary mb-1.5 uppercase tracking-wider">Tavsif</label>
                                <textarea
                                    value={formData.tavsif}
                                    onChange={(e) => setFormData({ ...formData, tavsif: e.target.value })}
                                    placeholder="Kitob haqida qisqacha ma'lumot..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-sm text-vercel-text placeholder-vercel-text-secondary/40 focus:outline-none focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 transition-all resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-vercel-text-secondary mb-1.5 uppercase tracking-wider">
                                    Kategoriya <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={formData.kategoriya}
                                    onChange={(e) => setFormData({ ...formData, kategoriya: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-sm text-vercel-text focus:outline-none focus:border-vercel-accent/50 cursor-pointer transition-all"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* PDF Upload */}
                            <div>
                                <label className="block text-[11px] font-medium text-vercel-text-secondary mb-1.5 uppercase tracking-wider">
                                    PDF Fayl {!editingBook && <span className="text-red-400">*</span>}
                                    {editingBook && <span className="text-vercel-text-secondary/50 normal-case tracking-normal ml-1">(ixtiyoriy)</span>}
                                </label>

                                <div
                                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragActive
                                        ? 'border-vercel-accent bg-vercel-accent/[0.03]'
                                        : pdfFile
                                            ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                                            : 'border-vercel-border/40 hover:border-vercel-accent/20 hover:bg-vercel-surface-2/20'
                                        }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />

                                    {pdfFile ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                                                <CheckCircle size={18} className="text-emerald-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-vercel-text truncate max-w-xs">{pdfFile.name}</p>
                                                <p className="text-[11px] text-vercel-text-secondary">{formatFileSize(pdfFile.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                                                className="p-1.5 text-vercel-text-secondary hover:text-red-400 hover:bg-red-400/[0.06] rounded-lg transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={22} className={`mx-auto mb-2 ${dragActive ? 'text-vercel-accent' : 'text-vercel-text-secondary/40'}`} />
                                            <p className="text-sm text-vercel-text-secondary">
                                                <span className="text-vercel-accent font-medium">Fayl tanlash</span> yoki shu yerga tashlang
                                            </p>
                                            <p className="text-[11px] text-vercel-text-secondary/40 mt-1">
                                                Faqat PDF • Maks 50MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => !submitting && setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-vercel-text-secondary bg-vercel-surface-2 hover:bg-vercel-border/30 rounded-xl transition-all border border-vercel-border/40"
                                    disabled={submitting}
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-vercel-accent text-black rounded-xl hover:bg-vercel-accent/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {submitting ? (
                                        <><Loader2 size={15} className="animate-spin" /> Yuklanmoqda...</>
                                    ) : editingBook ? (
                                        <><CheckCircle size={15} /> Saqlash</>
                                    ) : (
                                        <><Upload size={15} /> Yuklash</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div className="relative z-10 w-full max-w-sm mx-4 bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6 shadow-2xl animate-scale-in"
                        onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 rounded-2xl bg-red-500/[0.08] border border-red-500/10 mb-4">
                                <AlertTriangle size={22} className="text-red-400" />
                            </div>
                            <h3 className="text-base font-semibold text-vercel-text mb-1">Kitobni o'chirish</h3>
                            <p className="text-sm text-vercel-text-secondary mb-1">
                                <strong className="text-vercel-text">"{showDeleteConfirm.nomi}"</strong>
                            </p>
                            <p className="text-xs text-vercel-text-secondary/60 mb-6">
                                Bu amalni qaytarib bo'lmaydi. PDF fayl ham o'chiriladi.
                            </p>

                            <div className="flex items-center gap-3 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-vercel-text-secondary bg-vercel-surface-2 hover:bg-vercel-border/30 rounded-xl transition-all border border-vercel-border/40"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm.id)}
                                    disabled={deleting === showDeleteConfirm.id}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 active:scale-[0.98]"
                                >
                                    {deleting === showDeleteConfirm.id ? (
                                        <><Loader2 size={14} className="animate-spin" /> O'chirilmoqda</>
                                    ) : (
                                        <><Trash2 size={14} /> O'chirish</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
