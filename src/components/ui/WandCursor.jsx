import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const TRAIL = 7;

/**
 * A wand tip that follows the pointer, with a short trailing wake and a spark
 * burst on click.
 *
 * Deliberately AUGMENTS the native cursor rather than replacing it. Hiding the
 * system cursor costs real usability — it is what tells people a control is
 * clickable, a text field is editable, or something is being dragged — and no
 * amount of atmosphere is worth that. The glow reads as magic; the arrow keeps
 * the page operable.
 *
 * Renders nothing on touch devices (no pointer to follow) or under
 * prefers-reduced-motion. Runs on one rAF loop writing transforms directly,
 * so it never triggers React renders while moving.
 */
export default function WandCursor() {
    const reduce = useReducedMotion();

    /* Capability check, evaluated once in a lazy initialiser rather than set
       from an effect — it never changes, and setState inside an effect just
       cascades an extra render on every mount. */
    const [hasPointer] = useState(
        () =>
            typeof window !== 'undefined' &&
            window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    );
    const active = hasPointer && !reduce;

    const tipRef = useRef(null);
    const trailRefs = useRef([]);
    const sparkLayer = useRef(null);

    useEffect(() => {
        if (!active) return;

        const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const nodes = Array.from({ length: TRAIL + 1 }, () => ({ x: target.x, y: target.y }));
        let raf = null;
        let seen = false;

        const onMove = (e) => {
            target.x = e.clientX;
            target.y = e.clientY;
            if (!seen) { seen = true; nodes.forEach((n) => { n.x = target.x; n.y = target.y; }); }
        };

        const onDown = (e) => burst(e.clientX, e.clientY);

        const tick = () => {
            raf = requestAnimationFrame(tick);
            // Each node chases the one ahead of it — a chain, not N copies of
            // the same lerp, which is what makes it read as a wake.
            nodes[0].x += (target.x - nodes[0].x) * 0.35;
            nodes[0].y += (target.y - nodes[0].y) * 0.35;
            for (let i = 1; i < nodes.length; i++) {
                nodes[i].x += (nodes[i - 1].x - nodes[i].x) * 0.32;
                nodes[i].y += (nodes[i - 1].y - nodes[i].y) * 0.32;
            }

            if (tipRef.current) {
                tipRef.current.style.transform =
                    `translate3d(${nodes[0].x}px, ${nodes[0].y}px, 0) translate(-50%, -50%)`;
            }
            trailRefs.current.forEach((el, i) => {
                if (!el) return;
                const n = nodes[i + 1];
                el.style.transform =
                    `translate3d(${n.x}px, ${n.y}px, 0) translate(-50%, -50%)`;
            });
        };

        const burst = (x, y) => {
            const layer = sparkLayer.current;
            if (!layer) return;
            for (let i = 0; i < 8; i++) {
                const s = document.createElement('span');
                const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
                const dist = 26 + Math.random() * 34;
                s.className = 'wand-spark';
                s.style.left = `${x}px`;
                s.style.top = `${y}px`;
                s.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
                s.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
                s.style.animationDelay = `${Math.random() * 40}ms`;
                layer.appendChild(s);
                setTimeout(() => s.remove(), 700);
            }
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown, { passive: true });
        raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            cancelAnimationFrame(raf);
        };
    }, [active]);

    if (!active) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
            <div ref={sparkLayer} className="absolute inset-0" />

            {Array.from({ length: TRAIL }).map((_, i) => (
                <span
                    key={i}
                    ref={(el) => { trailRefs.current[i] = el; }}
                    className="absolute left-0 top-0 rounded-full will-change-transform"
                    style={{
                        width: `${5 - i * 0.5}px`,
                        height: `${5 - i * 0.5}px`,
                        background: 'rgb(249 106 27)',
                        opacity: 0.32 * (1 - i / TRAIL),
                        filter: 'blur(1px)',
                    }}
                />
            ))}

            <span
                ref={tipRef}
                className="absolute left-0 top-0 h-6 w-6 rounded-full will-change-transform"
                style={{
                    background:
                        'radial-gradient(circle, rgba(255,196,110,0.55) 0%, rgba(249,106,27,0.22) 40%, transparent 70%)',
                }}
            />
        </div>
    );
}
