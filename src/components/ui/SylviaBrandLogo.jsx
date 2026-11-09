import React from 'react';

/**
 * Sylvia Aesthetics Brand Logo & Monogram
 * Inspired by the luxury European dermatological clinic aesthetic:
 * - Elongated vertical cartouche / pill emblem
 * - Graceful intertwined "SA" calligraphy monogram
 * - High-editorial luxury serif typography
 * - Refined tracking with "CLINIC"
 */
export function SylviaMonogram({ className = 'h-10 w-6', strokeColor = 'currentColor', fill = 'none' }) {
    return (
        <svg
            viewBox="0 0 48 80"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Outer concentric elongated pill cartouche */}
            <rect
                x="2.5"
                y="2.5"
                width="43"
                height="75"
                rx="21.5"
                stroke={strokeColor}
                strokeWidth="1.2"
                strokeOpacity="0.8"
            />
            {/* Inner hairline frame */}
            <rect
                x="5.5"
                y="5.5"
                width="37"
                height="69"
                rx="18.5"
                stroke={strokeColor}
                strokeWidth="0.6"
                strokeOpacity="0.45"
            />
            {/* Intertwined 'S' and 'A' Monogram Calligraphy */}
            <path
                d="M 28 26 C 24 23 18 24 16 28 C 14 32 17 35 24 38 C 31 41 33 46 31 51 C 29 56 22 58 17 55 C 13 52 14 48 14 48"
                stroke={strokeColor}
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
            />
            {/* Cross-overlapping 'A' flourish */}
            <path
                d="M 20 54 L 28 27 L 34 54"
                stroke={strokeColor}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M 22 45 L 32 45"
                stroke={strokeColor}
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

export default function SylviaBrandLogo({
    variant = 'horizontal', // 'horizontal' | 'stacked' | 'emblem'
    size = 'default',       // 'sm' | 'default' | 'lg'
    className = '',
    color = 'text-foreground',
}) {
    if (variant === 'emblem') {
        return (
            <div className={`inline-flex flex-col items-center justify-center ${color} ${className}`}>
                <SylviaMonogram className="h-12 w-8" />
            </div>
        );
    }

    if (variant === 'stacked') {
        return (
            <div className={`inline-flex flex-col items-center text-center ${color} ${className}`}>
                <SylviaMonogram className="h-14 w-9 mb-3" />
                <span className="font-serif text-xl sm:text-2xl font-normal tracking-[0.22em] uppercase leading-none">
                    Sylvia Aesthetics
                </span>
                <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.42em] uppercase text-foreground/60 mt-1.5 font-light">
                    Clinic
                </span>
            </div>
        );
    }

    // Default: Horizontal refined navbar logo
    return (
        <div className={`inline-flex items-center gap-3 ${color} ${className}`}>
            <SylviaMonogram className="h-9 w-6 shrink-0" />
            <div className="flex flex-col text-left">
                <span className="font-serif text-sm sm:text-base font-medium tracking-[0.2em] uppercase leading-none text-foreground">
                    Sylvia Aesthetics
                </span>
                <span className="font-serif text-[8.5px] sm:text-[9.5px] tracking-[0.38em] uppercase text-foreground/55 mt-1 font-light">
                    Skin Clinic
                </span>
            </div>
        </div>
    );
}

