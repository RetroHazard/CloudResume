import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import SkillButton from './skill_button';

const ExperienceList = () => {
    const { data, loading, error } = useJsonData('career_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <div className='skill-list'>
            {data.Experience.map((experience, index) => (
                <div className='flex flex-col gap-3' key={`${experience.company}-${experience.start}`}>
                    <div className='flex w-full justify-between gap-2'>
                        <div className='flex gap-4'>
                            <img
                                className='size-10 rounded-xl sm:size-28'
                                src={experience.logo}
                                alt=''
                            />
                            <div className='flex flex-col'>
                                <h3 className='card-title'>{experience.job_title}</h3>
                                <p className='card-subtitle'>{experience.company}</p>
                                <p className='card-accent'>{experience.type}</p>
                                <p className='card-accent'>{experience.start} - {experience.end}</p>
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
                    <div className='mb-3 font-normal leading-relaxed text-xs sm:leading-relaxed sm:text-xs md:text-sm'>
                        <ul className='list-disc pl-10 pr-5'>
                            {experience.details.map((detail, detailIndex) => (
                                <li key={`${index}-${detailIndex}`}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <SkillButton skills={experience.technologies} />
                    </div>
                    {index < data.Experience.length - 1 && (
                        <div className='my-6 h-px w-full bg-secondary-600' />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ExperienceList;
