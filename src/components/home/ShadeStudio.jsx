import { useMemo, useState, useRef, useEffect } from 'react';
import { Plus, RotateCcw, ScanFace, Check, Sparkles, Target } from 'lucide-react';
import Reveal from '@/components/site/Reveal';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

const depthLabel = (d) =>
    d <= 2 ? 'Porcelain' : d <= 4 ? 'Fair' : d <= 6 ? 'Medium' : d <= 8 ? 'Tan–deep' : 'Rich deep';

const undertoneLabel = (u) =>
    u <= -2 ? 'Cool' : u === -1 ? 'Cool neutral' : u === 0 ? 'True neutral' : u === 1 ? 'Warm neutral' : 'Warm';

const family = (u) => (u <= -2 ? 'cool' : u >= 2 ? 'warm' : 'neutral');

function skinColor(depth, undertone) {
    const hue = 22 + undertone * 4;
    const sat = Math.max(22, 50 - depth * 2.2);
    const light = Math.max(16, 88 - depth * 7.2);
    return `hsl(${hue} ${sat}% ${light}%)`;
}

export default function ShadeStudio({ products = [] }) {
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    const [depth, setDepth] = useState(8);
    const [undertone, setUndertone] = useState(-2);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [added, setAdded] = useState(false);
    const [reticle, setReticle] = useState({ x: 50, y: 46 });
    const [scanning, setScanning] = useState(false);
    const scanTimeoutRef = useRef(null);
    const imageContainerRef = useRef(null);

    const safeProducts = Array.isArray(products) ? products : [];

    // Compute top matches based on depth & undertone
    const matches = useMemo(() => {
        if (!safeProducts || safeProducts.length === 0) return [];
        const want = family(undertone);
        return [...safeProducts]
            .map((p) => ({
                product: p,
                score: Math.abs(p.depth - depth) * 1.2 + (p.undertone === want ? 0 : 2.2),
            }))
            .sort((a, b) => a.score - b.score)
            .slice(0, 3);
    }, [products, depth, undertone]);

    const best = matches[0];
    const activeProduct = selectedProduct || best?.product;
    const confidence = Math.max(64, Math.min(99, Math.round(100 - (best?.score ?? 1) * 8.5)));

    // Trigger visual scan effect on adjustment
    const triggerScan = () => {
        setScanning(true);
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => setScanning(false), 800);
    };

    // Handle touch/click on the diagnostic face image
    const handleFaceInteract = (e) => {
        if (!imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = Math.max(10, Math.min(90, Math.round(((clientX - rect.left) / rect.width) * 100)));
        const y = Math.max(15, Math.min(85, Math.round(((clientY - rect.top) / rect.height) * 100)));

        setReticle({ x, y });
        // Map Y position to depth calibration (higher is forehead/highlight, lower is contour/deep)
        const calibratedDepth = Math.max(1, Math.min(10, Math.round((y / 100) * 8 + 2)));
        // Map X position to undertone calibration
        const calibratedUndertone = Math.max(-3, Math.min(3, Math.round(((x - 50) / 40) * 3)));

        setDepth(calibratedDepth);
        setUndertone(calibratedUndertone);
        setSelectedProduct(null);
        triggerScan();
    };

    const handleAdd = () => {
        if (!activeProduct) return;
        addItem(activeProduct);
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
    };

    const handleReset = () => {
        setDepth(5);
        setUndertone(0);
        setSelectedProduct(null);
        setReticle({ x: 50, y: 46 });
        triggerScan();
    };

    return (
        <section id="shade-studio" className="relative px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
                <Reveal className="max-w-xl">
                    <p className="label-mono text-foreground/50">Sylvia Aesthetics · Clinical Diagnostics</p>
                    <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[0.95] tracking-[0.08em] uppercase">
                        Clinical Shade Studio
                    </h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-foreground/65">
                        Calibrate your skin depth and natural undertone — our dermatological formula selector matches you
                        to your bespoke formulation.
                    </p>
                </Reveal>

                <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
                    {/* Left Column: Interactive Digital Skin Diagnostic Card */}
                    <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-3 shadow-xl">
                        <div
                            ref={imageContainerRef}
                            onClick={handleFaceInteract}
                            onTouchMove={handleFaceInteract}
                            className="group relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-black/40 cursor-crosshair select-none sm:aspect-[5/4] lg:aspect-[4/5]"
                        >
                            {/* Model portrait */}
                            <img
                                src="/images/clinic/clinic-2.jpeg"
                                alt="Sylvia Aesthetics clinical skin calibration and undertone diagnostic"
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            />

                            {/* Dynamic Tone Overlay responding in real-time to calibrated skin depth & undertone */}
                            <div
                                className="pointer-events-none absolute inset-0 opacity-45 transition-colors duration-500"
                                style={{
                                    background: `radial-gradient(circle at ${reticle.x}% ${reticle.y}%, ${skinColor(depth, undertone)} 0%, transparent 70%)`,
                                    mixBlendMode: 'soft-light',
                                }}
                            />

                            {/* Sweeping Laser Scan Line */}
                            <div
                                className={`pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-75 shadow-[0_0_16px_3px_var(--accent-glow)] transition-all duration-300 ${
                                    scanning ? 'scale-y-150 animate-pulse' : ''
                                }`}
                                style={{
                                    top: `${reticle.y}%`,
                                }}
                            />

                            {/* Precision Diagnostic Crosshair Reticle tracking user touch/click */}
                            <div
                                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out"
                                style={{ left: `${reticle.x}%`, top: `${reticle.y}%` }}
                            >
                                <div className="relative grid h-12 w-12 place-items-center">
                                    <div className="absolute inset-0 rounded-full border border-primary/70 animate-ping opacity-35" />
                                    <div className="h-8 w-8 rounded-full border border-primary/90 bg-primary/20 backdrop-blur-xs flex items-center justify-center">
                                        <div className="h-2 w-2 rounded-full bg-primary shadow-sm" />
                                    </div>
                                    <span className="absolute -bottom-5 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white backdrop-blur-md">
                                        {reticle.x}% · {reticle.y}%
                                    </span>
                                </div>
                            </div>

                            {/* Top Badge Overlay */}
                            <div className="absolute inset-x-4 top-4 flex items-center justify-between pointer-events-none">
                                <span className="glass-panel flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.24em] text-foreground/85 font-medium">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                    Digital skin · live
                                </span>
                                <div className="glass-panel rounded-full p-2 text-foreground/75">
                                    <ScanFace className="h-4 w-4" strokeWidth={1.4} />
                                </div>
                            </div>

                            {/* Helper hint for clients */}
                            <div className="pointer-events-none absolute top-14 left-4 rounded-full bg-card/60 px-3 py-1 text-[10px] text-foreground/70 backdrop-blur-sm border border-border/30 opacity-80 group-hover:opacity-100 transition-opacity">
                                Tap anywhere on facial zone to sample skin tone
                            </div>

                            {/* Bottom Readout Badges */}
                            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                                <div className="glass-solid rounded-2xl px-4 py-3 shadow-lg border border-border/50">
                                    <p className="label-mono text-foreground/55">Your skin</p>
                                    <div className="mt-2 flex items-center gap-2.5">
                                        <span
                                            className="h-7 w-7 rounded-full ring-2 ring-white/40 shadow-sm transition-colors duration-300"
                                            style={{ backgroundColor: skinColor(depth, undertone) }}
                                        />
                                        <span className="text-xs font-medium text-foreground/90 whitespace-nowrap">
                                            {depthLabel(depth)} · {undertoneLabel(undertone)}
                                        </span>
                                    </div>
                                </div>

                                <div className="glass-solid rounded-2xl px-4 py-3 shadow-lg border border-border/50">
                                    <p className="label-mono text-foreground/55">Matched pigment</p>
                                    <div className="mt-2 flex items-center gap-2.5">
                                        <span
                                            className="h-7 w-7 rounded-full ring-2 ring-white/40 shadow-sm transition-colors duration-300"
                                            style={{ backgroundColor: activeProduct?.shade_hex || '#C8826A' }}
                                        />
                                        <span className="text-xs font-medium text-foreground/90 whitespace-nowrap">
                                            {activeProduct?.shade_name || 'Bespoke'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Diagnostic Controls & Closest Match Recommendations */}
                    <div className="glass-panel flex flex-col rounded-[1.75rem] p-6 sm:p-8 shadow-xl">
                        {/* Header: Confidence & Reset */}
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="label-mono text-foreground/50">Match confidence</p>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <p className="font-display text-4xl tabular-nums tracking-tight font-normal text-foreground">
                                        {confidence}%
                                    </p>
                                    <span className="text-xs font-medium text-primary">Dermatologically verified</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleReset}
                                aria-label="Reset skin calibration"
                                className="label-mono flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-2 text-foreground/70 transition-colors hover:bg-card hover:text-foreground"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </button>
                        </div>

                        {/* Interactive Sliders */}
                        <div className="mt-8 space-y-7">
                            <div>
                                <div className="flex items-baseline justify-between">
                                    <label htmlFor="depth" className="label-mono text-foreground/60 font-medium">
                                        Skin depth
                                    </label>
                                    <span className="text-xs font-medium text-foreground/90">{depthLabel(depth)}</span>
                                </div>
                                <input
                                    id="depth"
                                    type="range"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={depth}
                                    onChange={(e) => {
                                        setDepth(Number(e.target.value));
                                        setSelectedProduct(null);
                                        triggerScan();
                                    }}
                                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-primary transition-all"
                                />
                                <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.16em] text-foreground/40 font-mono">
                                    <span>Porcelain</span>
                                    <span>Medium</span>
                                    <span>Rich deep</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-baseline justify-between">
                                    <label htmlFor="undertone" className="label-mono text-foreground/60 font-medium">
                                        Undertone
                                    </label>
                                    <span className="text-xs font-medium text-foreground/90">{undertoneLabel(undertone)}</span>
                                </div>
                                <input
                                    id="undertone"
                                    type="range"
                                    min="-3"
                                    max="3"
                                    step="1"
                                    value={undertone}
                                    onChange={(e) => {
                                        setUndertone(Number(e.target.value));
                                        setSelectedProduct(null);
                                        triggerScan();
                                    }}
                                    className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/15 accent-primary transition-all"
                                />
                                <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-mono">
                                    <span>Cool</span>
                                    <span>Neutral</span>
                                    <span>Warm</span>
                                </div>
                            </div>
                        </div>

                        <div className="my-7 h-px bg-border/40" />

                        {/* Closest Shades List (Clickable!) */}
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="label-mono text-foreground/50">Your closest shades</p>
                                <span className="text-[11px] text-foreground/40 font-mono">Select to preview</span>
                            </div>
                            <ul className="mt-3 space-y-2">
                                {matches.map(({ product }, i) => {
                                    const isSelected = activeProduct?.id === product.id;
                                    return (
                                        <li key={product.id}>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedProduct(product)}
                                                className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-primary/60 bg-primary/10 ring-1 ring-primary shadow-sm'
                                                        : 'border-border/40 bg-card/40 hover:bg-card/80 hover:border-border/70'
                                                }`}
                                            >
                                                <span
                                                    className="h-8 w-8 shrink-0 rounded-full ring-2 ring-white/25 shadow-sm"
                                                    style={{ backgroundColor: product.shade_hex }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[13px] font-medium text-foreground">
                                                        {product.shade_name}
                                                    </p>
                                                    <p className="truncate text-[11px] text-foreground/60">
                                                        {product.name} · {product.undertone}
                                                    </p>
                                                </div>
                                                {i === 0 && (
                                                    <span className="label-mono rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold text-primary-foreground uppercase tracking-wider">
                                                        Best
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-auto pt-7">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[13px] text-foreground/70">{activeProduct?.name || 'Diagnostic Match'}</p>
                                    <p className="font-display text-2xl tabular-nums font-normal text-foreground">
                                        {formatPrice(activeProduct?.price || 34)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!activeProduct}
                                    className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-[11px] font-medium uppercase tracking-[0.22em] text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-primary/30 active:scale-95"
                                >
                                    {added ? (
                                        <>
                                            <Check className="h-4 w-4" strokeWidth={2.2} />
                                            Added to Bag
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" strokeWidth={1.8} />
                                            Add matched shade
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
