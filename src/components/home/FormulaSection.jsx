import { Image } from '@/components/ui/image';
import { DROPLET_IMAGE, FLAGSHIP_IMAGE } from '@/data/products';

const NODES = [
    {
        title: 'Squalane spheres',
        copy: 'A suspension of micro-capsules that bursts on contact, so pigment glides instead of dragging.',
    },
    {
        title: 'Refractive wax blend',
        copy: 'Crystalline waxes bend light through the bullet for depth that reads as dimension, not coverage.',
    },
    {
        title: 'Ceramide complex',
        copy: 'A barrier lipid that holds colour in place for nine hours while the lip stays conditioned.',
    },
];

export default function FormulaSection() {
    return (
        <section id="formula" className="relative px-5 py-24 sm:px-8 sm:py-32">
            <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
                <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-2.5">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-black/10">
                        <img
                            src="/images/clinic/clinic-4.jpeg"
                            alt="Sylvia Aesthetics clinical consultation and formulation laboratory"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-card/85 px-4 py-3 backdrop-blur-md border border-border/40 shadow-lg">
                            <span className="label-mono text-foreground text-xs font-medium">Sylvia Aesthetics · Protocol 01</span>
                            <span className="label-mono text-primary text-xs">Biomimetic Science</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-8 lg:pl-6">
                    <div>
                        <p className="label-mono text-foreground/50">Sylvia Aesthetics · Formula Architecture</p>
                        <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[0.95] tracking-[0.08em] uppercase">
                            Clinical Purity. Cellular Radiance.
                        </h2>
                        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-foreground/65">
                            Each Sylvia Aesthetics formula is built from three clinical layers. Tap a node to read how it nourishes
                            and enriches skin.
                        </p>
                    </div>

                    <ul className="space-y-3">
                        {NODES.map((node, i) => (
                            <li
                                key={node.title}
                                className="glass-panel group flex gap-4 rounded-2xl p-4 transition-colors duration-500 hover:border-white/30"
                            >
                                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/20">
                                    <span
                                        className="h-2 w-2 rounded-full bg-primary transition-transform duration-500 group-hover:scale-150"
                                        style={{ boxShadow: '0 0 14px 3px var(--accent-glow)' }}
                                    />
                                </span>
                                <div>
                                    <p className="text-sm font-medium">
                                        <span className="mr-2 text-foreground/35">0{i + 1}</span>
                                        {node.title}
                                    </p>
                                    <p className="mt-1 text-[13px] leading-relaxed text-foreground/60">{node.copy}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="glass-panel overflow-hidden rounded-2xl">
                        <div className="grid grid-cols-3 divide-x divide-white/10">
                            {[
                                { value: '9h', label: 'Wear' },
                                { value: '12', label: 'Shades' },
                                { value: '0%', label: 'Tack' },
                            ].map((stat) => (
                                <div key={stat.label} className="px-4 py-5 text-center">
                                    <p className="font-display text-2xl tracking-tight">{stat.value}</p>
                                    <p className="label-mono mt-1 text-foreground/45">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/40 shadow-md">
                            <img src="/images/products/flagship-skin-tint.jpg" alt="Sylvia Muchiri Esthetics Skin Tint formulation" className="h-full w-full object-cover" />
                        </div>
                        <p className="max-w-xs text-[13px] leading-relaxed text-foreground/70 italic">
                            “The formula behaves like a second skin — it harmonises cellular light rather than masking it.”
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}