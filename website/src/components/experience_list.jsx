import React from 'react';
import DataLoader from '../utils/dataLoader';
import { Icon } from '@iconify-icon/react';
import SkillButton from './skill_button';

const jsonTarget = 'career_data.json';

const ExperienceList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div className='skill-list'>
                        {data.Experience.map((experience, index) => (
                            <div className='flex flex-col gap-3' key={index}>
                                <div className='flex w-full justify-between gap-2'>
                                    <div className='flex gap-4'>
                                        <img
                                            className='hidden h-[7rem] w-[7rem] rounded-xl sm:block'
                                            src={experience.logo}
                                            alt={`${experience.company} logo`}
                                        />
                                        <div className='flex flex-col'>
                                            <h3 className='h3 mb-0 font-extrabold text-content-title max-sm:text-sm sm:text-xs md:text-base'>
                                                {experience.job_title}
                                            </h3>
                                            <p className='mb-0.5 font-semibold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                                                {experience.company}
                                            </p>
                                            <p className='mb-0 font-medium leading-snug text-content-accent max-sm:text-xs sm:text-xs md:text-sm'>
                                                {experience.type}
                                            </p>
                                            <p className='mb-0 font-medium leading-snug text-content-date max-sm:text-xs sm:text-xs md:text-sm'>
                                                {experience.start} - {experience.end}
                                            </p>
                                            <p className='mb-0 font-light leading-snug text-content-accent max-sm:text-xs sm:text-xs md:text-xs'>
                                                {experience.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex flex-wrap gap-3 max-sm:flex-col sm:flex-col'>
                                        <a
                                            href={experience.website}
                                            className='social-link'
                                            target='_blank'
                                            aria-label='Website'
                                            rel='noopener noreferrer'
                                        >
                                            <Icon icon='fa6-solid:globe' height='1.25em' width='1.25em' />
                                        </a>
                                    </div>
                                </div>
                                <div className='mb-3 font-normal leading-relaxed max-sm:text-xs sm:text-xs sm:leading-relaxed md:text-sm'>
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
                                    <div className='my-6 h-px w-full bg-secondary-600'></div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            }}
        </DataLoader>
    );
};

export default ExperienceList;
