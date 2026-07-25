import { useJsonData } from '../utils/useJsonData';
import { RadarChart } from './charts/radar-chart';
import { RadarGrid } from './charts/radar-grid';
import { RadarAxis } from './charts/radar-axis';
import { RadarArea } from './charts/radar-area';
import { RadarLabels } from './charts/radar-labels';
import { RingChart } from './charts/ring-chart';
import { Ring } from './charts/ring';
import { RingCenter } from './charts/ring-center';
import GithubHeatmap from './github_heatmap';

type CoreSkill = { name: string; category: string; level: string };

/**
 * One taxonomy, six buckets. Every tool in the Rolling Stock list carries
 * exactly one of these as its `category` in skill_data.json, and everything on
 * this page — the badges on each tool, the radar, the rings — reads that one
 * field. The old data had twenty categories, half of them a single tool deep
 * ("AI Gateway", "Endpoint (MDM)", "Game Development"), which is why the radar
 * needed a private lookup table and why scoring anything was meaningless.
 *
 *   Cloud        the public clouds themselves
 *   Platform     what runs on them — IaC, CI/CD, containers, observability, repos
 *   Security     identity, endpoint posture, network, vulnerability, offensive
 *   Development  languages and the web stack
 *   Workplace    the endpoints and the tools the company works in
 *   Creative     the pre-engineering craft — real-time, 3D, VFX, design
 *
 * A tool whose category is off-list lands in `Other` rather than disappearing,
 * so the number in the middle of the rings always equals the number of tools in
 * the list.
 *
 * The two charts split the work: the radar carries depth (both the ceiling and
 * the average of a category, so the gap between them is visible), the rings
 * carry breadth (how much of the toolbox sits in each). Neither repeats the
 * other, and the table under the rings spells out all three numbers.
 */
const CATEGORIES = ['Cloud', 'Platform', 'Security', 'Development', 'Workplace', 'Creative'];
const OTHER = 'Other';

// Sequential ramp, brightest = largest bucket. See --chart-ramp-* in index.css.
const RAMP_STEPS = 6;

// Peak is the outer envelope, average the solid core it sits on — amber reads as
// headroom against the signal green the rest of the page uses for what is real.
const PEAK_COLOR = 'var(--chart-2)';
const AVG_COLOR = 'var(--chart-1)';

const pct = (level: string) => parseInt(String(level).replace('%', ''), 10) || 0;

type Bucket = { name: string; count: number; peak: number; avg: number };

function bucketize(core: CoreSkill[]): Bucket[] {
    const known = new Set(CATEGORIES);
    return [...CATEGORIES, OTHER]
        .map((name) => {
            const levels = core
                .filter((s) => (known.has(s.category) ? s.category === name : name === OTHER))
                .map((s) => pct(s.level));
            const sum = levels.reduce((a, b) => a + b, 0);
            return {
                name,
                count: levels.length,
                peak: levels.reduce((max, v) => Math.max(max, v), 0),
                avg: levels.length ? Math.round(sum / levels.length) : 0,
            };
        })
        .filter((b) => b.count > 0);
}

function SeriesKey({ color, filled, children }: { color: string; filled: boolean; children: string }) {
    return (
        <span className='inline-flex items-center gap-1.5'>
            <span
                aria-hidden='true'
                className='inline-block h-2.5 w-2.5 rounded-full'
                style={{
                    border: `2px solid ${color}`,
                    backgroundColor: filled ? color : 'transparent',
                }}
            />
            {children}
        </span>
    );
}

