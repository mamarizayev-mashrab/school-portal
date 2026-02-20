import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { User, Mail, BookOpen, Award, Save, Lock, Eye, EyeOff, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
    const { user: authUser, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [form, setForm] = useState({ ism: '', familiya: '', sinf: '' });
    const [passwordForm, setPasswordForm] = useState({ eskiParol: '', yangiParol: '', tasdiqlash: '' });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);

    // Avatar colors
    const avatarColors = [
        'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500',
        'from-orange-500 to-red-500', 'from-indigo-500 to-violet-500', 'from-teal-500 to-green-500',
        'from-rose-500 to-pink-500', 'from-amber-500 to-yellow-500',
    ];

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile');
            setProfile(res.data);
            setForm({ ism: res.data.ism, familiya: res.data.familiya, sinf: res.data.sinf || '' });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            const res = await api.put('/profile', form);
            setProfile({ ...profile, ...form });
            if (setUser) setUser({ ...authUser, ...form });
            setEditing(false);
            toast.success("Profil yangilandi");
        } catch (err) { toast.error("Yangilashda xato"); }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.yangiParol !== passwordForm.tasdiqlash) {
            return toast.error("Yangi parollar mos kelmayapti");
        }
        try {
            await api.put('/profile/password', { eskiParol: passwordForm.eskiParol, yangiParol: passwordForm.yangiParol });
            setPasswordForm({ eskiParol: '', yangiParol: '', tasdiqlash: '' });
            setChangingPassword(false);
            toast.success("Parol o'zgartirildi");
        } catch (err) {
            toast.error(err.response?.data?.xabar || "Parol o'zgartirishda xato");
        }
    };

    const setAvatar = async (color) => {
        try {
            await api.put('/profile', { avatar: color });
            setProfile({ ...profile, avatar: color });
            toast.success("Avatar yangilandi");
        } catch (err) { toast.error("Xatolik"); }
    };

    if (loading) return <div className="h-64 animate-shimmer rounded-xl" />;
    if (!profile) return null;

    const avatarGradient = profile.avatar || avatarColors[0];
    const initials = `${profile.ism?.[0] || ''}${profile.familiya?.[0] || ''}`.toUpperCase();

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                <User className="text-vercel-accent" size={24} />
                Profilim
            </h1>

            {/* Avatar & Info */}
            <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                <div className="flex items-center gap-5">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                        {initials}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-vercel-text">{profile.ism} {profile.familiya}</h2>
                        <p className="text-sm text-vercel-text-secondary">{profile.email}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-vercel-text-secondary">
                            <span className="px-2 py-0.5 bg-vercel-accent/10 text-vercel-accent border border-vercel-accent/20 rounded-full">
                                {profile.role === 'student' ? "O'quvchi" : profile.role === 'teacher' ? "O'qituvchi" : 'Admin'}
                            </span>
                            {profile.sinf && <span>{profile.sinf}</span>}
                            <span>Level: {profile.level}</span>
                        </div>
                    </div>
                </div>

                {/* Stats - Only for Students */}
                {profile.role === 'student' && (
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-3 bg-vercel-bg rounded-lg border border-vercel-border">
                            <BookOpen size={18} className="mx-auto text-vercel-accent mb-1" />
                            <p className="text-lg font-bold text-vercel-text">{profile.kitoblar_soni || 0}</p>
                            <p className="text-xs text-vercel-text-secondary">Kitoblar</p>
                        </div>
                        <div className="text-center p-3 bg-vercel-bg rounded-lg border border-vercel-border">
                            <Award size={18} className="mx-auto text-yellow-400 mb-1" />
                            <p className="text-lg font-bold text-vercel-text">{profile.nishonlar_soni || 0}</p>
                            <p className="text-xs text-vercel-text-secondary">Nishonlar</p>
                        </div>
                        <div className="text-center p-3 bg-vercel-bg rounded-lg border border-vercel-border">
                            <span className="text-2xl">⚡</span>
                            <p className="text-lg font-bold text-vercel-text">{profile.xp || 0}</p>
                            <p className="text-xs text-vercel-text-secondary">XP</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Avatar ranglari */}
            <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                <h3 className="text-sm font-medium text-vercel-text-secondary mb-3 flex items-center gap-2">
                    <Palette size={16} /> Avatar rangini tanlang
                </h3>
                <div className="flex flex-wrap gap-2">
                    {avatarColors.map(color => (
                        <button key={color} onClick={() => setAvatar(color)}
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} transition-all hover:scale-110 ${avatarGradient === color ? 'ring-2 ring-white ring-offset-2 ring-offset-vercel-surface' : ''}`}
                        />
                    ))}
                </div>
            </div>

            {/* Profil tahrirlash */}
            <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-vercel-text-secondary">Shaxsiy ma'lumotlar</h3>
                    {!editing ? (
                        <button onClick={() => setEditing(true)} className="text-xs text-vercel-accent hover:underline">Tahrirlash</button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setEditing(false)} className="text-xs text-vercel-text-secondary hover:underline">Bekor</button>
                            <button onClick={handleSave} className="flex items-center gap-1 text-xs text-vercel-accent hover:underline"><Save size={12} /> Saqlash</button>
                        </div>
                    )}
                </div>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-vercel-text-secondary block mb-1">Ism</label>
                            <input value={form.ism} onChange={e => setForm({ ...form, ism: e.target.value })} disabled={!editing}
                                className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text disabled:opacity-50 focus:outline-none focus:border-vercel-accent transition-all" />
                        </div>
                        <div>
                            <label className="text-xs text-vercel-text-secondary block mb-1">Familiya</label>
                            <input value={form.familiya} onChange={e => setForm({ ...form, familiya: e.target.value })} disabled={!editing}
                                className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text disabled:opacity-50 focus:outline-none focus:border-vercel-accent transition-all" />
                        </div>
                    </div>
                    {profile.role !== 'superadmin' && (
                        <div>
                            <label className="text-xs text-vercel-text-secondary block mb-1">
                                {profile.role === 'teacher' ? "Rahbarlik Sinfi" : "Sinf"}
                            </label>
                            <input value={form.sinf} onChange={e => setForm({ ...form, sinf: e.target.value })} disabled={!editing || profile.role === 'superadmin'}
                                className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text disabled:opacity-50 focus:outline-none focus:border-vercel-accent transition-all" />
                        </div>
                    )}
                </div>
            </div>

            {/* Parol o'zgartirish */}
            <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-vercel-text-secondary flex items-center gap-2"><Lock size={14} /> Parolni o'zgartirish</h3>
                    {!changingPassword && (
                        <button onClick={() => setChangingPassword(true)} className="text-xs text-vercel-accent hover:underline">O'zgartirish</button>
                    )}
                </div>
                {changingPassword && (
                    <div className="space-y-3">
                        <div className="relative">
                            <input type={showOld ? 'text' : 'password'} value={passwordForm.eskiParol}
                                onChange={e => setPasswordForm({ ...passwordForm, eskiParol: e.target.value })} placeholder="Eski parol"
                                className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all pr-10" />
                            <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-2 text-vercel-text-secondary">
                                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="relative">
                            <input type={showNew ? 'text' : 'password'} value={passwordForm.yangiParol}
                                onChange={e => setPasswordForm({ ...passwordForm, yangiParol: e.target.value })} placeholder="Yangi parol"
                                className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all pr-10" />
                            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2 text-vercel-text-secondary">
                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <input type="password" value={passwordForm.tasdiqlash}
                            onChange={e => setPasswordForm({ ...passwordForm, tasdiqlash: e.target.value })} placeholder="Yangi parolni tasdiqlang"
                            className="w-full px-3 py-2 bg-vercel-bg border border-vercel-border rounded-lg text-sm text-vercel-text focus:outline-none focus:border-vercel-accent transition-all" />
                        <div className="flex gap-2">
                            <button onClick={() => { setChangingPassword(false); setPasswordForm({ eskiParol: '', yangiParol: '', tasdiqlash: '' }); }}
                                className="flex-1 py-2 bg-vercel-surface-2 border border-vercel-border rounded-lg text-sm text-vercel-text hover:bg-vercel-border transition-all">Bekor</button>
                            <button onClick={handlePasswordChange}
                                className="flex-1 py-2 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:bg-white transition-all">Saqlash</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Ro'yxatdan o'tgan sana */}
            <p className="text-xs text-vercel-text-secondary/50 text-center">
                Ro'yxatdan o'tgan: {new Date(profile.created_at).toLocaleDateString('uz-UZ')}
            </p>
        </div>
    );
}
