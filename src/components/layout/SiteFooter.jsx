import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Lock, Mail, MapPin, Phone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import BackofficeSignIn from '@/components/layout/BackofficeSignIn';
import SylviaBrandLogo from '@/components/ui/SylviaBrandLogo';

const COLUMNS = [
    {
        title: 'Clinic & Formulas',
        links: [
            { label: 'All Formulations', href: '#catalog' },
            { label: 'Lips & Hydration', href: '#catalog' },
            { label: 'Complexion & Barrier', href: '#catalog' },
            { label: 'Cheeks & Radiance', href: '#catalog' },
        ],
    },
    {
        title: 'Clinical Services',
        links: [
            { label: 'Clinical Shade Matching', href: '#shade-studio' },
            { label: 'Peptide & Pigment Science', href: '#formula' },
            { label: 'Consultations: Sylviamuchiriaesthetics.com', href: 'mailto:concierge@sylviamuchiriaesthetics.com' },
        ],
    },
];

export default function SiteFooter() {
    const { user } = useAuth();
    const [signInOpen, setSignInOpen] = useState(false);
    const isAdmin = user?.role === 'admin' || user?.is_staff;

    return (
        <footer className="relative px-5 pb-12 pt-24 sm:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="prism-rule mb-12" />

                <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
                    {/* Brand Info & Emblem */}
                    <div>
                        <SylviaBrandLogo variant="horizontal" className="mb-4" />
                        <p className="mt-4 max-w-sm text-xs sm:text-sm leading-relaxed text-foreground/60">
                            Sylvia Aesthetics is a dedicated facial aesthetics and dermatological skin health clinic.
                            Crafted with pharmaceutical-grade pigments, biomimetic peptides, and clinical precision in Nairobi.
                        </p>

                        <div className="mt-5 space-y-2 text-xs text-foreground/50">
                            <p className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                                <a
                                    href="mailto:concierge@sylviamuchiriaesthetics.com"
                                    className="hover:text-foreground transition-colors"
                                >
                                    concierge@sylviamuchiriaesthetics.com
                                </a>
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span>Riverside & Westlands · Nairobi, Kenya</span>
                            </p>
                        </div>

                        <div className="mt-6 flex items-center gap-2.5">
                            <a
                                href="https://www.instagram.com/"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Sylvia Aesthetics on Instagram"
                                className="glass-btn grid h-9 w-9 place-items-center rounded-full text-foreground/80 hover:text-foreground hover:border-primary/50"
                            >
                                <Instagram className="h-4 w-4" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>

                    {/* Column Links */}
                    {COLUMNS.map((col) => (
                        <div key={col.title}>
                            <p className="label-mono text-xs uppercase tracking-[0.2em] text-foreground/45">{col.title}</p>
                            <ul className="mt-4 space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-xs sm:text-sm text-foreground/65 transition-colors hover:text-foreground"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Footer Bottom */}
                <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-foreground/40 sm:flex-row sm:items-center sm:justify-between">
                    <p className="label-mono">
                        © 2026 Sylvia Aesthetics Clinic (Sylviamuchiriaesthetics.com) · All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {isAdmin ? (
                            <Link
                                to="/backoffice"
                                className="glass-btn inline-flex h-8 items-center gap-2 rounded-full px-4 text-foreground/80 hover:text-foreground"
                            >
                                <Lock className="h-3.5 w-3.5" strokeWidth={1.6} />
                                Backoffice Dashboard
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSignInOpen(true)}
                                className="glass-btn inline-flex h-8 items-center gap-2 rounded-full px-4 text-foreground/80 hover:text-foreground"
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
