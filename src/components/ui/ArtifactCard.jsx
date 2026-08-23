import { forwardRef } from 'react';

/**
 * One project rendered as a collectible artifact card — the face a visitor
 * sees in the fan, before they open anything.
 *
 * Deliberately holds very little: a number, a mark, a name, a one-line
 * tagline, two technologies. A card that already said everything would make
 * opening it pointless, and the brief's whole interaction depends on the card
 * being an invitation rather than a summary. Everything else lives in the
 * detail view.
 *
 * It is a real <button>, not a div with a click handler: these are the primary
 * navigation of the section, so they have to be reachable and operable from a
 * keyboard and announce themselves properly. The magic is all in decoration
 * layers that are aria-hidden, sitting under text that stays plain and high
 * contrast — the brief is explicit that the work itself must stay readable.
 *
 * Forwards its ref so the fan can measure where a card sits on screen and
 * grow the detail view out of that exact point.
 */
/* The card face wants the product name, not the full descriptive title.
   Splits only on a spaced en/em dash so a hyphenated NAME survives intact —
   "Chef-AI – GenAI Recipe Platform" has to become "Chef-AI", not "Chef". */
const shortNameOf = (title) => title.split(/\s[–—]\s/)[0].trim();

const ArtifactCard = forwardRef(function ArtifactCard(
    { project, index, Icon, onOpen, dimmed = false, variant = 'fan' },
    ref,
) {
    const shortTitle = shortNameOf(project.title);

    /* The fan needs every card exactly the same height — the arc positions
       them by transform, so a card that sized itself to its own text would
       sit off the curve. The grid has no such constraint, and there the fixed
       height is actively harmful: a two-line title plus a two-line tagline
       overruns 282px and collides with the tech chips pinned to the bottom.
       So the fan gets a fixed height and the grid gets a floor. */
    const sizing = variant === 'fan' ? 'h-[282px]' : 'min-h-[282px]';

    return (
        <button
            ref={ref}
            type="button"
            onClick={onOpen}
            aria-label={`Open project ${project.title}`}
            className={`group/card relative block w-[200px] ${sizing} shrink-0 rounded-3xl text-left
                        transition-[transform,opacity,filter] duration-500 ease-expo transform-gpu
                        focus-visible:outline-none
                        ${dimmed ? 'opacity-45 saturate-50' : 'opacity-100'}
                        md:hover:-translate-y-3 md:focus-visible:-translate-y-3`}
        >
            {/* Card body. Gradient rather than flat ink so the surface has a
                direction to it — light gathering toward the top edge. */}
            <span
                className="absolute inset-0 rounded-3xl border border-gilt-700/30
                           bg-[linear-gradient(160deg,#1a1613_0%,#12100e_45%,#0c0a09_100%)]
                           shadow-e3 transition-[border-color,box-shadow] duration-500
                           group-hover/card:border-gilt-500/60 group-focus-visible/card:border-gilt-500/60
                           group-hover/card:shadow-glow group-focus-visible/card:shadow-glow"
                aria-hidden="true"
            />

            {/* Engraved double rule, inset from the edge like a printed plate. */}
            <span
                className="absolute inset-[7px] rounded-[18px] border border-gilt-700/25
                           transition-colors duration-500 group-hover/card:border-gilt-600/45"
                aria-hidden="true"
            />

            {/* Corner filigree. One SVG, mirrored four ways by rotation. */}
            <span className="absolute inset-[7px] pointer-events-none" aria-hidden="true">
                {[
                    'top-0 left-0',
                    'top-0 right-0 rotate-90',
                    'bottom-0 right-0 rotate-180',
                    'bottom-0 left-0 -rotate-90',
                ].map((pos) => (
                    <svg
                        key={pos}
                        viewBox="0 0 32 32"
                        className={`absolute ${pos} h-7 w-7 text-gilt-600/45 transition-colors
                                    duration-500 group-hover/card:text-gilt-400/70`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                    >
                        <path d="M2 14 L2 6 Q2 2 6 2 L14 2" />
                        <path d="M6 12 L6 8 Q6 6 8 6 L12 6" strokeOpacity="0.6" />
                        <circle cx="6" cy="6" r="1.1" fill="currentColor" stroke="none" />
                    </svg>
                ))}
            </span>

            {/* Ember motes — only while hovered, and only three. Restraint is
                the point: this should read as heat coming off the card, not a
                particle demo. */}
            <span
                className="absolute inset-0 overflow-hidden rounded-3xl opacity-0
                           transition-opacity duration-500 group-hover/card:opacity-100
                           motion-reduce:hidden"
                aria-hidden="true"
            >
                {[
                    { left: '24%', delay: '0ms' },
                    { left: '54%', delay: '900ms' },
                    { left: '78%', delay: '1700ms' },
                ].map((m) => (
                    <span
                        key={m.left}
                        className="absolute bottom-8 h-1 w-1 rounded-full bg-ember-400"
                        style={{ left: m.left, animation: `card-mote 3.4s ease-out ${m.delay} infinite` }}
                    />
                ))}
            </span>

            {/* ---- content ---------------------------------------------- */}
            <span className="relative flex h-full flex-col items-center px-5 py-6 text-center">
                {/* number */}
                <span className="font-mono text-meta tabular-nums text-gilt-500">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span className="mt-2 h-px w-8 bg-gilt-600/40" aria-hidden="true" />

                {/* mark */}
                <span
                    className="relative mt-6 flex h-16 w-16 items-center justify-center rounded-full
                               border border-gilt-600/35 bg-ink-950/70
                               transition-colors duration-500 group-hover/card:border-gilt-500/60"
                    aria-hidden="true"
                >
                    <span className="absolute inset-1.5 rounded-full border border-gilt-700/25" />
                    <Icon
                        size={24}
                        className="text-gilt-400 transition-colors duration-500 group-hover/card:text-ember-300"
                    />
                </span>

                {/* Name and tagline — the readable payload.
                    w-full is load-bearing, not decoration: the column is
                    `items-center`, which sizes children to their content on the
                    cross axis, so a long title lays itself out wider than the
                    card and spills past the engraved border into whichever card
                    overlaps next. Pinning the width forces the wrap. */}
                <span className="mt-6 w-full font-heading text-[1.02rem] leading-snug text-ink-50
                                 transition-colors duration-500 group-hover/card:text-gilt-100">
                    {shortTitle}
                </span>

                <span className="mt-2 w-full text-[0.72rem] leading-snug text-ink-400 line-clamp-2">
                    {project.tagline}
                </span>

                {/* minimal technical info */}
                <span className="mt-auto flex flex-wrap items-center justify-center gap-1.5">
                    {project.tech.slice(0, 2).map((t) => (
                        <span
                            key={t}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.04]
                                       px-2 py-0.5 text-[0.66rem] font-semibold text-ink-400"
                        >
                            {t}
                        </span>
                    ))}
                    {project.tech.length > 2 && (
                        <span className="text-[0.66rem] font-semibold text-ink-500">
                            +{project.tech.length - 2}
                        </span>
                    )}
                </span>

                <span className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-gilt-600/70">
                    {project.year}
                </span>
            </span>
        </button>
    );
});

export default ArtifactCard;
