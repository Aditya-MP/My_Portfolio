import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Github, Code2, ArrowUpRight } from 'lucide-react';
import { profile } from '../profile';
import SectionHeader from './ui/SectionHeader';
import { useTilt } from '../hooks/useTilt';

const total = profile.projects.length;

function ProjectCard({ project, index, progress }) {
    const reduce = useReducedMotion();
    const tilt = useTilt();
    const isLast = index === total - 1;

    // Each card parks slightly lower than the last so the stack stays readable.
    const top = `calc(6rem + ${index * 18}px)`;

    /* Recede as the next card arrives. The card holds full size for the first
       half of its slot — it is the front card then — and only shrinks once the
       one behind it is actually climbing over it.

       Written as explicit functions rather than range arrays so a non-finite
       scroll progress can't reach the DOM. useScroll reports NaN if its target
       measures zero-height (it can, before layout settles), and `scale: NaN`
       plus `opacity: NaN` renders every card invisible — a black page that
       looks exactly like a crash. */
    const coverStart = (index + 0.55) / total;
    const coverEnd = (index + 1) / total;

    const covered = (p) => {
        if (!Number.isFinite(p)) return 0;
        const t = (p - coverStart) / (coverEnd - coverStart);
        return t < 0 ? 0 : t > 1 ? 1 : t;
    };

    const scale = useTransform(progress, (p) => 1 - covered(p) * 0.1);
    const opacity = useTransform(progress, (p) => 1 - covered(p) * 0.5);
    const depth = isLast || reduce ? undefined : { scale, opacity };

    return (
        <div className="sticky w-full" style={{ top }}>
            {/* Depth layer: scales from the top edge so the peeking strips stay put. */}
            <motion.div style={depth} className="origin-top transform-gpu">
                {/* min-height, never a fixed height: the card must grow to its content.
                    A fixed height plus overflow-hidden silently clips the button row. */}
                <motion.article
                    onPointerMove={tilt.onPointerMove}
                    onPointerLeave={tilt.onPointerLeave}
                    style={{
                        rotateX: tilt.rotateX,
                        rotateY: tilt.rotateY,
                        transformPerspective: 1400,
                    }}
                    className="group relative flex flex-col md:flex-row md:min-h-[540px] overflow-hidden
                               rounded-5xl border border-white/[0.08] bg-ink-950 shadow-e4 transform-gpu
                               transition-[border-color,box-shadow] duration-500 ease-expo
                               hover:border-gilt-600/40 hover:shadow-glow-lg"
                >
                    {/* Cursor-tracked glow */}
                    <motion.div
                        style={{ background: tilt.glow }}
                        className="absolute inset-0 z-20 pointer-events-none opacity-0
                                   transition-opacity duration-500 group-hover:opacity-100"
                        aria-hidden="true"
                    />
                    {/* Specular top edge — sells the tilt as a physical surface */}
                    <div
                        className="absolute inset-x-0 top-0 h-px z-20 pointer-events-none
                                   bg-gradient-to-r from-transparent via-white/25 to-transparent
                                   opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        aria-hidden="true"
                    />

                    {/* Copy */}
                    <div className="order-2 md:order-1 w-full md:w-1/2 p-8 md:p-10 lg:p-12 flex flex-col justify-between
                                    relative z-10 bg-ink-950/85 backdrop-blur-2xl md:border-r border-white/[0.06]">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-meta font-mono text-gilt-500 tabular-nums">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className="w-6 h-px bg-gilt-600/50" aria-hidden="true" />
                                <span className="text-meta uppercase text-ink-500">
                                    {project.year} · {String(total).padStart(2, '0')} total
                                </span>
                            </div>

                            {/* title-2 is the card altitude; title-1 is reserved for section headings. */}
                            <h3 className="text-title-2 text-ink-50 mb-5 transition-colors duration-500 group-hover:text-gilt-200">
                                {project.title}
                            </h3>

                            <p className="text-body text-ink-400 mb-7 max-w-xl line-clamp-5">
                                {project.description}
                            </p>

                            <ul className="flex flex-wrap gap-2 mb-8">
                                {project.tech.map((tag) => (
                                    <li key={tag} className="chip">{tag}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary flex-1 md:flex-none group/btn"
                            >
                                Launch Project
                                <ArrowUpRight
                                    size={18}
                                    aria-hidden="true"
                                    className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                                />
                            </a>
                            {project.github && (
                                <a
                                    href={project.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${project.title} source on GitHub`}
                                    className="btn-icon"
                                >
                                    <Github size={19} aria-hidden="true" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Visual — md:h-auto + flex stretch; h-full would collapse now the row height is auto. */}
                    <div className="order-1 md:order-2 w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-ink-900">
                        {project.cover ? (
                            <>
                                {/* Held at a constant 1.10 rather than zooming to 1.0 on hover:
                                    the 5% overscan is what hides the edges while the ±12px
                                    parallax offset is running. Hover feedback comes from the
                                    overlay lightening instead. */}
                                <motion.img
                                    src={project.cover}
                                    alt={`${project.title} cover`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    style={{ x: tilt.parallaxX, y: tilt.parallaxY }}
                                    className="absolute inset-0 w-full h-full object-cover scale-110 transform-gpu"
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none bg-ink-950/45 transition-colors
                                               duration-700 group-hover:bg-ink-950/10"
                                    aria-hidden="true"
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none shadow-[inset_0_0_140px_rgba(10,10,11,0.9)]"
                                    aria-hidden="true"
                                />
                            </>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950">
                                <div className="absolute inset-0 opacity-[0.04] bg-dot-grid [background-size:22px_22px]" />
                                <motion.span
                                    style={{ x: tilt.parallaxX, y: tilt.parallaxY }}
                                    className="relative z-10 flex w-28 h-28 items-center justify-center rounded-full
                                               bg-ink-900/80 backdrop-blur-xl border border-white/10 shadow-e3"
                                >
                                    <Code2
                                        size={42}
                                        aria-hidden="true"
                                        className="text-ink-500 transition-colors duration-500 group-hover:text-ember-500"
                                    />
                                </motion.span>
                            </div>
                        )}
                    </div>
                </motion.article>
            </motion.div>
        </div>
    );
}

export default function Projects() {
    const trackRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: trackRef,
        offset: ['start start', 'end end'],
    });

    return (
        <div className="relative isolate container-page">
            <div className="halo top-[10%] left-1/2 -translate-x-1/2 w-full max-w-3xl h-[36vh]" aria-hidden="true" />

            <SectionHeader
                index="02"
                eyebrow="Selected Works"
                title="Things I've"
                accent="shipped."
                description="Intelligent applications, scalable backends and premium web experiences — built end to end."
                align="center"
                size="lg"
                rune
                className="mb-24 md:mb-32"
            />

            <div ref={trackRef} className="relative flex flex-col gap-[18vh] md:gap-[26vh] pb-[15vh]">
                {profile.projects.map((project, index) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                        progress={scrollYProgress}
                    />
                ))}
            </div>
        </div>
    );
}
