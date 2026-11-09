import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Password reset will be handled by Django in the future.
        // For now, show confirmation to avoid exposing user existence.
        await new Promise(r => setTimeout(r, 900));
        setSent(true);
        setLoading(false);
    };

    return (
        <AuthLayout
            icon={KeyRound}
            title={sent ? 'Check your inbox' : 'Reset password'}
            subtitle={sent ? `If ${email} has an account, you'll receive a link shortly.` : 'Enter your email to receive reset instructions'}
            footer={
                <Link to="/login" className="flex items-center gap-1.5 text-primary font-medium hover:underline">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                </Link>
            }
        >
            {!sent && (
                <>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12" required />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
                            {loading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                            ) : 'Send reset link'}
                        </Button>
                    </form>
                </>
            )}
        </AuthLayout>
    );
}
