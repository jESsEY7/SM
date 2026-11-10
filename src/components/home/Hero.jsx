import { useEffect, useState, useRef } from 'react';
import {
    ArrowDownRight,
    Sparkles,
    ShieldCheck,
    Volume2,
    VolumeX,
    Play,
    Pause,
    Check,
    ShoppingBag,
    Star,
    Layers,
    Info,
    ArrowRight,
} from 'lucide-react';
import { SylviaMonogram } from '@/components/ui/SylviaBrandLogo';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';
import { VIDEO_HOTSPOTS, VALUE_PROPOSITIONS } from '@/data/shoppableHotspots';
import ShoppableDrawer from '@/components/home/ShoppableDrawer';

const WORDS = ['SYLVIA', 'AESTHETICS'];

const FEATURED_PRODUCTS = [
    {
        id: 1,
        slug: 'sylvia-skin-tint-08',
        name: 'Sylvia Skin Tint',
        category: 'Physician Complexion',
        price: 48.0,
        rating: 4.9,
        reviewsCount: 142,
        finish: 'Luminous Second-Skin Veil',
        badge: 'Flagship Formulation',
        shades: [
            {
                name: 'Shade 08 Deep Cocoa',
                hex: '#6B3B24',
                undertone: 'Warm Rich',
                image: '/images/products/flagship-skin-tint-isolated.png',
                altImage: '/images/products/flagship-skin-tint.jpg',
            },
            {
                name: 'Shade 04 Warm Honey',
                hex: '#C48E6C',
                undertone: 'Golden Warm',
                image: '/images/products/catalog-1.jpeg',
                altImage: '/images/showcase/WhatsApp_Image_2026-11-10_at_03.17.50.jpeg',
            },
            {
                name: 'Shade 06 Rich Caramel',
                hex: '#A86D49',
                undertone: 'Neutral Caramel',
                image: '/images/products/catalog-4.jpeg',
                altImage: '/images/showcase/WhatsApp_Image_2026-11-10_at_03.17.54.jpeg',
            },
            {
                name: 'Shade 02 Luminous Almond',
                hex: '#D6A685',
                undertone: 'Satin Light Neutral',
                image: '/images/products/catalog-5.jpeg',
                altImage: '/images/showcase/WhatsApp_Image_2026-11-10_at_03.17.55.jpeg',
            },
        ],
        notes: [
            'Physician melanocyte depth calibration',
            'Multi-depth hyaluronic acid cellular infusion',
            'Niacinamide barrier reinforcement',
            'Non-comedogenic squalane hydration',
        ],
    },
    {
        id: 3,
        slug: 'sylvia-lacquer-espresso',
        name: 'Precision Lip Lacquer',
        category: 'Micro-Pigment Lacquer',
        price: 36.0,
        rating: 4.95,
        reviewsCount: 98,
        finish: '6-Hour Mirror Glass Finish',
        badge: 'Fan Favorite',
        shades: [
            {
                name: 'Obsidian Espresso 02',
                hex: '#2A1612',
                undertone: 'Cool Espresso',
                image: '/images/products/catalog-2.jpeg',
                altImage: '/images/showcase/WhatsApp_Image_2026-11-10_at_03.17.53.jpeg',
            },
            {
                name: 'Mocha Truffle Matte',
                hex: '#4A362D',
                undertone: 'Warm Mocha',
                image: '/images/products/catalog-3.jpeg',
                altImage: '/images/showcase/WhatsApp_Image_2026-11-10_at_03.17.55_1.jpeg',
            },
        ],
        notes: [
            'Dense micro-pigment non-feathering film',
            'Cold-pressed organic rosehip seed oil',
            'Bioactive peptide plumping matrix',
        ],
    },
    {
        id: 10,
        slug: 'sylvia-cellular-elixir',
        name: 'Botanical Recovery Elixir',
        category: 'Cellular Lipid Serum',
        price: 62.0,
        rating: 5.0,
        reviewsCount: 76,
        finish: 'High-Potency Active Lipids',
        badge: 'Clinical Rx',
        shades: [
            {
                name: 'Pure Golden Radiance',
                hex: '#D4AF37',
                undertone: 'Universal Nutrient Radiance',
                image: '/images/products/catalog-9.jpeg',
                altImage: '/images/showcase/WhatsApp_Image_2026-11-10_at_03.17.49.jpeg',
            },
        ],
        notes: [
            '100% active botanical lipid infusion',
            'Natural Bakuchiol cellular collagen support',
            'Antioxidant CoQ10 & squalane shield',
        ],
    },
    {
        id: 9,
        slug: 'sylvia-flush-sunstone',
        name: 'Radiant Cheek Flush',
        category: 'Luminous Sculpt Blush',
        price: 34.0,
        rating: 4.88,
        reviewsCount: 64,
        finish: 'Melt-Into-Skin Bronze Veil',
        badge: 'Award Winner',
        shades: [
            {
                name: 'Sunstone Bronze',
                hex: '#C27352',
                undertone: 'Warm Terracotta Bronze',
                image: '/images/products/catalog-8.jpeg',
                altImage: '/images/showcase/WhatsApp_Image_2026-11-10_at_03.17.54_1.jpeg',
            },
        ],
        notes: [
            'Micronised natural mineral bronze mica',
            'Jojoba ester barrier conditioning',
            'Seamless melt-into-skin texture',
        ],
    },
];

