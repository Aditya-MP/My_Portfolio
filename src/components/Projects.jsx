import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Satellite, Wallet, ScanFace, ChefHat, Palette, MapPin, Bot } from 'lucide-react';
import { profile } from '../profile';
import SectionHeader from './ui/SectionHeader';
import ArtifactCard from './ui/ArtifactCard';
import ProjectCodex from './ui/ProjectCodex';

/**
 * The Projects section as a spread of artifact cards rather than a stack of
 * page-width panels.
 *
 * Scroll in → the cards rise out of a single pile and fan into an arc →
 * click one → it opens into its full record with the rest still visible
 * behind → close → back to the spread.
 *
 * GEOMETRY. The fan is a real arc, not a row with rotations sprinkled on:
 * every card is placed by rotating it about one pivot far below the
 * container, so its angle and its position agree the way a held hand of cards
 * does. Faking it — translate on x, rotate independently — is what makes
 * these look like stickers rather than objects.
 *
 * RESPONSIVENESS. All the arc maths is written once, at one canonical size,
 * and the whole fan is then scaled to fit its measured container. Recomputing
 * the geometry per breakpoint would mean several sets of magic numbers that
 * drift apart. Below `FAN_MIN_WIDTH` the arc stops being usable at any scale —
 * seven overlapping cards on a phone leaves nothing legible — so the same
 * cards render as a plain grid instead. Same components, same data, different
 * arrangement.
 */

/* Presentation, not data: which mark stands for which project. Keyed by id so
   reordering profile.projects can't silently reassign icons. */
const ICONS = {
    7: Satellite,   // WorldBean — satellite verification
    1: Wallet,      // Salary Pilot — allocation
    2: Bot,         // Agent Forces — conversational agent
    3: ScanFace,    // Face recognition attendance
    4: ChefHat,     // Chef-AI
    5: Palette,     // Kalakrithi — artisan craft
    6: MapPin,      // Local Lens — hyperlocal
};
const iconFor = (id) => ICONS[id] ?? Bot;

/* Canonical fan, in px at scale 1. */
const CARD_W = 200;
const CARD_H = 282;
/* Radius sets how far apart the cards land; the angle sets how much each one
   tilts. They are tuned against each other rather than to taste: at radius
   1150 the seven cards stepped only ~135px apart, so each card buried nearly
   half of its neighbour and the project names were cut mid-word. Opening the
   radius to 1400 (same angle, so the same tilt) steps them ~164px apart —
   they still overlap like a held hand, but every name and tagline stays
   fully legible, which the brief treats as non-negotiable. */
const PIVOT_RADIUS = 1400;   // distance from arc centre to card centre
const ARC_RAD = 0.72;        // total angular spread of the whole hand
const FAN_WIDTH = 1240;      // container width the geometry is authored for
const FAN_MIN_WIDTH = 768;   // below this, fall back to the grid

/** Where card `i` of `n` sits on the arc. */
function fanSlot(i, n) {
    const t = n > 1 ? i / (n - 1) - 0.5 : 0;   // -0.5 … +0.5
    const angle = t * ARC_RAD;
    return {
        x: Math.sin(angle) * PIVOT_RADIUS,
        y: (1 - Math.cos(angle)) * PIVOT_RADIUS,
        rotate: (angle * 180) / Math.PI,
    };
}

const ARC_DIP = (1 - Math.cos(ARC_RAD / 2)) * PIVOT_RADIUS;
const FAN_HEIGHT = CARD_H + ARC_DIP + 56; // + room for the hover lift

