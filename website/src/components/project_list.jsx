import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import SkillButton from './skill_button';
import { Board, DepartureRow } from './ui/primitives';

const ONGOING = new Set(['---', 'now', 'present', '']);
const isOngoing = (end) => ONGOING.has(String(end).trim().toLowerCase());

const ProjectList = () => {
    const { data, loading, error } = useJsonData('project_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <Board columns={['Line', 'Service — Project / Studio', 'Since / Status']}>
            {data.Projects.map((project, index) => {
                const ongoing = isOngoing(project.end);
                return (
                    <li key={`${project.name}-${project.start}`}>
                        <DepartureRow
                            index={index}
                            letter={project.name.charAt(0)}
                            destination={project.name}
                            operator={project.company}
                            since={project.start}
                            status={ongoing ? 'on' : 'past'}
                            statusLabel={ongoing ? 'Running' : 'Completed'}
                            defaultOpen={index === 0}
                            name='projects'
                        >
                            <div className='flex flex-col gap-3'>
                                <div className='flex items-start justify-between gap-3'>
                                    <div className='flex gap-3'>
                                        <img
                                            className='size-12 rounded ring-1 ring-border sm:size-14'
                                            src={project.logo}
                                            alt=''
                                        />
                                        <div className='flex flex-col'>
                                            <p className='card-accent'>{project.category}</p>
                                            <p className='card-accent'>{project.role}</p>
                                            <p className='card-accent tabular'>
                                                {project.start} — {project.end}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex flex-wrap justify-end gap-2'>
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
                                                            <Icon icon={link.icon} height='1.1em' width='1.1em' aria-hidden='true' />
                                                        </a>
                                                    )),
                                                ),
                                            )}
                                    </div>
                                </div>
                                {project.details.length > 0 && (
                                    <ul className='ml-1 flex list-none flex-col gap-1.5 text-xs leading-relaxed text-content-body md:text-sm'>
                                        {project.details.map((detail, detailIndex) => (
                                            <li key={`${index}-${detailIndex}`} className='flex gap-2'>
                                                <span aria-hidden='true' className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon/70' />
                                                <span>{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <SkillButton skills={project.technologies} />
                            </div>
                        </DepartureRow>
                    </li>
                );
            })}
        </Board>
    );
};

export default ProjectList;
