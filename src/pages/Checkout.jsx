import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    Download,
    Lock,
    Loader2,
    Phone,
    Printer,
    QrCode,
    RefreshCw,
    ShieldCheck,
    Smartphone,
    XCircle,
} from 'lucide-react';
import { ordersApi, paymentsApi } from '@/api';
import { Image } from '@/components/ui/image';
import { FREE_GIFT_NAME, FREE_GIFT_THRESHOLD, useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import SylviaBrandLogo, { SylviaMonogram } from '@/components/ui/SylviaBrandLogo';

const FIELDS = [
    { name: 'customer_name', label: 'Full name', type: 'text', required: true, autoComplete: 'name' },
    { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'address_line1', label: 'Address', type: 'text', required: true, autoComplete: 'address-line1' },
    { name: 'address_line2', label: 'Apartment, suite (optional)', type: 'text', required: false, autoComplete: 'address-line2' },
    { name: 'city', label: 'City', type: 'text', required: true, autoComplete: 'address-level2' },
    { name: 'postal_code', label: 'Postal code', type: 'text', required: true, autoComplete: 'postal-code' },
    { name: 'country', label: 'Country', type: 'text', required: true, autoComplete: 'country-name' },
];

const SHIPPING = 6;

export default function Checkout() {
    const { items, subtotal, clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const [form, setForm] = useState(() =>
        FIELDS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {
            phone_number: '0712345678',
        })
    );
    const [paymentMethod, setPaymentMethod] = useState('stk_push'); // 'stk_push' | 'qr_code'
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);

    // Payment workflow states: 'idle' | 'awaiting_pin' | 'verifying' | 'completed' | 'failed' | 'cancelled'
    const [paymentState, setPaymentState] = useState('idle');
    const [checkoutRequestId, setCheckoutRequestId] = useState(null);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);
    const [copiedRef, setCopiedRef] = useState(false);
    const pollIntervalRef = useRef(null);

    const shipping = subtotal >= FREE_GIFT_THRESHOLD ? 0 : SHIPPING;
    const total = subtotal + shipping;
    const giftUnlocked = subtotal >= FREE_GIFT_THRESHOLD;

    const update = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

    // Clean up polling interval on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    // Polling function for transaction status
    const startStatusPolling = (reqId) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        let attempts = 0;
        const maxAttempts = 24; // 24 * 3s = 72 seconds max

        pollIntervalRef.current = setInterval(async () => {
            attempts += 1;
            try {
                const statusData = await paymentsApi.checkStatus(reqId);
                if (statusData.status === 'completed') {
                    clearInterval(pollIntervalRef.current);
                    setPaymentResult(statusData);
                    setPaymentState('completed');
                    clearCart();
                } else if (statusData.status === 'cancelled' || statusData.status === 'failed' || statusData.status === 'timeout') {
                    clearInterval(pollIntervalRef.current);
                    setPaymentResult(statusData);
                    setPaymentState(statusData.status);
                } else if (attempts >= maxAttempts) {
                    clearInterval(pollIntervalRef.current);
                    setPaymentState('timeout');
                }
            } catch (err) {
                // Keep polling
            }
        }, 3000);
    };

    const handlePlaceOrderAndPay = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // 1. Create order in Django
            const createdOrder = await ordersApi.createOrder({
                order_number: `LB-${Math.floor(100000 + Math.random() * 899999)}`,
                ...form,
                items: items.map((i) => ({
                    product_id: i.product_id,
                    name: i.name,
                    shade_name: i.shade_name,
                    shade_hex: i.shade_hex,
                    price: i.price,
                    quantity: i.quantity,
                })),
                subtotal,
                shipping,
                total,
                gift_unlocked: giftUnlocked,
                status: 'pending',
            });

            setOrder(createdOrder);

            // 2. Initiate Payment Method
            if (paymentMethod === 'stk_push') {
                const stkRes = await paymentsApi.initiateSTKPush({
                    order_id: createdOrder.id,
                    phone_number: form.phone_number,
                });
                setCheckoutRequestId(stkRes.checkout_request_id);
                setPaymentState('awaiting_pin');
                startStatusPolling(stkRes.checkout_request_id);
            } else {
                const qrRes = await paymentsApi.generateDynamicQR({
                    order_id: createdOrder.id,
                });
                setQrCodeData(qrRes);
                setPaymentState('awaiting_pin');
            }
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                err.response?.data?.phone_number?.[0] ||
                'Could not process order. Please verify your details and phone number.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Retry payment with existing or new details
    const handleRetryPayment = async (newMethod = paymentMethod) => {
        if (!order) return;
        setError('');
        setPaymentState('idle');
        setPaymentMethod(newMethod);

        try {
            if (newMethod === 'stk_push') {
                const stkRes = await paymentsApi.initiateSTKPush({
                    order_id: order.id,
                    phone_number: form.phone_number,
                });
                setCheckoutRequestId(stkRes.checkout_request_id);
                setPaymentState('awaiting_pin');
                startStatusPolling(stkRes.checkout_request_id);
            } else {
                const qrRes = await paymentsApi.generateDynamicQR({
                    order_id: order.id,
                });
                setQrCodeData(qrRes);
                setPaymentState('awaiting_pin');
            }
        } catch (err) {
            setError('Payment re-initiation failed. Please try again.');
        }
    };

    // Sandbox helper to simulate user action on phone
    const handleSimulateSandboxAction = async (scenario) => {
        if (!checkoutRequestId) return;
        try {
            await paymentsApi.simulateCallback(checkoutRequestId, scenario);
            // Poller or direct check will pick it up
            const updated = await paymentsApi.checkStatus(checkoutRequestId);
            setPaymentResult(updated);
            if (scenario === 'success') {
                setPaymentState('completed');
                clearCart();
            } else {
                setPaymentState(scenario);
            }
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        } catch (err) {
            console.error('Simulation error:', err);
        }
    };

    return (
        <div className="min-h-screen px-5 py-6 sm:px-8">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-sm text-foreground/65 transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
                        Back to Sylvia Aesthetics
                    </Link>
                    <SylviaBrandLogo variant="horizontal" />
                    <span className="label-mono hidden text-foreground/40 sm:block">M-Pesa Verified Checkout</span>
                </div>

                {/* 1. COMPLETED PAYMENT & OFFICIAL RECEIPT */}
                {paymentState === 'completed' && order ? (
                    <div className="mx-auto mt-12 max-w-2xl">
                        {/* Printable Receipt Container */}
                        <div id="sylvia-receipt" className="glass-solid rounded-3xl p-8 border border-white/20 shadow-2xl">
                            {/* Receipt Header */}
                            <div className="flex items-start justify-between border-b border-white/10 pb-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/40">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        M-Pesa Payment Verified
                                    </div>
                                    <h1 className="mt-3 font-display text-2xl font-semibold uppercase tracking-wider">
                                        Official Receipt
                                    </h1>
                                    <p className="mt-1 text-xs text-foreground/60">
                                        Sylvia Aesthetics Skin Clinic Ltd. · Sylviamuchiriaesthetics.com
                                    </p>
                                </div>
                                <div className="text-right">
                                    <SylviaMonogram className="h-8 w-5 ml-auto text-primary mb-1" />
                                    <p className="label-mono text-xs text-foreground/40">Order Ref</p>
                                    <p className="font-mono text-base font-semibold text-foreground">#{order.order_number}</p>
                                    <p className="mt-1 text-xs text-foreground/50">
                                        {new Date().toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* M-Pesa Transaction Verification Box */}
                            <div className="mt-6 rounded-2xl bg-white/[0.04] p-4 border border-white/10">
                                <p className="label-mono text-[11px] text-foreground/50">Safaricom Daraja Verification</p>
                                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-foreground/50">M-Pesa Receipt:</span>
                                        <p className="font-mono font-semibold text-emerald-400 mt-0.5">
                                            {paymentResult?.mpesa_receipt_number || 'NLJ148829'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-foreground/50">Account Reference:</span>
                                        <p className="font-mono text-foreground mt-0.5">{order.order_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-foreground/50">Customer Phone:</span>
                                        <p className="font-mono text-foreground mt-0.5">{form.phone_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-foreground/50">Payment Status:</span>
                                        <p className="font-semibold text-emerald-400 uppercase mt-0.5">Cleared & Confirmed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer & Delivery Details */}
                            <div className="mt-6 grid grid-cols-2 gap-4 text-xs border-b border-white/10 pb-6">
                                <div>
                                    <p className="label-mono text-foreground/50">Billed To</p>
                                    <p className="mt-1 font-medium text-foreground">{order.customer_name}</p>
                                    <p className="text-foreground/60">{order.email}</p>
                                </div>
                                <div>
                                    <p className="label-mono text-foreground/50">Shipping Destination</p>
                                    <p className="mt-1 text-foreground/80">{order.address_line1}</p>
                                    <p className="text-foreground/60">
                                        {order.city}, {order.country} {order.postal_code}
                                    </p>
                                </div>
                            </div>

                            {/* Ordered Items Table */}
                            <div className="mt-6">
                                <p className="label-mono text-foreground/50 text-xs">Purchased Formulas</p>
                                <ul className="mt-3 divide-y divide-white/5 text-xs">
                                    {order.items.map((i, idx) => (
                                        <li key={idx} className="flex items-center justify-between py-2.5">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                                                    style={{ backgroundColor: i.shade_hex || '#e2b' }}
                                                />
                                                <span className="font-medium text-foreground">{i.name}</span>
                                                <span className="text-foreground/50">({i.shade_name}) × {i.quantity}</span>
                                            </div>
                                            <span className="font-mono tabular-nums text-foreground">
                                                {formatPrice(i.price * i.quantity)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {order.gift_unlocked && (
                                    <div className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs text-foreground/75 flex items-center justify-between">
                                        <span>Complimentary Studio Gift</span>
                                        <span>{FREE_GIFT_NAME}</span>
                                    </div>
                                )}
                            </div>

                            {/* Total summary */}
                            <div className="mt-6 space-y-1.5 border-t border-white/10 pt-4 text-xs">
                                <div className="flex justify-between text-foreground/60">
                                    <span>Subtotal</span>
                                    <span className="font-mono">{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-foreground/60">
                                    <span>Shipping</span>
                                    <span className="font-mono">
                                        {Number(order.shipping) === 0 ? 'Free' : formatPrice(order.shipping)}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 text-sm font-semibold text-foreground border-t border-white/10">
                                    <span>Total Amount Paid</span>
                                    <span className="font-mono text-emerald-400">
                                        {formatPrice(order.total)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Action Buttons */}
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="glass-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs uppercase tracking-wider font-medium text-foreground"
                            >
                                <Printer className="h-4 w-4" />
                                Print / Save Receipt
                            </button>
                            <Link
                                to="/"
                                className="glass-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs uppercase tracking-wider font-medium text-primary-foreground bg-primary"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                ) : paymentState === 'awaiting_pin' ? (
                    /* 2. LIVE M-PESA STK PROMPT OR DYNAMIC QR SCREEN */
                    <div className="mx-auto mt-14 max-w-lg text-center">
                        <div className="glass-panel relative rounded-3xl p-8 border border-white/15 shadow-2xl">
                            {paymentMethod === 'stk_push' ? (
                                <>
                                    <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                                        <Smartphone className="h-9 w-9 text-emerald-400 animate-pulse" />
                                        <span className="absolute inset-0 rounded-full border border-emerald-400/40 animate-ping opacity-60" />
                                    </div>

                                    <h1 className="mt-6 font-display text-2xl font-medium tracking-tight">
                                        STK Push Sent to Your Phone
                                    </h1>
                                    <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                                        A prompt of <span className="font-semibold text-foreground">${total} (KES {(total * 130).toLocaleString()})</span> has been sent to{' '}
                                        <span className="font-mono font-medium text-emerald-400">{form.phone_number}</span>.
                                    </p>
                                    <p className="mt-1 text-xs text-foreground/50">
                                        Please enter your 4-digit M-Pesa PIN on your handset to authorize.
                                    </p>

                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-foreground/60">
                                        <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                                        <span>Listening for Safaricom Daraja confirmation...</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/15 border border-purple-500/30">
                                        <QrCode className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <h1 className="mt-5 font-display text-2xl font-medium">Scan to Pay with M-Pesa</h1>
                                    <p className="mt-1 text-xs text-foreground/60">
                                        Open M-Pesa App &gt; Tap Scan QR or use the Paybill details below:
                                    </p>

                                    {/* M-Pesa QR Code Display */}
                                    <div className="mt-5 mx-auto w-48 h-48 rounded-2xl bg-white p-3 flex flex-col items-center justify-center shadow-lg">
                                        <div className="text-center font-mono text-[10px] text-black/80 font-bold mb-1">
                                            SYLVIA AESTHETICS M-PESA
                                        </div>
                                        <div className="w-36 h-36 border-2 border-black/80 p-2 flex flex-col items-center justify-center bg-gray-50 rounded-lg text-black text-center text-xs">
                                            <QrCode className="h-20 w-20 text-black mb-1" />
                                            <span className="font-mono text-[9px] font-bold">#{order?.order_number}</span>
                                        </div>
                                    </div>

                                    {/* Manual Paybill Instructions */}
                                    <div className="mt-5 rounded-xl bg-white/5 p-4 text-xs text-left space-y-1.5 border border-white/10">
                                        <div className="flex justify-between">
                                            <span className="text-foreground/50">Paybill Number:</span>
                                            <span className="font-mono font-bold text-foreground">174379</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-foreground/50">Account Number:</span>
                                            <span className="font-mono font-bold text-emerald-400">{order?.order_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-foreground/50">Amount:</span>
                                            <span className="font-mono font-bold text-foreground">KES {(total * 130).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Sandbox Simulation Bar */}
                            <div className="mt-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4 text-xs">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-amber-300">Sandbox Test Controls</span>
                                    <span className="text-[10px] text-amber-300/60 uppercase">Development Mode</span>
                                </div>
                                <p className="text-[11px] text-foreground/60 text-left mb-3">
                                    Test the instant callback without needing a physical phone PIN prompt:
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSimulateSandboxAction('success')}
                                        className="flex-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 py-2 text-emerald-200 font-medium transition-colors"
                                    >
                                        Simulate Approval (PIN Entered)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSimulateSandboxAction('cancelled')}
                                        className="rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 px-3 py-2 text-red-200 transition-colors"
                                    >
                                        Simulate Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Cancel / Switch Method */}
                            <div className="mt-5 flex justify-center gap-4 text-xs">
                                <button
                                    type="button"
                                    onClick={() => handleRetryPayment(paymentMethod === 'stk_push' ? 'qr_code' : 'stk_push')}
                                    className="text-foreground/60 hover:text-foreground underline underline-offset-4"
                                >
                                    Switch to {paymentMethod === 'stk_push' ? 'Dynamic QR Code' : 'STK Push'}
                                </button>
                                <span>·</span>
                                <button
                                    type="button"
                                    onClick={() => setPaymentState('idle')}
                                    className="text-foreground/60 hover:text-foreground underline underline-offset-4"
                                >
                                    Change Phone / Address
                                </button>
                            </div>
                        </div>
                    </div>
                ) : paymentState === 'cancelled' || paymentState === 'failed' || paymentState === 'timeout' ? (
                    /* 3. FAILED / CANCELLED PAYMENT FEEDBACK */
                    <div className="mx-auto mt-16 max-w-md text-center">
                        <div className="glass-panel rounded-3xl p-8 border border-red-500/20 shadow-2xl">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30">
                                <XCircle className="h-8 w-8 text-red-400" />
                            </div>
                            <h1 className="mt-5 font-display text-2xl font-medium">
                                {paymentState === 'cancelled'
                                    ? 'Payment Cancelled on Phone'
                                    : paymentState === 'timeout'
                                    ? 'Payment Request Timed Out'
                                    : 'Payment Could Not Be Completed'}
                            </h1>
                            <p className="mt-2 text-xs leading-relaxed text-foreground/65">
                                {paymentResult?.result_desc ||
                                    'The M-Pesa transaction was not completed. Your order has been saved and your shades remain reserved.'}
                            </p>

                            <div className="mt-6 flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => handleRetryPayment('stk_push')}
                                    className="glass-btn flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-xs uppercase tracking-wider font-medium text-primary-foreground"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Retry STK Push
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRetryPayment('qr_code')}
                                    className="glass-btn flex h-11 w-full items-center justify-center gap-2 rounded-full text-xs uppercase tracking-wider text-foreground/80"
                                >
                                    <QrCode className="h-3.5 w-3.5" />
                                    Pay with M-Pesa QR Code Instead
                                </button>
                            </div>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    /* 4. EMPTY BAG */
                    <div className="mx-auto mt-24 max-w-md text-center">
                        <h1 className="font-display text-3xl font-medium tracking-[-0.03em]">Your bag is empty</h1>
                        <p className="mt-3 text-sm text-foreground/60">
                            Add a shade from the cosmic catalog and it will appear here.
                        </p>
                        <Link
                            to="/"
                            className="glass-btn label-mono mt-8 inline-flex h-12 items-center justify-center rounded-full px-8 text-foreground"
                        >
                            Browse the catalog
                        </Link>
                    </div>
                ) : (
                    /* 5. MAIN CHECKOUT FORM & DELIVERY DETAILS */
                    <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                        <form onSubmit={handlePlaceOrderAndPay} className="glass-panel rounded-[1.75rem] p-6 sm:p-8">
                            <h1 className="font-display text-2xl font-medium tracking-[-0.03em]">Delivery & M-Pesa Details</h1>
                            <p className="mt-2 text-sm text-foreground/55">
                                Orders leave our Nairobi studio within two working days with secure M-Pesa verification.
                            </p>

                            {/* Delivery Fields */}
                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                {FIELDS.map((field) => (
                                    <div key={field.name} className={field.name === 'address_line1' ? 'sm:col-span-2' : ''}>
                                        <label htmlFor={field.name} className="label-mono text-foreground/50 text-xs">
                                            {field.label}
                                        </label>
                                        <input
                                            id={field.name}
                                            name={field.name}
                                            type={field.type}
                                            required={field.required}
                                            autoComplete={field.autoComplete}
                                            value={form[field.name]}
                                            onChange={(e) => update(field.name, e.target.value)}
                                            className="mt-2 h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-white/40"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* M-PESA PAYMENT SELECTION */}
                            <div className="mt-8 rounded-2xl border border-white/15 bg-white/[0.03] p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                        <p className="label-mono text-xs font-medium text-foreground">Safaricom M-Pesa Gateway</p>
                                    </div>
                                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                        Instant STK & QR
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('stk_push')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs ${
                                            paymentMethod === 'stk_push'
                                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                                                : 'border-white/10 bg-white/5 text-foreground/60 hover:text-foreground'
                                        }`}
                                    >
                                        <Smartphone className="h-5 w-5 mb-1" />
                                        <span className="font-medium">M-Pesa STK Push</span>
                                        <span className="text-[10px] text-foreground/45 mt-0.5">Prompt on phone</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('qr_code')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs ${
                                            paymentMethod === 'qr_code'
                                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                                                : 'border-white/10 bg-white/5 text-foreground/60 hover:text-foreground'
                                        }`}
                                    >
                                        <QrCode className="h-5 w-5 mb-1" />
                                        <span className="font-medium">Dynamic QR Code</span>
                                        <span className="text-[10px] text-foreground/45 mt-0.5">Scan with App</span>
                                    </button>
                                </div>

                                {/* Phone number input for STK Push */}
                                {paymentMethod === 'stk_push' && (
                                    <div className="mt-4">
                                        <label htmlFor="phone_number" className="label-mono text-foreground/50 text-xs">
                                            M-Pesa Phone Number (Safaricom)
                                        </label>
                                        <div className="relative mt-2">
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                                            <input
                                                id="phone_number"
                                                name="phone_number"
                                                type="tel"
                                                required
                                                placeholder="0712345678 or 254712345678"
                                                value={form.phone_number}
                                                onChange={(e) => update('phone_number', e.target.value)}
                                                className="h-12 w-full rounded-xl border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-emerald-500/50 font-mono"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delivery notes */}
                            <div className="mt-6">
                                <label htmlFor="notes" className="label-mono text-foreground/50 text-xs">
                                    Delivery notes (optional)
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={2}
                                    value={form.notes || ''}
                                    onChange={(e) => update('notes', e.target.value)}
                                    className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-white/40"
                                />
                            </div>

                            {error && (
                                <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[11px] font-medium uppercase tracking-[0.24em] text-primary-foreground transition-all duration-500 hover:shadow-[0_20px_44px_-18px_var(--accent-glow)] disabled:opacity-70"
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting
                                    ? 'Initiating M-Pesa...'
                                    : `Pay ${formatPrice(total)} via M-Pesa`}
                            </button>
                        </form>

                        {/* Order Summary Sidebar */}
                        <aside className="glass-panel h-fit rounded-[1.75rem] p-6 sm:p-8 lg:sticky lg:top-6">
                            <p className="label-mono text-foreground/50">Your order</p>
                            <ul className="mt-4 space-y-3">
                                {items.map((item) => (
                                    <li key={item.key} className="flex gap-3">
                                        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-black/40">
                                            <Image src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm">{item.name}</p>
                                            <p className="mt-1 flex items-center gap-2 text-[11px] text-foreground/55">
                                                <span
                                                    className="h-2 w-2 rounded-full ring-1 ring-white/25"
                                                    style={{ backgroundColor: item.shade_hex }}
                                                />
                                                {item.shade_name} · ×{item.quantity}
                                            </p>
                                            <p className="mt-2 text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {giftUnlocked ? (
                                <p className="mt-5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[12px] text-foreground/70">
                                    Gift unlocked: {FREE_GIFT_NAME}
                                </p>
                            ) : (
                                <p className="mt-5 rounded-xl border border-white/10 px-4 py-3 text-[12px] text-foreground/50">
                                    Add {formatPrice(FREE_GIFT_THRESHOLD - subtotal)} more for the free mini gloss.
                                </p>
                            )}

                            <div className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm">
                                <div className="flex justify-between text-foreground/65">
                                    <span>Subtotal</span>
                                    <span className="tabular-nums">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-foreground/65">
                                    <span>Shipping</span>
                                    <span className="tabular-nums">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                                </div>
                                <div className="flex justify-between pt-2 font-display text-lg">
                                    <span>Total</span>
                                    <span className="tabular-nums">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
