import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/motion';

/**
 * Headings surface out of the dark.
 *
 * Blur plus opacity rather than the usual slide-up: ink soaking into paper
 * doesn't travel, it resolves. Words are the unit, not characters — per-letter
 * animation on a Garamond reads as a gimmick and wrecks the word shapes the
 * face is designed around.
 *
 * `whole` is REQUIRED for gradient text (`background-clip: text`). Animating
 * per word puts opacity/filter on child spans, and a child with its own
 * compositing layer is painted outside the parent's background-clip — so the
 * gradient clips to nothing and the text renders invisible. With `whole` the
 * gradient and the animation sit on the same element, which composites fine.
 */
const HIDDEN = { opacity: 0, filter: 'blur(12px)' };
const SHOWN = { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } };

export default function InkReveal({
    text,
    as = 'span',
    className = '',
    delay = 0,
    stagger = 0.08,
    whole = false,
    once = true,
}) {
    const reduce = useReducedMotion();
    const Tag = motion[as];

    if (reduce) {
        const Plain = as;
        return <Plain className={className}>{text}</Plain>;
    }

    if (whole) {
        return (
            <Tag
                className={className}
                initial={HIDDEN}
                whileInView={SHOWN}
                viewport={{ once, margin: '-10% 0px' }}
                transition={{ ...SHOWN.transition, delay }}
            >
                {text}
            </Tag>
        );
    }

    const words = String(text).split(' ');

    return (
        <Tag
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: '-10% 0px' }}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
            }}
        >
            {words.map((word, i) => (
                // Spaces stay as real text nodes between the animated spans, so
                // the heading still wraps naturally and selects as normal text.
                <span key={`${word}-${i}`}>
                    <motion.span
                        className="inline-block"
                        variants={{ hidden: HIDDEN, visible: SHOWN }}
                    >
                        {word}
                    </motion.span>
                    {i < words.length - 1 ? ' ' : ''}
                </span>
            ))}
        </Tag>
    );
}
