import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Student
import StudentDashboard from './pages/student/Dashboard';
import AddBook from './pages/student/AddBook';
import MyBooks from './pages/student/MyBooks';
import Quiz from './pages/student/Quiz';
import Leaderboard from './pages/student/Leaderboard';
import Badges from './pages/student/Badges';
import Profile from './pages/student/Profile';
import Notifications from './pages/student/Notifications';
import ReadingPlan from './pages/student/ReadingPlan';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import ClassStats from './pages/teacher/ClassStats';
import ReviewSummaries from './pages/teacher/ReviewSummaries';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBooks from './pages/admin/ManageBooks';
import AdminSettings from './pages/admin/Settings';
import AuditLogs from './pages/admin/AuditLogs';

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-vercel-bg"><div className="h-8 w-8 border-2 border-vercel-accent border-t-transparent rounded-full animate-spin" /></div>;
    if (!user) return <Navigate to="/login" />;

    // Super Admin Master Key - har qanday joyga kira oladi
    if (user.role === 'superadmin') return children;

    if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role === 'admin' ? 'admin' : user.role === 'teacher' ? 'teacher' : 'student'}`} />;
    return children;
}

export default function App() {
    return (
        <>
            <Toaster position="top-right"
                toastOptions={{
                    style: { background: '#171717', color: '#EDEDED', border: '1px solid #333333', borderRadius: '12px', fontSize: '14px' },
                    success: { iconTheme: { primary: '#50E3C2', secondary: '#000' } },
                    error: { iconTheme: { primary: '#EE0000', secondary: '#fff' } },
                }}
            />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student */}
                <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout><StudentDashboard /></Layout></ProtectedRoute>} />
                <Route path="/student/add-book" element={<ProtectedRoute roles={['student']}><Layout><AddBook /></Layout></ProtectedRoute>} />
                <Route path="/student/my-books" element={<ProtectedRoute roles={['student']}><Layout><MyBooks /></Layout></ProtectedRoute>} />
                <Route path="/student/quiz" element={<ProtectedRoute roles={['student']}><Layout><Quiz /></Layout></ProtectedRoute>} />
                <Route path="/student/leaderboard" element={<ProtectedRoute roles={['student']}><Layout><Leaderboard /></Layout></ProtectedRoute>} />
                <Route path="/student/badges" element={<ProtectedRoute roles={['student']}><Layout><Badges /></Layout></ProtectedRoute>} />
                <Route path="/student/plan" element={<ProtectedRoute roles={['student']}><Layout><ReadingPlan /></Layout></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

                {/* Teacher */}
                <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><Layout><TeacherDashboard /></Layout></ProtectedRoute>} />
                <Route path="/teacher/class-stats" element={<ProtectedRoute roles={['teacher', 'superadmin']}><Layout><ClassStats /></Layout></ProtectedRoute>} />
                <Route path="/teacher/summaries" element={<ProtectedRoute roles={['teacher', 'superadmin']}><Layout><ReviewSummaries /></Layout></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute roles={['superadmin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute roles={['superadmin']}><Layout><ManageUsers /></Layout></ProtectedRoute>} />
                <Route path="/admin/books" element={<ProtectedRoute roles={['superadmin']}><Layout><ManageBooks /></Layout></ProtectedRoute>} />
                <Route path="/admin/audit" element={<ProtectedRoute roles={['superadmin']}><Layout><AuditLogs /></Layout></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute roles={['superadmin']}><Layout><AdminSettings /></Layout></ProtectedRoute>} />

                {/* Default */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </>
    );
}
