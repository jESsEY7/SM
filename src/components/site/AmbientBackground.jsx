import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/lib/theme';

/**
 * PodVault-inspired ambient background effects:
 * - Three large blurred gradient blobs that slowly drift behind all content
 * - Subtle pointer-following radial glow that tracks mouse movement
 * Only renders when dark mode (isDark) is active.
 */
export default function AmbientBackground() {
    const { isDark } = useTheme();
    const glowRef = useRef(null);

    const handlePointerMove = useCallback((e) => {
        if (glowRef.current) {
            glowRef.current.style.left = `${e.clientX}px`;
            glowRef.current.style.top = `${e.clientY}px`;
        }
    }, []);

    useEffect(() => {
        if (!isDark) return;
        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [isDark, handlePointerMove]);

    if (!isDark) return null;

    return (
        <>
            {/* Fixed ambient gradient blobs */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
            >
                {/* Blob 1: Deep indigo — upper left */}
                <div
                    className="ambient-blob absolute -left-[15%] -top-[10%] h-[50rem] w-[50rem] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(60, 30, 140, 0.8) 0%, transparent 70%)',
                        filter: 'blur(120px)',
                        animation: 'ambient-drift-1 25s ease-in-out infinite',
                    }}
                />

                {/* Blob 2: Electric violet — center right */}
                <div
                    className="ambient-blob absolute right-[-10%] top-[30%] h-[45rem] w-[45rem] rounded-full opacity-25"
                    style={{
                        background: 'radial-gradient(circle, rgba(100, 40, 200, 0.7) 0%, transparent 70%)',
                        filter: 'blur(130px)',
                        animation: 'ambient-drift-2 30s ease-in-out infinite',
                    }}
                />

                {/* Blob 3: Subtle crimson accent — bottom center */}
                <div
                    className="ambient-blob absolute bottom-[-5%] left-[30%] h-[35rem] w-[35rem] rounded-full opacity-15"
                    style={{
                        background: 'radial-gradient(circle, rgba(140, 30, 60, 0.6) 0%, transparent 70%)',
                        filter: 'blur(140px)',
                        animation: 'ambient-drift-3 22s ease-in-out infinite',
                    }}
                />
            </div>

            {/* Pointer-following glow */}
            <div
                ref={glowRef}
                aria-hidden="true"
                className="pointer-events-none fixed -z-40 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 transition-opacity duration-500"
                style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />
        </>
    );
}
