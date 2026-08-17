import { Reveal } from './Reveal';
import RuneRing from './RuneRing';
import InkReveal from './InkReveal';
import Candle from './Candle';

/**
 * The one section-heading treatment used by every section.
 *
 * index       – two-digit ordinal, e.g. "02"
 * eyebrow     – short uppercase label
 * title       – heading text; the trailing `accent` word is emphasised
 * accent      – word rendered in the ember gradient
 * description – optional supporting line
 * size        – 'lg' for the two hero-weight sections, 'md' elsewhere
 * candles     – flank the heading with a pair of floating candles. Desktop
 *               only (hidden below md) and only makes sense on a centered
 *               header, where there is symmetric room either side.
 */
export default function SectionHeader({
    index,
    eyebrow,
    title,
    accent,
    description,
    align = 'left',
    size = 'md',
    rune = false,
    candles = false,
    className = '',
}) {
    const centered = align === 'center';

    return (
        <header
            className={`relative isolate flex flex-col gap-6 ${centered ? 'items-center text-center' : 'items-start'} ${className}`}
        >
            {/* isolate on the header traps the ring's -z-10 in a local stacking
                context; without it the ring falls behind the page background. */}
            {rune && <RuneRing />}
            {candles && centered && (
                <>
                    <Candle className="hidden md:block left-[8%] top-1/2 -translate-y-1/2" delay={0} />
                    <Candle className="hidden md:block right-[8%] top-1/2 -translate-y-1/2" delay={950} />
                </>
            )}

            {(eyebrow || index) && (
                <Reveal className="flex items-center gap-3" y={12}>
                    {/* gilt-600, not 700: at 11px this is small text, and 700
                        measures 3.7:1 on the ground — below AA. 600 is 6.0:1. */}
                    {index && (
                        <span className="text-meta font-mono text-gilt-600 tabular-nums">{index}</span>
                    )}
                    {index && eyebrow && <span className="w-8 h-px bg-gilt-600/50" aria-hidden="true" />}
                    {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                </Reveal>
            )}

            <h2 className={size === 'lg' ? 'text-display-2' : 'text-title-1'}>
                <InkReveal text={title} className="text-ink-50" delay={0.06} />
                {accent && (
                    <>
                        {' '}
                        {/* Gold leaf on sections; the hero keeps ember.
                            `whole` is mandatory here — see InkReveal. */}
                        <InkReveal
                            text={accent}
                            whole
                            className="inline-block text-gilt-gradient"
                            delay={0.06 + 0.08 * String(title).split(' ').length}
                        />
                    </>
                )}
            </h2>

            {description && (
                <Reveal delay={0.18}>
                    <p className={`lede max-w-2xl ${centered ? 'mx-auto' : ''}`}>
                        {description}
                    </p>
                </Reveal>
            )}
        </header>
    );
}
