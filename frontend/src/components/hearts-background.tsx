import { useMemo } from "react";

const HEART_COUNT = 22;

function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// A decorative, non-interactive background of gently falling hearts.
// Pure CSS animation — no dependencies, no per-frame JS.
export default function HeartsBackground() {
    const hearts = useMemo(
        () =>
            Array.from({ length: HEART_COUNT }, () => ({
                left: `${random(0, 100)}%`,
                fontSize: `${random(14, 42)}px`,
                duration: random(9, 20),
                // Negative delays so the screen is already populated on first paint.
                delay: -random(0, 20),
                opacity: random(0.12, 0.5),
                drift: `${random(-50, 50)}px`,
            })),
        []
    );

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <style>{`
                @keyframes heartFall {
                    0%   { transform: translateY(-12vh) translateX(0) rotate(0deg); opacity: 0; }
                    10%  { opacity: var(--o); }
                    90%  { opacity: var(--o); }
                    100% { transform: translateY(112vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .matcha-heart { animation: none !important; opacity: 0.18 !important; }
                }
            `}</style>
            {hearts.map((h, i) => {
                const style: React.CSSProperties = {
                    left: h.left,
                    fontSize: h.fontSize,
                    animation: `heartFall ${h.duration}s linear ${h.delay}s infinite`,
                };
                (style as Record<string, string | number>)["--o"] = h.opacity;
                (style as Record<string, string | number>)["--drift"] = h.drift;
                return (
                    <span
                        key={i}
                        className="matcha-heart absolute top-0 select-none text-rose-400"
                        style={style}
                    >
                        ♥
                    </span>
                );
            })}
        </div>
    );
}
