import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, Check } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password !== confirm) { setError('Passwords do not match'); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 900));
        setDone(true);
        setLoading(false);
    };

    return (
        <AuthLayout
            icon={done ? Check : Lock}
            title={done ? 'Password updated' : 'Set new password'}
            subtitle={done ? 'You can now log in with your new password.' : 'Choose a strong password'}
            footer={<Link to="/login" className="text-primary font-medium hover:underline">Back to login</Link>}
        >
            {!done && (
                <>
                    {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="password" type="password" autoFocus placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input id="confirm" type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} className="pl-10 h-12" required />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : 'Update password'}
                        </Button>
                    </form>
                </>
            )}
        </AuthLayout>
    );
}
