import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';

// GitHub-style contribution calendar, merged across the accounts baked into
// contributions.json (see scripts/fetch-contributions.mjs). Reads the data the
// same way every other panel does — a static JSON asset via useJsonData.

type Day = { date: string; count: number; level: number };
type Contributions = { total: number; accounts?: string[]; updated?: string | null; days: Day[] };

const LEVEL_BG = ['#0e2129', 'rgba(46,224,138,0.22)', 'rgba(46,224,138,0.44)', 'rgba(46,224,138,0.70)', '#2ee08a'];
const ACCOUNT_SWATCH = ['var(--color-neon)', 'var(--color-glow)'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`);
const label = (iso: string) => {
    const d = parse(iso);
    return `${DOW[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};

export default function GithubHeatmap() {
    const { data, loading, error } = useJsonData('contributions.json') as {
        data: Contributions | null;
        loading: boolean;
        error: unknown;
    };
    if (loading) return <LoadingSkeleton />;
    if (error || !data || !data.days?.length) return null;

    const { days } = data;

    // Pad to whole weeks: lead with the first day's weekday, trail to fill the
    // last column, then the CSS grid lays the flat list out column-by-column.
    const cells: (Day | null)[] = [];
    for (let i = parse(days[0].date).getUTCDay(); i > 0; i--) cells.push(null);
    cells.push(...days);
    while (cells.length % 7 !== 0) cells.push(null);
    const weekCount = cells.length / 7;

    // A month label sits above the column where that month begins.
    const months: (string | null)[] = [];
    let lastMonth = -1;
    for (let w = 0; w < weekCount; w++) {
        const top = cells.slice(w * 7, w * 7 + 7).find(Boolean) ?? null;
        if (top) {
            const d = parse(top.date);
            if (d.getUTCMonth() !== lastMonth && d.getUTCDate() <= 7) {
                months.push(MONTHS[d.getUTCMonth()]);
                lastMonth = d.getUTCMonth();
                continue;
            }
        }
        months.push(null);
    }

    const accounts = data.accounts ?? [];

    return (
        <figure className='flex w-full flex-col gap-3'>
            <figcaption className='font-mono text-[0.62rem] uppercase tracking-[0.2em] text-neon'>
                // contribution activity
            </figcaption>
            <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                <span className='font-heading text-2xl font-extrabold uppercase tracking-wide text-content-header'>
                    <span className='text-neon'>{data.total.toLocaleString()}</span> contributions
                </span>
                <span className='font-mono text-[0.68rem] text-content-accent'>last year · personal + work, combined</span>
            </div>
            {accounts.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                    {accounts.map((a, i) => (
                        <span
                            key={a}
                            className='inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary-800/60 px-2.5 py-1 font-mono text-[0.62rem] text-content-accent'
                        >
                            <span className='h-2 w-2 rounded-[2px]' style={{ background: ACCOUNT_SWATCH[i % ACCOUNT_SWATCH.length] }} />@{a}
                        </span>
                    ))}
                </div>
            )}

            <div className='gh-scroll overflow-x-auto pb-1'>
                <div className='gh-cal'>
                    <div className='gh-months' style={{ gridTemplateColumns: `repeat(${weekCount}, var(--gh-cell))` }}>
                        {months.map((m, i) => (
                            <div key={i} className='gh-month'>
                                {m && <span>{m}</span>}
                            </div>
                        ))}
                    </div>
                    <div className='gh-dow'>
                        <span />
                        <span>Mon</span>
                        <span />
                        <span>Wed</span>
                        <span />
                        <span>Fri</span>
                        <span />
                    </div>
                    <div className='gh-grid'>
                        {cells.map((c, i) =>
                            c ? (
                                <div
                                    key={i}
                                    className='gh-cell'
                                    title={`${c.count} contribution${c.count === 1 ? '' : 's'} · ${label(c.date)}`}
                                    style={{
                                        background: LEVEL_BG[c.level] ?? LEVEL_BG[0],
                                        boxShadow: c.level === 4 ? '0 0 6px rgba(46,224,138,0.55)' : undefined,
                                    }}
                                />
                            ) : (
                                <div key={i} className='gh-cell' style={{ background: 'transparent' }} />
                            ),
                        )}
                    </div>
                </div>
            </div>

            <div className='flex items-center justify-end gap-1.5 font-mono text-[0.6rem] text-content-accent'>
                Less
                {LEVEL_BG.map((bg, i) => (
                    <span key={i} className='gh-cell' style={{ background: bg }} />
                ))}
                More
            </div>

            <style>{`
                .gh-cal { --gh-cell: 12px; display: inline-grid; grid-template-columns: auto 1fr; gap: 6px; min-width: min-content; }
                .gh-months { grid-column: 2; display: grid; grid-auto-flow: column; gap: 3px; height: 13px;
                    font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: 0.04em; color: var(--chart-label, #8ba7ac); }
                .gh-month { position: relative; }
                .gh-month span { position: absolute; left: 0; white-space: nowrap; }
                .gh-dow { grid-row: 2; grid-column: 1; display: grid; grid-template-rows: repeat(7, var(--gh-cell)); gap: 3px;
                    padding-right: 4px; align-items: center; font-family: var(--font-mono, monospace); font-size: 9px; color: var(--chart-label, #8ba7ac); }
                .gh-grid { grid-row: 2; grid-column: 2; display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, var(--gh-cell)); gap: 3px; }
                .gh-cell { width: var(--gh-cell, 11px); height: var(--gh-cell, 11px); border-radius: 2.5px; }
            `}</style>
        </figure>
    );
}
