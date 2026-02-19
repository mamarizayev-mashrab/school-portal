import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    BookOpen, Search, Filter, Download, Eye, Grid3X3, List,
    FileText, Calendar, HardDrive, X, ChevronDown, Loader2,
    BookMarked, Library as LibraryIcon, Layers, ArrowUpDown
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// PDF hajmini formatlash
function formatFileSize(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Sanani formatlash
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Bugun';
    if (days === 1) return 'Kecha';
    if (days < 7) return `${days} kun oldin`;

    return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Kategoriya ranglari
const CATEGORIES = [
    'Badiiy adabiyot', 'Sarguzasht', 'Detektiv', 'Fantastika', 'Diniy-ma\'rifiy',
    'Psixologiya', 'Biznes va Moliya', 'Biografiya', 'Bolalar adabiyoti',
    'She\'riyat', 'Matematika', 'Fizika', 'Kimyo', 'Biologiya', 'Tarix', 'Geografiya',
    'Ona tili', 'Ingliz tili', 'Rus tili', 'Informatika',
    'Iqtisodiyot', 'Huquq', 'Falsafa', 'Jamiyat',
    'San\'at va Madaniyat', 'Salomatlik', 'Texnologiya', 'Hujjatli', 'Boshqa'
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

function getCategoryStyle(category) {
    const color = categoryColors[category] || '#50E3C2';
    return {
        bg: color + '1A',
        text: color,
        border: color + '33'
    };
}

// Gradient ranglari kitob kartalari uchun
const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f5576c 0%, #ff6a00 100%)',
    'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)',
];

export default function Library() {
    const { user } = useAuth();
    const [books, setBooks] = useState([]);
    const [kategoriyalar, setKategoriyalar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [showPdfViewer, setShowPdfViewer] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchBooks();
    }, [selectedCategory]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchBooks();
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowCategoryDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            console.error('Kutubxona xatosi:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (book) => {
        setSelectedBook(book);
        setShowPdfViewer(true);
        setPdfLoading(true);
    };

    const handleDownload = async (book) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/library/${book.id}/file?download=true`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${book.nomi}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Yuklab olish xatosi:', err);
        }
    };

    const sortedBooks = [...books].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'name') return a.nomi.localeCompare(b.nomi);
        if (sortBy === 'size') return (b.fayl_hajmi || 0) - (a.fayl_hajmi || 0);
        return 0;
    });

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <BookOpen size={22} className="text-white" />
                        </div>
                        Kutubxona
                    </h1>
                    <p className="text-sm text-vercel-text-secondary mt-1">
                        {books.length} ta kitob mavjud
                    </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-vercel-surface border border-vercel-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid'
                                ? 'bg-vercel-accent/10 text-vercel-accent'
                                : 'text-vercel-text-secondary hover:text-vercel-text'
                                }`}
                        >
                            <Grid3X3 size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list'
                                ? 'bg-vercel-accent/10 text-vercel-accent'
                                : 'text-vercel-text-secondary hover:text-vercel-text'
                                }`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary" />
                    <input
                        type="text"
                        placeholder="Kitob nomini qidirish..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-vercel-surface border border-vercel-border rounded-lg text-sm text-vercel-text placeholder-vercel-text-secondary focus:outline-none focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 transition-all"
                    />
                </div>

                {/* Category Filter */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-vercel-surface border border-vercel-border rounded-lg text-sm text-vercel-text hover:border-vercel-accent/30 transition-all min-w-[180px]"
                    >
                        <Filter size={16} className="text-vercel-text-secondary" />
                        <span className="flex-1 text-left">
                            {selectedCategory === 'all' ? 'Barcha kategoriyalar' : selectedCategory}
                        </span>
                        <ChevronDown size={14} className={`text-vercel-text-secondary transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showCategoryDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-vercel-surface border border-vercel-border rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                onClick={() => { setSelectedCategory('all'); setShowCategoryDropdown(false); }}
                                className={`w-full px-4 py-2.5 text-sm text-left hover:bg-vercel-surface-2 transition-colors ${selectedCategory === 'all' ? 'text-vercel-accent bg-vercel-accent/5' : 'text-vercel-text'
                                    }`}
                            >
                                Barcha kategoriyalar
                            </button>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); }}
                                    className={`w-full px-4 py-2.5 text-sm text-left hover:bg-vercel-surface-2 transition-colors flex items-center gap-2 ${selectedCategory === cat ? 'text-vercel-accent bg-vercel-accent/5' : 'text-vercel-text'
                                        }`}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ background: getCategoryStyle(cat).text }}
                                    />
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2.5 bg-vercel-surface border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent/50 cursor-pointer"
                >
                    <option value="newest">Eng yangi</option>
                    <option value="oldest">Eng eski</option>
                    <option value="name">Nomi bo'yicha</option>
                    <option value="size">Hajmi bo'yicha</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                            <BookMarked size={18} className="text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-vercel-text">{books.length}</p>
                            <p className="text-xs text-vercel-text-secondary">Jami kitoblar</p>
                        </div>
                    </div>
                </div>
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Layers size={18} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-vercel-text">{kategoriyalar.length}</p>
                            <p className="text-xs text-vercel-text-secondary">Kategoriyalar</p>
                        </div>
                    </div>
                </div>
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10">
                            <FileText size={18} className="text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-vercel-text">PDF</p>
                            <p className="text-xs text-vercel-text-secondary">Fayl formati</p>
                        </div>
                    </div>
                </div>
                <div className="bg-vercel-surface border border-vercel-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <HardDrive size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-vercel-text">
                                {formatFileSize(books.reduce((sum, b) => sum + (b.fayl_hajmi || 0), 0))}
                            </p>
                            <p className="text-xs text-vercel-text-secondary">Jami hajm</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden">
                            <div className="h-40 animate-shimmer" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 w-3/4 animate-shimmer rounded" />
                                <div className="h-3 w-1/2 animate-shimmer rounded" />
                                <div className="h-3 w-full animate-shimmer rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : sortedBooks.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="p-4 rounded-2xl bg-vercel-surface border border-vercel-border mb-4">
                        <BookOpen size={40} className="text-vercel-text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-vercel-text mb-1">Kitoblar topilmadi</h3>
                    <p className="text-sm text-vercel-text-secondary">
                        {search ? `"${search}" bo'yicha natija topilmadi` : 'Kutubxonada hozircha kitoblar yo\'q'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedBooks.map((book, index) => (
                        <div
                            key={book.id}
                            className="group bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden hover:border-vercel-accent/30 transition-all duration-300 hover:shadow-lg hover:shadow-vercel-accent/5 hover:-translate-y-0.5"
                        >
                            {/* Book Cover Gradient */}
                            <div
                                className="h-40 relative overflow-hidden"
                                style={{ background: gradients[index % gradients.length] }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <BookOpen size={80} className="text-white" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                {/* Category Badge */}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className="px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                                        style={{
                                            background: getCategoryStyle(book.kategoriya).bg,
                                            color: getCategoryStyle(book.kategoriya).text,
                                            border: `1px solid ${getCategoryStyle(book.kategoriya).border}`,
                                        }}
                                    >
                                        {book.kategoriya}
                                    </span>
                                </div>

                                {/* File size badge */}
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/40 text-white/80 backdrop-blur-sm">
                                        {formatFileSize(book.fayl_hajmi)}
                                    </span>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={() => handleView(book)}
                                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white transition-all duration-200 hover:scale-105"
                                        title="Ko'rish"
                                    >
                                        <Eye size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(book)}
                                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white transition-all duration-200 hover:scale-105"
                                        title="Yuklab olish"
                                    >
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Book Info */}
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-vercel-text line-clamp-1 mb-1">
                                    {book.nomi}
                                </h3>
                                {book.tavsif && (
                                    <p className="text-xs text-vercel-text-secondary line-clamp-2 mb-3">
                                        {book.tavsif}
                                    </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-vercel-text-secondary">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {formatDate(book.created_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FileText size={12} />
                                        PDF
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-vercel-border">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Kitob</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-vercel-text-secondary uppercase tracking-wider hidden sm:table-cell">Kategoriya</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-vercel-text-secondary uppercase tracking-wider hidden md:table-cell">Hajmi</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-vercel-text-secondary uppercase tracking-wider hidden md:table-cell">Sana</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-vercel-border">
                                {sortedBooks.map((book, index) => (
                                    <tr key={book.id} className="hover:bg-vercel-surface-2 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: gradients[index % gradients.length] }}
                                                >
                                                    <BookOpen size={16} className="text-white/70" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-vercel-text truncate">{book.nomi}</p>
                                                    {book.tavsif && (
                                                        <p className="text-xs text-vercel-text-secondary truncate max-w-xs">{book.tavsif}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    background: getCategoryStyle(book.kategoriya).bg,
                                                    color: getCategoryStyle(book.kategoriya).text,
                                                }}
                                            >
                                                {book.kategoriya}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-vercel-text-secondary hidden md:table-cell">
                                            {formatFileSize(book.fayl_hajmi)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-vercel-text-secondary hidden md:table-cell">
                                            {formatDate(book.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(book)}
                                                    className="p-2 text-vercel-text-secondary hover:text-vercel-accent hover:bg-vercel-accent/5 rounded-lg transition-all"
                                                    title="Ko'rish"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(book)}
                                                    className="p-2 text-vercel-text-secondary hover:text-emerald-400 hover:bg-emerald-400/5 rounded-lg transition-all"
                                                    title="Yuklab olish"
                                                >
                                                    <Download size={16} />
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

            {/* PDF Viewer Modal */}
            {showPdfViewer && selectedBook && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowPdfViewer(false)}
                    />

                    {/* Modal */}
                    <div className="relative z-10 w-full max-w-5xl h-[90vh] mx-4 bg-vercel-surface border border-vercel-border rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-vercel-border bg-vercel-surface">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-1.5 rounded-lg bg-vercel-accent/10">
                                    <FileText size={18} className="text-vercel-accent" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-vercel-text truncate">{selectedBook.nomi}</h3>
                                    <p className="text-xs text-vercel-text-secondary">
                                        {selectedBook.kategoriya} • {formatFileSize(selectedBook.fayl_hajmi)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(selectedBook)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-vercel-text bg-vercel-surface-2 hover:bg-vercel-accent/10 hover:text-vercel-accent border border-vercel-border rounded-lg transition-all"
                                >
                                    <Download size={14} />
                                    Yuklab olish
                                </button>
                                <button
                                    onClick={() => setShowPdfViewer(false)}
                                    className="p-2 text-vercel-text-secondary hover:text-vercel-text hover:bg-vercel-surface-2 rounded-lg transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* PDF Content */}
                        <div className="flex-1 relative bg-neutral-900">
                            {pdfLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-vercel-bg z-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 size={32} className="text-vercel-accent animate-spin" />
                                        <p className="text-sm text-vercel-text-secondary">PDF yuklanmoqda...</p>
                                    </div>
                                </div>
                            )}
                            <iframe
                                src={`${API_BASE}/library/${selectedBook.id}/file?token=${localStorage.getItem('token')}`}
                                className="w-full h-full"
                                title={selectedBook.nomi}
                                onLoad={() => setPdfLoading(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
