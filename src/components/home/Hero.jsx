import { useEffect, useState, useRef } from 'react';
import { ArrowDownRight, Sparkles, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { SylviaMonogram } from '@/components/ui/SylviaBrandLogo';

const WORDS = ['SYLVIA', 'AESTHETICS'];

const SHOWCASE_PRODUCTS = [
    {
        id: 'tint-08',
        name: 'Sylvia Skin Tint',
        shade: 'Shade 08 · Deep Cocoa',
        hex: '#6B3B24',
        spec: '30 ML · Physician Formulated',
        badge: 'Flagship Formulation',
        finish: 'Second-Skin Mineral Veil',
        image: '/images/products/flagship-skin-tint-isolated.png',
        isIsolated: true,
    },
    {
        id: 'lacquer-espresso',
        name: 'Precision Lip Lacquer',
        shade: 'Obsidian Espresso · 02',
        hex: '#2A1612',
        spec: '6-Hour Mirror Glass',
        badge: 'Fan Favorite',
        finish: 'Micro-Pigment Plumping Core',
        image: '/images/products/catalog-2.jpeg',
        isIsolated: false,
    },
    {
        id: 'velvet-truffle',
        name: 'Velvet Lip Contour',
        shade: 'Mocha Truffle · Matte',
        hex: '#4A362D',
        spec: 'Hyaluronic Micro-Spheres',
        badge: 'Bestseller',
        finish: 'Cashmere Silk Finish',
        image: '/images/products/catalog-3.jpeg',
        isIsolated: false,
    },
    {
        id: 'cellular-elixir',
        name: 'Botanical Recovery Elixir',
        shade: 'Pure Golden Radiance',
        hex: '#D4AF37',
        spec: '100% Bio-Active Lipids',
        badge: 'Doctor Approved',
        finish: 'Deep Dermal Rescue Serum',
        image: '/images/products/catalog-9.jpeg',
        isIsolated: false,
    },
    {
        id: 'tint-04',
        name: 'Sylvia Skin Tint',
        shade: 'Shade 04 · Warm Honey',
        hex: '#C48E6C',
        spec: 'Bio-Mimetic Peptide Radiance',
        badge: 'New Arrival',
        finish: 'Dewy Second-Skin Fluid',
        image: '/images/products/catalog-1.jpeg',
        isIsolated: false,
    },
    {
        id: 'flush-sunstone',
        name: 'Radiant Cheek Flush',
        shade: 'Sunstone Bronze · Sculpt',
        hex: '#C27352',
        spec: 'Micronised Bronze Mica',
        badge: 'Award Winner',
        finish: 'Luminous Sculpt Blush',
        image: '/images/products/catalog-8.jpeg',
        isIsolated: false,
    },
];

export default function Hero() {
    const [pointer, setPointer] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);
    const [activeProductIndex, setActiveProductIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const heroRef = useRef(null);

    // Auto-rotate showcase products every 4.5 seconds
    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setActiveProductIndex((prev) => (prev + 1) % SHOWCASE_PRODUCTS.length);
        }, 4500);
        return () => clearInterval(interval);
    }, [isHovered]);

    const activeProduct = SHOWCASE_PRODUCTS[activeProductIndex];

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let ticking = false;

        const handlePointer = (clientX, clientY) => {
            const x = (clientX / window.innerWidth - 0.5) * 2;
            const y = (clientY / window.innerHeight - 0.5) * 2;
            setPointer({
                x: Math.max(-1, Math.min(1, x)),
                y: Math.max(-1, Math.min(1, y)),
            });
        };

        const onPointerMove = (e) => {
            handlePointer(e.clientX, e.clientY);
        };

        const onTouchMove = (e) => {
            if (e.touches && e.touches[0]) {
                handlePointer(e.touches[0].clientX, e.touches[0].clientY);
            }
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrollY(window.scrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    // Full-page parallax vectors
    const bgX = pointer.x * -20;
    const bgY = pointer.y * -14;

    const productRotateX = -pointer.y * 8;
    const productRotateY = pointer.x * 10;
    const productX = pointer.x * 24;
    const productY = pointer.y * 16 - scrollY * 0.14;

    const textX = pointer.x * -8;
    const textY = pointer.y * -6;

    return (
        <section
            ref={heroRef}
            id="top"
            aria-label="Sylvia Aesthetics"
            className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden px-5 pb-12 pt-32 sm:px-8 sm:pb-16"
        >
            {/* Full-bleed responsive ambient atmospheric depth tracking whole page movement */}
            <div
                className="pointer-events-none absolute inset-0 -z-30 transition-transform duration-700 ease-out"
                style={{
                    transform: `translate3d(${bgX}px, ${bgY}px, 0) scale(1.08)`,
                    background:
                        'radial-gradient(ellipse 75% 65% at 75% 35%, var(--accent-glow), transparent 72%), radial-gradient(ellipse 65% 55% at 20% 75%, var(--halo), transparent 65%)',
                }}
            />

            {/* Cinematic gradient veil across whole page */}
            <div
                className="pointer-events-none absolute inset-0 -z-20 transition-colors duration-700"
                style={{
                    background:
                        'radial-gradient(120% 90% at 75% 35%, transparent 0%, rgba(0,0,0,0.22) 45%, var(--hero-veil) 100%)',
                }}
            />

            {/* Subtle floating starfield/dust shimmer in zero-gravity */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-35"
                style={{
                    backgroundImage:
                        'radial-gradient(1.5px 1.5px at 20px 30px, var(--accent-raw), rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 140px, var(--foreground), rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 220px 210px, var(--accent-raw), rgba(0,0,0,0))',
                    backgroundSize: '280px 280px',
                    transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -8}px, 0)`,
                }}
            />

            {/* Grand Towering Product Visual Filling the Right Side of the Whole Screen with Auto-Rotating Showcase */}
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="absolute right-[-4%] sm:right-[2%] lg:right-[6%] top-0 bottom-12 lg:bottom-16 w-full sm:w-[65%] lg:w-[48%] flex items-center justify-center lg:justify-end z-0 select-none [perspective:1200px]"
            >
                <div
                    className="relative flex items-center justify-center h-full transition-transform duration-500 ease-out will-change-transform"
                    style={{
                        transform: `rotateX(${productRotateX}deg) rotateY(${productRotateY}deg) translate3d(${productX}px, ${productY}px, 0)`,
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Glowing ambient aura dynamically tinted to the active product shade */}
                    <div
                        className="absolute -inset-14 rounded-full opacity-70 blur-3xl pointer-events-none transition-all duration-700"
                        style={{
                            background: `radial-gradient(circle, ${activeProduct.hex}55 0%, var(--accent-glow) 45%, transparent 72%)`,
                            transform: `translate3d(${pointer.x * -15}px, ${pointer.y * -15}px, -40px)`,
                        }}
                    />

                    {/* Rotating Product Showcase Stack */}
                    <div className="relative flex items-center justify-center">
                        {SHOWCASE_PRODUCTS.map((prod, idx) => {
                            const isActive = idx === activeProductIndex;
                            return (
                                <div
                                    key={prod.id}
                                    className={`transition-all duration-700 ease-out ${
                                        isActive
                                            ? 'opacity-100 scale-100 z-10 translate-y-0'
                                            : 'opacity-0 scale-95 z-0 translate-y-6 pointer-events-none absolute'
                                    }`}
                                >
                                    {prod.isIsolated ? (
                                        <img
                                            src={prod.image}
                                            alt={prod.name}
                                            className="h-[68vh] sm:h-[84vh] lg:h-[92vh] max-h-[850px] w-auto object-contain filter drop-shadow-[0_35px_80px_rgba(0,0,0,0.7)] transition-all duration-700 ease-out hover:scale-105 opacity-40 sm:opacity-100 translate-y-10 sm:translate-y-0"
                                            loading="eager"
                                        />
                                    ) : (
                                        <div className="relative h-[55vh] sm:h-[72vh] lg:h-[78vh] aspect-[3/4] max-h-[720px] rounded-[2.5rem] overflow-hidden border border-border/60 bg-black/25 shadow-[0_35px_90px_-20px_rgba(0,0,0,0.8)] backdrop-blur-sm group">
                                            <img
                                                src={prod.image}
                                                alt={prod.name}
                                                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out hover:scale-105"
                                                loading="eager"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                                                <div>
                                                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70 font-medium">
                                                        {prod.badge}
                                                    </p>
                                                    <p className="font-display text-xl font-medium tracking-tight text-white mt-1">
                                                        {prod.name}
                                                    </p>
                                                    <p className="text-xs text-white/70 mt-0.5">{prod.finish}</p>
                                                </div>
                                                <span
                                                    className="h-5 w-5 rounded-full ring-2 ring-white/70 shadow-lg shrink-0"
                                                    style={{ backgroundColor: prod.hex }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Dynamic Specular Sheen Gliding over the Bottle on cursor/touch angle */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
                        style={{
                            background: `linear-gradient(${120 + pointer.x * 25}deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)`,
                        }}
                    />

                    {/* Floating Parallax Pill 1: Dynamic Shade & Swatch */}
                    <div
                        className="hidden sm:flex absolute -left-8 top-[32%] rounded-full border border-border/60 bg-card/90 px-4 py-2 shadow-2xl backdrop-blur-md items-center gap-2.5 transition-all duration-500 pointer-events-auto"
                        style={{
                            transform: `translate3d(${pointer.x * 28}px, ${pointer.y * 20}px, 45px)`,
                        }}
                    >
                        <span
                            className="h-3 w-3 rounded-full ring-1 ring-white/40 shadow-sm transition-colors duration-500"
                            style={{ backgroundColor: activeProduct.hex }}
                        />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-foreground font-medium whitespace-nowrap transition-all duration-300">
                            {activeProduct.shade}
                        </span>
                    </div>

                    {/* Floating Parallax Pill 2: Dynamic Formulation Spec */}
                    <div
                        className="hidden sm:flex absolute -right-6 bottom-[26%] rounded-full border border-border/60 bg-card/90 px-4 py-2 shadow-2xl backdrop-blur-md items-center gap-2.5 transition-all duration-500 pointer-events-auto"
                        style={{
                            transform: `translate3d(${pointer.x * -24}px, ${pointer.y * -18}px, 40px)`,
                        }}
                    >
                        <ShieldCheck className="h-4 w-4 text-primary transition-transform duration-500" />
                        <span className="font-mono text-[11px] uppercase tracking-wider text-foreground font-medium whitespace-nowrap transition-all duration-300">
                            {activeProduct.spec}
                        </span>
                    </div>

                    {/* Interactive Rotating Showcase Indicator Dots & Controls */}
                    <div
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-border/50 bg-card/90 px-3 py-1.5 shadow-xl backdrop-blur-md pointer-events-auto transition-transform duration-300"
                        style={{
                            transform: `translate3d(calc(-50% + ${pointer.x * 12}px), ${pointer.y * 8}px, 50px)`,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setActiveProductIndex((prev) => (prev - 1 + SHOWCASE_PRODUCTS.length) % SHOWCASE_PRODUCTS.length)
                            }
                            aria-label="Previous showcase product"
                            className="text-foreground/50 hover:text-foreground transition-colors p-0.5"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex items-center gap-1.5 px-1">
                            {SHOWCASE_PRODUCTS.map((p, idx) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setActiveProductIndex(idx)}
                                    aria-label={`Show ${p.name}`}
                                    className={`h-1.5 rounded-full transition-all duration-400 ${
                                        idx === activeProductIndex
                                            ? 'w-6 bg-primary shadow-[0_0_8px_var(--accent-glow)]'
                                            : 'w-1.5 bg-foreground/25 hover:bg-foreground/50'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveProductIndex((prev) => (prev + 1) % SHOWCASE_PRODUCTS.length)}
                            aria-label="Next showcase product"
                            className="text-foreground/50 hover:text-foreground transition-colors p-0.5"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Foreground Content Container */}
            <div className="mx-auto w-full max-w-7xl relative z-10">
                <div className="max-w-3xl min-h-[62svh] flex flex-col justify-center">
                    <div
                        className="transition-transform duration-500 ease-out"
                        style={{
                            transform: `translate3d(${textX}px, ${textY}px, 0)`,
                        }}
                    >
                        {/* Clinical eyebrow */}
                        <div
                            className="rise-in inline-flex items-center gap-3 rounded-full border border-border/40 bg-card/65 px-4 py-1.5 shadow-sm backdrop-blur-md mb-6"
                            style={{ animationDelay: '0.05s' }}
                        >
                            <SylviaMonogram className="h-5 w-3.5 text-primary" />
                            <span className="font-mono text-xs uppercase tracking-[0.24em] text-foreground/80 font-medium">
                                Refined Beauty
                            </span>
                        </div>

                        {/* Huge Display Headline with interactive .hero-letter illumination */}
                        <h1 className="font-display text-[clamp(2.75rem,7.5vw,6.5rem)] font-normal uppercase leading-[0.88] tracking-[-0.035em] text-foreground">
                            {WORDS.map((word) => (
                                <span key={word} className="block whitespace-nowrap">
                                    {word.split('').map((char, index) => (
                                        <span key={`${char}-${index}`} className="hero-letter">
                                            {char}
                                        </span>
                                    ))}
                                </span>
                            ))}
                        </h1>

                        {/* Tagline / Mission */}
                        <p
                            className="rise-in mt-7 max-w-xl text-base leading-relaxed text-foreground/75 sm:text-lg font-light"
                            style={{ animationDelay: '0.4s' }}
                        >
                            Physician-grade cosmetic formulations and precision dermatological skin therapies.

                        </p>

                        {/* CTAs */}
                        <div
                            className="rise-in mt-9 flex flex-col gap-3.5 sm:flex-row sm:items-center"
                            style={{ animationDelay: '0.55s' }}
                        >
                            <a
                                href="#shade-studio"
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-[11px] font-medium uppercase tracking-[0.24em] text-primary-foreground shadow-lg transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-18px_var(--accent-glow)] active:scale-95"
                            >
                                Shade Studio
                            </a>
                            <a
                                href="#catalog"
                                className="glass-btn inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-[11px] font-medium uppercase tracking-[0.24em] text-foreground transition-all duration-300 hover:border-primary/50"
                            >
                                Shop Now
                                <ArrowDownRight className="h-4 w-4" strokeWidth={1.6} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
