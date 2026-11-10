import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/lib/theme';

const NOISE_SVG = `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.305'/></svg>")`;

// Base anchor centers from the 21st.dev "Pipo" Bloom Field gradient
const BASE_BLOBS = [
    {
        // Apricot (#E6B093)
        baseX: 68.1,
        baseY: 46.03,
        p: 0.94,
        p2: 1.62,
        stops: 'rgba(230, 176, 147, 1) 0%, rgba(230, 176, 147, 0.844) 10.28%, rgba(230, 176, 147, 0.5) 20.55%, rgba(230, 176, 147, 0.156) 30.83%, rgba(230, 176, 147, 0) 41.1%',
    },
    {
        // Sky blue (#A3CEFF)
        baseX: 25.17,
        baseY: 75.99,
        p: 2.45,
        p2: 0.73,
        stops: 'rgba(163, 206, 255, 1) 0%, rgba(163, 206, 255, 0.844) 11.15%, rgba(163, 206, 255, 0.5) 22.3%, rgba(163, 206, 255, 0.156) 33.45%, rgba(163, 206, 255, 0) 44.6%',
    },
    {
        // Paper (#FAF9EF)
        baseX: 53.11,
        baseY: 12.71,
        p: 4.12,
        p2: 3.28,
        stops: 'rgba(250, 249, 239, 1) 0%, rgba(250, 249, 239, 0.844) 16.66%, rgba(250, 249, 239, 0.5) 33.33%, rgba(250, 249, 239, 0.156) 49.99%, rgba(250, 249, 239, 0) 66.65%',
    },
];

function buildMeshBackground(x1, y1, x2, y2, x3, y3) {
    return `${NOISE_SVG}, radial-gradient(circle at ${x1}% ${y1}%, ${BASE_BLOBS[0].stops}), radial-gradient(circle at ${x2}% ${y2}%, ${BASE_BLOBS[1].stops}), radial-gradient(circle at ${x3}% ${y3}%, ${BASE_BLOBS[2].stops})`;
}

/**
 * AmbientBackground:
 * - Day / Bright Mode: Recreates the animated "Pipo" Bloom Field mesh gradient (Apricot, Sky Blue, Paper)
 *   driven by requestAnimationFrame with zero-snap modulation.
 * - Dark Mode: Deep charcoal studio background with drifting violet/indigo blobs & pointer glow.
 */
export default function AmbientBackground() {
    const { isDark } = useTheme();
    const dayBgRef = useRef(null);
    const glowRef = useRef(null);

    // Pointer move for dark mode pointer glow
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

    // Animated Pipo mesh gradient for Day Mode
    useEffect(() => {
        if (isDark) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        let rafId;
        const startTime = performance.now();
        const amt = 0.72;

        const animate = (now) => {
            const t = (now - startTime) / 1000;
            const ph = t * 0.86;

            // Zero-snap continuous modulation: (sin(ph * 0.55 + p) - sin(p)) * 14 * amt
            const dx1 = (Math.sin(ph * 0.55 + BASE_BLOBS[0].p) - Math.sin(BASE_BLOBS[0].p)) * 14 * amt;
            const dy1 = (Math.sin(ph * 0.43 + BASE_BLOBS[0].p2) - Math.sin(BASE_BLOBS[0].p2)) * 14 * amt;
            const x1 = BASE_BLOBS[0].baseX + dx1;
            const y1 = BASE_BLOBS[0].baseY + dy1;

            const dx2 = (Math.sin(ph * 0.55 + BASE_BLOBS[1].p) - Math.sin(BASE_BLOBS[1].p)) * 14 * amt;
            const dy2 = (Math.sin(ph * 0.43 + BASE_BLOBS[1].p2) - Math.sin(BASE_BLOBS[1].p2)) * 14 * amt;
            const x2 = BASE_BLOBS[1].baseX + dx2;
            const y2 = BASE_BLOBS[1].baseY + dy2;

            const dx3 = (Math.sin(ph * 0.55 + BASE_BLOBS[2].p) - Math.sin(BASE_BLOBS[2].p)) * 14 * amt;
            const dy3 = (Math.sin(ph * 0.43 + BASE_BLOBS[2].p2) - Math.sin(BASE_BLOBS[2].p2)) * 14 * amt;
            const x3 = BASE_BLOBS[2].baseX + dx3;
            const y3 = BASE_BLOBS[2].baseY + dy3;

            if (dayBgRef.current) {
                dayBgRef.current.style.backgroundImage = buildMeshBackground(x1, y1, x2, y2, x3, y3);
            }

            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [isDark]);

    if (isDark) {
        return (
            <>
                {/* Fixed ambient gradient blobs for dark mode */}
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

    // Day / Bright Mode: Pipo Bloom Field mesh gradient
    return (
        <div
            ref={dayBgRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-50 transition-opacity duration-700"
            style={{
                backgroundColor: '#FAF9EF',
                backgroundImage: buildMeshBackground(
                    BASE_BLOBS[0].baseX,
                    BASE_BLOBS[0].baseY,
                    BASE_BLOBS[1].baseX,
                    BASE_BLOBS[1].baseY,
                    BASE_BLOBS[2].baseX,
                    BASE_BLOBS[2].baseY
                ),
                backgroundSize: '120px 120px, auto, auto, auto',
                backgroundBlendMode: 'overlay, normal, normal, normal',
            }}
        />
    );
}
