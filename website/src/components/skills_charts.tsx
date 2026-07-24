import { useJsonData } from '../utils/useJsonData';
import { RadarChart } from './charts/radar-chart';
import { RadarGrid } from './charts/radar-grid';
import { RadarAxis } from './charts/radar-axis';
import { RadarArea } from './charts/radar-area';
import { RadarLabels } from './charts/radar-labels';
import { RingChart } from './charts/ring-chart';
import { Ring } from './charts/ring';
import { RingCenter } from './charts/ring-center';

type CoreSkill = { name: string; category: string; level: string };

// Roll the many fine-grained categories up into the domains that matter for a
// cloud/security engineer. A domain's score = the peak skill within it.
const CATEGORY_TO_DOMAIN: Record<string, string> = {
    Cloud: 'Cloud',
    Automation: 'Automation',
    Containerization: 'Containers',
    Orchestration: 'Containers',
    Security: 'Security',
    'Operating System': 'Systems',
    'Command Language': 'Scripting',
    'Scripting Language': 'Scripting',
    'Programming Language': 'Scripting',
    Library: 'Web',
    Framework: 'Web',
};
const DOMAINS = ['Cloud', 'Automation', 'Security', 'Containers', 'Scripting', 'Systems'];

const pct = (level: string) => parseInt(String(level).replace('%', ''), 10) || 0;

const RING_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];

export default function SkillsCharts() {
    const { data } = useJsonData('skill_data.json') as {
        data: { core_skills?: CoreSkill[] } | null;
    };
    const core: CoreSkill[] = data?.core_skills ?? [];
    if (core.length === 0) return null;

    // radar: peak proficiency per domain
    const values: Record<string, number> = {};
    for (const domain of DOMAINS) {
        const peak = core
            .filter((s) => CATEGORY_TO_DOMAIN[s.category] === domain)
            .reduce((max, s) => Math.max(max, pct(s.level)), 0);
        values[domain] = peak;
    }
    const metrics = DOMAINS.map((d) => ({ key: d, label: d }));
    const radarData = [{ label: 'Proficiency', values }];

    // rings: the three public clouds
    const clouds = core
        .filter((s) => s.category === 'Cloud')
        .map((s, i) => ({
            label: s.name.replace('Amazon Web Services', 'AWS').replace('Microsoft ', '').replace('Google Cloud Platform', 'GCP'),
            value: pct(s.level),
            maxValue: 100,
            color: RING_COLORS[i % RING_COLORS.length],
        }));

    return (
        <div className='grid gap-8 md:grid-cols-2'>
            <figure className='flex flex-col items-center'>
                <RadarChart data={radarData} metrics={metrics} className='mx-auto max-w-[380px]'>
                    <RadarGrid />
                    <RadarAxis />
                    <RadarArea index={0} showGlow />
                    <RadarLabels />
                </RadarChart>
                <figcaption className='mt-2 font-mono text-xs uppercase tracking-wider text-content-accent'>
                    // domain proficiency
                </figcaption>
            </figure>

            <figure className='flex flex-col items-center'>
                <RingChart
                    data={clouds}
                    className='mx-auto max-w-[300px]'
                    strokeWidth={16}
                    ringGap={8}
                    baseInnerRadius={46}
                >
                    {clouds.map((c, i) => (
                        <Ring key={c.label} index={i} showGlow />
                    ))}
                    <RingCenter defaultLabel='Cloud' />
                </RingChart>
                <figcaption className='mt-2 flex flex-wrap justify-center gap-3 font-mono text-xs text-content-accent'>
                    {clouds.map((c, i) => (
                        <span key={c.label} className='inline-flex items-center gap-1.5'>
                            <span
                                aria-hidden='true'
                                className='inline-block h-2 w-2 rounded-full'
                                style={{ backgroundColor: RING_COLORS[i % RING_COLORS.length] }}
                            />
                            {c.label} {c.value}%
                        </span>
                    ))}
                </figcaption>
            </figure>
        </div>
    );
}
