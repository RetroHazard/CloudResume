import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';

const pct = (level) => parseInt(String(level).replace('%', ''), 10) || 0;

const SkillHighlight = () => {
    const { data, loading, error } = useJsonData('skill_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    const skills = [...data.core_skills].sort((a, b) => pct(b.level) - pct(a.level));
    return (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3'>
            {skills.map((skill) => (
                <a
                    key={skill.name}
                    href={skill.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`${skill.name} (opens in new tab)`}
                    className='group flex flex-col gap-2 rounded-lg border border-border bg-secondary-800/50 p-3 no-underline transition-colors hover:border-neon/40'
                >
                    <div className='flex items-center gap-2.5'>
                        <Icon icon={skill.logo} width='1.6em' height='1.6em' aria-hidden='true' />
                        <div className='flex min-w-0 flex-col'>
                            <span className='truncate text-sm font-semibold text-content-subtitle group-hover:text-content-title'>
                                {skill.name}
                            </span>
                            <span className='truncate font-mono text-[0.65rem] uppercase tracking-wide text-content-accent'>
                                {skill.category}
                            </span>
                        </div>
                    </div>
                    <div
                        className='h-1.5 w-full overflow-hidden rounded-full bg-secondary-700'
                        role='progressbar'
                        aria-valuenow={pct(skill.level)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${skill.name} proficiency`}
                    >
                        <div
                            className='h-full rounded-full bg-gradient-to-r from-primary-500 to-glow'
                            style={{ width: skill.level }}
                        />
                    </div>
                </a>
            ))}
        </div>
    );
};

export default SkillHighlight;
