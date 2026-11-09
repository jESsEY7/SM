import { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
    { id: 'linen', name: 'Alabaster Cream (Clinic)', swatch: '#9E8265', desc: 'Warm Ivory Linen' },
    { id: 'sylvia', name: 'Obsidian Bronze', swatch: '#C5A880', desc: 'Deep Noir & Gold' },
    { id: 'cosmic', name: 'Cosmic Violet', swatch: '#8B5CF6', desc: 'Clinical Glow' },
    { id: 'rose', name: 'Sunset Rose', swatch: '#F43F5E', desc: 'Radiant Blush' },
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('sylvia-theme') || 'linen';
        } catch {
            return 'linen';
        }
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        try {
            localStorage.setItem('sylvia-theme', theme);
        } catch {
            /* storage unavailable */
        }
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