export default function SkillsCharts() {
    const { data } = useJsonData('skill_data.json') as {
        data: { core_skills?: CoreSkill[] } | null;
    };
    const core: CoreSkill[] = data?.core_skills ?? [];
    if (core.length === 0) return null;

    const buckets = bucketize(core);

    // Radar — two readings of the same six axes. Peak is what a category can
    // reach, average is how deep it runs, and every category's average sits
    // inside its peak, so the band between them is headroom: Cloud peaks at 80
    // on AWS and averages 35 once Azure and GCP are counted.
    const peaks: Record<string, number> = {};
    const averages: Record<string, number> = {};
    for (const bucket of buckets) {
        peaks[bucket.name] = bucket.peak;
        averages[bucket.name] = bucket.avg;
    }
    const metrics = buckets.map((b) => ({ key: b.name, label: b.name }));
    const radarData = [
        { label: 'Peak', values: peaks, color: PEAK_COLOR },
        { label: 'Average', values: averages, color: AVG_COLOR },
    ];

    // Rings — how much of the toolbox each category accounts for. The widest
    // category fills its ring, so the rest read as shares of it; the exact
    // counts are in the table and the centre carries the total.
    const ranked = [...buckets].sort((a, b) => b.count - a.count || b.avg - a.avg);
    const widest = ranked[0].count;
    const rings = ranked.map((b, i) => ({
        label: b.name,
        value: b.count,
        maxValue: widest,
        avg: b.avg,
        peak: b.peak,
        color: `var(--chart-ramp-${Math.min(i + 1, RAMP_STEPS)})`,
    }));

    return (
        <div className='flex flex-col gap-10'>
            <GithubHeatmap />

            <div className='grid gap-8 md:grid-cols-2'>
                <figure className='flex flex-col items-center gap-3'>
                    <RadarChart data={radarData} metrics={metrics} className='mx-auto max-w-[380px]'>
                        <RadarGrid />
                        <RadarAxis />
                        <RadarArea index={0} showPoints={false} showGlow />
                        <RadarArea index={1} showGlow />
                        <RadarLabels />
                    </RadarChart>
                    <figcaption className='flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-wider text-content-accent'>
                        // proficiency by category
                        <span className='flex flex-wrap justify-center gap-x-4 gap-y-1 text-[0.68rem] normal-case tracking-normal text-content-subtitle'>
                            <SeriesKey color={PEAK_COLOR} filled={false}>
                                peak
                            </SeriesKey>
                            <SeriesKey color={AVG_COLOR} filled>
                                average
                            </SeriesKey>
                        </span>
                    </figcaption>
                </figure>

                <figure className='flex flex-col items-center gap-3'>
                    <RingChart
                        data={rings}
                        className='mx-auto max-w-[280px]'
                        strokeWidth={11}
                        ringGap={5}
                        baseInnerRadius={44}
                    >
                        {rings.map((r, i) => (
                            <Ring key={r.label} index={i} showGlow />
                        ))}
                        <RingCenter defaultLabel='Tools' />
                    </RingChart>
                    <figcaption className='flex w-full flex-col items-center gap-2 font-mono text-xs uppercase tracking-wider text-content-accent'>
                        // toolbox by category
                        <table className='w-full max-w-[320px] border-collapse text-[0.68rem] normal-case tracking-normal'>
                            <caption className='sr-only'>
                                Tools, average proficiency and peak proficiency in each category
                            </caption>
                            <thead>
                                <tr className='text-content-date'>
                                    <th scope='col' className='text-left font-normal'>
                                        <span className='sr-only'>Category</span>
                                    </th>
                                    <th scope='col' className='pl-2 text-right font-normal'>
                                        tools
                                    </th>
                                    <th scope='col' className='pl-3 text-right font-normal'>
                                        avg
                                    </th>
                                    <th scope='col' className='pl-3 text-right font-normal'>
                                        peak
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rings.map((r) => (
                                    <tr key={r.label}>
                                        <th scope='row' className='py-px text-left font-normal text-content-subtitle'>
                                            <span className='flex items-center gap-1.5'>
                                                <span
                                                    aria-hidden='true'
                                                    className='inline-block h-2 w-2 shrink-0 rounded-full'
                                                    style={{ backgroundColor: r.color }}
                                                />
                                                {r.label}
                                            </span>
                                        </th>
                                        <td className='tabular py-px pl-2 text-right'>{r.value}</td>
                                        <td className='tabular py-px pl-3 text-right'>{r.avg}%</td>
                                        <td className='tabular py-px pl-3 text-right'>{r.peak}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </figcaption>
                </figure>
            </div>
        </div>
    );
}
