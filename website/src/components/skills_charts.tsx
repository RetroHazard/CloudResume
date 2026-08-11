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
import { byTaxonomyOrder, categoryColor, groupSkills } from '../utils/skillTaxonomy';

type CoreSkill = { name: string; category: string; level: string };

/**
 * Both charts read the categories the Rolling Stock list is grouped by — see
 * utils/skillTaxonomy for the taxonomy itself — and split the work between
 * them. The radar carries depth: a category's ceiling and its average, so the
 * gap between the two is visible. The rings carry breadth: how much of the
 * toolbox each category accounts for. Neither repeats the other, and the table
 * under the rings spells out all three numbers.
 *
 * Both sit in taxonomy order, so a category is in the same place on both, and
 * stays there when a tool is added. The rings were once ordered biggest-first,
 * which put magnitude in the arc, the radius and the colour all at once and
 * drew the same descending staircase every time. Only the arc says it now;
 * radius is just the taxonomy, and colour identifies the category.
 */

// Peak is the outer envelope, average the solid core it sits on — amber reads as
// headroom against the signal green the rest of the page uses for what is real.
const PEAK_COLOR = 'var(--chart-2)';
const AVG_COLOR = 'var(--chart-1)';

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

    // Grouped biggest-first — the order the toolbox drawers use below. Both
    // charts re-sort into taxonomy order; the drawers keep this one, since a
    // list of tools is worth reading widest-first. Colour, not position, is
    // what ties a drawer to its ring.
    const groups = groupSkills(core);

    // Taxonomy order, so both charts mean the same thing from one visit to the
    // next rather than shuffling when a tool is added.
    const ordered = [...groups].sort(byTaxonomyOrder);

    // Radar — two readings of the same axes. Peak is what a category can reach,
    // average is how deep it runs, and every category's average sits inside its
    // peak, so the band between them is headroom: Cloud peaks at 80 on AWS and
    // averages 35 once Azure and GCP are counted.
    const peaks: Record<string, number> = {};
    const averages: Record<string, number> = {};
    for (const group of ordered) {
        peaks[group.name] = group.peak;
        averages[group.name] = group.avg;
    }
    const metrics = ordered.map((g) => ({ key: g.name, label: g.name }));
    const radarData = [
        { label: 'Peak', values: peaks, color: PEAK_COLOR },
        { label: 'Average', values: averages, color: AVG_COLOR },
    ];

    // Rings — how much of the toolbox each category accounts for. The exact
    // counts are in the table below and the centre carries the total.
    //
    // The sweep is log-scaled, and stops short of a full turn. Drawn linearly,
    // Security closed the loop while Cloud sat at a fourteen-percent scratch:
    // one solid circle — a different kind of shape from an arc — ringed by
    // debris. Compressing the top and opening out the bottom gives all seven a
    // length worth comparing, and the headroom keeps even the widest reading as
    // an arc rather than a closed ring.
    //
    // The cost is that sweep is no longer a ratio: Security holds seven times
    // Cloud's tools but draws about 2.2 times the arc. Comparing counts is what
    // the table underneath is for — this is the shape of the toolbox, not its
    // measurements.
    //
    // `widest` is taken across every group rather than off the front of
    // `groups`. That read correctly only because grouping happens to sort
    // biggest-first, and there are now two differently-ordered views of the same
    // array — so dropping the spread above, or changing how groupSkills sorts,
    // would quietly rescale everything against whatever landed first.
    const FULLEST_SWEEP = 0.85;
    const widest = Math.max(...groups.map((g) => g.count));
    // count + 1 because log(1) is 0 — a category holding a single tool would
    // otherwise draw no arc at all.
    const sweepOf = (count: number) => (Math.log(count + 1) / Math.log(widest + 1)) * FULLEST_SWEEP;

    const rings = ordered.map((g) => ({
        label: g.name,
        // `value` stays the true count: the centre reads it out on hover and
        // sums it for the total. The scale is applied through `maxValue`, which
        // is what the arc is actually drawn against.
        value: g.count,
        maxValue: g.count / sweepOf(g.count),
        avg: g.avg,
        peak: g.peak,
        color: categoryColor(g.name),
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
                    <figcaption className='flex flex-col items-center gap-2 font-mono text-xs tracking-wider text-content-accent uppercase'>
                        // proficiency by category
                        <span className='flex flex-wrap justify-center gap-x-4 gap-y-1 text-[0.68rem] tracking-normal text-content-subtitle normal-case'>
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
                    <figcaption className='flex w-full flex-col items-center gap-2 font-mono text-xs tracking-wider text-content-accent uppercase'>
                        // toolbox by category
                        <table className='w-full max-w-[320px] border-collapse text-[0.68rem] tracking-normal normal-case'>
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
