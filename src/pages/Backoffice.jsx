import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    LogOut,
    TrendingUp,
    Clock,
    Ban,
    ShoppingBag,
    CreditCard,
    Users,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    X
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { ordersApi, paymentsApi, authApi } from '@/api';
import OrdersTable from '@/components/backoffice/OrdersTable';
import SylviaBrandLogo from '@/components/ui/SylviaBrandLogo';

function money(n) {
    return `Ksh ${Math.round(Number(n || 0) * 130).toLocaleString()}`;
}

function StatCard({ icon: Icon, label, value, hint = '' }) {
    return (
        <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center gap-2 text-foreground/55">
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                <p className="label-mono">{label}</p>
            </div>
            <p className="mt-3 font-display text-2xl font-medium tracking-[-0.02em] tabular-nums">{value}</p>
            {hint && <p className="mt-1 text-[11px] text-foreground/40">{hint}</p>}
        </div>
    );
}

export default function Backoffice() {
    const { user, logout } = useAuth();
    const [tab, setTab] = useState('orders'); // 'orders' | 'transactions' | 'users'
    const [orders, setOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inspectTx, setInspectTx] = useState(null);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [ordersRes, txRes, usersRes, analyticsRes] = await Promise.allSettled([
                ordersApi.getOrders(),
                paymentsApi.getTransactions(),
                authApi.getUsers(),
                ordersApi.getAnalytics(),
            ]);

            if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value);
            if (txRes.status === 'fulfilled') setTransactions(txRes.value);
            if (usersRes.status === 'fulfilled') setUsersList(usersRes.value);
            if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
        } catch {
            // keep graceful fallbacks
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleStatusChange = async (id, status) => {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        try {
            await ordersApi.updateStatus(id, status);
            const updatedAnalytics = await ordersApi.getAnalytics();
            setAnalytics(updatedAnalytics);
        } catch {
            loadAll();
        }
    };

    const stats = {
        total: analytics?.total_orders ?? orders.length,
        revenue: analytics?.revenue ?? orders
            .filter((o) => o.status === 'confirmed' || o.status === 'shipped')
            .reduce((s, o) => s + Number(o.total || 0), 0),
        mpesaPaid: analytics?.paid_transactions ?? transactions.filter((t) => t.status === 'completed').length,
        usersCount: analytics?.total_users ?? usersList.length,
    };

    return (
        <div className="min-h-screen px-4 py-6 sm:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header navigation */}
                <div className="flex items-center justify-between gap-4">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm text-foreground/65 transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
                        Back to store
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={loadAll}
                            disabled={loading}
                            title="Refresh data"
                            className="glass-btn inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] uppercase tracking-[0.16em] text-foreground/75"
                        >
                            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                            Sync
                        </button>
                        <p className="hidden text-[11px] text-foreground/45 sm:block">{user?.email}</p>
                        <button
                            type="button"
                            onClick={() => logout()}
                            className="glass-btn inline-flex h-9 items-center gap-2 rounded-full px-4 text-[11px] uppercase tracking-[0.18em] text-foreground/80"
                        >
                            <LogOut className="h-3.5 w-3.5" strokeWidth={1.6} />
                            Sign out
                        </button>
                    </div>
                </div>

                {/* Page Title */}
                <div className="mt-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <SylviaBrandLogo variant="horizontal" />
                            <span className="label-mono text-xs text-foreground/45">· Backoffice</span>
                        </div>
                        <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium uppercase tracking-[0.16em]">
                            Clinic Orders & Payments
                        </h1>
                    </div>
                </div>

                {/* Stat Cards from Backend Analytics */}
                <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <StatCard icon={ShoppingBag} label="Total orders" value={stats.total} />
                    <StatCard icon={TrendingUp} label="Total Revenue" value={money(stats.revenue)} hint="Server verified" />
                    <StatCard
                        icon={CreditCard}
                        label="M-Pesa Cleared"
                        value={stats.mpesaPaid}
                        hint={`${transactions.length} total txns`}
                    />
                    <StatCard icon={Users} label="Registered Users" value={stats.usersCount} hint="Staff & customers" />
                </div>

                {/* Navigation Tabs */}
                <div className="mt-8 flex items-center gap-2 border-b border-white/10 pb-3">
                    <button
                        type="button"
                        onClick={() => setTab('orders')}
                        className={`label-mono rounded-full px-4 py-2 text-xs transition-all ${
                            tab === 'orders'
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'glass-btn text-foreground/70 hover:text-foreground'
                        }`}
                    >
                        Orders ({orders.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('transactions')}
                        className={`label-mono rounded-full px-4 py-2 text-xs transition-all ${
                            tab === 'transactions'
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'glass-btn text-foreground/70 hover:text-foreground'
                        }`}
                    >
                        M-Pesa Transactions ({transactions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('users')}
                        className={`label-mono rounded-full px-4 py-2 text-xs transition-all ${
                            tab === 'users'
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'glass-btn text-foreground/70 hover:text-foreground'
                        }`}
                    >
                        Users & Staff ({usersList.length})
                    </button>
                </div>

                {/* Tab: Orders */}
                {tab === 'orders' && (
                    <div className="mt-4">
                        <OrdersTable orders={orders} loading={loading} onStatusChange={handleStatusChange} />
                    </div>
                )}

                {/* Tab: M-Pesa Transactions */}
                {tab === 'transactions' && (
                    <div className="glass-panel mt-4 overflow-hidden rounded-2xl p-5">
                        <div className="flex items-center justify-between pb-4">
                            <div>
                                <h3 className="font-display text-lg font-medium">M-Pesa Payment Logs</h3>
                                <p className="text-xs text-foreground/50">
                                    Server-verified Daraja STK Push and dynamic QR transactions
                                </p>
                            </div>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="py-12 text-center text-sm text-foreground/50">
                                No payment transactions recorded yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-white/10 text-foreground/50">
                                        <tr>
                                            <th className="py-3 px-3">Receipt / Ref</th>
                                            <th className="py-3 px-3">Order</th>
                                            <th className="py-3 px-3">Customer</th>
                                            <th className="py-3 px-3">Phone</th>
                                            <th className="py-3 px-3">Amount</th>
                                            <th className="py-3 px-3">Method</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 px-3">Date</th>
                                            <th className="py-3 px-3 text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {transactions.map((t) => (
                                            <tr key={t.id} className="transition-colors hover:bg-white/[0.02]">
                                                <td className="py-3 px-3 font-mono text-foreground font-medium">
                                                    {t.mpesa_receipt_number || t.checkout_request_id?.slice(0, 16) || `#${t.id}`}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="font-mono text-foreground/80">#{t.order_number}</span>
                                                </td>
                                                <td className="py-3 px-3">{t.customer_name || '—'}</td>
                                                <td className="py-3 px-3 font-mono text-foreground/70">{t.phone_number || '—'}</td>
                                                <td className="py-3 px-3 font-mono font-medium">Ksh {Math.round(Number(t.amount) * 130).toLocaleString()}</td>
                                                <td className="py-3 px-3 uppercase text-[10px] tracking-wider text-foreground/60">
                                                    {t.payment_method === 'stk_push' ? 'STK Push' : 'Dynamic QR'}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                                                            t.status === 'completed'
                                                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                                : t.status === 'pending'
                                                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                                                : 'bg-red-500/15 text-red-300 border border-red-500/30'
                                                        }`}
                                                    >
                                                        {t.status === 'completed' ? (
                                                            <CheckCircle2 className="h-3 w-3" />
                                                        ) : t.status === 'pending' ? (
                                                            <Clock className="h-3 w-3" />
                                                        ) : (
                                                            <XCircle className="h-3 w-3" />
                                                        )}
                                                        {t.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-foreground/50">
                                                    {new Date(t.created_at).toLocaleString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </td>
                                                <td className="py-3 px-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => setInspectTx(t)}
                                                        className="glass-btn inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-foreground/75 hover:text-foreground"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        Inspect
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Users & Staff */}
                {tab === 'users' && (
                    <div className="glass-panel mt-4 overflow-hidden rounded-2xl p-5">
                        <div className="flex items-center justify-between pb-4">
                            <div>
                                <h3 className="font-display text-lg font-medium">Registered Platform Users</h3>
                                <p className="text-xs text-foreground/50">
                                    Administrative team and customer accounts persisted in Django
                                </p>
                            </div>
                        </div>

                        {usersList.length === 0 ? (
                            <div className="py-12 text-center text-sm text-foreground/50">
                                No registered users found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-white/10 text-foreground/50">
                                        <tr>
                                            <th className="py-3 px-3">Email</th>
                                            <th className="py-3 px-3">Name</th>
                                            <th className="py-3 px-3">Role</th>
                                            <th className="py-3 px-3">Status</th>
                                            <th className="py-3 px-3">Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {usersList.map((u) => (
                                            <tr key={u.id} className="transition-colors hover:bg-white/[0.02]">
                                                <td className="py-3 px-3 font-mono font-medium text-foreground">{u.email}</td>
                                                <td className="py-3 px-3">
                                                    {u.first_name || u.last_name
                                                        ? `${u.first_name} ${u.last_name}`.trim()
                                                        : '—'}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span
                                                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                                                            u.is_staff
                                                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                                                : 'bg-white/10 text-foreground/70'
                                                        }`}
                                                    >
                                                        {u.is_staff ? 'Administrator' : 'Customer'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className="text-emerald-400 font-medium">Active</span>
                                                </td>
                                                <td className="py-3 px-3 text-foreground/50">
                                                    {u.date_joined
                                                        ? new Date(u.date_joined).toLocaleDateString(undefined, {
                                                              year: 'numeric',
                                                              month: 'short',
                                                              day: 'numeric',
                                                          })
                                                        : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Inspect Transaction Modal */}
                {inspectTx && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                        <div className="glass-solid relative w-full max-w-lg rounded-2xl p-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <h3 className="font-display text-lg font-medium">Transaction Details</h3>
                                <button
                                    type="button"
                                    onClick={() => setInspectTx(null)}
                                    className="glass-btn grid h-8 w-8 place-items-center rounded-full text-foreground/70"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mt-4 space-y-3 text-xs">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-foreground/50">M-Pesa Receipt:</span>
                                    <span className="font-mono font-medium text-foreground">
                                        {inspectTx.mpesa_receipt_number || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-foreground/50">Checkout Request ID:</span>
                                    <span className="font-mono text-foreground">{inspectTx.checkout_request_id || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-foreground/50">Order Number:</span>
                                    <span className="font-mono text-foreground">#{inspectTx.order_number}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-foreground/50">Phone Number:</span>
                                    <span className="font-mono text-foreground">{inspectTx.phone_number || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-foreground/50">Amount:</span>
                                    <span className="font-mono font-medium text-foreground">Ksh {Math.round(Number(inspectTx.amount) * 130).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-foreground/50">Status / Result:</span>
                                    <span className="font-medium text-foreground">
                                        {inspectTx.status} ({inspectTx.result_desc || 'No description'})
                                    </span>
                                </div>
                                <div className="pt-2">
                                    <span className="block text-foreground/50 mb-1">Raw Callback Payload:</span>
                                    <pre className="max-h-40 overflow-y-auto rounded-xl bg-black/50 p-3 font-mono text-[11px] text-foreground/80">
                                        {JSON.stringify(inspectTx.raw_callback_payload, null, 2) || '{}'}
                                    </pre>
                                </div>
                            </div>
                            <div className="mt-5 text-right">
                                <button
                                    type="button"
                                    onClick={() => setInspectTx(null)}
                                    className="glass-btn rounded-full px-5 py-2 text-xs font-medium uppercase tracking-wider"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
