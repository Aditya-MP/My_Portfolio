import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Github, ArrowUpRight, Target, ListChecks, Layers, TrendingUp } from 'lucide-react';

/**
 * The opened artifact — one project's full record.
 *
 * Grows out of the card the visitor clicked: the fan measures that card's
 * position and passes it as `origin`, which becomes the panel's
 * transform-origin, so the expansion visibly starts where the card was rather
 * than from the middle of the screen. That single detail is what makes this
 * read as the card opening instead of a dialog appearing over it.
 *
 * The scrim is deliberately translucent and only lightly blurred — the brief
 * asks that the rest of the collection stay visible behind, so a visitor
 * still feels like they are holding one card out of a spread.
 *
 * Content order is the reading order the brief asked for: what it is, the
 * problem, what it does, what it is built from, what it achieved, where to go
 * next. Sections with no data are omitted entirely rather than rendered
 * empty — several of these projects have no published metrics, and an empty
 * "Results" heading would read as a gap in the work rather than an absence of
 * a number.
 */
export default function ProjectCodex({ project, index, Icon, origin, onClose }) {
    const panelRef = useRef(null);
    const closeRef = useRef(null);

    /* Escape closes; focus moves into the dialog on open and returns to the
       card on close; the page behind is locked so a scroll gesture doesn't
       drift the section while a modal is up. */
    useEffect(() => {
        const previouslyFocused = document.activeElement;
        closeRef.current?.focus();

        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
                return;
            }
            // Minimal focus containment: keep Tab inside the dialog.
            if (e.key !== 'Tab' || !panelRef.current) return;
            const focusables = panelRef.current.querySelectorAll(
                'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
    }, [onClose]);

    const titleId = `codex-title-${project.id}`;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8">
            {/* Scrim — light enough that the fan reads through it. */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                onClick={onClose}
                className="absolute inset-0 bg-ink-950/72 backdrop-blur-[3px]"
                aria-hidden="true"
            />

            <motion.div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.22, ease: 'easeIn' } }}
                transition={{ type: 'spring', stiffness: 210, damping: 26, mass: 0.9 }}
                style={{ transformOrigin: origin }}
                className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden
                           rounded-4xl border border-gilt-700/35 bg-ink-950/95 shadow-e4
                           md:flex-row"
            >
                {/* engraved inner rule, matching the card it grew from */}
                <span
                    className="pointer-events-none absolute inset-[9px] rounded-[26px] border border-gilt-700/20"
                    aria-hidden="true"
                />

                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Close project details"
                    className="btn-icon absolute right-4 top-4 z-30 h-10 w-10 rounded-full
                               bg-ink-950/80 backdrop-blur-sm"
                >
                    <X size={17} aria-hidden="true" />
                </button>

                {/* ---- visual ------------------------------------------- */}
                <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-[38%]">
                    {project.cover ? (
                        <img
                            src={project.cover}
                            alt={`${project.title} cover`}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />
                    )}
                    {/* Seam: fades the image into the copy panel rather than
                        butting two rectangles against each other. */}
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-ink-950/10
                                   md:bg-gradient-to-r md:from-ink-950/10 md:via-ink-950/50 md:to-ink-950"
                        aria-hidden="true"
                    />

                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-6 md:top-0 md:bottom-auto">
                        <span
                            className="flex h-11 w-11 items-center justify-center rounded-full
                                       border border-gilt-600/40 bg-ink-950/70"
                            aria-hidden="true"
                        >
                            <Icon size={19} className="text-gilt-400" />
                        </span>
                        <span className="font-mono text-meta tabular-nums text-gilt-500">
                            {String(index + 1).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* ---- record ------------------------------------------- */}
                <div className="relative min-h-0 flex-1 overflow-y-auto p-7 md:p-10">
                    <p className="eyebrow mb-4">
                        <span className="h-px w-5 bg-gilt-600/50" aria-hidden="true" />
                        {project.year}
                        {project.role && <span className="text-ink-500">· {project.role}</span>}
                    </p>

                    <h3 id={titleId} className="text-title-2 text-ink-50">
                        {project.title}
                    </h3>

                    <p className="mt-5 text-body text-ink-300">{project.description}</p>

                    {project.problem && (
                        <section className="mt-8">
                            <h4 className="mb-2.5 flex items-center gap-2 text-eyebrow uppercase text-gilt-500">
                                <Target size={14} aria-hidden="true" /> Problem solved
                            </h4>
                            <p className="text-body-sm text-ink-400">{project.problem}</p>
                        </section>
                    )}

                    {project.features?.length > 0 && (
                        <section className="mt-8">
                            <h4 className="mb-3 flex items-center gap-2 text-eyebrow uppercase text-gilt-500">
                                <ListChecks size={14} aria-hidden="true" /> Key features
                            </h4>
                            <ul className="space-y-2.5">
                                {project.features.map((f) => (
                                    <li key={f} className="flex gap-3 text-body-sm text-ink-400">
                                        <span
                                            className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-ember-500"
                                            aria-hidden="true"
                                        />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="mt-8">
                        <h4 className="mb-3 flex items-center gap-2 text-eyebrow uppercase text-gilt-500">
                            <Layers size={14} aria-hidden="true" /> Technologies
                        </h4>
                        <ul className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                                <li key={t} className="chip chip-accent">{t}</li>
                            ))}
                        </ul>
                    </section>

                    {project.metrics?.length > 0 && (
                        <section className="mt-8">
                            <h4 className="mb-3 flex items-center gap-2 text-eyebrow uppercase text-gilt-500">
                                <TrendingUp size={14} aria-hidden="true" /> Results
                            </h4>
                            <ul className="flex flex-wrap gap-3">
                                {project.metrics.map((m) => (
                                    <li
                                        key={m.label}
                                        className="rounded-2xl border border-gilt-700/25 bg-white/[0.03] px-4 py-3"
                                    >
                                        <p className="font-heading text-title-3 text-gilt-200">{m.value}</p>
                                        <p className="mt-0.5 text-body-sm text-ink-500">{m.label}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <div className="mt-9 flex flex-wrap gap-3">
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary group/btn"
                        >
                            Launch Project
                            <ArrowUpRight
                                size={18}
                                aria-hidden="true"
                                className="transition-transform duration-300
                                           group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                            />
                        </a>
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary"
                            >
                                <Github size={18} aria-hidden="true" /> Source
                            </a>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
