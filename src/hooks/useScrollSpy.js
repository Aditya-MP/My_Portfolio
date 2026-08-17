import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently occupying the reading position.
 *
 * `ids` must be a stable reference (declare it at module scope) or the
 * listener re-subscribes on every render.
 */
export function useScrollSpy(ids) {
    const [active, setActive] = useState(ids[0]);

    useEffect(() => {
        const elements = ids
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (!elements.length) return;

        let frame = null;

        const compute = () => {
            frame = null;

            // A section is "current" once its top crosses the upper third.
            const line = window.innerHeight * 0.35;
            let current = elements[0].id;

            for (const el of elements) {
                if (el.getBoundingClientRect().top <= line) current = el.id;
            }

            // The last section is often too short to ever cross the line.
            const atBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 4;
            if (atBottom) current = elements[elements.length - 1].id;

            setActive(current);
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
    }, [ids]);

    return active;
}
