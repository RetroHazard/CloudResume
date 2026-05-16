import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import SkillButton from './skill_button';

const ProjectList = () => {
    const { data, loading, error } = useJsonData('project_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <div>
            {data.Projects.map((project, index) => (
                <div className='flex flex-col gap-6' key={`${project.name}-${project.start}`}>
                    <div className='flex flex-col gap-4'>
                        <div className='flex w-full flex-col gap-4'>
                            <div className='flex gap-4'>
                                <img
                                    className='size-10 rounded-xl sm:size-28'
                                    src={project.logo}
                                    alt=''
                                />
                                <div className='flex w-full justify-between'>
                                    <div className='flex flex-col'>
                                        <h3 className='card-title'>{project.name}</h3>
                                        <p className='card-subtitle'>{project.company}</p>
                                        <p className='card-accent'>{project.role}</p>
                                        <p className='card-accent'>{project.start} - {project.end}</p>
                                        <p className='card-fine'>{project.category}</p>
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
                                                            aria-label={`${project.name} ${linkType} (opens in new tab)`}
                                                            rel='noopener noreferrer'
                                                        >
                                                            <Icon icon={link.icon} height='1.25em' width='1.25em' aria-hidden='true' />
                                                        </a>
                                                    )),
                                                ),
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='mb-3 font-normal leading-relaxed text-xs sm:leading-relaxed sm:text-xs md:text-sm'>
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
                        <div className='my-6 h-px w-full bg-secondary-600' />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ProjectList;
