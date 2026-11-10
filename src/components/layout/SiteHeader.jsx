import { useEffect, useState } from 'react';
import { ShoppingBag, Menu, X, ArrowUpRight, Sparkles, Moon, Search } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useTheme } from '@/lib/theme';
import SylviaBrandLogo from '@/components/ui/SylviaBrandLogo';

const LINKS = [
    { href: '#top', label: 'Brand Film' },
    { href: '#catalog', label: 'Formulas' },
    { href: '#shade-studio', label: 'Clinical Studio' },
    { href: '#clinical-social-proof', label: 'Reviews & UGC' },
    { href: '#formula', label: 'Science' },
];

export default function SiteHeader() {
    const { count, openCart } = useCart();
    const { isDark, toggleDarkMode } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const catalogEl = document.getElementById('catalog');
            if (catalogEl) {
                catalogEl.scrollIntoView({ behavior: 'smooth' });
            }
            setSearchOpen(false);
        }
    };

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const onScroll = () => {
            const currentScrollY = window.scrollY;

            // Track if scrolled past hero header threshold for glass styling
            setScrolled(currentScrollY > 40);

            // Hide navbar when scrolling down past 80px, reveal when scrolling up
            if (currentScrollY > 80 && currentScrollY > lastScrollY + 6) {
                setVisible(false);
                setMobileMenuOpen(false);
            } else if (currentScrollY < lastScrollY - 6 || currentScrollY <= 20) {
                setVisible(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4 transition-all duration-400 ease-out ${
                visible ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-28 opacity-0 pointer-events-none'
            }`}
        >
            <div
                className={`mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full px-4 py-2 transition-all duration-500 sm:px-6 sm:py-2.5 ${
                    scrolled
                        ? 'glass-solid shadow-[0_20px_50px_-15px_rgba(158,130,101,0.22)] border border-border/60 bg-background/90 backdrop-blur-xl'
                        : 'glass-panel'
                }`}
            >
                {/* Mobile Options Hamburger placed BEFORE the brand logo */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Mobile Hamburger Button for Options (displayed BEFORE logo on mobile) */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen((open) => !open)}
                        aria-label="Toggle navigation options"
                        aria-expanded={mobileMenuOpen}
                        className="glass-btn md:hidden relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/80 transition-all hover:text-foreground hover:border-primary/50"
                    >
                        {mobileMenuOpen ? <X className="h-4 w-4" strokeWidth={1.8} /> : <Menu className="h-4 w-4" strokeWidth={1.8} />}
                    </button>

                    {/* Brand Logo */}
                    <a href="#top" className="group flex items-center gap-2 transition-opacity hover:opacity-90">
                        <SylviaBrandLogo variant="horizontal" />
                    </a>
                </div>

                {/* Desktop navigation links */}
                <nav className="hidden items-center gap-9 md:flex">
                    {LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="label-mono text-xs uppercase tracking-[0.2em] text-foreground/70 transition-colors duration-300 hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Right controls: Search + Currency Selector + Dark Mode Crescent Moon + Shopping Bag */}
                <div className="flex items-center gap-2">
                    {/* Expandable Quick Formula Search */}
                    {searchOpen ? (
                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex items-center rounded-full border border-primary/50 bg-background/95 px-3 py-1 shadow-lg animate-in fade-in duration-200"
                        >
                            <Search className="h-3.5 w-3.5 text-primary mr-2 shrink-0" />
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search formulas..."
                                className="w-28 sm:w-40 bg-transparent text-xs text-foreground outline-none font-mono placeholder:text-foreground/40"
                            />
                            <button
                                type="button"
                                onClick={() => setSearchOpen(false)}
                                className="text-foreground/50 hover:text-foreground ml-1"
                                aria-label="Close search"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Search clinical formulas"
                            title="Search formulas"
                            className="glass-btn hidden sm:grid h-10 w-10 place-items-center rounded-full text-foreground/80 hover:text-foreground transition-all hover:border-primary/50"
                        >
                            <Search className="h-4 w-4" strokeWidth={1.7} />
                        </button>
                    )}

                    {/* Crescent Moon Dark Mode Toggle */}
                    <button
                        type="button"
                        onClick={toggleDarkMode}
                        aria-label={isDark ? 'Switch to day mode' : 'Switch to dark mode'}
                        title={isDark ? 'Day Mode (Alabaster Cream)' : 'Dark Mode (Obsidian Noir)'}
                        className="glass-btn relative grid h-10 w-10 place-items-center rounded-full text-foreground transition-all duration-300 hover:border-primary/50 group"
                    >
                        <Moon
                            className={`h-4 w-4 transition-all duration-500 ${
                                isDark
                                    ? 'text-primary fill-primary/30 -rotate-12 drop-shadow-[0_0_8px_var(--accent-glow)] scale-110'
                                    : 'text-foreground/75 hover:text-foreground rotate-0 scale-100'
                            }`}
                            strokeWidth={1.8}
                        />
                    </button>

                    {/* Shopping Bag */}
                    <div className="relative inline-flex items-center">
                        <button
                            type="button"
                            onClick={openCart}
                            aria-label={`Open shopping bag, ${count} items`}
                            className="glass-btn !overflow-visible relative grid h-10 w-10 place-items-center rounded-full text-foreground transition-all duration-300 hover:border-primary/50"
                        >
                            <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
                        </button>
                        {count > 0 && (
                            <span
                                onClick={openCart}
                                role="status"
                                aria-label={`${count} items in bag`}
                                className="absolute -right-1.5 -top-1.5 z-30 flex h-5 min-w-5 cursor-pointer items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white shadow-lg ring-2 ring-background transition-transform duration-200 hover:scale-110"
                            >
                                {count}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Options Menu */}
            {mobileMenuOpen && (
                <div className="mx-auto mt-2 max-w-7xl md:hidden">
                    <div className="glass-solid overflow-hidden rounded-3xl border border-border/60 bg-background/95 p-5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-300">
                        <div className="flex items-center justify-between border-b border-border/40 pb-3">
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
                                Sylvia Aesthetics · Navigation
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                                <Sparkles className="h-3 w-3" />
                                Certified Clinic
                            </span>
                        </div>

                        <nav className="mt-3 flex flex-col divide-y divide-border/30">
                            {LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between py-3.5 text-xs uppercase tracking-[0.2em] text-foreground/80 font-medium transition-colors hover:text-primary active:text-primary"
                                >
                                    <span>{link.label}</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 text-foreground/40" />
                                </a>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    toggleDarkMode();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center justify-between py-3.5 text-xs uppercase tracking-[0.2em] text-foreground/80 font-medium transition-colors hover:text-primary text-left"
                            >
                                <span className="flex items-center gap-2.5">
                                    <Moon className={`h-4 w-4 ${isDark ? 'text-primary fill-primary/30' : 'text-foreground/60'}`} />
                                    <span>{isDark ? 'Day Mode (Linen)' : 'Dark Mode (Noir)'}</span>
                                </span>
                                <span className="label-mono text-[9px] text-primary">{isDark ? 'Day' : 'Dark'}</span>
                            </button>
                        </nav>

                        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                            <a
                                href="mailto:concierge@sylviamuchiriaesthetics.com"
                                className="label-mono text-[10px] text-foreground/60 hover:text-foreground"
                            >
                                Sylvia Muchiri Aesthetics
                            </a>
                            <a
                                href="/backoffice"
                                className="label-mono text-[10px] text-primary hover:underline"
                            >
                                Back Office →
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
