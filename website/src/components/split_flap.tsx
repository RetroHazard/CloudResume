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
        const settleAt = chars.map((_, i) => 8 + i * 2 + Math.floor(Math.random() * 6));
        const maxTick = Math.max(1, ...settleAt);
        holder.current.t = 0;

        const animation = animate(holder.current, {
            t: maxTick,
            duration: 90 * maxTick,
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
        <span className={className} aria-label={ariaLabel ?? text} role="text">
            {words.map((word, wi) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={wi} aria-hidden="true">
                    <span className="inline-block whitespace-nowrap">
                        {word.map(({ ch, i }) => (
                            <span
                                // eslint-disable-next-line react/no-array-index-key
                                key={i}
                                className={cellClassName}
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
