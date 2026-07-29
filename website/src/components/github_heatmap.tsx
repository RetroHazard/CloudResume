import { useEffect, useState } from 'react';
import { LoadingSkeleton } from '../utils/useJsonData';

// GitHub-style contribution calendar, merged across two accounts. Unlike the
// other panels this data is fetched at runtime rather than bundled: the
// scheduled updateContributions Lambda rewrites data/contributions.json in S3
// on an interval, so the heatmap stays current without redeploying the site.
// Deploys seed the same path from public/data/contributions.json (refreshed in
// CI by scripts/fetch-contributions.mjs).
//
// The calendar is fluid: the 53 week-columns share the container width equally
// and cells stay square via aspect-ratio, so a full year always fits the element
// with no horizontal scroll, shrinking with the viewport.

type Day = { date: string; count: number; level: number };
type Contributions = { total: number; accounts?: string[]; updated?: string | null; days: Day[] };

const DATA_URL = '/data/contributions.json';

function useContributions() {
    const [state, setState] = useState<{ data: Contributions | null; loading: boolean; error: unknown }>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        fetch(DATA_URL, { headers: { Accept: 'application/json' } })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<Contributions>;
            })
            .then((data) => {
                if (!cancelled) setState({ data, loading: false, error: null });
            })
            .catch((error) => {
                if (!cancelled) setState({ data: null, loading: false, error });
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}

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
    const { data, loading, error } = useContributions();
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
    const columns = `repeat(${weekCount}, minmax(0, 1fr))`;

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
            <figcaption className='font-mono text-[0.62rem] tracking-[0.2em] text-neon uppercase'>
                // contribution activity
            </figcaption>
            <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                <span className='font-heading text-2xl font-extrabold tracking-wide text-content-header uppercase'>
                    <span className='text-neon'>{data.total.toLocaleString()}</span> contributions
                </span>
                <span className='font-mono text-[0.68rem] text-content-accent'>
                    last year · personal + work, combined
                </span>
            </div>
            {accounts.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                    {accounts.map((a, i) => (
                        <span
                            key={a}
                            className='inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary-800/60 px-2.5 py-1 font-mono text-[0.62rem] text-content-accent'
                        >
                            <span
                                className='h-2 w-2 rounded-[2px]'
                                style={{ background: ACCOUNT_SWATCH[i % ACCOUNT_SWATCH.length] }}
                            />
                            @{a}
                        </span>
                    ))}
                </div>
            )}

            <div className='gh-wrap'>
                <div className='gh-cal'>
                    <div className='gh-months' style={{ gridTemplateColumns: columns }}>
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
                    <div className='gh-grid' style={{ gridTemplateColumns: columns, aspectRatio: `${weekCount} / 7` }}>
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
                    <span key={i} className='gh-swatch' style={{ background: bg }} />
                ))}
                More
            </div>

            <style>{`
                .gh-wrap { container-type: inline-size; width: 100%; }
                .gh-cal { --gh-gap: clamp(1px, 0.35cqw, 2px); display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px; width: 100%; }
                /* Labels have a legibility floor: below ~8px they are decoration,
                   not information, so the weekday gutter is dropped on narrow
                   containers rather than shrunk further. Month labels stay — they
                   sit ~4 columns apart, which is enough room even at 8px. */
                .gh-months { grid-row: 1; grid-column: 2; display: grid; gap: var(--gh-gap); height: clamp(11px, 1.8cqw, 13px);
                    font-family: var(--font-mono, monospace); font-size: clamp(8px, 1.6cqw, 10px); letter-spacing: 0.04em; color: var(--chart-label, #8ba7ac); }
                .gh-month { position: relative; min-width: 0; }
                .gh-month span { position: absolute; left: 0; white-space: nowrap; }
                .gh-dow { grid-row: 2; grid-column: 1; align-self: stretch; display: grid; grid-template-rows: repeat(7, minmax(0, 1fr)); gap: var(--gh-gap);
                    min-height: 0; overflow: hidden; padding-right: 4px; align-items: center; line-height: 1;
                    font-family: var(--font-mono, monospace); font-size: clamp(8px, 1.5cqw, 9px); color: var(--chart-label, #8ba7ac); }
                @container (max-width: 460px) {
                    .gh-cal { grid-template-columns: minmax(0, 1fr); }
                    .gh-dow { display: none; }
                    .gh-months, .gh-grid { grid-column: 1; }
                }
                .gh-grid { grid-row: 2; grid-column: 2; display: grid; grid-template-rows: repeat(7, minmax(0, 1fr)); grid-auto-flow: column; gap: var(--gh-gap); width: 100%; }
                .gh-cell { min-width: 0; min-height: 0; border-radius: 2px; }
                .gh-swatch { width: 11px; height: 11px; border-radius: 2px; flex: 0 0 auto; }
            `}</style>
        </figure>
    );
}
