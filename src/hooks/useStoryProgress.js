import { useEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';

/**
 * Scroll position → a 0–1 value where each section owns an equal slice.
 *
 * Deliberately NOT raw scrollYProgress: sections have wildly different heights
 * (Projects is ~6x the Hero), so raw progress would put the dive somewhere in
 * the middle of About. Warping by section index means waypoint N always lands
 * on section N, whatever the content does later.
 *
 * With n sections the result is (index + localProgress) / n, which matches the
 * n+1 waypoints / n segments in flightPath.js.
 */
export function useStoryProgress(ids) {
    const progress = useMotionValue(0);
    const meta = useRef({ index: 0, local: 0 });

    useEffect(() => {
        let frame = null;

        const compute = () => {
            frame = null;
            const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
            if (els.length < 2) return;

            // Read position at 45% down the viewport — roughly where attention sits.
            const line = window.scrollY + window.innerHeight * 0.45;
            const docHeight = document.documentElement.scrollHeight;

            let index = els.length - 1;
            let local = 1;

            for (let i = 0; i < els.length; i++) {
                const top = els[i].offsetTop;
                const bottom = i + 1 < els.length ? els[i + 1].offsetTop : docHeight;
                if (line < bottom) {
                    index = i;
                    local = Math.min(1, Math.max(0, (line - top) / Math.max(1, bottom - top)));
                    break;
                }
            }

            meta.current = { index, local };
            const u = (index + local) / els.length;
            progress.set(Number.isFinite(u) ? Math.min(1, Math.max(0, u)) : 0);
        };

        const onScroll = () => {
            if (frame === null) frame = requestAnimationFrame(compute);
        };

        compute();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (frame !== null) cancelAnimationFrame(frame);
        };
    }, [ids, progress]);

    return progress;
}
