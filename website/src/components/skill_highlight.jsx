import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { groupSkills, pct, rampColor } from '../utils/skillTaxonomy';
import { BrandIcon } from './ui/brand_icon';

// The bar is a proficiency reading, so its colour has to mean proficiency.
// Cycling the line-badge palette instead painted Terraform in `--color-alert`
// red — the same red this design language uses for "suspended service".
const barColor = (level) => {
    if (level >= 85) return 'var(--color-line-green)';
    if (level >= 70) return 'var(--color-line-blue)';
    if (level >= 50) return 'var(--color-line-amber)';
    return 'var(--color-secondary-400)';
};

function SkillCard({ skill }) {
    const level = pct(skill.level);
    return (
        <a
            href={skill.website}
            target='_blank'
            rel='noopener noreferrer'
            aria-label={`${skill.name} (opens in new tab)`}
            className='group flex items-center gap-3 rounded border border-border bg-secondary-800/50 px-3 py-2 no-underline transition-colors hover:border-neon/40'
        >
            <BrandIcon icon={skill.logo} name={skill.name} monogram={skill.monogram} size='1.5em' className='shrink-0' />
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <div className='flex items-baseline justify-between gap-2'>
                    <span
                        className='truncate text-sm font-semibold text-content-subtitle group-hover:text-content-title'
                        title={skill.name}
                    >
                        {skill.name}
                    </span>
                    {/* The category used to sit here; the drawer above says it now,
                        so the slot carries the tool's own reading instead. */}
                    <span className='tabular shrink-0 font-mono text-[0.6rem] uppercase tracking-wide text-content-accent'>
                        {skill.level}
                    </span>
                </div>
                <div
                    className='h-1.5 w-full overflow-hidden rounded-full bg-background'
                    role='progressbar'
                    aria-valuenow={level}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${skill.name} proficiency`}
                >
                    <div
                        className='h-full rounded-full transition-all'
                        style={{ width: `${level}%`, background: barColor(level) }}
                    />
                </div>
            </div>
        </a>
    );
}

const SkillHighlight = () => {
    const { data, loading, error } = useJsonData('skill_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;

    // One drawer per category, biggest first — the same order, and the same
    // ramp colour, as the rings above. All shut on arrival: the list runs to
    // dozens of tools, and a wall of them is nobody's idea of a summary.
    const groups = groupSkills(data.core_skills ?? []);

    return (
        <div className='flex flex-col gap-2'>
            {groups.map((group, index) => (
                <details
                    key={group.name}
                    name='rolling-stock'
                    className='group overflow-hidden rounded border border-border bg-secondary-800/40 [&_summary::-webkit-details-marker]:hidden'
                >
                    <summary className='grid cursor-pointer list-none items-center gap-3 px-3 py-2.5 transition-colors hover:bg-secondary-800/80 [grid-template-columns:auto_1fr_auto]'>
                        <span
                            aria-hidden='true'
                            className='inline-block h-2.5 w-2.5 shrink-0 rounded-full'
                            style={{ backgroundColor: rampColor(index) }}
                        />
                        <span className='flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                            <span className='font-heading text-[0.95rem] font-bold uppercase leading-tight tracking-wide text-content-title sm:text-base'>
                                {group.name}
                            </span>
                            <span className='tabular font-mono text-[0.58rem] uppercase tracking-wider text-content-accent sm:text-[0.62rem]'>
                                {group.count} {group.count === 1 ? 'tool' : 'tools'} · avg {group.avg}%
                            </span>
                        </span>
                        <span aria-hidden='true' className='text-content-accent transition-transform group-open:rotate-90'>
                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                                <path d='M9 6l6 6-6 6' />
                            </svg>
                        </span>
                    </summary>
                    <div className='grid grid-cols-1 gap-2.5 border-t border-border/60 bg-background/40 px-3 pb-3 pt-3 sm:grid-cols-2'>
                        {group.skills.map((skill) => (
                            <SkillCard key={skill.name} skill={skill} />
                        ))}
                    </div>
                </details>
            ))}
        </div>
    );
};

export default SkillHighlight;
