import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Scroll-triggered fade/slide-in. Respects reduced motion via the app-level
// MotionConfig (reducedMotion="user").
export function Reveal({
    children,
    className,
    delay = 0,
    y = 16,
    as = 'div',
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    y?: number;
    as?: 'div' | 'li' | 'section';
}) {
    const MotionTag = motion[as];
    return (
        <MotionTag
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </MotionTag>
    );
}

// The cyber "panel" that frames each route: glass card, neon top-edge, mono kicker.
export function SectionShell({
    id,
    kicker,
    title,
    children,
    className,
}: {
    id?: string;
    kicker?: string;
    title?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            id={id}
            className={cn(
                'relative overflow-hidden rounded-2xl border border-border bg-card/60 p-6 shadow-xl shadow-black/40 backdrop-blur-sm sm:p-8',
                className,
            )}
        >
            <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent' />
            {(kicker || title) && (
                <header className='mb-6 flex flex-col gap-1'>
                    {kicker && (
                        <span className='font-mono text-xs uppercase tracking-[0.25em] text-neon/80'>
                            {kicker}
                        </span>
                    )}
                    {title && (
                        <h1 className='mb-0 font-heading text-2xl font-bold text-content-header sm:text-3xl'>
                            {title}
                        </h1>
                    )}
                </header>
            )}
            {children}
        </section>
    );
}

// Small neon-outlined tag/chip used for tech, categories, availability.
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary-700/60 px-2.5 py-1 font-mono text-xs text-content-subtitle transition-colors hover:border-neon/50 hover:text-neon',
                className,
            )}
        >
            {children}
        </span>
    );
}
