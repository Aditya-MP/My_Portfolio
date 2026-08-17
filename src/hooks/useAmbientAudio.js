import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'portfolio:ambience';

/**
 * Background ambience, gated behind an explicit user gesture.
 *
 * Deliberately never autoplays. Two reasons, and both are hard constraints:
 * browsers block unmuted autoplay outright, and WCAG 2.1 (1.4.2) requires a
 * control for any audio that runs longer than three seconds. So the default is
 * off, the choice is remembered, and starting always comes from a click.
 *
 * Volume is ramped rather than switched — an instant cut to full volume is the
 * single most jarring thing a site can do.
 */
export function useAmbientAudio(src, { volume = 0.35, fadeMs = 1200 } = {}) {
    const audioRef = useRef(null);
    const rampRef = useRef(null);

    const [enabled, setEnabled] = useState(false);
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);

    // Create the element once; never attach it to the DOM.
    useEffect(() => {
        const el = new Audio();
        el.src = src;
        el.loop = true;
        el.preload = 'none'; // don't spend bandwidth until asked
        el.volume = 0;
        el.addEventListener('canplaythrough', () => setReady(true));
        el.addEventListener('error', () => setFailed(true));
        audioRef.current = el;

        return () => {
            cancelAnimationFrame(rampRef.current);
            el.pause();
            el.src = '';
            audioRef.current = null;
        };
    }, [src]);

    const ramp = useCallback((to, done) => {
        const el = audioRef.current;
        if (!el) return;
        cancelAnimationFrame(rampRef.current);

        const from = el.volume;
        const start = performance.now();

        const tick = (now) => {
            const t = Math.min(1, (now - start) / fadeMs);
            el.volume = from + (to - from) * t;
            if (t < 1) rampRef.current = requestAnimationFrame(tick);
            else done?.();
        };
        rampRef.current = requestAnimationFrame(tick);
    }, [fadeMs]);

    const toggle = useCallback(async () => {
        const el = audioRef.current;
        if (!el) return;

        if (enabled) {
            ramp(0, () => el.pause());
            setEnabled(false);
            localStorage.setItem(STORAGE_KEY, 'off');
            return;
        }

        try {
            el.volume = 0;
            await el.play();       // must stay inside the click's call stack
            ramp(volume);
            setEnabled(true);
            localStorage.setItem(STORAGE_KEY, 'on');
        } catch {
            // Blocked, or the file is missing. Stay silent and surface it.
            setFailed(true);
            setEnabled(false);
        }
    }, [enabled, ramp, volume]);

    // Pause while the tab is hidden; resume only if it was already playing.
    useEffect(() => {
        if (!enabled) return;
        const onVisibility = () => {
            const el = audioRef.current;
            if (!el) return;
            if (document.hidden) el.pause();
            else el.play().catch(() => {});
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, [enabled]);

    return { enabled, ready, failed, toggle, preferred: localStorage.getItem(STORAGE_KEY) === 'on' };
}
