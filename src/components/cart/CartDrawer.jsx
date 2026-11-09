// @ts-nocheck
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Gift } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { FREE_GIFT_NAME, FREE_GIFT_THRESHOLD, useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

export default function CartDrawer() {
    const { isOpen, closeCart, items, subtotal, setQuantity, removeItem } = useCart();
    const { formatPrice } = useCurrency();
    const progress = Math.min(100, (subtotal / FREE_GIFT_THRESHOLD) * 100);
    const remaining = Math.max(0, FREE_GIFT_THRESHOLD - subtotal);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="fixed inset-0 z-50"
                >
                    <button
                        type="button"
                        aria-label="Close bag"
                        onClick={closeCart}
                        className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-sm"
                    />
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                        className="glass-solid absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l"
                        aria-label="Your bag"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div>
                                <p className="label-mono text-foreground/55">Your bag</p>
                                <p className="mt-1 font-display text-lg font-medium tracking-tight">Sylvia Aesthetics Checkout</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeCart}
                                aria-label="Close bag"
                                className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                                    <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 text-foreground/60">
                                        <Gift className="h-5 w-5" strokeWidth={1.4} />
                                    </span>
                                    <p className="font-display text-base">Your bag is weightless</p>
                                    <p className="max-w-[16rem] text-sm text-foreground/60">
                                        Add a shade from the catalog and it will travel here in zero gravity.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={closeCart}
                                        className="glass-btn label-mono mt-2 rounded-full px-6 py-3 text-foreground"
                                    >
                                        Browse catalog
                                    </button>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {items.map((item) => (
                                        <li key={item.key} className="glass-panel flex gap-4 rounded-2xl p-3">
                                            <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-black/40">
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="truncate text-sm font-medium">{item.name}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.key)}
                                                        className="label-mono text-foreground/45 transition-colors hover:text-foreground"
                                                        aria-label={`Remove ${item.name}`}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <p className="mt-1 flex items-center gap-2 text-xs text-foreground/60">
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full ring-1 ring-white/25"
                                                        style={{ backgroundColor: item.shade_hex }}
                                                    />
                                                    {item.shade_name}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between pt-3">
                                                    <div className="flex items-center gap-1 rounded-full border border-white/15 px-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuantity(item.key, item.quantity - 1)}
                                                            aria-label={`Decrease ${item.name}`}
                                                            className="grid h-7 w-7 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="w-5 text-center text-xs tabular-nums">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setQuantity(item.key, item.quantity + 1)}
                                                            aria-label={`Increase ${item.name}`}
                                                            className="grid h-7 w-7 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-white/10 hover:text-foreground"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="border-t border-white/10 px-6 py-5">
                            <div className="mb-4">
                                <div className="flex items-center justify-between text-xs text-foreground/65">
                                    <span>{remaining > 0 ? `${formatPrice(remaining)} to unlock the mini gloss` : 'Mini gloss unlocked'}</span>
                                    <span className="tabular-nums">{Math.round(progress)}%</span>
                                </div>
                                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-primary transition-[width] duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-[11px] text-foreground/45">Gift: {FREE_GIFT_NAME}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="label-mono text-foreground/55">Subtotal</span>
                                <span className="font-display text-xl tabular-nums">{formatPrice(subtotal)}</span>
                            </div>
                            <Link
                                to="/checkout"
                                onClick={closeCart}
                                className={`label-mono mt-4 flex h-12 items-center justify-center rounded-full transition-all duration-500 ${items.length === 0
                                        ? 'pointer-events-none border border-white/10 text-foreground/30'
                                        : 'bg-primary text-primary-foreground hover:shadow-[0_18px_40px_-16px_var(--accent-glow)]'
                                    }`}
                            >
                                Proceed to checkout
                            </Link>
                            <p className="mt-3 text-center text-[11px] text-foreground/40">
                                Shipping and taxes calculated at checkout
                            </p>
                        </div>
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}