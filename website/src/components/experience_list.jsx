import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import SkillButton from './skill_button';
import { Board, DepartureRow } from './ui/primitives';

const ONGOING = new Set(['---', 'now', 'present', '']);
const isOngoing = (end) => ONGOING.has(String(end).trim().toLowerCase());

const ExperienceList = () => {
    const { data, loading, error } = useJsonData('career_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <Board columns={['Line', 'Destination — Role / Operator', 'Since / Status']}>
            {data.Experience.map((experience, index) => {
                const ongoing = isOngoing(experience.end);
                return (
                    <li key={`${experience.company}-${experience.start}`}>
                        <DepartureRow
                            index={index}
                            letter={experience.company.charAt(0)}
                            destination={experience.job_title}
                            operator={experience.company}
                            since={experience.start}
                            status={ongoing ? 'on' : 'past'}
                            statusLabel={ongoing ? 'On Time' : 'Departed'}
                            defaultOpen={index === 0}
                        >
                            <div className='flex flex-col gap-3'>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex gap-3'>
                                        <img
                                            className='size-12 rounded ring-1 ring-border sm:size-14'
                                            src={experience.logo}
                                            alt=''
                                        />
                                        <div className='flex flex-col'>
                                            <p className='card-accent'>{experience.type}</p>
                                            <p className='card-accent tabular'>
                                                {experience.start} — {experience.end}
                                            </p>
                                            <p className='card-fine'>{experience.location}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={experience.website}
                                        className='social-link'
                                        target='_blank'
                                        aria-label={`${experience.company} website (opens in new tab)`}
                                        rel='noopener noreferrer'
                                    >
                                        <Icon icon='fa6-solid:globe' height='1.1em' width='1.1em' aria-hidden='true' />
                                    </a>
                                </div>
                                {experience.details.length > 0 && (
                                    <ul className='ml-1 flex list-none flex-col gap-1.5 text-xs leading-relaxed text-content-body md:text-sm'>
                                        {experience.details.map((detail, detailIndex) => (
                                            <li key={`${index}-${detailIndex}`} className='flex gap-2'>
                                                <span aria-hidden='true' className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon/70' />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <SkillButton skills={experience.technologies} />
                            </div>
                        </DepartureRow>
                    </li>
                );
            })}
        </Board>
    );
};

export default ExperienceList;
