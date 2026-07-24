import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import SkillButton from './skill_button';
import { Timeline, TimelineItem } from './ui/primitives';

const ProjectList = () => {
    const { data, loading, error } = useJsonData('project_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <Timeline>
            {data.Projects.map((project, index) => (
                <TimelineItem key={`${project.name}-${project.start}`} delay={index * 0.05}>
                    <div className='flex flex-col gap-4'>
                        <div className='flex gap-4'>
                            <img
                                className='size-10 rounded-xl ring-1 ring-border sm:size-20'
                                src={project.logo}
                                alt=''
                            />
                            <div className='flex w-full justify-between gap-2'>
                                <div className='flex flex-col'>
                                    <h3 className='card-title'>{project.name}</h3>
                                    <p className='card-subtitle'>{project.company}</p>
                                    <p className='card-accent font-mono'>{project.role}</p>
                                    <p className='card-accent font-mono'>
                                        {project.start} — {project.end}
                                    </p>
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
                        {project.details.length > 0 && (
                            <div className='font-normal leading-relaxed text-xs sm:leading-relaxed md:text-sm'>
                                <ul className='ml-4 list-disc space-y-1 pr-2 marker:text-neon/60'>
                                    {project.details.map((detail, detailIndex) => (
                                        <li key={`${index}-${detailIndex}`}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <SkillButton skills={project.technologies} />
                    </div>
                </TimelineItem>
            ))}
        </Timeline>
    );
};

export default ProjectList;
