import { AnimatePresence, motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import { Menu, X, Github, Linkedin, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { profile } from '../profile';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { EASE } from '../lib/motion';

// Module scope keeps the reference stable for useScrollSpy.
const navItems = [
    { name: 'Home', id: 'home', n: '01' },
    { name: 'About', id: 'about', n: '02' },
    { name: 'Projects', id: 'projects', n: '03' },
    { name: 'Achievements', id: 'achievements', n: '04' },
    { name: 'Contact', id: 'contact', n: '05' },
];
const sectionIds = navItems.map((item) => item.id);

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const active = useScrollSpy(sectionIds);

    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll();
    // Spring smoothing IS motion; under reduced-motion track scroll directly.
    const smoothed = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
    const progress = reduce ? scrollYProgress : smoothed;

    // Condense the bar once the hero is behind us.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close the sheet on Escape, and lock the page behind it.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Reading progress */}
            <motion.div
                style={{ scaleX: progress }}
                className="fixed top-0 left-0 right-0 h-0.5 bg-ember-sheen origin-left z-[60]"
                aria-hidden="true"
            />

            <nav
                aria-label="Primary"
                className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
            >
                <div
                    className={`flex items-center gap-2 rounded-full border transition-all duration-500 ease-expo
                        ${scrolled
                            ? 'bg-ink-950/85 border-white/10 shadow-e3 backdrop-blur-2xl px-3 py-2'
                            : 'bg-ink-950/40 border-white/[0.06] backdrop-blur-xl px-3 py-2.5'
                        }`}
                >
                    <a
                        href="#home"
                        aria-label="Back to top"
                        className="font-heading font-black tracking-tight text-title-3 text-ink-50 px-3 shrink-0"
                    >
                        AM<span className="text-ember-500">.</span>
                    </a>

                    <span className="hidden md:block w-px h-6 bg-white/10" aria-hidden="true" />

                    {/* Desktop links */}
                    <ul className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = active === item.id;
                            return (
                                <li key={item.id}>
                                    <a
                                        href={`#${item.id}`}
                                        aria-current={isActive ? 'true' : undefined}
                                        className={`relative block px-4 py-2 rounded-full text-body-sm font-semibold transition-colors duration-300
                                            ${isActive ? 'text-ink-50' : 'text-ink-400 hover:text-ink-100'}`}
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId="nav-active"
                                                className="absolute inset-0 rounded-full bg-white/[0.09] border border-white/[0.08]"
                                                transition={
                                                    reduce
                                                        ? { duration: 0 }
                                                        : { type: 'spring', bounce: 0.15, duration: 0.5 }
                                                }
                                            />
                                        )}
                                        <span className="relative z-10 flex items-baseline gap-1.5">
                                            <span
                                                className={`font-mono text-[0.6rem] tabular-nums transition-colors
                                                    ${isActive ? 'text-gilt-500' : 'text-ink-600'}`}
                                                aria-hidden="true"
                                            >
                                                {item.n}
                                            </span>
                                            {item.name}
                                        </span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>

                    <span className="hidden md:block w-px h-6 bg-white/10" aria-hidden="true" />

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-1.5 pl-1">
                        {[
                            { Icon: Github, href: profile.github, label: 'GitHub' },
                            { Icon: Linkedin, href: profile.linkedin, label: 'LinkedIn' },
                        ].map(({ Icon, href, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="btn-icon w-9 h-9 rounded-full"
                            >
                                <Icon size={15} aria-hidden="true" />
                            </a>
                        ))}
                        <a
                            href={profile.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary px-4 py-2 text-body-sm rounded-full ml-1"
                        >
                            <FileText size={15} aria-hidden="true" /> Resume
                        </a>
                    </div>

                    {/* Mobile trigger */}
                    <button
                        type="button"
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                        onClick={() => setIsOpen((v) => !v)}
                        className="md:hidden btn-icon w-10 h-10 rounded-full"
                    >
                        {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
                    </button>
                </div>
            </nav>

            {/* Mobile sheet */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="md:hidden fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
                            aria-hidden="true"
                        />
                        <motion.div
                            id="mobile-menu"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.28, ease: EASE }}
                            className="md:hidden fixed top-20 left-4 right-4 z-50 surface p-4 flex flex-col gap-1.5"
                        >
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={() => setIsOpen(false)}
                                    aria-current={active === item.id ? 'true' : undefined}
                                    className={`px-5 py-3.5 rounded-2xl text-body-lg font-semibold transition-colors
                                        ${active === item.id
                                            ? 'bg-ember-500/12 text-ember-300 border border-ember-500/25'
                                            : 'text-ink-300 bg-white/[0.03] border border-transparent hover:bg-white/[0.07]'
                                        }`}
                                >
                                    {item.name}
                                </a>
                            ))}

                            <div className="rule my-2" />

                            <div className="flex items-center gap-2">
                                <a
                                    href={profile.resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary flex-1"
                                >
                                    <FileText size={16} aria-hidden="true" /> Resume
                                </a>
                                <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="btn-icon">
                                    <Github size={18} aria-hidden="true" />
                                </a>
                                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="btn-icon">
                                    <Linkedin size={18} aria-hidden="true" />
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
