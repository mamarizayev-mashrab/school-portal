import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(identifier, password);
            toast.success(`Xush kelibsiz, ${user.ism}!`);
            if (user.role === 'student') navigate('/student');
            else if (user.role === 'teacher') navigate('/teacher');
            else navigate('/admin'); // admin & superadmin
        } catch (err) {
            toast.error(err.response?.data?.xabar || 'Kirish xatosi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-vercel-bg flex items-center justify-center p-4">
            {/* Background gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-vercel-accent/5 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative animate-fade-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vercel-accent/10 border border-vercel-accent/20 mb-4">
                        <GraduationCap size={28} className="text-vercel-accent" />
                    </div>
                    <h1 className="text-2xl font-bold text-vercel-text">Kitobxonga kirish</h1>
                    <p className="text-vercel-text-secondary mt-2 text-sm">Kitob o'qish sayohatingizni davom ettiring</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-vercel-surface border border-vercel-border rounded-xl p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-vercel-text-secondary mb-2">Email yoki ID</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="email@namuna.uz yoki AA1234"
                            required
                            className="w-full px-4 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-vercel-text-secondary mb-2">Parol</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text placeholder:text-vercel-text-secondary/50 focus:outline-none focus:border-vercel-accent focus:ring-1 focus:ring-vercel-accent/50 transition-all text-sm pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary hover:text-vercel-text transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-vercel-text text-vercel-bg rounded-lg font-medium text-sm hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-vercel-bg border-t-transparent rounded-full animate-spin" />
                                Kirilmoqda...
                            </span>
                        ) : 'Kirish'}
                    </button>
                </form>

                <p className="text-center text-sm text-vercel-text-secondary mt-6">
                    Akkauntingiz yo'qmi?{' '}
                    <Link to="/register" className="text-vercel-accent hover:underline">
                        Ro'yxatdan o'tish
                    </Link>
                </p>
            </div>
        </div>
    );
}
