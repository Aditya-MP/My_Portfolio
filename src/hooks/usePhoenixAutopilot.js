import { useEffect } from 'react';
import { useMotionValue } from 'framer-motion';

/**
 * Drives the phoenix's position on the flight path (lib/flightPath.js) on
 * its own clock, not the scrollbar. This used to be scroll progress —
 * scrolling the page pinned the bird to an exact point on the curve, which
 * read as a puppet on a string rather than a living thing.
 *
 * `u` counts up forever rather than ping-ponging back and forth. That isn't
 * just pacing taste: flightPath's curve is now CLOSED, built specifically so
 * u can increase without limit and wrap straight from the last waypoint back
 * into the first — a real circuit, the way a dragon circles rather than
 * pacing a corridor. A ping-pong would need the bird to reverse direction on
 * an open curve, and a curve tangent only encodes one direction of travel;
 * reversing it made the heading math ambiguous (see flightPath.js). Counting
 * up forever sidesteps that rather than patching around it.
 *
 * Same MotionValue interface useStoryProgress returned (a framer-motion
 * value with .get()), so usePhoenixFlight, usePhoenixLife and EmberTrail
 * all keep working unmodified — only who drives it changed.
 */
export function usePhoenixAutopilot(reduce) {
    const u = useMotionValue(reduce ? 0.16 : 0);

    useEffect(() => {
        if (reduce) return;

        let raf = null;
        /* One full circuit. Raised from 46s when the loop was widened to fill
           the screen: that doubled the arc length (≈60 → 122 units), so
           holding the old lap time would have doubled the bird's speed — the
           opposite of the calm, deliberate glide this wants. 72s lands it
           slightly faster than the old tight loop while covering far more
           ground, which reads as purposeful rather than hurried. */
        const lapSeconds = 72;

        const tick = (now) => {
            raf = requestAnimationFrame(tick);
            u.set((now / 1000 / lapSeconds) % 1);
        };
        raf = requestAnimationFrame(tick);

        return () => { if (raf) cancelAnimationFrame(raf); };
    }, [reduce, u]);

    return u;
}
