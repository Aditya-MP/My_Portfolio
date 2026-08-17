import { useState } from 'react';
import { Mail, Linkedin, Github, Phone, ArrowUpRight, Check, Copy } from 'lucide-react';
import { profile } from '../profile';
import { Reveal, Stagger, StaggerItem } from './ui/Reveal';
import Candle from './ui/Candle';

const channels = [
    {
        Icon: Mail,
        label: 'Email',
        value: profile.email,
        href: `mailto:${profile.email}`,
        copyable: true,
    },
    {
        Icon: Linkedin,
        label: 'LinkedIn',
        value: 'Let’s connect',
        href: profile.linkedin,
        external: true,
    },
    {
        Icon: Github,
        label: 'GitHub',
        value: 'See the code',
        href: profile.github,
        external: true,
    },
    {
        Icon: Phone,
        label: 'Phone',
        value: profile.phone,
        href: `tel:${profile.phone.replace(/[^+\d]/g, '')}`,
        copyable: true,
    },
];

function CopyButton({ value, label }) {
    const [copied, setCopied] = useState(false);

    const copy = async (e) => {
        // The card itself is a link — don't follow it.
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard unavailable (insecure origin / denied) — the link still works.
        }
    };

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
            className="btn-icon w-10 h-10 rounded-xl"
        >
            {copied ? (
                <Check size={16} aria-hidden="true" className="text-ember-400" />
            ) : (
                <Copy size={16} aria-hidden="true" />
            )}
        </button>
    );
}

export default function Contact() {
    return (
        <div className="relative isolate">
            <div className="halo top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[30vh]" aria-hidden="true" />

            {/* A single candle, not a pair — REST is the quietest beat, and one
                small light left burning reads as "the journey is complete, but
                the story continues" more than a symmetrical pair would. */}
            <Candle className="hidden md:block left-[14%] top-10" delay={0} />

            <div className="max-w-3xl mx-auto text-center">
                <Reveal>
                    <p className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-meta uppercase
                                  text-ember-300 bg-ember-500/10 border border-ember-500/25">
                        <span className="relative flex h-2 w-2" aria-hidden="true">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-ember-400 opacity-75 animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-ember-500" />
                        </span>
                        Open to opportunities
                    </p>
                </Reveal>

                <Reveal delay={0.06}>
                    <h2 className="text-display-2 mt-8">
                        <span className="text-ink-50">Let&apos;s build</span>{' '}
                        <span className="text-ember-gradient">something.</span>
                    </h2>
                </Reveal>

                <Reveal delay={0.12}>
                    <p className="text-body-lg text-ink-400 max-w-xl mx-auto mt-6">
                        Have a role, a project or an idea worth prototyping? The fastest way to reach me
                        is email — I reply to everything.
                    </p>
                </Reveal>

                <Reveal delay={0.18} className="mt-10">
                    <a href={`mailto:${profile.email}`} className="btn-primary text-body-lg px-8 py-4">
                        <Mail size={19} aria-hidden="true" /> Email me
                    </a>
                </Reveal>
            </div>

            <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mt-16" gap={0.07}>
                {channels.map(({ Icon, label, value, href, external, copyable }) => (
                    <StaggerItem key={label}>
                        <a
                            href={href}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            className="surface surface-interactive group flex items-center gap-4 p-5 text-left h-full"
                        >
                            <span
                                className="flex w-12 h-12 shrink-0 items-center justify-center rounded-2xl
                                           bg-white/[0.05] text-ink-300 border border-white/[0.08]
                                           transition-colors duration-300
                                           group-hover:bg-ember-500 group-hover:text-ink-950 group-hover:border-ember-500"
                            >
                                <Icon size={20} aria-hidden="true" />
                            </span>

                            <span className="min-w-0 flex-1">
                                <span className="block text-meta uppercase text-ink-500 mb-1">{label}</span>
                                <span className="block text-body font-semibold text-ink-100 truncate">{value}</span>
                            </span>

                            {copyable ? (
                                <CopyButton value={value} label={label} />
                            ) : (
                                <span
                                    className="flex w-10 h-10 shrink-0 items-center justify-center rounded-xl
                                               border border-white/10 text-ink-400 transition-all duration-300
                                               group-hover:text-ink-50 group-hover:border-white/25"
                                    aria-hidden="true"
                                >
                                    <ArrowUpRight size={16} />
                                </span>
                            )}
                        </a>
                    </StaggerItem>
                ))}
            </Stagger>
        </div>
    );
}
