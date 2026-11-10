import { useState, useRef } from 'react';
import { Plus, Check, Star, Play, Sparkles } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    const [formulaOpen, setFormulaOpen] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);

    const handleAdd = (e) => {
        e.stopPropagation();
        addItem(product);
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1600);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <article
            className="group relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-2.5 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_20px_45px_-15px_var(--accent-glow)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-black/40">
                    {/* Primary Product Image */}
                    <Image
                        src={product.image_url}
                        alt={`${product.name} in ${product.shade_name}`}
                        fittingType="fill"
                        originWidth={768}
                        originHeight={1024}
                        className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.06] ${
                            isHovered ? 'opacity-20 scale-105' : 'opacity-100'
                        }`}
                    />

                    {/* Hover Dynamic Video Loop Snippet in Action */}
                    <video
                        ref={videoRef}
                        src="/videos/brand-hero.mp4"
                        muted
                        loop
                        playsInline
                        preload="none"
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 pointer-events-none ${
                            isHovered ? 'opacity-100 z-10' : 'opacity-0 -z-10'
                        }`}
                    />

                    {/* Video Action Badge on Hover */}
                    {isHovered && (
                        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-white backdrop-blur-md border border-white/20 animate-in fade-in duration-300">
                            <Play className="h-2.5 w-2.5 fill-emerald-400 text-emerald-400" />
                            <span>In-Action Preview</span>
                        </div>
                    )}

                    {/* Product Badge */}
                    {product.badge && (
                        <span className="glass-panel absolute left-3 top-3 z-20 rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.24em] text-foreground/90 font-mono font-medium shadow-sm">
                            {product.badge}
                        </span>
                    )}

                    {/* Formula nodes button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFormulaOpen((v) => !v);
                        }}
                        aria-expanded={formulaOpen}
                        aria-label={`Formula details for ${product.name}`}
                        className="absolute top-3 right-3 z-20 grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/40 backdrop-blur-md transition-transform duration-500 hover:scale-105"
                    >
                        <span className="glow-ring absolute inset-0 rounded-full" />
                        <span
                            className="h-1.5 w-1.5 rounded-full bg-primary"
                            style={{ boxShadow: '0 0 10px 2px var(--accent-glow)' }}
                        />
                    </button>

                    {/* Quick Add Overlay on Hover */}
                    <button
                        type="button"
                        onClick={handleAdd}
                        aria-label={`Quick add ${product.name} to bag`}
                        className={`absolute inset-x-3 bottom-3 z-20 flex h-11 items-center justify-center gap-2 rounded-full font-mono text-[11px] uppercase tracking-[0.2em] font-medium shadow-xl transition-all duration-300 ${
                            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
                        } ${
                            justAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-95'
                        }`}
                    >
                        {justAdded ? (
                            <>
                                <Check className="h-4 w-4" strokeWidth={2.2} />
                                Added to Bag
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" strokeWidth={2} />
                                Quick Add · {formatPrice(product.price)}
                            </>
                        )}
                    </button>

                    {/* Formula details drawer */}
                    {formulaOpen && (
                        <div className="glass-solid absolute inset-x-3 bottom-16 z-30 rounded-2xl p-3.5 border border-white/20 shadow-2xl animate-in fade-in duration-200">
                            <p className="label-mono text-foreground/60 text-[10px]">Clinical Formula Nodes</p>
                            <ul className="mt-2 space-y-1.5">
                                {product.formula_notes?.map((note) => (
                                    <li key={note} className="flex items-center gap-2 text-[12px] text-foreground/85">
                                        <span className="h-1 w-1 rounded-full bg-primary shrink-0" />
                                        <span>{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Meta & Price */}
            <div className="mt-3.5 flex items-start justify-between gap-3 px-1">
                <div className="min-w-0">
                    <h3 className="truncate font-display text-[15px] font-medium tracking-tight text-foreground">
                        {product.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-foreground/60">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/25"
                            style={{ backgroundColor: product.shade_hex }}
                        />
                        <span className="truncate">{product.shade_name}</span>
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            ))}
                        </div>
                        <span className="font-mono text-[10px] text-foreground/50">4.9</span>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums text-foreground/95 font-mono">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        type="button"
                        onClick={handleAdd}
                        aria-label={`Add ${product.name} to bag`}
                        className="glass-btn grid h-8 w-8 place-items-center rounded-full text-foreground/80 hover:text-foreground hover:border-primary/50 transition-colors"
                    >
                        {justAdded ? <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.2} /> : <Plus className="h-3.5 w-3.5" strokeWidth={2} />}
                    </button>
                </div>
            </div>
        </article>
    );
}
