import { Trophy, Medal, Award, Users, Sparkles } from 'lucide-react';
import { profile } from '../profile';
import SectionHeader from './ui/SectionHeader';
import { Stagger, StaggerItem } from './ui/Reveal';

/**
 * Achievements are stored as single strings. Split them into rank / event /
 * year so the card can build a real hierarchy instead of one flat line.
 * Only en/em dashes are treated as separators — an ASCII hyphen would also
 * split words like "Runner-Up".
 */
function parseAchievement(raw) {
    const yearMatch = raw.match(/\((\d{4})\)\s*$/);
    const year = yearMatch ? yearMatch[1] : null;
    const body = (yearMatch ? raw.slice(0, yearMatch.index) : raw).trim();

    const parts = body.split(/\s+[–—]\s+/);
    return parts.length > 1
        ? { rank: parts[0].trim(), event: parts.slice(1).join(' – ').trim(), year }
        : { rank: null, event: body, year };
}

function iconFor(rank = '') {
    const r = rank.toLowerCase();
    if (r.includes('winner') || r.includes('champion')) return Trophy;
    if (r.includes('runner')) return Medal;
    if (r.includes('finalist')) return Award;
    if (r.includes('volunteer') || r.includes('participant')) return Users;
    return Sparkles;
}

export default function Achievements() {
    return (
        <>
            <SectionHeader
                index="03"
                eyebrow="Recognition"
                title="Hackathons &"
                accent="awards."
                description="Where the work has been put in front of judges — national ideathons, blockchain hackathons and campus competitions."
                align="center"
                rune
                candles
                className="mb-16"
            />

            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" gap={0.06}>
                {profile.achievements.map((raw) => {
                    const { rank, event, year } = parseAchievement(raw);
                    const Icon = iconFor(rank);

                    return (
                        <StaggerItem
                            key={raw}
                            className="surface surface-interactive group relative overflow-hidden p-7 flex flex-col"
                        >
                            <div
                                className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl bg-ember-500/10
                                           transition-all duration-700 group-hover:bg-ember-500/20"
                                aria-hidden="true"
                            />

                            <div className="relative z-10 flex items-start justify-between gap-4 mb-5">
                                <span
                                    className="flex w-11 h-11 shrink-0 items-center justify-center rounded-2xl
                                               bg-ember-500/12 text-ember-400 border border-ember-500/25
                                               transition-transform duration-500 ease-expo group-hover:-rotate-6 group-hover:scale-105"
                                >
                                    <Icon size={20} aria-hidden="true" />
                                </span>
                                {year && (
                                    <span className="text-meta uppercase text-ink-500 tabular-nums pt-1">{year}</span>
                                )}
                            </div>

                            <div className="relative z-10 mt-auto">
                                {rank && (
                                    <p className="text-meta uppercase text-ember-400 mb-2">{rank}</p>
                                )}
                                <h3 className="text-title-3 text-ink-100 transition-colors duration-300 group-hover:text-ink-50">
                                    {event}
                                </h3>
                            </div>
                        </StaggerItem>
                    );
                })}
            </Stagger>
        </>
    );
}
