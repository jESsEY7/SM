import { useTheme } from '@/lib/theme';

export default function ThemeSwitcher({ className = '', floating = false }) {
    const { theme, setTheme, themes } = useTheme();

    if (floating) {
        return (
            <div
                role="group"
                aria-label="Color Theme Palette"
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-border/40 bg-card/85 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105"
            >
                {themes.map((t) => {
                    const active = theme === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTheme(t.id)}
                            aria-pressed={active}
                            aria-label={t.name}
                            title={t.name}
                            className={`group relative grid h-7 w-7 place-items-center rounded-full transition-all duration-300 ${
                                active ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-115 opacity-75 hover:opacity-100'
                            }`}
                        >
                            <span
                                className="h-4 w-4 rounded-full transition-transform duration-300 group-hover:scale-110"
                                style={{
                                    backgroundColor: t.swatch,
                                    boxShadow: active ? `0 0 14px 2px ${t.swatch}88` : 'none',
                                }}
                            />
                        </button>
                    );
                })}
            </div>
        );
    }

    // Navbar version: Minimal floating color pearl group with NO text words
    return (
        <div
            role="group"
            aria-label="Atmosphere Color Selection"
            className={`glass-panel flex items-center gap-1.5 rounded-full px-2.5 py-1.5 border border-border/40 ${className}`}
        >
            {themes.map((t) => {
                const active = theme === t.id;
                return (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        aria-pressed={active}
                        aria-label={t.name}
                        title={t.name}
                        className={`group relative grid h-7 w-7 place-items-center rounded-full transition-all duration-300 ${
                            active
                                ? 'bg-primary/15 ring-1.5 ring-primary'
                                : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                        }`}
                    >
                        <span
                            className={`rounded-full transition-all duration-300 ${active ? 'h-3.5 w-3.5 scale-105' : 'h-2.5 w-2.5 group-hover:scale-125'}`}
                            style={{
                                backgroundColor: t.swatch,
                                boxShadow: active ? `0 0 10px 1px ${t.swatch}99` : 'none',
                            }}
                        />
                    </button>
                );
            })}
        </div>
    );
}
