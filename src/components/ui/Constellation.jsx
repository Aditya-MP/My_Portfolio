import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A skill cluster drawn as a constellation.
 *
 * The skills stay real DOM — a <ul> of focusable chips — and the star lines are
 * an SVG overlay whose endpoints are MEASURED from those chips. The obvious
 * alternative, rendering everything inside one SVG, would have made the labels
 * unselectable, unfocusable and blurry at small sizes. The brief is explicit
 * that the text must stay highly readable, so the decoration adapts to the
 * content rather than the other way round.
 *
 * Lines follow DOM order (a path threading the cluster) plus a few longer
 * chords, which is what stops it looking like a plain zig-zag. Hovering or
 * focusing a chip lights the lines that touch it.
 */
export default function Constellation({ items = [] }) {
    const wrapRef = useRef(null);
    const chipRefs = useRef([]);
    const [nodes, setNodes] = useState([]);
    const [active, setActive] = useState(null);

    const measure = useCallback(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const base = wrap.getBoundingClientRect();
        const next = chipRefs.current.map((el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
        });
        setNodes(next);
    }, []);

    useEffect(() => {
        measure();
        // Chips reflow on resize and on webfont swap; both move the endpoints.
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        window.addEventListener('resize', measure);
        document.fonts?.ready?.then(measure).catch(() => {});
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [measure, items]);

    // Sequential thread + a chord every third node, so the shape reads as a
    // constellation rather than a polyline.
    const edges = [];
    for (let i = 0; i < items.length - 1; i++) edges.push([i, i + 1]);
    for (let i = 0; i + 3 < items.length; i += 3) edges.push([i, i + 3]);

    return (
        <div ref={wrapRef} className="relative">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                aria-hidden="true"
            >
                {edges.map(([a, b], i) => {
                    const p = nodes[a];
                    const q = nodes[b];
                    if (!p || !q) return null;
                    const lit = active === a || active === b;
                    return (
                        <line
                            key={i}
                            x1={p.x} y1={p.y} x2={q.x} y2={q.y}
                            stroke="currentColor"
                            strokeWidth={lit ? 1 : 0.6}
                            className={`transition-all duration-300 ${
                                lit ? 'text-gilt-500/70' : 'text-gilt-700/25'
                            }`}
                        />
                    );
                })}
                {nodes.map((n, i) =>
                    n ? (
                        <circle
                            key={i}
                            cx={n.x} cy={n.y} r={active === i ? 2.5 : 1.5}
                            className={`transition-all duration-300 ${
                                active === i ? 'fill-gilt-400' : 'fill-gilt-600/40'
                            }`}
                        />
                    ) : null,
                )}
            </svg>

            {/* Plain list items, NOT buttons.
                These were <button>s so they could take focus, which added ~30
                dead tab stops that announce as "button" and do nothing. The
                lines are decoration; the skill name is the content. Hover is a
                bonus for mice, not a feature anyone should have to tab through. */}
            <ul className="relative flex flex-wrap gap-x-3 gap-y-3">
                {items.map((skill, i) => (
                    <li
                        key={skill}
                        ref={(el) => { chipRefs.current[i] = el; }}
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(null)}
                        className={`chip transition-all duration-300 ${
                            active === i ? 'border-gilt-500/50 bg-gilt-500/10 text-gilt-200' : ''
                        }`}
                    >
                        {skill}
                    </li>
                ))}
            </ul>
        </div>
    );
}
