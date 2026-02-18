import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm] = useState({
        ism: '', familiya: '', email: '', student_id: '', password: '', sinf: '', role: 'student',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const sinflar = ['5-A', '5-B', '6-A', '6-B', '7-A', '7-B', '8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-A', '11-B'];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Ma'lumotlarni tozalash
            const formData = { ...form };
            if (formData.role === 'student') {
                delete formData.email;
            } else {
                delete formData.student_id;
                delete formData.sinf;
            }

            const user = await register(formData);
            toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz!");
            navigate(user.role === 'student' ? '/student' : `/${user.role}`);
        } catch (err) {
            const errors = err.response?.data?.xatolar;
            if (errors) {
                errors.forEach(e => toast.error(e));
            } else {
                toast.error(err.response?.data?.xabar || "Ro'yxatdan o'tish xatosi");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-vercel-bg flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-vercel-accent/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vercel-accent/10 border border-vercel-accent/20 mb-4">
                        <GraduationCap size={28} className="text-vercel-accent" />
                    </div>
                    <h1 className="text-2xl font-bold text-vercel-text">Ro'yxatdan o'tish</h1>
                    <p className="text-vercel-text-secondary mt-2 text-sm">Kitobxon tizimiga qo'shiling</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-vercel-surface border border-vercel-border rounded-xl p-6 space-y-4">
                    {/* Role Selection */}
                    <div className="flex bg-vercel-bg border border-vercel-border rounded-lg p-1 mb-4">
                        <button type="button"
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${form.role === 'student' ? 'bg-vercel-accent text-black shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                            onClick={() => setForm({ ...form, role: 'student' })}>
                            O'quvchi
                        </button>
                        <button type="button"
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${form.role === 'teacher' ? 'bg-vercel-accent text-black shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                            onClick={() => setForm({ ...form, role: 'teacher' })}>
                            O'qituvchi
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Ism</label>
                            <input name="ism" value={form.ism} onChange={handleChange} required placeholder="Ismingiz"
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Familiya</label>
                            <input name="familiya" value={form.familiya} onChange={handleChange} required placeholder="Familiyangiz"
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm" />
                        </div>
                    </div>

                    {form.role === 'teacher' ? (
                        <div>
                            <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@namuna.uz"
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm" />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">ID Raqam</label>
                            <input name="student_id" value={form.student_id} onChange={handleChange} required placeholder="AA1234 (2 harf + 4 raqam)"
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm upper-case" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Parol</label>
                        <div className="relative">
                            <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required placeholder="Kamida 6 ta belgi"
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary hover:text-vercel-text transition-colors">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {form.role === 'student' && (
                        <div>
                            <label className="block text-sm font-medium text-vercel-text-secondary mb-1.5">Sinf</label>
                            <select name="sinf" value={form.sinf} onChange={handleChange}
                                className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm">
                                <option value="">Sinfni tanlang</option>
                                {sinflar.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full py-2.5 bg-vercel-text text-vercel-bg rounded-lg font-medium text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-vercel-bg border-t-transparent rounded-full animate-spin" />
                                Ro'yxatdan o'tilmoqda...
                            </span>
                        ) : "Ro'yxatdan o'tish"}
                    </button>
                </form>

                <p className="text-center text-sm text-vercel-text-secondary mt-6">
                    Akkauntingiz bormi?{' '}
                    <Link to="/login" className="text-vercel-accent hover:underline">Kirish</Link>
                </p>
            </div>
        </div>
    );
}
