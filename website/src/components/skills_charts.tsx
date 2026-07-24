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

const shortCloud = (name: string) =>
    name
        .replace('Amazon Web Services', 'AWS')
        .replace('Microsoft Azure', 'Azure')
        .replace('Google Cloud Platform', 'GCP');

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

    // Cloud: a specialist story rather than a lopsided three-way race. The
    // primary platform (highest proficiency — AWS) gets the hero ring; the rest
    // are shown as "also worked with", acknowledged without competing.
    const clouds = core
        .filter((s) => s.category === 'Cloud')
        .map((s) => ({ label: shortCloud(s.name), value: pct(s.level) }))
        .sort((a, b) => b.value - a.value);
    const primary = clouds[0] ?? { label: 'AWS', value: 0 };
    const secondary = clouds.slice(1);

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
                    data={[{ label: primary.label, value: primary.value, maxValue: 100, color: 'var(--chart-1)' }]}
                    className='mx-auto max-w-[260px]'
                    strokeWidth={20}
                    baseInnerRadius={56}
                >
                    <Ring index={0} showGlow lineCap='round' />
                    <RingCenter defaultLabel={primary.label} suffix='%' />
                </RingChart>
                <figcaption className='mt-3 flex flex-col items-center gap-2'>
                    <span className='font-mono text-[0.6rem] uppercase tracking-[0.2em] text-content-accent'>
                        Primary Cloud Platform
                    </span>
                    {secondary.length > 0 && (
                        <div className='flex flex-wrap items-center justify-center gap-2'>
                            <span className='font-mono text-[0.6rem] uppercase tracking-wide text-content-date'>
                                also worked with
                            </span>
                            {secondary.map((c) => (
                                <span
                                    key={c.label}
                                    className='inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary-800/70 px-2 py-0.5 font-mono text-[0.62rem] text-content-subtitle'
                                >
                                    {c.label}
                                </span>
                            ))}
                        </div>
                    )}
                </figcaption>
            </figure>
        </div>
    );
}
