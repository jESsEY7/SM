import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Instagram,
    Lock,
    Mail,
    MapPin,
    ShieldCheck,
    Truck,
    Sparkles,
    Check,
    ArrowRight,
    MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import BackofficeSignIn from '@/components/layout/BackofficeSignIn';
import SylviaBrandLogo from '@/components/ui/SylviaBrandLogo';

const COLUMNS = [
    {
        title: 'Formulas & Shop',
        links: [
            { label: 'All Formulations', href: '#catalog' },
            { label: 'Flagship Skin Tint', href: '#catalog' },
            { label: 'Precision Lip Lacquers', href: '#catalog' },
            { label: 'Cellular Lipid Elixirs', href: '#catalog' },
            { label: 'Radiant Cheek Flush', href: '#catalog' },
        ],
    },
    {
        title: 'Clinical Diagnostics',
        links: [
            { label: 'Clinical Shade Matching Studio', href: '#shade-studio' },
            { label: 'Verified Results & UGC', href: '#clinical-social-proof' },
            { label: 'Peptide & Pigment Science', href: '#formula' },
            { label: 'Bespoke Treatments', href: '#clinical-services' },
        ],
    },
    {
        title: 'Assurance & Policies',
        links: [
            { label: 'Nairobi Same-Day Delivery Policy', href: '#top' },
            { label: 'Safaricom M-Pesa Verification', href: '#top' },
            { label: 'Shade Match Guarantee', href: '#shade-studio' },
            { label: 'Privacy & Clinical Disclaimers', href: '#top' },
        ],
    },
];

const TRUST_BADGES = [
    {
        icon: Truck,
        title: 'Nairobi Same-Day',
        desc: 'Tracked 24-48h Kenya nationwide',
    },
    {
        icon: ShieldCheck,
        title: 'M-Pesa Verified',
        desc: 'Instant Safaricom Daraja STK Push & QR',
    },
    {
        icon: Sparkles,
        title: 'Melanin Calibrated',
        desc: 'Physician undertone matching',
    },
    {
        icon: Lock,
        title: '100% Bio-Active',
        desc: 'Paraben-free & cruelty-free purity',
    },
];

export default function SiteFooter() {
    const { user } = useAuth();
    const [signInOpen, setSignInOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const isAdmin = user?.role === 'admin' || user?.is_staff;

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 4000);
        }
    };

    return (
        <footer className="relative px-5 pb-12 pt-20 sm:px-8 border-t border-border/40">
            <div className="mx-auto max-w-7xl">
                {/* 1. Trust Badges Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 pb-12 border-b border-border/40">
                    {TRUST_BADGES.map((badge, idx) => {
                        const Icon = badge.icon;
                        return (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl glass-panel">
                                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="font-display text-sm font-medium text-foreground">{badge.title}</p>
                                    <p className="font-mono text-[10px] text-foreground/50">{badge.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 2. Main Footer Grid: Newsletter + Brand + Link Columns */}
                <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    {/* Brand Info & Newsletter */}
                    <div>
                        <SylviaBrandLogo variant="horizontal" className="mb-4" />
                        <p className="mt-3 max-w-sm text-xs sm:text-sm leading-relaxed text-foreground/60 font-light">
                            Sylvia Aesthetics is a dedicated facial aesthetics and dermatological skin health clinic in
                            Nairobi. Crafted with pharmaceutical-grade pigments and biomimetic peptides.
                        </p>

                        {/* Newsletter Signup Form */}
                        <div className="mt-6 p-4 rounded-2xl glass-panel max-w-sm border border-border/50">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/60 font-medium">
                                Sylvia Concierge · Private Invitations
                            </p>
                            <p className="text-xs text-foreground/75 mt-1 font-light">
                                Subscribe for formula restock alerts and private shade diagnostics.
                            </p>

                            <form onSubmit={handleSubscribe} className="mt-3 flex items-center gap-2">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your.email@domain.com"
                                    className="h-10 flex-1 rounded-xl border border-border/60 bg-background/80 px-3 text-xs text-foreground outline-none font-mono placeholder:text-foreground/35 focus:border-primary"
                                />
                                <button
                                    type="submit"
                                    aria-label="Subscribe to Sylvia Concierge"
                                    className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-mono text-[10px] uppercase tracking-wider font-medium flex items-center justify-center shrink-0 hover:brightness-110 active:scale-95 transition-all"
                                >
                                    {subscribed ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                </button>
                            </form>
                            {subscribed && (
                                <p className="mt-2 text-[11px] text-emerald-400 font-mono">
                                    ✓ Welcome to Sylvia Concierge. Invitation confirmed.
                                </p>
                            )}
                        </div>

                        {/* Direct Contacts & Socials */}
                        <div className="mt-6 space-y-2 text-xs text-foreground/60">
                            <p className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                                <a
                                    href="mailto:concierge@sylviamuchiriaesthetics.com"
                                    className="hover:text-foreground transition-colors"
                                >
                                    concierge@sylviamuchiriaesthetics.com
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                                <span>Riverside & Westlands · Nairobi, Kenya</span>
                            </p>
                        </div>

                        <div className="mt-5 flex items-center gap-2.5">
                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Sylvia Aesthetics on Instagram"
                                className="glass-btn grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground hover:border-primary/50 transition-colors"
                            >
                                <Instagram className="h-4 w-4" strokeWidth={1.5} />
                            </a>
                            <a
                                href="https://wa.me/254712345678"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Sylvia Aesthetics on WhatsApp"
                                className="glass-btn grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground hover:border-primary/50 transition-colors"
                            >
                                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Column Links */}
                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <p className="label-mono text-xs uppercase tracking-[0.2em] text-foreground/50">{col.title}</p>
                            <ul className="mt-4 space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-xs sm:text-sm text-foreground/70 transition-colors hover:text-primary font-light"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* 3. Footer Bottom */}
                <div className="mt-16 flex flex-col gap-4 border-t border-border/40 pt-6 text-[11px] text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-[10px]">
                        © 2026 Sylvia Aesthetics Skin Clinic Ltd. · Sylviamuchiriaesthetics.com · All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {isAdmin ? (
                            <Link
                                to="/backoffice"
                                className="glass-btn inline-flex h-8 items-center gap-2 rounded-full px-4 text-foreground/80 hover:text-foreground text-xs font-mono uppercase tracking-wider"
                            >
                                <Lock className="h-3.5 w-3.5" strokeWidth={1.6} />
                                Backoffice Dashboard
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSignInOpen(true)}
                                className="glass-btn inline-flex h-8 items-center gap-2 rounded-full px-4 text-foreground/80 hover:text-foreground text-xs font-mono uppercase tracking-wider"
                            >
                                <Lock className="h-3.5 w-3.5" strokeWidth={1.6} />
                                Staff Portal
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <BackofficeSignIn open={signInOpen} onClose={() => setSignInOpen(false)} />
        </footer>
    );
}
