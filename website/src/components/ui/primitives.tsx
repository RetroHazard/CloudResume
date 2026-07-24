import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ══ Line colours ═════════════════════════════════════════════════════════════
// Each entry (job, school, project, nav stop) is assigned a "line" — a coloured
// roundel like a metro line badge. Colours cycle deterministically by index.
const LINES = [
    { key: 'green', color: '#2ee08a' },
    { key: 'amber', color: '#ffc24b' },
    { key: 'blue', color: '#4aa8ff' },
    { key: 'violet', color: '#b48cff' },
    { key: 'red', color: '#ff5a5f' },
] as const;

export function lineColor(index: number) {
    return LINES[index % LINES.length].color;
}

// Round line badge with a single glyph (company/school initial or given letter).
export function LineBadge({
    letter,
    index = 0,
    color,
    size = 'md',
}: {
    letter: string;
    index?: number;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
}) {
    const c = color ?? lineColor(index);
    const dim = size === 'lg' ? '2.6rem' : size === 'sm' ? '1.4rem' : '1.9rem';
    const fs = size === 'lg' ? '1.15rem' : size === 'sm' ? '0.68rem' : '0.9rem';
    return (
        <span
            aria-hidden="true"
            className="inline-grid shrink-0 place-items-center rounded-full font-heading font-extrabold"
            style={{
                width: dim,
                height: dim,
                fontSize: fs,
                color: '#071319',
                background: c,
                boxShadow: `0 0 0 3px ${c}22`,
            }}
        >
            {letter.slice(0, 2).toUpperCase()}
        </span>
    );
}

// Status pill — service state (on-time / departed / suspended).
export function StatusPill({
    tone = 'on',
    children,
}: {
    tone?: 'on' | 'past' | 'alert';
    children: ReactNode;
}) {
    const styles = {
        on: 'text-neon',
        past: 'text-content-date',
        alert: 'text-alert',
    }[tone];
    return (
        <span className={cn('inline-flex items-center gap-1.5 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em]', styles)}>
            {tone === 'on' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />}
            {tone === 'alert' && <span className="h-1.5 w-1.5 rounded-full bg-alert" />}
            {children}
        </span>
    );
}

// Scroll-triggered reveal (respects reduced motion via app MotionConfig).
export function Reveal({
    children,
    className,
    delay = 0,
    y = 14,
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
            transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </MotionTag>
    );
}

// ══ SectionShell ═════════════════════════════════════════════════════════════
// The platform board that frames every route: signal stripe, line roundel,
// platform/kicker label, and a condensed uppercase title.
export function SectionShell({
    id,
    kicker,
    title,
    line = 0,
    badge,
    right,
    children,
    className,
}: {
    id?: string;
    kicker?: string;
    title?: string;
    line?: number;
    badge?: string;
    right?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    const c = lineColor(line);
    return (
        <section
            id={id}
            className={cn(
                'relative overflow-hidden rounded-xl border border-border bg-card/80 shadow-xl shadow-black/40 backdrop-blur-sm',
                className,
            )}
        >
            {/* signal stripe */}
            <div className="h-1 w-full" style={{ background: c }} />
            {(kicker || title) && (
                <header className="flex items-center justify-between gap-3 border-b border-border bg-secondary-800/60 px-5 py-3 sm:px-7">
                    <div className="flex items-center gap-3">
                        {(badge || title) && (
                            <LineBadge letter={badge ?? title!.charAt(0)} color={c} />
                        )}
                        <div className="flex flex-col">
                            {kicker && (
                                <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-content-accent">
                                    {kicker}
                                </span>
                            )}
                            {title && (
                                <h1 className="mb-0 font-heading text-2xl font-extrabold uppercase leading-none tracking-wide text-content-header sm:text-3xl">
                                    {title}
                                </h1>
                            )}
                        </div>
                    </div>
                    {right}
                </header>
            )}
            <div className="p-5 sm:p-7">{children}</div>
        </section>
    );
}

// Departure-board frame: a table-like list with a mono column header row.
export function Board({
    columns,
    children,
}: {
    columns: string[];
    children: ReactNode;
}) {
    const left = columns.slice(0, -1).join('  ·  ');
    const right = columns[columns.length - 1];
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary-800/70 px-3 py-2 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-content-accent sm:px-4">
                <span>{left}</span>
                <span className="max-sm:hidden">{right}</span>
            </div>
            <ol className="flex list-none flex-col">{children}</ol>
        </div>
    );
}

// ══ DepartureRow ═════════════════════════════════════════════════════════════
// One entry on a departure board (a job, a project, a course). The summary line
// reads like a board row — line badge, destination, operator, since, status —
// and expands to reveal the full stop details.
export function DepartureRow({
    index,
    letter,
    destination,
    operator,
    since,
    status = 'past',
    statusLabel,
    defaultOpen = false,
    children,
}: {
    index: number;
    letter: string;
    destination: string;
    operator: string;
    since: string;
    status?: 'on' | 'past' | 'alert';
    statusLabel?: string;
    defaultOpen?: boolean;
    children: ReactNode;
}) {
    return (
        <details
            open={defaultOpen}
            className="group border-b border-border last:border-b-0 [&_summary::-webkit-details-marker]:hidden"
        >
            <summary className="grid cursor-pointer list-none items-center gap-3 px-3 py-3 transition-colors hover:bg-secondary-800/50 sm:px-4 [grid-template-columns:auto_1fr_auto]">
                <LineBadge letter={letter} index={index} />
                <span className="flex min-w-0 flex-col">
                    <span className="truncate font-heading text-base font-bold uppercase leading-tight tracking-wide text-content-title sm:text-lg">
                        {destination}
                    </span>
                    <span className="truncate font-mono text-[0.7rem] text-neon">{operator}</span>
                </span>
                <span className="flex items-center gap-3">
                    <span className="flex flex-col items-end max-sm:hidden">
                        <span className="tabular font-mono text-xs font-semibold text-content-subtitle">
                            {since}
                        </span>
                        <StatusPill tone={status}>{statusLabel ?? (status === 'on' ? 'On Time' : 'Departed')}</StatusPill>
                    </span>
                    <span
                        aria-hidden="true"
                        className="text-content-accent transition-transform group-open:rotate-90"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M9 6l6 6-6 6" />
                        </svg>
                    </span>
                </span>
            </summary>
            <div className="border-t border-border/60 bg-background/40 px-3 pb-4 pt-3 sm:px-4">
                {children}
            </div>
        </details>
    );
}

// Small line-label chip.
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded border border-border bg-secondary-800/70 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-content-subtitle transition-colors hover:border-neon/60 hover:text-neon',
                className,
            )}
        >
            {children}
        </span>
    );
}
