import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
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
        <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src="https://aksia-travel.ru/wp-content/uploads/2023/07/uzbekistan-farhodjon-chinberdiev-lpmpsETf2BQ-unsplash.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-[#0a0a0a]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Logo */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="relative group mb-2">
                        <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700" />
                        <img
                            src="https://yuksalish-maktabi.uz/logo_icon.png"
                            alt="Logo"
                            className="relative w-28 h-28 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] transform hover:scale-105 transition-all duration-500 ease-out"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg tracking-tight text-center">Xush kelibsiz!</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 space-y-6 shadow-2xl ring-1 ring-black/5">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 ml-1">Email yoki ID</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="email@namuna.uz yoki AA1234"
                            required
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-vercel-accent/50 focus:ring-2 focus:ring-vercel-accent/20 transition-all text-sm shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 ml-1">Parol</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-vercel-accent/50 focus:ring-2 focus:ring-vercel-accent/20 transition-all text-sm shadow-inner pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-vercel-accent text-black rounded-xl font-bold text-sm hover:bg-white transition-all transform active:scale-[0.98] shadow-lg shadow-vercel-accent/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Tekshirilmoqda...
                            </span>
                        ) : 'Tizimga kirish'}
                    </button>
                </form>

                <p className="text-center text-sm text-white/60 mt-8 font-medium drop-shadow-md">
                    Akkauntingiz yo'qmi?{' '}
                    <Link to="/register" className="text-vercel-accent hover:text-white transition-colors decoration-2 hover:underline underline-offset-4">
                        Ro'yxatdan o'tish
                    </Link>
                </p>
            </div>
        </div>
    );
}
