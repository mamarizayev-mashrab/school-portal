import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { Users, Trash2, Edit3, X, Save, UserPlus, Search, GraduationCap, Mail, Hash, Calendar, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('students');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ ism: '', familiya: '', email: '', password: '', role: 'student', sinf: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get(`/admin/users`);
            setUsers(res.data);
        } catch (err) {
            toast.error("Foydalanuvchilarni yuklashda xato");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const deleteUser = async (id) => {
        if (!confirm("Bu foydalanuvchini o'chirishni xohlaysizmi?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            toast.success("Foydalanuvchi o'chirildi");
        } catch (err) {
            toast.error(err.response?.data?.xabar || "O'chirishda xato");
        }
    };

    const saveEdit = async () => {
        try {
            const payload = { ...editUser };
            if (payload.role === 'student') {
                delete payload.email;
            } else {
                delete payload.student_id;
                delete payload.sinf;
            }
            await api.put(`/admin/users/${editUser.id}`, payload);
            setUsers(users.map(u => u.id === editUser.id ? { ...u, ...payload } : u));
            setEditUser(null);
            toast.success("Foydalanuvchi yangilandi");
        } catch (err) {
            toast.error(err.response?.data?.xabar || "Yangilashda xato");
        }
    };

    const saveNewUser = async () => {
        try {
            const payload = { ...newUser };
            if (payload.role === 'student') {
                delete payload.email;
            } else {
                delete payload.student_id;
                delete payload.sinf;
            }
            const res = await api.post('/admin/users', payload);
            setUsers([res.data.user, ...users]);
            setShowAddModal(false);
            setNewUser({ ism: '', familiya: '', email: '', student_id: '', password: '', role: 'student', sinf: '' });
            toast.success("Foydalanuvchi qo'shildi");
        } catch (err) {
            const errors = err.response?.data?.xatolar;
            if (errors) {
                errors.forEach(e => toast.error(e));
            } else {
                toast.error(err.response?.data?.xabar || "Qo'shishda xato");
            }
        }
    };

    const openAddModal = () => {
        setNewUser({ ...newUser, role: activeTab === 'students' ? 'student' : 'teacher' });
        setShowAddModal(true);
    };

    const filteredStudents = useMemo(() => {
        return users.filter(user => user.role === 'student').filter(user => {
            const matchesSearch =
                (user.ism?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.familiya?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.student_id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesClass = filterClass ? user.sinf === filterClass : true;
            return matchesSearch && matchesClass;
        });
    }, [users, searchTerm, filterClass]);

    const filteredTeachers = useMemo(() => {
        return users.filter(user => user.role === 'teacher').filter(user => {
            return (
                (user.ism?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.familiya?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        });
    }, [users, searchTerm]);

    const availableClasses = useMemo(() => {
        const classes = new Set(users.filter(u => u.role === 'student').map(u => u.sinf).filter(Boolean));
        return Array.from(classes).sort();
    }, [users]);

    // Input component
    const InputField = ({ icon: Icon, ...props }) => (
        <div className="relative">
            {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary/50" />}
            <input {...props} className={`w-full ${Icon ? 'pl-9' : 'px-3'} py-2.5 bg-vercel-bg border border-vercel-border/60 rounded-xl text-vercel-text text-sm focus:outline-none focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 transition-all placeholder:text-vercel-text-secondary/40 ${props.disabled ? 'opacity-40 cursor-not-allowed' : ''} ${props.className || ''}`} />
        </div>
    );

    const UserModal = ({ user, setUser, onSave, title, isEdit = false }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => isEdit ? setEditUser(null) : setShowAddModal(false)}>
            <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl p-6 w-full max-w-md animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-vercel-accent/10 rounded-xl border border-vercel-accent/10">
                            {isEdit ? <Edit3 size={16} className="text-vercel-accent" /> : <UserPlus size={16} className="text-vercel-accent" />}
                        </div>
                        <h3 className="text-base font-semibold text-vercel-text">{title}</h3>
                    </div>
                    <button onClick={() => isEdit ? setEditUser(null) : setShowAddModal(false)}
                        className="p-2 text-vercel-text-secondary hover:text-vercel-text hover:bg-vercel-surface-2 rounded-xl transition-all">
                        <X size={16} />
                    </button>
                </div>

                {/* Role Toggle */}
                <div className="flex bg-vercel-bg border border-vercel-border/60 rounded-xl p-1 mb-5">
                    <button type="button"
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${user.role === 'student' ? 'bg-vercel-accent text-black shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                        onClick={() => setUser({ ...user, role: 'student' })} disabled={isEdit}>
                        <GraduationCap size={13} /> O'quvchi
                    </button>
                    <button type="button"
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${user.role === 'teacher' ? 'bg-vercel-accent text-black shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                        onClick={() => setUser({ ...user, role: 'teacher' })} disabled={isEdit}>
                        <Shield size={13} /> O'qituvchi
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <InputField icon={null} value={user.ism} onChange={(e) => setUser({ ...user, ism: e.target.value })} placeholder="Ism" />
                        <InputField icon={null} value={user.familiya} onChange={(e) => setUser({ ...user, familiya: e.target.value })} placeholder="Familiya" />
                    </div>

                    {user.role === 'student' ? (
                        <InputField icon={Hash} value={user.student_id || ''} onChange={(e) => setUser({ ...user, student_id: e.target.value })} placeholder="ID Raqam (AN1234)" disabled={isEdit} className="uppercase" />
                    ) : (
                        <InputField icon={Mail} value={user.email || ''} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" disabled={isEdit} type="email" />
                    )}

                    {!isEdit && (
                        <InputField icon={null} value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="Parol" type="password" />
                    )}

                    {user.role === 'student' && (
                        <InputField icon={GraduationCap} value={user.sinf || ''} onChange={(e) => setUser({ ...user, sinf: e.target.value })} placeholder="Sinf (5-A)" />
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={() => isEdit ? setEditUser(null) : setShowAddModal(false)}
                        className="flex-1 py-2.5 bg-vercel-surface-2 border border-vercel-border/40 rounded-xl text-sm text-vercel-text-secondary hover:text-vercel-text hover:bg-vercel-border/30 transition-all font-medium">
                        Bekor qilish
                    </button>
                    <button onClick={onSave}
                        className="flex-1 py-2.5 bg-vercel-text text-vercel-bg rounded-xl text-sm font-semibold hover:bg-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                        <Save size={14} /> Saqlash
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="space-y-4 animate-fade-in">
            <div className="h-20 animate-shimmer rounded-2xl" />
            <div className="h-12 animate-shimmer rounded-2xl w-64" />
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 animate-shimmer rounded-2xl" />)}
        </div>
    );

    return (
        <div className="animate-fade-in space-y-5">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vercel-surface via-vercel-surface to-vercel-surface-2 border border-vercel-border/60 p-6">
                <div className="absolute inset-0 dot-pattern opacity-30" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/[0.03] rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl border border-blue-500/10">
                            <Users className="text-blue-400" size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-vercel-text tracking-tight">Foydalanuvchilar</h1>
                            <p className="text-vercel-text-secondary text-xs mt-0.5">
                                Jami {users.length} ta foydalanuvchi • {filteredStudents.length} o'quvchi, {filteredTeachers.length} o'qituvchi
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 md:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary/50" size={15} />
                            <input
                                type="text"
                                placeholder="Qidirish..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-56 pl-9 pr-4 py-2.5 bg-vercel-bg/50 border border-vercel-border/60 rounded-xl text-vercel-text text-sm focus:outline-none focus:border-vercel-accent/50 focus:ring-1 focus:ring-vercel-accent/20 transition-all placeholder:text-vercel-text-secondary/40"
                            />
                        </div>
                        <button onClick={openAddModal}
                            className="px-4 py-2.5 bg-vercel-text text-vercel-bg rounded-xl text-sm font-semibold hover:bg-white transition-all flex items-center gap-2 whitespace-nowrap active:scale-[0.98] shadow-lg shadow-black/20">
                            <UserPlus size={15} /> Qo'shish
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
                <div className="flex p-1 bg-vercel-surface border border-vercel-border/60 rounded-xl">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-vercel-surface-2 text-vercel-text shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                    >
                        <GraduationCap size={14} />
                        O'quvchilar
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${activeTab === 'students' ? 'bg-vercel-accent/10 text-vercel-accent' : 'bg-vercel-surface-2 text-vercel-text-secondary'}`}>
                            {filteredStudents.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('teachers')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'teachers' ? 'bg-vercel-surface-2 text-vercel-text shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                    >
                        <Shield size={14} />
                        O'qituvchilar
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${activeTab === 'teachers' ? 'bg-vercel-accent/10 text-vercel-accent' : 'bg-vercel-surface-2 text-vercel-text-secondary'}`}>
                            {filteredTeachers.length}
                        </span>
                    </button>
                </div>

                {activeTab === 'students' && (
                    <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
                        className="px-3 py-2 bg-vercel-surface border border-vercel-border/60 rounded-xl text-vercel-text text-xs font-medium focus:outline-none focus:border-vercel-accent/50 transition-all cursor-pointer">
                        <option value="">Barcha sinflar</option>
                        {availableClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Modals */}
            {editUser && <UserModal user={editUser} setUser={setEditUser} onSave={saveEdit} title="Foydalanuvchini tahrirlash" isEdit={true} />}
            {showAddModal && <UserModal user={newUser} setUser={setNewUser} onSave={saveNewUser} title="Yangi foydalanuvchi" isEdit={false} />}

            {/* Table */}
            {activeTab === 'students' ? (
                <div className="animate-fade-in">
                    <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-vercel-border/50 bg-vercel-surface-2/30">
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">#</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Foydalanuvchi</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">ID Raqam</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Sinf</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Sana</th>
                                        <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-vercel-border/30">
                                    {filteredStudents.map((user, index) => (
                                        <tr key={user.id} className="table-row-hover group">
                                            <td className="px-5 py-3.5 text-sm text-vercel-text-secondary/60">{index + 1}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center text-xs font-bold text-blue-400 border border-blue-500/10">
                                                        {user.ism?.[0]}
                                                    </div>
                                                    <span className="text-sm font-medium text-vercel-text">{user.ism} {user.familiya}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm text-vercel-text-secondary font-mono bg-vercel-surface-2/50 px-2 py-0.5 rounded-md">{user.student_id}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-sm text-vercel-text-secondary">{user.sinf || '—'}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 text-sm text-vercel-text-secondary/60">
                                                    <Calendar size={12} />
                                                    {formatDate(user.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditUser(user)}
                                                        className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-accent hover:bg-vercel-accent/[0.06] transition-all" title="Tahrirlash">
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button onClick={() => deleteUser(user.id)}
                                                        className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/[0.06] transition-all" title="O'chirish">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredStudents.length === 0 && (
                            <div className="p-12 text-center">
                                <GraduationCap size={32} className="mx-auto text-vercel-text-secondary/20 mb-3" />
                                <p className="text-sm text-vercel-text-secondary">Hech qanday o'quvchi topilmadi</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="bg-vercel-surface border border-vercel-border/60 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="border-b border-vercel-border/50 bg-vercel-surface-2/30">
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">#</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Foydalanuvchi</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Email</th>
                                        <th className="text-left px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Sana</th>
                                        <th className="text-right px-5 py-3.5 text-[11px] font-semibold text-vercel-text-secondary uppercase tracking-wider">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-vercel-border/30">
                                    {filteredTeachers.map((user, index) => (
                                        <tr key={user.id} className="table-row-hover group">
                                            <td className="px-5 py-3.5 text-sm text-vercel-text-secondary/60">{index + 1}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 border border-emerald-500/10">
                                                        {user.ism?.[0]}
                                                    </div>
                                                    <span className="text-sm font-medium text-vercel-text">{user.ism} {user.familiya}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail size={12} className="text-vercel-text-secondary/40" />
                                                    <span className="text-sm text-vercel-text-secondary">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 text-sm text-vercel-text-secondary/60">
                                                    <Calendar size={12} />
                                                    {formatDate(user.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditUser(user)}
                                                        className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-accent hover:bg-vercel-accent/[0.06] transition-all" title="Tahrirlash">
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button onClick={() => deleteUser(user.id)}
                                                        className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/[0.06] transition-all" title="O'chirish">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredTeachers.length === 0 && (
                            <div className="p-12 text-center">
                                <Shield size={32} className="mx-auto text-vercel-text-secondary/20 mb-3" />
                                <p className="text-sm text-vercel-text-secondary">Hech qanday o'qituvchi topilmadi</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
