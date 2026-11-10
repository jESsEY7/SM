import { useState } from 'react';
import { Star, ShieldCheck, ShoppingBag, ArrowUpRight, Check, Heart, Play } from 'lucide-react';
import { UGC_REVIEWS } from '@/data/shoppableHotspots';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

export default function UgcSection() {
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    const [addedId, setAddedId] = useState(null);
    const [activeVideoModal, setActiveVideoModal] = useState(false);

    const handleQuickAdd = (rev) => {
        addItem({
            product_id: rev.id,
            id: `ugc-${rev.id}`,
            name: rev.productName,
            price: rev.productPrice,
            shade_name: rev.shade,
            shade_hex: '#6B3B24',
            image_url: rev.image,
        });
        setAddedId(rev.id);
        setTimeout(() => setAddedId(null), 1800);
    };

    return (
        <section id="clinical-social-proof" className="relative px-4 py-20 sm:px-8 sm:py-28 border-t border-border/40">
            <div className="mx-auto max-w-7xl">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/70 px-3.5 py-1 text-xs font-mono uppercase tracking-[0.2em] text-foreground/70 mb-3 backdrop-blur-md">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            <span>Verified Clinical Results & UGC</span>
                        </div>
                        <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-normal uppercase leading-[0.94] tracking-[-0.02em] text-foreground">
                            Real Skin. True Melanin Radiance.
                        </h2>
                    </div>
                    <div className="max-w-md">
                        <p className="text-sm text-foreground/70 font-light leading-relaxed">
                            Captured live from our Nairobi clinic patients and daily skin tint wearers. Real skin with
                            cellular hydration and physician-matched undertones.
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-xs font-mono text-primary font-medium">
                            <Heart className="h-3.5 w-3.5 fill-primary" />
                            <span>98.6% Client Melanin Match Satisfaction</span>
                        </div>
                    </div>
                </div>

                {/* UGC Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {UGC_REVIEWS.map((rev) => (
                        <div
                            key={rev.id}
                            className="group glass-panel rounded-[2rem] overflow-hidden border border-border/50 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl flex flex-col justify-between"
                        >
                            {/* Photo / Video Thumbnail Container */}
                            <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
                                <img
                                    src={rev.image}
                                    alt={`${rev.author} skin review for ${rev.productName}`}
                                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                                {/* Verified Patient Seal */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[9px] font-mono uppercase tracking-wider text-white backdrop-blur-md border border-white/20">
                                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                    <span>Verified Match</span>
                                </div>

                                {/* Video Play Pill */}
                                <button
                                    type="button"
                                    onClick={() => setActiveVideoModal(true)}
                                    aria-label="Play brand film snippet"
                                    className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-black/80 hover:scale-110 transition-all"
                                >
                                    <Play className="h-3 w-3 fill-white translate-x-0.5" />
                                </button>

                                {/* Bottom Patient Meta */}
                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                    <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                                        {[...Array(rev.rating)].map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="font-display text-base font-medium leading-tight">{rev.author}</p>
                                    <p className="text-[11px] text-white/70 font-mono">
                                        {rev.location} · {rev.shade}
                                    </p>
                                </div>
                            </div>

                            {/* Review Content & Product Card Link */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <p className="text-xs text-foreground/80 font-light leading-relaxed italic mb-5">
                                    "{rev.text}"
                                </p>

                                {/* Linked Product Mini Card with Quick Add */}
                                <div className="rounded-xl border border-border/40 bg-card/60 p-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-mono text-[9px] uppercase tracking-wider text-foreground/50">
                                            Worn Formula
                                        </p>
                                        <p className="font-display text-xs font-medium text-foreground truncate">
                                            {rev.productName}
                                        </p>
                                        <p className="font-mono text-[11px] font-semibold text-primary">
                                            {formatPrice(rev.productPrice)}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleQuickAdd(rev)}
                                        aria-label={`Quick add ${rev.productName}`}
                                        className="h-8 px-3 rounded-full bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-wider font-medium flex items-center gap-1.5 shrink-0 shadow-md transition-all hover:scale-105 active:scale-95"
                                    >
                                        {addedId === rev.id ? (
                                            <>
                                                <Check className="h-3 w-3" />
                                                <span>Added</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingBag className="h-3 w-3" />
                                                <span>Add</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Modal Trigger */}
            {activeVideoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl">
                        <video
                            src="/videos/brand-hero.mp4"
                            autoPlay
                            controls
                            playsInline
                            className="w-full aspect-video object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => setActiveVideoModal(false)}
                            className="absolute top-4 right-4 glass-btn rounded-full px-4 py-1.5 text-xs text-white uppercase font-mono tracking-wider"
                        >
                            Close Video ✕
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

