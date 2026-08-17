import {
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
    useReducedMotion,
} from 'framer-motion';

/**
 * Pointer-tracked 3D tilt for a card.
 *
 * Returns motion values for the card's rotation, a counter-moving parallax
 * offset for its artwork, and a cursor-following glow gradient.
 *
 * Depth is faked with counter-translation rather than translateZ on purpose:
 * a computed `overflow` other than `visible` forces `transform-style: flat`,
 * so real Z-layering cannot coexist with the card's `overflow-hidden` rounding.
 *
 * Tilt is suppressed for touch pointers and for prefers-reduced-motion.
 *
 * Deliberately holds no ref: the move handler is bound to the card itself, so
 * `event.currentTarget` already is the element we need to measure.
 */
export function useTilt({ max = 6, parallax = 12 } = {}) {
    const reduce = useReducedMotion();

    // Normalised pointer position within the card, 0..1. Centre is rest.
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);

    const spring = { stiffness: 150, damping: 20, mass: 0.4 };
    const sx = useSpring(px, spring);
    const sy = useSpring(py, spring);

    const rotateY = useTransform(sx, [0, 1], [-max, max]);
    const rotateX = useTransform(sy, [0, 1], [max, -max]);

    const parallaxX = useTransform(sx, [0, 1], [parallax, -parallax]);
    const parallaxY = useTransform(sy, [0, 1], [parallax, -parallax]);

    const glowX = useTransform(sx, [0, 1], ['0%', '100%']);
    const glowY = useTransform(sy, [0, 1], ['0%', '100%']);
    const glow = useMotionTemplate`radial-gradient(560px circle at ${glowX} ${glowY}, rgba(249,106,27,0.16), transparent 68%)`;

    const onPointerMove = (event) => {
        if (reduce || event.pointerType === 'touch') return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        px.set((event.clientX - rect.left) / rect.width);
        py.set((event.clientY - rect.top) / rect.height);
    };

    const onPointerLeave = () => {
        px.set(0.5);
        py.set(0.5);
    };

    return {
        onPointerMove,
        onPointerLeave,
        rotateX: reduce ? 0 : rotateX,
        rotateY: reduce ? 0 : rotateY,
        parallaxX: reduce ? 0 : parallaxX,
        parallaxY: reduce ? 0 : parallaxY,
        glow,
    };
}