export default function Hero() {
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();

    // Video states
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    // Active product configuration
    const [activeProductIdx, setActiveProductIdx] = useState(0);
    const [selectedShadeIdx, setSelectedShadeIdx] = useState(0);
    const [selectedSize, setSelectedSize] = useState('30ml');
    const [activeAngle, setActiveAngle] = useState('main'); // 'main' | 'alt'
    const [justAdded, setJustAdded] = useState(false);

    // Hotspot drawer modal state
    const [drawerProduct, setDrawerProduct] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeHotspotHover, setActiveHotspotHover] = useState(null);

    // Value proposition active tooltip
    const [activeValProp, setActiveValProp] = useState(null);

    const activeProduct = FEATURED_PRODUCTS[activeProductIdx];
    const activeShade = activeProduct.shades[selectedShadeIdx] || activeProduct.shades[0];
    const currentPrice = selectedSize === '50ml' ? activeProduct.price * 1.5 : activeProduct.price;

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    };

    const toggleAudio = () => {
        if (!videoRef.current) return;
        const newMuted = !isMuted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    const handleAddToCart = () => {
        addItem({
            product_id: activeProduct.id,
            id: `${activeProduct.slug}-${activeShade.name}-${selectedSize}`,
            name: activeProduct.name,
            price: currentPrice,
            shade_name: `${activeShade.name} (${selectedSize.toUpperCase()})`,
            shade_hex: activeShade.hex,
            image_url: activeAngle === 'alt' ? activeShade.altImage : activeShade.image,
            category: activeProduct.category,
        });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    };

    const openHotspot = (hotspot) => {
        setDrawerProduct(hotspot);
        setDrawerOpen(true);
        // Also sync the right-hand panel if it matches
        const matchIdx = FEATURED_PRODUCTS.findIndex((p) => p.name.includes(hotspot.name) || hotspot.name.includes(p.name));
        if (matchIdx !== -1) {
            setActiveProductIdx(matchIdx);
            setSelectedShadeIdx(0);
        }
    };

    return (
        <section
            id="top"
            aria-label="Sylvia Aesthetics Interactive Hero"
            className="relative isolate min-h-[100svh] overflow-hidden px-4 pt-28 pb-16 sm:px-8 sm:pt-36 sm:pb-24 flex flex-col justify-between"
        >
            {/* Ambient Background Aura */}
            <div
                className="pointer-events-none absolute inset-0 -z-30 transition-all duration-700"
                style={{
                    background: `radial-gradient(circle 700px at 75% 35%, ${activeShade.hex}30, transparent 70%), radial-gradient(circle 500px at 20% 75%, var(--accent-glow), transparent 70%)`,
                }}
            />

            <div className="mx-auto w-full max-w-7xl">
                {/* 1. Header Eyebrow & Brand Headline */}
                <div className="max-w-3xl mb-8 sm:mb-12">
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/75 px-4 py-1.5 shadow-sm backdrop-blur-md mb-4">
                        <SylviaMonogram className="h-4 w-3 text-primary" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-foreground/80 font-medium">
                            Clinical Science · Refined Radiance
                        </span>
                    </div>

                    <h1 className="font-display text-[clamp(2.5rem,6.5vw,5.5rem)] font-normal uppercase leading-[0.92] tracking-[-0.03em] text-foreground">
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

                    <p className="mt-4 text-sm sm:text-base text-foreground/75 max-w-xl font-light leading-relaxed">
                        Physician-grade cosmetic formulations and precision dermatological therapies. Touch and explore
                        our clinical brand video or configure your bespoke second-skin shade below.
                    </p>
                </div>

                {/* 2. DYNAMIC SPLIT SCREEN: Interactive Video (Left) + Interactive Product Showcase (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                    {/* LEFT SIDE (VISUAL ANCHOR): Video Player with Loop, Audio Toggle & Interactive Shoppable Hotspots */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                        <div className="relative aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/11] w-full rounded-[2rem] overflow-hidden border border-border/60 bg-black/40 shadow-2xl group">
                            {/* The Brand Video */}
                            <video
                                ref={videoRef}
                                src="/videos/brand-hero.mp4"
                                autoPlay
                                loop
                                muted={isMuted}
                                playsInline
                                className="h-full w-full object-cover object-center filter saturate-[1.1] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            />

                            {/* Cinematic Lighting Vignette */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />

                            {/* Top Left: Live Shoppable Badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3.5 py-1.5 backdrop-blur-md">
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/90 font-medium">
                                    Brand Film · Shoppable Hotspots
                                </span>
                            </div>

                            {/* Top Right: Discreet Playback & Audio Controls */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleAudio}
                                    aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                    className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-105 active:scale-95 shadow-lg"
                                >
                                    {isMuted ? <VolumeX className="h-4 w-4 text-white/70" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={togglePlay}
                                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                                    title={isPlaying ? 'Pause' : 'Play'}
                                    className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-105 active:scale-95 shadow-lg"
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
                                </button>
                            </div>

                            {/* Clickable Interactive Hotspots / Pins on Video */}
                            {VIDEO_HOTSPOTS.map((hotspot) => {
                                const isHovered = activeHotspotHover === hotspot.id;
                                return (
                                    <div
                                        key={hotspot.id}
                                        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => openHotspot(hotspot)}
                                            onMouseEnter={() => setActiveHotspotHover(hotspot.id)}
                                            onMouseLeave={() => setActiveHotspotHover(null)}
                                            aria-label={`Shop ${hotspot.name}`}
                                            className="relative flex items-center justify-center p-2 focus:outline-none"
                                        >
                                            {/* Radar pulse rings */}
                                            <span
                                                className="absolute h-8 w-8 rounded-full animate-ping opacity-60"
                                                style={{ backgroundColor: hotspot.hex }}
                                            />
                                            <span
                                                className="relative h-5 w-5 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform duration-300 hover:scale-125"
                                                style={{ backgroundColor: hotspot.hex }}
                                            >
                                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                            </span>
                                        </button>

                                        {/* Floating Glassmorphic Hotspot Preview Tooltip */}
                                        <div
                                            className={`absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-48 rounded-2xl glass-solid border border-white/30 bg-black/85 p-3 shadow-2xl backdrop-blur-xl transition-all duration-300 pointer-events-auto ${
                                                isHovered
                                                    ? 'opacity-100 scale-100 translate-y-0 visible'
                                                    : 'opacity-0 scale-95 translate-y-2 invisible'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hotspot.hex }} />
                                                <span className="font-mono text-[9px] uppercase tracking-wider text-white/70">
                                                    {hotspot.badge}
                                                </span>
                                            </div>
                                            <p className="font-display text-sm font-medium text-white truncate">{hotspot.name}</p>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs">
                                                <span className="font-mono text-emerald-400 font-semibold">{formatPrice(hotspot.price)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => openHotspot(hotspot)}
                                                    className="font-mono text-[9px] uppercase tracking-wider text-white/90 hover:text-primary flex items-center gap-0.5"
                                                >
                                                    Shop <ArrowRight className="h-2.5 w-2.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Bottom Video Banner Info */}
                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] tracking-wider uppercase text-white/75 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                                        Tap any glowing pin to quick-shop
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openHotspot(VIDEO_HOTSPOTS[0])}
                                    className="font-mono text-[11px] uppercase tracking-wider font-medium text-white bg-white/20 hover:bg-white/30 px-3.5 py-1 rounded-full border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
                                >
                                    <span>Hotspot Details</span>
                                    <ArrowRight className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        {/* Interactive Horizontal Formula Quick-Strip (Replacing timer interval cycling) */}
                        <div className="mt-5 glass-panel rounded-2xl p-3 border border-border/50">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                                    Interactive Catalog Showcase · Explore at your pace
                                </span>
                                <span className="font-mono text-[10px] text-primary">
                                    {activeProductIdx + 1} of {FEATURED_PRODUCTS.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {FEATURED_PRODUCTS.map((prod, idx) => {
                                    const isSelected = idx === activeProductIdx;
                                    return (
                                        <button
                                            key={prod.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveProductIdx(idx);
                                                setSelectedShadeIdx(0);
                                                setActiveAngle('main');
                                            }}
                                            className={`rounded-xl p-2 text-left transition-all flex items-center gap-2.5 border ${
                                                isSelected
                                                    ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/40'
                                                    : 'border-border/40 bg-card/40 hover:bg-card/80 hover:border-border'
                                            }`}
                                        >
                                            <div className="h-10 w-9 rounded-lg overflow-hidden bg-black/30 shrink-0 flex items-center justify-center">
                                                <img
                                                    src={prod.shades[0].image}
                                                    alt={prod.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0 hidden sm:block">
                                                <p className="font-display text-xs font-medium text-foreground truncate">{prod.name}</p>
                                                <p className="font-mono text-[10px] text-primary font-medium">{formatPrice(prod.price)}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Interactive Featured Product Showcase with Shade & Size Selectors + Add to Bag */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                        <div className="glass-solid rounded-[2rem] border border-border/60 bg-card/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl h-full flex flex-col justify-between">
                            {/* Product Header & Rating */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary font-medium bg-primary/10 px-3 py-0.5 rounded-full border border-primary/25">
                                        {activeProduct.badge}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-amber-400">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                        <span className="font-mono text-[11px] text-foreground/60">
                                            {activeProduct.rating} ({activeProduct.reviewsCount})
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-baseline justify-between gap-2">
                                    <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
                                        {activeProduct.name}
                                    </h2>
                                    <span className="font-mono text-xl sm:text-2xl font-semibold text-primary tabular-nums">
                                        {formatPrice(currentPrice)}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-foreground/60 font-mono">{activeProduct.finish}</p>
                            </div>

                            {/* Dynamic Live Gallery with Alternate Angle Toggle */}
                            <div className="my-5 relative aspect-[4/3] rounded-2xl overflow-hidden border border-border/40 bg-black/30 flex items-center justify-center group/card">
                                <img
                                    src={activeAngle === 'alt' ? activeShade.altImage : activeShade.image}
                                    alt={`${activeProduct.name} ${activeShade.name}`}
                                    className="h-full w-full object-contain p-4 transition-all duration-500 group-hover/card:scale-105"
                                />

                                {/* Angle Switcher Pills */}
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 p-1 rounded-full backdrop-blur-md border border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setActiveAngle('main')}
                                        aria-label="View flagship bottle"
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors ${
                                            activeAngle === 'main' ? 'bg-primary text-primary-foreground font-medium' : 'text-white/70 hover:text-white'
                                        }`}
                                    >
                                        Bottle
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveAngle('alt')}
                                        aria-label="View studio photography application"
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors ${
                                            activeAngle === 'alt' ? 'bg-primary text-primary-foreground font-medium' : 'text-white/70 hover:text-white'
                                        }`}
                                    >
                                        Studio
                                    </button>
                                </div>

                                {/* Active Shade Tag */}
                                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md border border-white/10">
                                    <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white/60" style={{ backgroundColor: activeShade.hex }} />
                                    <span className="font-mono text-[10px] text-white font-medium">{activeShade.name}</span>
                                </div>
                            </div>

                            {/* Interactive Shade Selector */}
                            {activeProduct.shades.length > 1 && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="font-mono text-[11px] uppercase tracking-wider text-foreground/70">
                                            Select Calibrated Shade:
                                        </span>
                                        <span className="font-mono text-[10px] text-primary">{activeShade.undertone}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {activeProduct.shades.map((sh, idx) => {
                                            const isCurrent = idx === selectedShadeIdx;
                                            return (
                                                <button
                                                    key={sh.name}
                                                    type="button"
                                                    onClick={() => setSelectedShadeIdx(idx)}
                                                    aria-label={`Select ${sh.name}`}
                                                    className={`group flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all ${
                                                        isCurrent
                                                            ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/50'
                                                            : 'border-border/40 bg-card/40 hover:border-border hover:bg-card/70'
                                                    }`}
                                                >
                                                    <span
                                                        className="h-3.5 w-3.5 rounded-full ring-1 ring-white/50 shrink-0"
                                                        style={{ backgroundColor: sh.hex }}
                                                    />
                                                    <span className="font-mono text-[10px] text-foreground font-medium">{sh.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Interactive Size Selector */}
                            <div className="mb-5">
                                <label className="block font-mono text-[11px] uppercase tracking-wider text-foreground/70 mb-2">
                                    Volume / Specification:
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSize('30ml')}
                                        className={`rounded-xl border py-2.5 px-3 text-xs font-mono transition-all flex items-center justify-between ${
                                            selectedSize === '30ml'
                                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                                : 'border-border/40 bg-card/40 text-foreground/70 hover:text-foreground'
                                        }`}
                                    >
                                        <span>30 ML Standard</span>
                                        <span className="text-[10px] opacity-75">{formatPrice(activeProduct.price)}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSize('50ml')}
                                        className={`rounded-xl border py-2.5 px-3 text-xs font-mono transition-all flex items-center justify-between ${
                                            selectedSize === '50ml'
                                                ? 'border-primary bg-primary/10 text-primary font-medium'
                                                : 'border-border/40 bg-card/40 text-foreground/70 hover:text-foreground'
                                        }`}
                                    >
                                        <span>50 ML Studio Pro</span>
                                        <span className="text-[10px] opacity-75">{formatPrice(activeProduct.price * 1.5)}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Add to Bag and Fast Checkout Buttons */}
                            <div className="space-y-2 pt-2 border-t border-border/40">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    className="w-full h-12 rounded-full bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.22em] font-medium flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:shadow-[0_18px_40px_-14px_var(--accent-glow)] active:scale-98"
                                >
                                    {justAdded ? (
                                        <>
                                            <Check className="h-4 w-4" strokeWidth={2.2} />
                                            Added to Bag
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                                            Add to Bag · {formatPrice(currentPrice)}
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center gap-2">
                                    <a
                                        href="#shade-studio"
                                        className="flex-1 h-10 rounded-full border border-border/60 bg-card/60 text-foreground font-mono text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition-colors"
                                    >
                                        <span>Shade Studio</span>
                                        <ArrowDownRight className="h-3.5 w-3.5 text-primary" />
                                    </a>
                                    <a
                                        href="#catalog"
                                        className="h-10 px-5 rounded-full border border-border/60 bg-card/60 text-foreground/75 font-mono text-[11px] uppercase tracking-[0.18em] font-medium flex items-center justify-center hover:text-foreground hover:bg-white/10 transition-colors"
                                    >
                                        All Formulas
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. INTERACTIVE VALUE PROPOSITIONS BAR WITH MICRO-INTERACTIONS */}
                <div className="mt-12 pt-8 border-t border-border/40">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-foreground/50 text-center mb-5">
                        Sylvia Aesthetics Clinical Guarantees · Touch for Details
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {VALUE_PROPOSITIONS.map((prop) => {
                            const isSelected = activeValProp === prop.id;
                            return (
                                <div
                                    key={prop.id}
                                    onMouseEnter={() => setActiveValProp(prop.id)}
                                    onMouseLeave={() => setActiveValProp(null)}
                                    onClick={() => setActiveValProp(isSelected ? null : prop.id)}
                                    className={`relative cursor-pointer rounded-2xl p-4 border transition-all duration-300 ${
                                        isSelected
                                            ? 'border-primary bg-primary/10 shadow-lg scale-[1.02]'
                                            : 'border-border/40 bg-card/45 hover:border-border hover:bg-card/75'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                                        <h4 className="font-display text-sm font-medium text-foreground truncate">{prop.title}</h4>
                                    </div>
                                    <p className="text-[11px] font-mono text-foreground/60">{prop.subtitle}</p>

                                    {/* Expandable details on hover / click */}
                                    <div
                                        className={`overflow-hidden transition-all duration-300 text-[11px] text-foreground/80 font-light mt-2 pt-2 border-t border-border/30 ${
                                            isSelected ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                                        }`}
                                    >
                                        {prop.detail}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Shoppable Hotspot Drawer Modal */}
            <ShoppableDrawer
                product={drawerProduct}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />
        </section>
    );
}
