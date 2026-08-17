import { motion, useReducedMotion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useAmbientAudio } from '../../hooks/useAmbientAudio';

const TRACK = '/audio/ambience.mp3';

/**
 * Floating sound control. Renders nothing at all if the track is missing or
 * blocked, so a absent audio file degrades to silence rather than a dead button.
 */
export default function AmbientToggle() {
    const reduce = useReducedMotion();
    const { enabled, failed, toggle } = useAmbientAudio(TRACK, { volume: 0.3 });

    if (failed) return null;

    // Five bars, tallest in the middle, so the "playing" state reads as level meter.
    const bars = [0.4, 0.75, 1, 0.75, 0.4];

    return (
        <button
            type="button"
            onClick={toggle}
            aria-pressed={enabled}
            aria-label={enabled ? 'Turn ambience off' : 'Turn ambience on'}
            title={enabled ? 'Ambience on' : 'Ambience off'}
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full
                       border border-white/10 bg-ink-950/80 px-4 py-2.5 backdrop-blur-xl
                       shadow-e3 transition-colors duration-300 hover:border-ember-500/40"
        >
            <span className="text-ember-400">
                {enabled ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}
            </span>

            <span className="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
                {bars.map((peak, i) => (
                    <motion.span
                        key={i}
                        className="w-[2px] rounded-full bg-ember-500"
                        initial={false}
                        animate={
                            enabled && !reduce
                                ? { height: [`${peak * 30}%`, '100%', `${peak * 45}%`] }
                                : { height: '22%' }
                        }
                        transition={
                            enabled && !reduce
                                ? { duration: 0.9 + i * 0.14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                                : { duration: 0.25 }
                        }
                    />
                ))}
            </span>
        </button>
    );
}
