import { useMemo, useState } from 'react';
import ProductCard from '@/components/home/ProductCard';
import Reveal from '@/components/site/Reveal';
import { CATEGORIES, UNDERTONES } from '@/data/products';
import CurrencySelector from '@/components/ui/CurrencySelector';

export default function Catalog({ products }) {
    const [category, setCategory] = useState('all');
    const [undertone, setUndertone] = useState('all');
    const safeProducts = Array.isArray(products) ? products : [];

    const visible = useMemo(
        () =>
            safeProducts.filter(
                (p) =>
                    (category === 'all' || p.category === category) &&
                    (undertone === 'all' || p.undertone === undertone)
            ),
        [safeProducts, category, undertone]
    );

    return (
        <section id="catalog" className="relative px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <Reveal className="max-w-xl">
                        <p className="label-mono text-foreground/50">Sylvia Aesthetics · Clinical Catalog</p>
                        <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[0.95] tracking-[0.08em] uppercase">
                            Clinical Formulations. Pure Radiance.
                        </h2>
                        <p className="mt-4 text-[15px] leading-relaxed text-foreground/65">
                            Every formula is engineered with cellular hydration and dermatological pigments.
                        </p>
                    </Reveal>
                    <div className="flex flex-wrap items-center gap-3">
                        <CurrencySelector />
                        <p className="label-mono shrink-0 text-foreground/50">{visible.length} formulas shown</p>
                    </div>
                </div>

                <div className="mt-10 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setCategory(c.id)}
                                aria-pressed={category === c.id}
                                className={`label-mono rounded-full px-4 py-2.5 transition-all duration-300 ${category === c.id
                                    ? 'border border-transparent bg-primary text-primary-foreground'
                                    : 'glass-btn text-foreground/70'
                                    }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="label-mono mr-1 text-foreground/35">Undertone</span>
                        {UNDERTONES.map((u) => (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => setUndertone(u.id)}
                                aria-pressed={undertone === u.id}
                                className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-300 ${undertone === u.id
                                    ? 'border-white/40 bg-white/10 text-foreground'
                                    : 'border-white/10 text-foreground/55 hover:border-white/25 hover:text-foreground/85'
                                    }`}
                            >
                                {u.label}
                            </button>
                        ))}
                    </div>
                </div>

                {visible.length === 0 ? (
                    <div className="glass-panel mt-12 rounded-3xl px-6 py-16 text-center">
                        <p className="font-display text-lg">No formula matches that orbit</p>
                        <p className="mt-2 text-sm text-foreground/60">
                            Try another undertone or clear the filters to see every shade.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setCategory('all');
                                setUndertone('all');
                            }}
                            className="glass-btn label-mono mt-6 rounded-full px-6 py-3 text-foreground"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        {visible.map((product, index) => (
                            <div key={product.id} className={index % 3 === 1 ? 'lg:mt-14' : index % 3 === 2 ? 'lg:mt-7' : ''}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}