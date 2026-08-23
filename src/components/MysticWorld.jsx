import { useEffect, useRef } from 'react';
import { motion, useReducedMotion, useTransform } from 'framer-motion';
import { useStoryProgress } from '../hooks/useStoryProgress';
import { SECTION_IDS } from '../lib/story';
import RuneRing from './ui/RuneRing';

/**
 * The world the phoenix flies through — a gothic keep behind the whole page,
 * not a hero-only backdrop. Fixed and full-bleed like PhoenixStage, but
 * mounted BEHIND it (App.jsx renders this first) so the WebGL canvas's
 * transparent clear colour lets the keep show through the gutters between
 * the phoenix, the embers and the stars, exactly the way Section backgrounds
 * are deliberately translucent for the same reason.
 *
 * The keep is a real photograph (Tomer Texler, Hohenzollern Castle, Germany,
 * Unsplash License — free to use, no attribution required, credited here
 * anyway): a distant castle crowning a forested hill, with real atmospheric
 * haze stacking the ridges behind it.
 *
 * THIRD photo in this slot, and the two rejects explain the choice:
 *   · A single small gatehouse turret. A real photo, wrong SUBJECT — one
 *     modest building can't read as "a magical world" however it's graded.
 *   · Eltz Castle, shot close and filling the frame. Genuinely a fortress,
 *     but framed as architecture: no landscape, no distance, no depth.
 * The reference the brief kept pointing at is a LANDSCAPE — the castle small
 * and far off across terrain, forest between you and it, air thick enough to
 * see. That's a compositional property, not a grading one, which is why the
 * first two couldn't be processed into it and this one needs almost nothing.
 *
 * A code-drawn version was also built and thrown away: layered SVG ridges,
 * procedural conifers, gradient light shafts. It rendered cleanly and looked
 * exactly like flat vector art, because silhouettes stacked on gradients have
 * no texture, and texture is most of what "photoreal" means. Not worth
 * re-attempting — the shortfall is the technique, not the tuning.
 *
 * Every layer ON TOP of the photo is still code — that's what turns a static
 * photo into a scene with the rest of the page:
 *
 *   1. A colour-grade + darken pass so a bright stock photo reads as part of
 *      this palette instead of a pasted-in image — same trick a film does
 *      with a LUT, not a filter slapped on for its own sake.
 *   2. THE JOURNEY: one continuous zoom-and-drift toward the keep tracking
 *      how far down the whole page a visitor is (0→1 across the entire
 *      scrollable height, not per section — see `scrollFrac` in the effect).
 *      A single photo can't cut to a different vantage point the way six
 *      drawn scenes could, but it can be travelled INTO, the way a slow
 *      dolly-in reads as approach rather than a slideshow. This is the thing
 *      that makes scrolling feel like moving through one connected place —
 *      the earlier brief's complaint was one static image sitting behind
 *      the text with nothing connecting section to section; this is the fix.
 *   3. A short scroll-triggered settle + idle Ken-Burns creep + sway on top
 *      of that, at their own gentle pace independent of the journey — "its
 *      own moments" the same way the phoenix's wander is.
 *   4. A colour wash keyed to the same five-beat story the phoenix flies
 *      (lib/story.js) — the keep's mood shifts arrival → awareness →
 *      descent → ascension → rest, like a film's lighting changing scene to
 *      scene.
 *
 * The short scroll-triggered settle (not the journey zoom) is soft-capped
 * (`settle()` below) rather than linear in scrollY, so it only ever
 * contributes an "arriving" flourish over the first couple of screens
 * instead of accumulating without bound over a page this tall.
 */

const BEAT_TINTS = [
    'rgba(249,106,27,0.16)',  // home · ARRIVAL — ember dusk
    'rgba(217,164,65,0.14)',  // about · AWARENESS — gilt, attentive
    'rgba(116,136,181,0.20)', // projects · DESCENT — cold, mysterious
    'rgba(242,224,174,0.18)', // achievements · ASCENSION — bright gilt triumph
    'rgba(20,16,26,0.30)',    // contact · REST — quiet indigo-black
];

/** Diminishing-returns cap: fast at first, then holds — never runs away. */
const settle = (v, cap, decay) => cap * (1 - Math.exp(-Math.abs(v) / decay)) * Math.sign(v);

