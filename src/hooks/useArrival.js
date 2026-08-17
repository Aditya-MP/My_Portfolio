import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { MOTION } from '../lib/phoenixMotion';

/**
 * The awakening.
 *
 * On first load the page should not simply contain a phoenix — something should
 * arrive. This drives a single 0→1 value over the arrival duration that the
 * scene reads to stage the sequence:
 *
 *   0.00–0.18  dark; the first ember
 *   0.18–0.35  a second, then a scatter
 *   0.35–0.65  silhouette resolving out of the far dark
 *   0.65–1.00  the glide in, wings becoming readable
 *
 * Returned as a ref, not state: the frame loop reads it every frame and a
 * state update per frame would re-render the tree 60 times a second. The
 * boolean `done` IS state, because the DOM needs it once to release the title.
 *
 * Under reduced motion it completes instantly — the page must never withhold
 * content for the sake of a flourish.
 */
export function useArrival() {
    const reduce = useReducedMotion();
    const progress = useRef(reduce ? 1 : 0);

    /* `done` is derived rather than set: under reduced motion the sequence is
       complete by definition, and calling setState for that synchronously
       inside the effect just cascades an extra render. Only the real
       completion, which fires from a rAF callback, touches state. */
    const [finished, setFinished] = useState(false);
    const done = reduce || finished;

    useEffect(() => {
        if (reduce) {
            progress.current = 1;
            return;
        }

        const duration = MOTION.arrivalDuration * 1000;
        const start = performance.now();
        let raf = null;

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            // easeOutQuint: fast to establish presence, then a long settle
            progress.current = 1 - Math.pow(1 - t, 5);
            if (t < 1) raf = requestAnimationFrame(tick);
            else setFinished(true);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            if (raf) cancelAnimationFrame(raf);
        };
    }, [reduce]);

    return { progress, done };
}