export default function Projects() {
    const reduce = useReducedMotion();
    const projects = profile.projects;

    const wrapRef = useRef(null);
    const cardRefs = useRef([]);

    /* Observed on the WRAPPER, which is always mounted — not on the fan or the
       grid. Those two swap places once the measure below decides which
       arrangement fits, and useInView captures its target when its effect
       runs: point it at either branch and it spends the rest of the session
       observing a node that got unmounted a frame later, reports false
       forever, and the cards never leave their pile. */
    const inView = useInView(wrapRef, { once: true, amount: 0.3 });

    const [openIndex, setOpenIndex] = useState(null);
    const [origin, setOrigin] = useState('50% 50%');
    const [layout, setLayout] = useState({ isFan: false, scale: 1 });
    /* Which card is being pointed at or focused. The fan overlaps by design,
       and because the cards are rotated they overlap MORE toward their lower
       edge — which is exactly where the tagline sits. Rather than spreading
       the hand until nothing overlaps (at which point it stops reading as a
       hand at all), the card under the cursor lifts to the front, so any card
       can be read in full on demand. This is also why it tracks focus, not
       just hover: a keyboard user tabbing through gets the same reveal. */
    const [active, setActive] = useState(null);

    /* Measure in a layout effect: this decides between two arrangements, and
       doing it after paint would show the wrong one for a frame. */
    useLayoutEffect(() => {
        const measure = () => {
            const w = wrapRef.current?.clientWidth ?? 0;
            setLayout({
                isFan: w >= FAN_MIN_WIDTH,
                scale: Math.min(1, w / FAN_WIDTH),
            });
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (wrapRef.current) ro.observe(wrapRef.current);
        return () => ro.disconnect();
    }, []);

    /* Grow the detail view out of the card that was clicked. Measured at click
       time rather than stored per card, because the fan's scale — and so every
       card's screen position — changes with the viewport. */
    const open = useCallback((i) => {
        const el = cardRefs.current[i];
        if (el) {
            const r = el.getBoundingClientRect();
            const px = ((r.left + r.width / 2) / window.innerWidth) * 100;
            const py = ((r.top + r.height / 2) / window.innerHeight) * 100;
            setOrigin(`${px.toFixed(1)}% ${py.toFixed(1)}%`);
        }
        setOpenIndex(i);
    }, []);

    const close = useCallback(() => setOpenIndex(null), []);

    // A resize while open would leave the panel growing from a stale point.
    useEffect(() => {
        if (openIndex === null) return;
        const onResize = () => setOrigin('50% 50%');
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [openIndex]);

    const settled = reduce || inView;

    return (
        <div className="relative isolate container-page">
            <div className="halo top-[10%] left-1/2 -translate-x-1/2 w-full max-w-3xl h-[36vh]" aria-hidden="true" />

            <SectionHeader
                index="02"
                eyebrow="Selected Works"
                title="Things I've"
                accent="shipped."
                description="Seven artifacts. Draw one from the spread to read its full record."
                align="center"
                size="lg"
                rune
                className="mb-16 md:mb-20"
            />

            <div ref={wrapRef}>
                {layout.isFan ? (
                    <div
                        className="relative mx-auto"
                        style={{ height: FAN_HEIGHT * layout.scale, width: FAN_WIDTH * layout.scale }}
                    >
                        <div
                            className="absolute left-1/2 top-0 origin-top"
                            style={{ transform: `translateX(-50%) scale(${layout.scale})`, width: FAN_WIDTH }}
                        >
                            {projects.map((project, i) => {
                                const slot = fanSlot(i, projects.length);
                                return (
                                    <motion.div
                                        key={project.id}
                                        className="absolute left-1/2 top-0"
                                        onMouseEnter={() => setActive(i)}
                                        onMouseLeave={() => setActive((c) => (c === i ? null : c))}
                                        onFocusCapture={() => setActive(i)}
                                        onBlurCapture={() => setActive((c) => (c === i ? null : c))}
                                        style={{
                                            marginLeft: -CARD_W / 2,
                                            zIndex: openIndex === i ? 40 : active === i ? 30 : 10 + i,
                                        }}
                                        initial={
                                            reduce
                                                ? false
                                                : { x: 0, y: 60, rotate: 0, opacity: 0, scale: 0.92 }
                                        }
                                        animate={
                                            settled
                                                ? { x: slot.x, y: slot.y + 16, rotate: slot.rotate, opacity: 1, scale: 1 }
                                                : { x: 0, y: 60, rotate: 0, opacity: 0, scale: 0.92 }
                                        }
                                        transition={
                                            reduce
                                                ? { duration: 0 }
                                                : {
                                                      type: 'spring',
                                                      stiffness: 84,
                                                      damping: 17,
                                                      mass: 0.9,
                                                      delay: 0.07 * i,
                                                  }
                                        }
                                    >
                                        <ArtifactCard
                                            ref={(el) => { cardRefs.current[i] = el; }}
                                            project={project}
                                            index={i}
                                            Icon={iconFor(project.id)}
                                            onOpen={() => open(i)}
                                            dimmed={openIndex !== null && openIndex !== i}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Phone arrangement: the same artifacts, laid out to be read. */
                    <ul className="grid grid-cols-2 justify-items-center gap-4 sm:gap-6">
                        {projects.map((project, i) => (
                            <motion.li
                                key={project.id}
                                initial={reduce ? false : { opacity: 0, y: 24 }}
                                animate={settled ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                                transition={reduce ? { duration: 0 } : { duration: 0.5, delay: 0.05 * i }}
                            >
                                <ArtifactCard
                                    ref={(el) => { cardRefs.current[i] = el; }}
                                    project={project}
                                    index={i}
                                    Icon={iconFor(project.id)}
                                    onOpen={() => open(i)}
                                    dimmed={openIndex !== null && openIndex !== i}
                                    variant="grid"
                                />
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>

            <AnimatePresence>
                {openIndex !== null && (
                    <ProjectCodex
                        key={projects[openIndex].id}
                        project={projects[openIndex]}
                        index={openIndex}
                        Icon={iconFor(projects[openIndex].id)}
                        origin={origin}
                        onClose={close}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
