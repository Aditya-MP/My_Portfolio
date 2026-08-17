import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Code2, Cpu, Globe, GraduationCap, Briefcase, X } from 'lucide-react';
import { profile } from '../profile';
import SectionHeader from './ui/SectionHeader';
import { Reveal, Stagger, StaggerItem } from './ui/Reveal';
import Constellation from './ui/Constellation';

const categoryIcons = {
    'languages & tools': Code2,
    'ai & ml': Cpu,
    frameworks: Network,
    cloud: Globe,
};

function ProfileLightbox({ open, onClose }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Portrait of ${profile.name}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/90 backdrop-blur-md p-4 cursor-zoom-out"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-3xl max-h-[90vh] rounded-4xl overflow-hidden shadow-e4 border border-white/10 bg-ink-900 cursor-default"
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute top-4 right-4 z-10 btn-icon w-10 h-10 rounded-full bg-ink-950/70"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                        <img
                            src={profile.imgUrl}
                            alt={profile.name}
                            className="w-full h-full object-contain max-h-[85vh]"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function About() {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <>
            <SectionHeader
                index="01"
                eyebrow="About"
                title="Engineer building"
                accent="intelligent systems."
                description="AIML graduate turning ideas into shipped products — across AI pipelines, full-stack platforms and interactive interfaces."
                className="mb-16"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                {/* Left: identity, bio, stack */}
                <div className="lg:col-span-5 space-y-8">
                    <Reveal className="flex items-center gap-4">
                        {/* Enchanted portrait: gilt leaf ring, a soft inner glow that
                            wakes on hover, and a slow orbiting tick — restrained enough
                            that the person stays the subject. */}
                        <button
                            type="button"
                            onClick={() => profile.imgUrl && setLightboxOpen(true)}
                            aria-label="View full portrait"
                            disabled={!profile.imgUrl}
                            className="group/portrait relative h-20 w-20 shrink-0 rounded-full bg-gilt-sheen p-[1.5px]
                                       transition-transform duration-500 ease-expo
                                       hover:scale-[1.04] active:scale-95 disabled:hover:scale-100"
                        >
                            <span
                                className="absolute -inset-1.5 rounded-full border border-gilt-600/30
                                           opacity-60 transition-opacity duration-500 group-hover/portrait:opacity-100"
                                aria-hidden="true"
                            />
                            <span
                                className="absolute -inset-4 rounded-full bg-gilt-500/10 blur-xl opacity-0
                                           transition-opacity duration-700 group-hover/portrait:opacity-100"
                                aria-hidden="true"
                            />
                            <span className="relative block h-full w-full overflow-hidden rounded-full bg-ink-900">
                                {profile.imgUrl ? (
                                    <img
                                        src={profile.imgUrl}
                                        alt=""
                                        className="h-full w-full object-cover transition-transform duration-700 ease-expo
                                                   group-hover/portrait:scale-105"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-2xl">👨‍💻</span>
                                )}
                            </span>
                        </button>
                        <div>
                            <p className="font-heading text-title-2 text-ink-50">{profile.name}</p>
                            <p className="text-body-sm font-semibold text-gilt-500">{profile.title}</p>
                        </div>
                    </Reveal>

                    <Reveal delay={0.05} className="surface p-8">
                        {/* Illuminated initial — the one place the bio gets a manuscript device. */}
                        <p className="dropcap text-body-lg text-ink-300">{profile.about.trim()}</p>
                    </Reveal>

                    <div className="space-y-5">
                        <Reveal>
                            <h3 className="text-title-3 text-ink-50">Tech Stack</h3>
                        </Reveal>

                        <Stagger className="grid gap-4">
                            {Object.entries(profile.skills).map(([category, skills]) => {
                                const Icon = categoryIcons[category.toLowerCase()] || Cpu;
                                return (
                                    <StaggerItem key={category} className="surface surface-interactive p-6 group">
                                        <h4 className="flex items-center gap-2.5 text-meta uppercase text-ink-400 mb-5">
                                            <Icon
                                                size={15}
                                                aria-hidden="true"
                                                className="text-gilt-500 transition-transform duration-300 group-hover:scale-110"
                                            />
                                            {category}
                                        </h4>
                                        <Constellation items={skills} />
                                    </StaggerItem>
                                );
                            })}
                        </Stagger>
                    </div>
                </div>

                {/* Right: timeline */}
                <div className="lg:col-span-7 space-y-12">
                    <div>
                        <Reveal className="flex items-center gap-3 mb-6">
                            <span className="p-2.5 rounded-xl bg-ember-500/10 text-ember-400 border border-ember-500/20">
                                <Briefcase size={20} aria-hidden="true" />
                            </span>
                            <h3 className="text-title-2 text-ink-50">Experience</h3>
                        </Reveal>

                        <Stagger className="space-y-5">
                            {profile.experience.map((exp) => (
                                <StaggerItem
                                    key={`${exp.company}-${exp.role}`}
                                    className="surface surface-interactive p-7 group"
                                >
                                    <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
                                        <div>
                                            <h4 className="text-title-3 text-ink-50 transition-colors duration-300 group-hover:text-ember-300">
                                                {exp.role}
                                            </h4>
                                            <p className="text-body-sm font-semibold text-ink-400 mt-0.5">
                                                {exp.company}
                                            </p>
                                        </div>
                                        <span className="chip text-meta uppercase rounded-full">{exp.duration}</span>
                                    </div>

                                    <ul className="space-y-2.5 mb-5">
                                        {exp.description.map((desc) => (
                                            <li key={desc} className="flex items-start gap-3 text-body text-ink-400">
                                                <span
                                                    className="mt-2 w-1.5 h-1.5 rounded-full bg-ember-500/60 shrink-0"
                                                    aria-hidden="true"
                                                />
                                                {desc}
                                            </li>
                                        ))}
                                    </ul>

                                    <ul className="flex flex-wrap gap-2">
                                        {exp.tech.map((t) => (
                                            <li key={t} className="chip text-meta py-1">{t}</li>
                                        ))}
                                    </ul>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>

                    <div>
                        <Reveal className="flex items-center gap-3 mb-6">
                            <span className="p-2.5 rounded-xl bg-ember-500/10 text-ember-400 border border-ember-500/20">
                                <GraduationCap size={20} aria-hidden="true" />
                            </span>
                            <h3 className="text-title-2 text-ink-50">Education</h3>
                        </Reveal>

                        <Stagger className="space-y-5">
                            {profile.education.map((edu) => (
                                <StaggerItem
                                    key={edu.degree}
                                    className="surface surface-interactive p-6 flex items-center gap-5 group"
                                >
                                    <span
                                        className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-white/[0.04] border border-white/[0.06]
                                                   items-center justify-center text-2xl grayscale transition-all duration-300
                                                   group-hover:grayscale-0"
                                        aria-hidden="true"
                                    >
                                        🏛️
                                    </span>
                                    <div>
                                        <h4 className="text-title-3 text-ink-50">{edu.degree}</h4>
                                        <p className="text-body-sm font-semibold text-ember-400 mt-0.5 mb-2">
                                            {edu.institution}
                                        </p>
                                        <p className="flex flex-wrap gap-x-3 gap-y-1 text-meta uppercase text-ink-500">
                                            <span>{edu.duration}</span>
                                            <span aria-hidden="true">·</span>
                                            <span>{edu.details}</span>
                                        </p>
                                    </div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </div>
                </div>
            </div>

            <ProfileLightbox open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
        </>
    );
}
