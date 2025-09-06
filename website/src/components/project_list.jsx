import React from 'react';
import DataLoader from '../utils/dataLoader';
import { Icon } from '@iconify-icon/react';
import SkillButton from './skill_button';

const jsonTarget = 'project_data.json';

const ProjectList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div>
                        {data.Projects.map((project, index) => (
                            <div className='flex flex-col gap-6' key={index}>
                                <div className='flex flex-col gap-4'>
                                    <div className='flex w-full flex-col gap-4'>
                                        <div className='flex gap-4'>
                                            <img
                                                className='hidden h-[7rem] w-[7rem] rounded-xl sm:block'
                                                src={project.logo}
                                                alt={`${project.name} logo`}
                                            />
                                            <div className='flex w-full justify-between'>
                                                <div className='flex flex-col'>
                                                    <h3 className='h3 mb-0 font-extrabold text-content-title max-sm:text-sm sm:text-xs md:text-base'>
                                                        {project.name}
                                                    </h3>
                                                    <p className='mb-0.5 font-semibold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                                                        {project.company}
                                                    </p>
                                                    <p className='mb-0 font-medium leading-snug text-content-accent max-sm:text-xs sm:text-xs md:text-sm'>
                                                        {project.role}
                                                    </p>
                                                    <p className='mb-0 font-medium leading-snug text-content-date max-sm:text-xs sm:text-xs md:text-sm'>
                                                        {project.start} - {project.end}
                                                    </p>
                                                    <p className='mb-0 font-light leading-snug text-content-accent max-sm:text-xs sm:text-xs md:text-xs'>
                                                        {project.category}
                                                    </p>
                                                </div>
                                                <div className='flex flex-wrap gap-3 max-sm:flex-col sm:flex-col'>
                                                    {project.links &&
                                                        project.links.map((linkGroup, idx) =>
                                                            Object.keys(linkGroup).map((linkType) =>
                                                                linkGroup[linkType].map((link, linkIdx) => (
                                                                    <a
                                                                        key={`${idx}-${linkType}-${linkIdx}`}
                                                                        href={link.website}
                                                                        className='social-link'
                                                                        target='_blank'
                                                                        aria-label={linkType}
                                                                        rel='noopener noreferrer'
                                                                    >
                                                                        <Icon
                                                                            icon={link.icon}
                                                                            height='1.25em'
                                                                            width='1.25em'
                                                                        />
                                                                    </a>
                                                                )),
                                                            ),
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='mb-3 font-normal leading-relaxed max-sm:text-xs sm:text-xs sm:leading-relaxed md:text-sm'>
                                        <ul className='list-disc pl-10 pr-5'>
                                            {project.details.map((detail, detailIndex) => (
                                                <li key={`${index}-${detailIndex}`}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-1.5'>
                                    <SkillButton skills={project.technologies} />
                                </div>
                                {index < data.Projects.length - 1 && (
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

export default ProjectList;
