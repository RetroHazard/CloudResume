import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';

// ── SplitFlap ────────────────────────────────────────────────────────────────
// A mechanical departure-board display. Each character sits in its own flap cell
// and "spins" through a glyph reel before settling on its final letter — the
// signature motion of the Rapid design. Driven by anime.js on a single ticking
// value; honours prefers-reduced-motion by rendering the settled text instantly.

const REEL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-/ ';

function reduceMotion() {
    return (
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
}

export function SplitFlap({
    text,
    className,
    cellClassName,
    ariaLabel,
}: {
    text: string;
    className?: string;
    cellClassName?: string;
    ariaLabel?: string;
}) {
    const target = text.toUpperCase();
    const [display, setDisplay] = useState<string[]>(() =>
        reduceMotion() ? [...target] : target.split('').map((c) => (c === ' ' ? ' ' : '-')),
    );
    const holder = useRef({ t: 0 });

    useEffect(() => {
        if (reduceMotion()) {
            setDisplay([...target]);
            return;
        }
        const chars = [...target];
        // Each cell resolves after a staggered number of ticks (left → right).
        // The stagger and tick length are tuned so a long name still settles in
        // well under two seconds — this text is the page's headline, and leaving
        // it as unreadable glyphs for several seconds costs more than the effect
        // is worth.
        const settleAt = chars.map((_, i) => 6 + Math.round(i * 1.2) + Math.floor(Math.random() * 4));
        const maxTick = Math.max(1, ...settleAt);
        holder.current.t = 0;

        const animation = animate(holder.current, {
            t: maxTick,
            duration: 55 * maxTick,
            ease: 'linear',
            onUpdate: () => {
                const tick = holder.current.t;
                setDisplay(
                    chars.map((ch, i) => {
                        if (ch === ' ') return ' ';
                        if (tick >= settleAt[i]) return ch;
                        return REEL[Math.floor(Math.random() * (REEL.length - 1))];
                    }),
                );
            },
        });
        return () => {
            animation.revert?.();
        };
    }, [target]);

    // Group cells into words so the board only wraps at spaces — never mid-word.
    const words: { ch: string; i: number }[][] = [[]];
    display.forEach((ch, i) => {
        if (target[i] === ' ') words.push([]);
        else words[words.length - 1].push({ ch, i });
    });

    return (
        // Every cell is aria-hidden because the reel glyphs are noise; the settled
        // text is exposed once, off-screen. (`role="text"` is not a real ARIA role,
        // so an aria-label here would simply be dropped by most screen readers.)
        <span className={className}>
            <span className="sr-only">{ariaLabel ?? text}</span>
            {words.map((word, wi) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={wi} aria-hidden="true">
                    <span className="inline-block whitespace-nowrap">
                        {word.map(({ ch, i }) => (
                            <span
                                // eslint-disable-next-line react/no-array-index-key
                                key={i}
                                // Fixed-width, centred cell: the glyph reel cycles through
                                // characters of differing widths, so without a locked cell
                                // width the board's total width would change every tick and
                                // jitter the surrounding layout. overflow-hidden clips the
                                // rare wide transient glyph (M/W) without affecting layout.
                                className={`inline-block overflow-hidden text-center align-baseline ${cellClassName ?? ''}`}
                                style={{ width: '0.72em' }}
                            >
                                {ch}
                            </span>
                        ))}
                    </span>
                    {wi < words.length - 1 ? ' ' : null}
                </span>
            ))}
        </span>
    );
}

export default SplitFlap;
