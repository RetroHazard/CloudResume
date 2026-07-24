import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { lineColor } from './ui/primitives';

const pct = (level) => parseInt(String(level).replace('%', ''), 10) || 0;

const SkillHighlight = () => {
    const { data, loading, error } = useJsonData('skill_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    const skills = [...data.core_skills].sort((a, b) => pct(b.level) - pct(a.level));
    return (
        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
            {skills.map((skill, index) => {
                const color = lineColor(index);
                return (
                    <a
                        key={skill.name}
                        href={skill.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        aria-label={`${skill.name} (opens in new tab)`}
                        className='group flex items-center gap-3 rounded border border-border bg-secondary-800/50 px-3 py-2 no-underline transition-colors hover:border-neon/40'
                    >
                        <Icon icon={skill.logo} width='1.5em' height='1.5em' aria-hidden='true' />
                        <div className='flex min-w-0 flex-1 flex-col gap-1'>
                            <div className='flex items-baseline justify-between gap-2'>
                                <span className='truncate text-sm font-semibold text-content-subtitle group-hover:text-content-title'>
                                    {skill.name}
                                </span>
                                <span className='tabular shrink-0 font-mono text-[0.6rem] uppercase tracking-wide text-content-accent'>
                                    {skill.category}
                                </span>
                            </div>
                            <div
                                className='h-1.5 w-full overflow-hidden rounded-full bg-background'
                                role='progressbar'
                                aria-valuenow={pct(skill.level)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${skill.name} proficiency`}
                            >
                                <div
                                    className='h-full rounded-full transition-all'
                                    style={{ width: skill.level, background: color }}
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
