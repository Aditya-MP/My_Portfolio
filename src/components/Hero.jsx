import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, FileText } from 'lucide-react';
import { profile } from '../profile';
import { EASE } from '../lib/motion';

/**
 * Per-character entrance. `offset` shifts the whole word so the two lines
 * animate in sequence rather than on top of each other.
 */
function SplitText({ text, offset = 0, reduce }) {
    if (reduce) return <>{text}</>;

    return text.split('').map((char, i) => (
        <motion.span
            key={i}
            initial={{ opacity: 0, y: '0.4em' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: offset + i * 0.04, duration: 0.7, ease: EASE }}
            className="inline-block"
        >
            {char === ' ' ? ' ' : char}
        </motion.span>
    ));
}

export default function Hero() {
    const reduce = useReducedMotion();

    return (
        <div
            id="home"
            className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
        >
            {/* The 3D scene is no longer owned by the hero — it is one fixed
                canvas behind the whole page. See PhoenixStage. */}

            {/* Vignette + seam into the next section */}
            <div
                className="absolute inset-0 z-[5] pointer-events-none bg-gradient-to-b
                           from-ink-950/70 via-transparent to-ink-950"
                aria-hidden="true"
            />

            {/* Content — the wrapper stays click-through so OrbitControls keeps working */}
            <div className="relative z-10 w-full container-page text-center pointer-events-none">
                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="eyebrow justify-center mb-8"
                >
                    <span className="w-6 h-px bg-ember-500/50" aria-hidden="true" />
                    {profile.title}
                    <span className="w-6 h-px bg-ember-500/50" aria-hidden="true" />
                </motion.p>

                <h1 className="text-display-1 font-heading select-none">
                    <span className="block text-ink-50">
                        <SplitText text="CREATIVE" reduce={reduce} offset={0.15} />
                    </span>
                    <span
                        className="block text-ember-gradient [-webkit-text-stroke:2px_rgba(255,255,255,0.08)]
                                   md:[-webkit-text-stroke:3px_rgba(255,255,255,0.08)]"
                        style={{ textShadow: '0 0 60px rgba(249,106,27,0.35)' }}
                    >
                        <SplitText text="DEVELOPER" reduce={reduce} offset={0.5} />
                    </span>
                </h1>

                <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.7, ease: EASE }}
                    className="text-body-lg text-ink-300 max-w-xl mx-auto mt-8"
                >
                    I&apos;m <span className="text-ink-50 font-semibold">{profile.name}</span> — I build
                    intelligent applications, full-stack platforms and interactive systems.
                </motion.p>

                {/* Only the actions capture pointer events. */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.15, duration: 0.7, ease: EASE }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-3 pointer-events-auto"
                >
                    <a href="#projects" className="btn-primary">
                        View Selected Work
                        <ArrowDown size={18} aria-hidden="true" />
                    </a>
                    <a
                        href={profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                    >
                        <FileText size={18} aria-hidden="true" /> Download Resume
                    </a>
                </motion.div>
            </div>

            {/* Scroll hint */}
            <motion.a
                href="#about"
                aria-label="Scroll to about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 group"
            >
                <span className="flex h-10 w-6 justify-center rounded-full border border-white/20 p-2
                                 transition-colors group-hover:border-ember-500/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-200 animate-scroll-hint
                                     group-hover:bg-ember-400" />
                </span>
            </motion.a>
        </div>
    );
}
