import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import SkillButton from './skill_button';
import { Timeline, TimelineItem } from './ui/primitives';

const ExperienceList = () => {
    const { data, loading, error } = useJsonData('career_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <Timeline>
            {data.Experience.map((experience, index) => (
                <TimelineItem key={`${experience.company}-${experience.start}`} delay={index * 0.05}>
                    <div className='flex flex-col gap-3'>
                        <div className='flex w-full justify-between gap-2'>
                            <div className='flex gap-4'>
                                <img
                                    className='size-10 rounded-xl ring-1 ring-border sm:size-20'
                                    src={experience.logo}
                                    alt=''
                                />
                                <div className='flex flex-col'>
                                    <h3 className='card-title'>{experience.job_title}</h3>
                                    <p className='card-subtitle'>{experience.company}</p>
                                    <p className='card-accent font-mono'>{experience.type}</p>
                                    <p className='card-accent font-mono'>
                                        {experience.start} — {experience.end}
                                    </p>
                                    <p className='card-fine'>{experience.location}</p>
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-3 max-sm:flex-col sm:flex-col'>
                                <a
                                    href={experience.website}
                                    className='social-link'
                                    target='_blank'
                                    aria-label={`${experience.company} website (opens in new tab)`}
                                    rel='noopener noreferrer'
                                >
                                    <Icon icon='fa6-solid:globe' height='1.25em' width='1.25em' aria-hidden='true' />
                                </a>
                            </div>
                        </div>
                        {experience.details.length > 0 && (
                            <div className='font-normal leading-relaxed text-xs sm:leading-relaxed md:text-sm'>
                                <ul className='ml-4 list-disc space-y-1 pr-2 marker:text-neon/60'>
                                    {experience.details.map((detail, detailIndex) => (
                                        <li key={`${index}-${detailIndex}`}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <SkillButton skills={experience.technologies} />
                    </div>
                </TimelineItem>
            ))}
        </Timeline>
    );
};

export default ExperienceList;
