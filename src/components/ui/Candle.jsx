import { useReducedMotion } from 'framer-motion';

/**
 * A single floating candle — a restrained point of warm light marking a
 * section boundary. Pure DOM/CSS, no WebGL: this is decoration sitting in
 * the page flow, not part of the phoenix's world, and costs nothing worth
 * measuring.
 *
 * Two layers do the work: a soft blurred halo (the cast light) and a small
 * bright core (the flame). Both flicker independently via CSS keyframes
 * (defined in index.css) with a per-instance delay, so two candles on the
 * same section never flicker in lockstep — unison is what would make them
 * read as a loop instead of something alive.
 *
 * Frozen to a steady glow under prefers-reduced-motion via the same global
 * backstop that flattens every other animation-duration in the app — no
 * special-casing needed here.
 */
export default function Candle({ className = '', delay = 0 }) {
    const reduce = useReducedMotion();

    return (
        <div
            className={`pointer-events-none absolute h-6 w-6 ${className}`}
            aria-hidden="true"
        >
            {/* cast light */}
            <span
                className="absolute -inset-5 rounded-full bg-ember-500/25 blur-xl"
                style={{ animation: reduce ? 'none' : `candle-halo 3.6s ease-in-out ${delay}ms infinite` }}
            />
            {/* flame core */}
            <span
                className="absolute left-1/2 top-1/2 h-2.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full
                           bg-gilt-300 shadow-[0_0_10px_3px_rgba(249,106,27,0.6)]"
                style={{
                    transformOrigin: '50% 90%',
                    animation: reduce ? 'none' : `candle-flicker 2.1s ease-in-out ${delay}ms infinite`,
                }}
            />
        </div>
    );
}
