import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

export default function ProductCard({ product }) {
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    const [formulaOpen, setFormulaOpen] = useState(false);
    const [justAdded, setJustAdded] = useState(false);

    const handleAdd = () => {
        addItem(product);
        setJustAdded(true);
        window.setTimeout(() => setJustAdded(false), 1600);
    };

    return (
        <article className="group relative">
            <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-2.5">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-black/40">
                    <Image
                        src={product.image_url}
                        alt={`${product.name} in ${product.shade_name}`}
                        fittingType="fill"
                        originWidth={768}
                        originHeight={1024}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />

                    {product.badge && (
                        <span className="glass-panel absolute left-3 top-3 rounded-full px-3 py-1 text-[9px] uppercase tracking-[0.24em] text-foreground/90">
                            {product.badge}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => setFormulaOpen((v) => !v)}
                        aria-expanded={formulaOpen}
                        aria-label={`Formula details for ${product.name}`}
                        className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/40 backdrop-blur-md transition-transform duration-500 hover:scale-105"
                    >
                        <span className="glow-ring absolute inset-0 rounded-full" />
                        <span
                            className="h-2 w-2 rounded-full bg-primary"
                            style={{ boxShadow: '0 0 14px 3px var(--accent-glow)' }}
                        />
                    </button>

                    {formulaOpen && (
                        <div className="glass-solid absolute inset-x-3 bottom-16 rounded-2xl p-3.5">
                            <p className="label-mono text-foreground/60">Formula nodes</p>
                            <ul className="mt-2 space-y-1.5">
                                {product.formula_notes.map((note) => (
                                    <li key={note} className="flex items-center gap-2 text-[13px] text-foreground/85">
                                        <span className="h-1 w-1 rounded-full bg-primary" />
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 px-1">
                <div className="min-w-0">
                    <h3 className="truncate font-display text-[15px] font-medium tracking-tight">{product.name}</h3>
                    <p className="mt-1 flex items-center gap-2 text-xs text-foreground/60">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/25"
                            style={{ backgroundColor: product.shade_hex }}
                        />
                        {product.shade_name} · {product.finish}
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-foreground/90 font-mono">
                        {formatPrice(product.price)}
                    </span>
                    <button
                        type="button"
                        onClick={handleAdd}
                        aria-label={`Add ${product.name} to bag`}
                        className="glass-btn grid h-10 w-10 place-items-center rounded-full text-foreground"
                    >
                        {justAdded ? <Check className="h-4 w-4" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={1.8} />}
                    </button>
                </div>
            </div>
        </article>
    );
}