export default function MysticWorld() {
    const reduce = useReducedMotion();
    const u = useStoryProgress(SECTION_IDS);
    const tint = useTransform(u, [0, 0.25, 0.5, 0.75, 1], BEAT_TINTS);

    const photoRef = useRef(null);
    const mistRef = useRef(null);

    useEffect(() => {
        let raf = null;
        let scrollY = window.scrollY;
        // How far down the WHOLE page a visitor physically is, 0→1 — not the
        // section-warped `u` above. `u` gives equal weight to every section
        // for the story beats, which is right for mood but wrong here: the
        // journey should track how much of the page has gone by, not which
        // chapter, or the "camera" would leap across the short Hero and
        // crawl through the long Projects section at wildly different rates.
        let docRange = 1;

        const measure = () => {
            docRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        };
        const onScroll = () => { scrollY = window.scrollY; };
        measure();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', measure);

        const tick = (now) => {
            raf = requestAnimationFrame(tick);
            const breathe = reduce ? 0 : Math.sin(now / 6200) * 6;
            const scrollFrac = Math.min(1, Math.max(0, scrollY / docRange));

            /* The journey: one continuous push toward the keep across the
               ENTIRE page, not a per-section jump cut. Zoom carries the
               "walking closer" read; the compensating upward pan keeps the
               lit doorway — the thing worth arriving at — in frame instead
               of drifting off as the scale grows around the viewport's
               centre; the horizontal drift is small enough to stay inside
               object-cover's overscan at any viewport width. This is what
               makes scrolling read as moving through one connected place
               rather than a static poster sitting behind the text. */
            const journeyZoom = reduce ? 1 : 1 + scrollFrac * 0.34;
            const journeyY = reduce ? 0 : scrollFrac * 46;
            const journeyX = reduce ? 0 : scrollFrac * -22;

            // Small idle creep + sway on top — the scene never sits perfectly
            // still even at a fixed scroll position, "its own moments" the
            // same way the phoenix's wander is.
            const idleZoom = reduce ? 1 : 1 + Math.min(0.03, now / 1400000);

            const pan = settle(scrollY, 90, 1500) + breathe;
            const mist = settle(scrollY, 130, 1200) + breathe * 1.6;

            if (photoRef.current) {
                photoRef.current.style.transform =
                    `translate3d(${journeyX}px, ${-(pan + journeyY)}px, 0) scale(${idleZoom * journeyZoom})`;
            }
            if (mistRef.current) mistRef.current.style.transform = `translate3d(0, ${-mist}px, 0)`;
        };
        raf = requestAnimationFrame(tick);

        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', measure);
            if (raf) cancelAnimationFrame(raf);
        };
    }, [reduce]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* The keep. Source is a TALL portrait photo (towers, then the
                bridge, then its own reflection, stacked top to bottom) — only
                a slice of that is ever visible in a wide viewport, so
                object-position picks the slice with the skyline in it rather
                than cropping to centre and landing mid-bridge. */}
            <img
                ref={photoRef}
                src="/keep-backdrop.jpg"
                srcSet="/keep-backdrop-sm.jpg 1200w, /keep-backdrop.jpg 3000w"
                sizes="100vw"
                alt=""
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-[center_74%] will-change-transform"
                /* Source is 3000px wide (up from 2400) specifically because the
                   journey zooms to 1.34x — at the old size a 2x display was
                   resampling past the source's real detail by the bottom of the
                   page and the stonework went soft. Grade is lighter than it
                   was too: brightness 0.62 was crushing the castle into a
                   silhouette, and the ask was for MORE visible detail, so this
                   holds more of the photo's own range and leans on contrast
                   rather than darkness. The seam gradients below still supply
                   the dark the hero copy needs to stay legible. */
                style={{ filter: 'brightness(0.72) saturate(0.95) contrast(1.12)' }}
            />

            {/* Grade: this photo is already warm (golden sunrise mist), so —
                unlike a cool-cast source — this only needs to deepen it
                toward the site's ink/ember palette, not fight its colour. */}
            <div
                className="absolute inset-0 mix-blend-color"
                style={{ background: 'linear-gradient(180deg, #241A12 0%, #34240F 45%, #1A140D 100%)', opacity: 0.3 }}
            />

            {/* A soft warm accent roughly where the gate sits, so it still
                reads as a destination once the darken pass above pulls the
                photo's own glow down. */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse 34% 20% at 50% 48%, rgba(249,166,64,0.16), transparent 65%)',
                }}
            />

            {/* Seams into the page background — top, and a long fade at the
                bottom so the photo resolves into the same ink-950 every
                section's own gradient/panel bleeds into. */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        linear-gradient(to bottom, #0B0907 0%, transparent 16%, transparent 55%, #0B0907 100%),
                        linear-gradient(to top, rgba(11,9,7,0.55), transparent 30%)
                    `,
                }}
            />

            {/* A quiet arcane sigil against the storm clouds — not a literal
                moon over a real sky, just a mark noticed on a second pass.
                Reuses RuneRing's two independently-spinning glyph rings. */}
            <div className="absolute left-[62%] top-[8%] h-36 w-36 -translate-x-1/2 isolate md:h-48 md:w-48">
                <RuneRing size={280} className="opacity-40" />
            </div>

            {/* Mist — two bands drifting opposite ways at different speeds, so
                even a visitor who never scrolls sees the keep breathing. */}
            <div ref={mistRef} className="absolute inset-x-0 bottom-0 h-[38vh] will-change-transform">
                <div
                    className="absolute -inset-x-8 bottom-0 h-2/3 opacity-60"
                    style={{
                        background: 'linear-gradient(to top, rgba(11,9,7,0.95), transparent)',
                        animation: reduce ? 'none' : 'mist-drift-a 22s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute -inset-x-8 bottom-0 h-2/5 opacity-45 blur-sm"
                    style={{
                        background: 'linear-gradient(to top, rgba(61,53,43,0.7), transparent)',
                        animation: reduce ? 'none' : 'mist-drift-b 31s ease-in-out infinite',
                    }}
                />
            </div>

            {/* Colour-grade wash, keyed to the phoenix's own five-beat story. */}
            <motion.div
                className="absolute inset-0 mix-blend-overlay"
                style={{ background: tint }}
            />
        </div>
    );
}
