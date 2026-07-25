import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { BrandIcon } from './ui/brand_icon';

const pct = (level) => parseInt(String(level).replace('%', ''), 10) || 0;

// The bar is a proficiency reading, so its colour has to mean proficiency.
// Cycling the line-badge palette instead painted Terraform in `--color-alert`
// red — the same red this design language uses for "suspended service".
const barColor = (level) => {
    if (level >= 85) return 'var(--color-line-green)';
    if (level >= 70) return 'var(--color-line-blue)';
    if (level >= 50) return 'var(--color-line-amber)';
    return 'var(--color-secondary-400)';
};

const SkillHighlight = () => {
    const { data, loading, error } = useJsonData('skill_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    const skills = [...data.core_skills].sort((a, b) => pct(b.level) - pct(a.level));
    return (
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
            {skills.map((skill) => {
                const level = pct(skill.level);
                return (
                    <a
                        key={skill.name}
                        href={skill.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`${skill.name} (opens in new tab)`}
                        className='group flex items-center gap-3 rounded border border-border bg-secondary-800/50 px-3 py-2 no-underline transition-colors hover:border-neon/40'
                    >
                        <BrandIcon
                            icon={skill.logo}
                            name={skill.name}
                            monogram={skill.monogram}
                            size='1.5em'
                            className='shrink-0'
                        />
                        <div className='flex min-w-0 flex-1 flex-col gap-1'>
                            <div className='flex items-baseline justify-between gap-2'>
                                <span
                                    className='truncate text-sm font-semibold text-content-subtitle group-hover:text-content-title'
                                    title={skill.name}
                                >
                                    {skill.name}
                                </span>
                                <span className='tabular shrink-0 font-mono text-[0.6rem] uppercase tracking-wide text-content-accent'>
                                    {skill.category}
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
            })}
        </div>
    );
};

export default SkillHighlight;
