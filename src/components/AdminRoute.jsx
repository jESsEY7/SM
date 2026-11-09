import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function AdminRoute({ children }) {
    const { user, isAuthenticated, isLoadingAuth } = useAuth();

    if (isLoadingAuth) {
        return (
            <div className="fixed inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login?returnTo=/backoffice" replace />;
    }

    if (!user.is_staff && user.role !== 'admin') {
        return (
            <div className="flex min-h-screen items-center justify-center px-6 text-center">
                <div className="glass-panel max-w-md rounded-2xl p-8">
                    <h1 className="font-display text-xl font-medium uppercase tracking-[0.2em]">Access restricted</h1>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/65">
                        The backoffice is admin-only. Your account doesn't have admin access to this store.
                    </p>
                </div>
            </div>
        );
    }

    return children;
}
