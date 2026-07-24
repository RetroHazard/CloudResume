import { useJsonData } from '../utils/useJsonData';
import { RadarChart } from './charts/radar-chart';
import { RadarGrid } from './charts/radar-grid';
import { RadarAxis } from './charts/radar-axis';
import { RadarArea } from './charts/radar-area';
import { RadarLabels } from './charts/radar-labels';
import GithubHeatmap from './github_heatmap';

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

    return (
        <div className='flex flex-col gap-10'>
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

            <GithubHeatmap />
        </div>
    );
}
