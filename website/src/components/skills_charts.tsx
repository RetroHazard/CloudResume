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
 * needed a private lookup table and why counting anything was meaningless.
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
 * the list below them.
 */
const CATEGORIES = ['Cloud', 'Platform', 'Security', 'Development', 'Workplace', 'Creative'];
const OTHER = 'Other';

// Sequential ramp, brightest = biggest bucket. See --chart-ramp-* in index.css.
const RAMP_STEPS = 6;

const pct = (level: string) => parseInt(String(level).replace('%', ''), 10) || 0;

type Bucket = { name: string; count: number; peak: number };

function bucketize(core: CoreSkill[]): Bucket[] {
    const known = new Set(CATEGORIES);
    return [...CATEGORIES, OTHER]
        .map((name) => {
            const levels = core
                .filter((s) => (known.has(s.category) ? s.category === name : name === OTHER))
                .map((s) => pct(s.level));
            return {
                name,
                count: levels.length,
                peak: levels.reduce((max, v) => Math.max(max, v), 0),
            };
        })
        .filter((b) => b.count > 0);
}

export default function SkillsCharts() {
    const { data } = useJsonData('skill_data.json') as {
        data: { core_skills?: CoreSkill[] } | null;
    };
    const core: CoreSkill[] = data?.core_skills ?? [];
    if (core.length === 0) return null;

    const buckets = bucketize(core);

    // Radar — the ceiling of each category, axes kept in taxonomy order so the
    // shape means the same thing from one visit to the next.
    const values: Record<string, number> = {};
    for (const bucket of buckets) values[bucket.name] = bucket.peak;
    const metrics = buckets.map((b) => ({ key: b.name, label: b.name }));
    const radarData = [{ label: 'Peak proficiency', values }];

    // Rings — how much of the toolbox each category accounts for. The widest
    // category fills its ring, so the rest read as shares of it; the exact
    // counts are in the legend and the centre carries the total.
    const ranked = [...buckets].sort((a, b) => b.count - a.count || b.peak - a.peak);
    const widest = ranked[0].count;
    const rings = ranked.map((b, i) => ({
        label: b.name,
        value: b.count,
        maxValue: widest,
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
                        <RadarArea index={0} showGlow />
                        <RadarLabels />
                    </RadarChart>
                    <figcaption className='flex flex-col items-center gap-1 font-mono text-xs uppercase tracking-wider text-content-accent'>
                        // peak proficiency by category
                        <span className='sr-only'>
                            {buckets.map((b) => `${b.name}: ${b.peak}%`).join(', ')}
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
                        <ul className='m-0 flex w-full max-w-[300px] list-none flex-col gap-1 p-0 normal-case tracking-normal'>
                            {rings.map((r) => (
                                <li key={r.label} className='flex items-baseline justify-between gap-3 text-[0.68rem]'>
                                    <span className='flex items-center gap-1.5 text-content-subtitle'>
                                        <span
                                            aria-hidden='true'
                                            className='inline-block h-2 w-2 shrink-0 rounded-full'
                                            style={{ backgroundColor: r.color }}
                                        />
                                        {r.label}
                                    </span>
                                    <span className='tabular whitespace-nowrap'>
                                        {r.value} · peak {r.peak}%
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </figcaption>
                </figure>
            </div>
        </div>
    );
}
