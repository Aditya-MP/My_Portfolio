import { motion, useReducedMotion } from 'framer-motion';
import { EASE, DURATION } from '../../lib/motion';

/**
 * Shared motion vocabulary. Every entrance animation in the app comes from
 * here so timing, easing and reduced-motion behaviour stay identical.
 *
 * When the user prefers reduced motion, movement is dropped and only a short
 * opacity fade remains.
 */

/** Single element that fades and rises into view once. */
export function Reveal({
    children,
    as = 'div',
    className = '',
    delay = 0,
    y = 24,
    once = true,
    ...rest
}) {
    const reduce = useReducedMotion();
    const Tag = motion[as];

    return (
        <Tag
            className={className}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, margin: '-12% 0px' }}
            transition={{ duration: reduce ? 0.3 : DURATION, delay, ease: EASE }}
            {...rest}
        >
            {children}
        </Tag>
    );
}

/** Parent that releases its <StaggerItem> children in sequence. */
export function Stagger({
    children,
    as = 'div',
    className = '',
    delay = 0,
    gap = 0.08,
    once = true,
    ...rest
}) {
    const reduce = useReducedMotion();
    const Tag = motion[as];

    return (
        <Tag
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: '-10% 0px' }}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: reduce ? 0 : gap,
                        delayChildren: delay,
                    },
                },
            }}
            {...rest}
        >
            {children}
        </Tag>
    );
}

/** Child of <Stagger>. Inherits its timing from the parent. */
export function StaggerItem({ children, as = 'div', className = '', y = 20, ...rest }) {
    const reduce = useReducedMotion();
    const Tag = motion[as];

    return (
        <Tag
            className={className}
            variants={{
                hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: reduce ? 0.3 : DURATION, ease: EASE },
                },
            }}
            {...rest}
        >
            {children}
        </Tag>
    );
}
