/**
 * A slow arcane circle sitting behind a section heading.
 *
 * Pure SVG and CSS — no runtime cost worth measuring. Two rings turning in
 * opposite directions at different rates never repeat their alignment, which
 * is what stops it reading as a spinning graphic.
 *
 * Kept at very low opacity on purpose: this should feel like something noticed
 * on a second pass, not a badge. Rotation stops under prefers-reduced-motion
 * via the global backstop in index.css.
 */

const GLYPHS = ['✦', '◇', '✧', '⌖', '◈', '✦', '⟡', '◇'];

export default function RuneRing({ className = '', size = 460 }) {
    return (
        <div
            className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 ${className}`}
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
            <svg viewBox="0 0 200 200" className="h-full w-full">
                {/* outer ring, clockwise */}
                <g
                    className="origin-center"
                    style={{ animation: 'spin 90s linear infinite' }}
                >
                    <circle
                        cx="100" cy="100" r="92"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.4"
                        strokeDasharray="2 6"
                        className="text-ember-500/25"
                    />
                    {GLYPHS.map((g, i) => {
                        const a = (Math.PI * 2 * i) / GLYPHS.length - Math.PI / 2;
                        return (
                            <text
                                key={i}
                                x={100 + Math.cos(a) * 80}
                                y={100 + Math.sin(a) * 80}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="6"
                                className="fill-ember-400/30"
                            >
                                {g}
                            </text>
                        );
                    })}
                </g>

                {/* inner ring, counter-clockwise and slower */}
                <g
                    className="origin-center"
                    style={{ animation: 'spin 140s linear infinite reverse' }}
                >
                    <circle
                        cx="100" cy="100" r="62"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        strokeDasharray="14 10"
                        className="text-ember-600/20"
                    />
                    {Array.from({ length: 24 }).map((_, i) => {
                        const a = (Math.PI * 2 * i) / 24;
                        const r1 = 54;
                        const r2 = i % 3 === 0 ? 48 : 51;
                        return (
                            <line
                                key={i}
                                x1={100 + Math.cos(a) * r1}
                                y1={100 + Math.sin(a) * r1}
                                x2={100 + Math.cos(a) * r2}
                                y2={100 + Math.sin(a) * r2}
                                stroke="currentColor"
                                strokeWidth="0.35"
                                className="text-ember-500/20"
                            />
                        );
                    })}
                </g>
            </svg>
        </div>
    );
}
