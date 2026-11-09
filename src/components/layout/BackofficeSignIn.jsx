import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const RETURN_TO = '/backoffice';

export default function BackofficeSignIn({ open, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    if (!open) return null;

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userData = await login(email, password);
            if (!userData?.is_staff && userData?.role !== 'admin') {
                setError('Access restricted to staff/administrator accounts.');
                setLoading(false);
                return;
            }
            if (onClose) onClose();
            navigate(RETURN_TO);
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.error || err.message || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Close"
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="glass-solid relative w-full max-w-md rounded-2xl p-7 sm:p-8">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="glass-btn absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-foreground/70"
                >
                    <X className="h-4 w-4" strokeWidth={1.6} />
                </button>

                <div className="mb-4">
                    <p className="label-mono text-xs uppercase tracking-[0.24em] text-primary mb-1">
                        Sylvia Aesthetics Clinic
                    </p>
                    <h2 className="font-display text-2xl font-medium uppercase tracking-[0.16em]">
                        Staff Portal
                    </h2>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">
                    Admin access only. Sign in to manage orders and payments.
                </p>

                {error && (
                    <div className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="bo-email" className="label-mono text-foreground/50">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" aria-hidden="true" />
                            <input
                                id="bo-email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-white/45"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="bo-password" className="label-mono text-foreground/50">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" aria-hidden="true" />
                            <input
                                id="bo-password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-white/45"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[11px] font-medium uppercase tracking-[0.24em] text-primary-foreground transition-all duration-500 hover:shadow-[0_20px_44px_-18px_var(--accent-glow)] disabled:opacity-70"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Signing in' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-[12px] text-foreground/45">
                    Forgot your password?{' '}
                    <Link to="/forgot-password" className="text-foreground/75 underline-offset-2 hover:underline">
                        Reset it
                    </Link>
                </p>
            </div>
        </div>
    );
}