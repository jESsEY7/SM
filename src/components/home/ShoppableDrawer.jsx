import { useState } from 'react';
import { X, Check, ShoppingBag, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { Link } from 'react-router-dom';

export default function ShoppableDrawer({ product, isOpen, onClose }) {
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    const [size, setSize] = useState('30ml');
    const [added, setAdded] = useState(false);

    if (!isOpen || !product) return null;

    const basePrice = product.price || 48;
    const finalPrice = size === '50ml' ? basePrice * 1.5 : basePrice;

    const handleAdd = () => {
        addItem({
            ...product,
            price: finalPrice,
            shade_name: `${product.shade || product.shade_name} (${size.toUpperCase()})`,
            shade_hex: product.hex || product.shade_hex || '#6B3B24',
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

            {/* Slide-over Drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={`Shoppable Video Details for ${product.name}`}
                className="relative z-10 w-full max-w-md h-full glass-solid border-l border-border/60 bg-background/95 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-400"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                            Shoppable Video Hotspot
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close drawer"
                        className="grid h-9 w-9 place-items-center rounded-full border border-border/50 text-foreground/70 hover:text-foreground hover:bg-white/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Product Media & Details */}
                <div className="my-6 space-y-5">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/40 bg-black/30 flex items-center justify-center">
                        <img
                            src={product.image || product.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain p-4"
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-primary/90 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-primary-foreground shadow-md">
                            {product.badge || 'Featured In Video'}
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-2xl font-medium tracking-tight text-foreground">
                                {product.name}
                            </h3>
                            <span className="font-mono text-lg font-semibold text-primary">
                                {formatPrice(finalPrice)}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-foreground/60 font-mono">
                            {product.finish || 'Physician Melanin Calibrated'}
                        </p>
                    </div>

                    <p className="text-sm text-foreground/75 leading-relaxed font-light">
                        {product.description ||
                            'Physician-grade cosmetic formula engineered for cellular hydration, skin-barrier reinforcement, and true melanin undertone reflection.'}
                    </p>

                    {/* Shade swatch indicator */}
                    <div className="rounded-xl border border-border/40 bg-card/50 p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span
                                className="h-6 w-6 rounded-full ring-2 ring-white/60 shadow-md shrink-0"
                                style={{ backgroundColor: product.hex || product.shade_hex || '#6B3B24' }}
                            />
                            <div>
                                <p className="text-xs font-medium text-foreground">
                                    {product.shade || product.shade_name || 'Shade 08 Deep Cocoa'}
                                </p>
                                <p className="text-[11px] text-foreground/50 font-mono">Clinical Undertone Match</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <Sparkles className="h-3 w-3" />
                            In Stock
                        </span>
                    </div>

                    {/* Size Selector */}
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-foreground/60 mb-2">
                            Select Formulation Volume
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setSize('30ml')}
                                className={`rounded-xl border py-2.5 px-3 text-xs font-mono transition-all flex items-center justify-between ${
                                    size === '30ml'
                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                        : 'border-border/40 bg-card/40 text-foreground/70 hover:text-foreground'
                                }`}
                            >
                                <span>30 ML Standard</span>
                                <span className="text-[10px] opacity-75">{formatPrice(basePrice)}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSize('50ml')}
                                className={`rounded-xl border py-2.5 px-3 text-xs font-mono transition-all flex items-center justify-between ${
                                    size === '50ml'
                                        ? 'border-primary bg-primary/10 text-primary font-medium'
                                        : 'border-border/40 bg-card/40 text-foreground/70 hover:text-foreground'
                                }`}
                            >
                                <span>50 ML Studio Pro</span>
                                <span className="text-[10px] opacity-75">{formatPrice(basePrice * 1.5)}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-border/40 pt-4 space-y-2.5">
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="w-full h-12 rounded-full bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.22em] font-medium flex items-center justify-center gap-2 shadow-lg transition-all hover:shadow-[0_16px_36px_-12px_var(--accent-glow)] active:scale-98"
                    >
                        {added ? (
                            <>
                                <Check className="h-4 w-4" strokeWidth={2.2} />
                                Added to Bag
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                                Quick Add · {formatPrice(finalPrice)}
                            </>
                        )}
                    </button>

                    <Link
                        to="/checkout"
                        onClick={onClose}
                        className="w-full h-11 rounded-full border border-border/60 bg-card/60 text-foreground font-mono text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                    >
                        <span>Fast Checkout with M-Pesa</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </aside>
        </div>
    );
}

