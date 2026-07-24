import { Fragment, useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

// anime.js showpiece: per-character blur/rise reveal of the name on mount.
// Characters are grouped into words (whitespace-nowrap) so the name only ever
// wraps at spaces between words — never mid-word, letter by letter.
// Honors prefers-reduced-motion by rendering the final state with no motion.
export function HeroName({ text, className }: { text: string; className?: string }) {
    const ref = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const chars = el.querySelectorAll<HTMLElement>('[data-char]');
        const reduce =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        if (reduce) {
            chars.forEach((c) => {
                c.style.opacity = '1';
                c.style.filter = 'none';
                c.style.transform = 'none';
            });
            return;
        }

        const animation = animate(chars, {
            opacity: [0, 1],
            translateY: [26, 0],
            filter: ['blur(10px)', 'blur(0px)'],
            delay: stagger(35),
            duration: 750,
            ease: 'out(3)',
        });
        return () => {
            animation.revert?.();
        };
    }, [text]);

    const words = text.split(' ');

    return (
        <h1 ref={ref} className={className} aria-label={text}>
            {words.map((word, wi) => (
                // eslint-disable-next-line react/no-array-index-key
                <Fragment key={wi}>
                    <span className='inline-block whitespace-nowrap'>
                        {[...word].map((ch, ci) => (
                            <span
                                // eslint-disable-next-line react/no-array-index-key
                                key={ci}
                                data-char
                                aria-hidden='true'
                                className='inline-block'
                                style={{ opacity: 0, willChange: 'transform, filter, opacity' }}
                            >
                                {ch}
                            </span>
                        ))}
                    </span>
                    {wi < words.length - 1 ? ' ' : null}
                </Fragment>
            ))}
        </h1>
    );
}
