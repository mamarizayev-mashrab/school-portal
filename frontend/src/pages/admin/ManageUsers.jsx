import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { Users, Trash2, Edit3, X, Save, UserPlus, Lock, Search, Filter } from 'lucide-react';
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

    // Format Date Helper
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
            // Clean up payload based on role
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
            // Clean up payload based on role
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

    // Client-side filtering logic
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

    // Extract unique classes for filter dropdown
    const availableClasses = useMemo(() => {
        const classes = new Set(users.filter(u => u.role === 'student').map(u => u.sinf).filter(Boolean));
        return Array.from(classes).sort();
    }, [users]);

    // Generic Modal Component (Unchanged)
    const UserModal = ({ user, setUser, onSave, title, isEdit = false }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-vercel-surface border border-vercel-border rounded-xl p-6 w-full max-w-md animate-slide-up shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-vercel-text">{title}</h3>
                    <button onClick={() => isEdit ? setEditUser(null) : setShowAddModal(false)} className="p-1 text-vercel-text-secondary hover:text-vercel-text transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-3">
                    <div className="flex bg-vercel-bg border border-vercel-border rounded-lg p-1 mb-4">
                        <button type="button"
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${user.role === 'student' ? 'bg-vercel-accent text-black shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                            onClick={() => setUser({ ...user, role: 'student' })} disabled={isEdit}>
                            O'quvchi
                        </button>
                        <button type="button"
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${user.role === 'teacher' ? 'bg-vercel-accent text-black shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                            onClick={() => setUser({ ...user, role: 'teacher' })} disabled={isEdit}>
                            O'qituvchi
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <input value={user.ism} onChange={(e) => setUser({ ...user, ism: e.target.value })} placeholder="Ism" className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                        <input value={user.familiya} onChange={(e) => setUser({ ...user, familiya: e.target.value })} placeholder="Familiya" className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                    </div>

                    {user.role === 'student' ? (
                        <input value={user.student_id || ''} onChange={(e) => setUser({ ...user, student_id: e.target.value })} placeholder="ID Raqam (AN1234)" disabled={isEdit} className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all uppercase" />
                    ) : (
                        <input value={user.email || ''} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="Email" disabled={isEdit} type="email" className={`w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`} />
                    )}

                    {!isEdit && (
                        <input value={user.password} onChange={(e) => setUser({ ...user, password: e.target.value })} placeholder="Parol" type="password" className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                    )}

                    {user.role === 'student' && (
                        <input value={user.sinf || ''} onChange={(e) => setUser({ ...user, sinf: e.target.value })} placeholder="Sinf (5-A)" className="w-full px-3 py-2.5 bg-vercel-bg border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all" />
                    )}
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={() => isEdit ? setEditUser(null) : setShowAddModal(false)} className="flex-1 py-2.5 bg-vercel-surface-2 border border-vercel-border rounded-lg text-sm text-vercel-text hover:bg-vercel-border transition-all">Bekor qilish</button>
                    <button onClick={onSave} className="flex-1 py-2.5 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:bg-white transition-all flex items-center justify-center gap-2">
                        <Save size={14} /> Saqlash
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 animate-shimmer rounded-xl" />)}</div>;

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-vercel-surface border border-vercel-border rounded-xl p-5 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-vercel-text flex items-center gap-3">
                        <div className="p-2 bg-vercel-accent/10 rounded-lg">
                            <Users className="text-vercel-accent" size={24} />
                        </div>
                        Foydalanuvchilar
                    </h1>
                    <p className="text-vercel-text-secondary text-sm mt-1 ml-1">
                        Tizim foydalanuvchilarini boshqarish
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-vercel-text-secondary" size={16} />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-vercel-surface border border-vercel-border rounded-lg text-vercel-text text-sm focus:outline-none focus:border-vercel-accent transition-all placeholder:text-vercel-text-secondary/50"
                        />
                    </div>

                    <button onClick={openAddModal}
                        className="px-4 py-2 bg-vercel-text text-vercel-bg rounded-lg text-sm font-medium hover:bg-white transition-all flex items-center gap-2 whitespace-nowrap">
                        <UserPlus size={16} /> Qo'shish
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-vercel-surface border border-vercel-border rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'students' ? 'bg-vercel-surface-2 text-vercel-text shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                >
                    Userlar
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'students' ? 'bg-vercel-text text-vercel-bg' : 'bg-vercel-surface-2 text-vercel-text-secondary'}`}>
                        {filteredStudents.length}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('teachers')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'teachers' ? 'bg-vercel-surface-2 text-vercel-text shadow-sm' : 'text-vercel-text-secondary hover:text-vercel-text'}`}
                >
                    O'qituvchilar
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'teachers' ? 'bg-vercel-text text-vercel-bg' : 'bg-vercel-surface-2 text-vercel-text-secondary'}`}>
                        {filteredTeachers.length}
                    </span>
                </button>
            </div>

            {/* Modals */}
            {editUser && <UserModal user={editUser} setUser={setEditUser} onSave={saveEdit} title="Foydalanuvchini tahrirlash" isEdit={true} />}
            {showAddModal && <UserModal user={newUser} setUser={setNewUser} onSave={saveNewUser} title="Yangi foydalanuvchi" isEdit={false} />}

            {/* Content Based on Tab */}
            {activeTab === 'students' ? (
                /* Students Table Section */
                <div className="space-y-4 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {/* Optional secondary tabs or info if needed */}
                        </div>

                        {/* Class Filter only for students */}
                        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
                            className="px-3 py-1.5 bg-vercel-surface border border-vercel-border rounded-lg text-vercel-text text-xs focus:outline-none focus:border-vercel-accent transition-all cursor-pointer">
                            <option value="">Barcha sinflar</option>
                            {availableClasses.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-vercel-border bg-vercel-surface-2/50">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Ism</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">ID Raqam</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Sinf</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Sana</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-vercel-border/50">
                                {filteredStudents.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-vercel-surface-2 transition-colors">
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary">{index + 1}</td>
                                        <td className="px-5 py-3.5 text-sm font-medium text-vercel-text">{user.ism} {user.familiya}</td>
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary font-mono">{user.student_id}</td>
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary">{user.sinf || '—'}</td>
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary">{formatDate(user.created_at)}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setEditUser(user)} className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-accent hover:bg-vercel-accent/10 transition-all" title="Tahrirlash"><Edit3 size={15} /></button>
                                                <button onClick={() => deleteUser(user.id)} className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/10 transition-all" title="O'chirish"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredStudents.length === 0 && (
                            <div className="p-8 text-center text-vercel-text-secondary">Hech qanday o'quvchi topilmadi</div>
                        )}
                    </div>
                </div>
            ) : (
                /* Teachers Table Section */
                <div className="space-y-4 animate-slide-up">
                    <div className="bg-vercel-surface border border-vercel-border rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-vercel-border bg-vercel-surface-2/50">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">#</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Ism</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Email</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Sana</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-vercel-text-secondary uppercase tracking-wider">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-vercel-border/50">
                                {filteredTeachers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-vercel-surface-2 transition-colors">
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary">{index + 1}</td>
                                        <td className="px-5 py-3.5 text-sm font-medium text-vercel-text">{user.ism} {user.familiya}</td>
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary">{user.email}</td>
                                        <td className="px-5 py-3.5 text-sm text-vercel-text-secondary">{formatDate(user.created_at)}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setEditUser(user)} className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-accent hover:bg-vercel-accent/10 transition-all" title="Tahrirlash"><Edit3 size={15} /></button>
                                                <button onClick={() => deleteUser(user.id)} className="p-2 rounded-lg text-vercel-text-secondary hover:text-vercel-error hover:bg-vercel-error/10 transition-all" title="O'chirish"><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredTeachers.length === 0 && (
                            <div className="p-8 text-center text-vercel-text-secondary">Hech qanday o'qituvchi topilmadi</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
