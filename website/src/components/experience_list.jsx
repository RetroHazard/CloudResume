import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import SkillButton from './skill_button';
import { Board, Chip, DepartureRow } from './ui/primitives';
import { formatDate, formatRange, isOngoing } from '../utils/dates';

// A career entry is either a single posting (flat: job_title/start/end on the
// entry itself) or one employer the line called at more than once — a
// promotion, carried as a newest-first `roles` array. Both normalise to the
// same shape here so the board only has to know about roles.
const toRoles = (entry) => (Array.isArray(entry.roles) && entry.roles.length > 0 ? entry.roles : [entry]);

// Bullets and skill chips, identical whether the role stands alone or is one
// stop in a promotion track.
const RoleBody = ({ role, index }) => (
    <>
        {role.details?.length > 0 && (
            <ul className='ml-1 flex list-none flex-col gap-1.5 text-xs leading-relaxed text-content-body md:text-sm'>
                {role.details.map((detail, detailIndex) => (
                    <li key={`${index}-${detailIndex}`} className='flex gap-2'>
                        <span aria-hidden='true' className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon/70' />
                        <span>{detail}</span>
                    </li>
                ))}
            </ul>
        )}
        <SkillButton skills={role.technologies} />
    </>
);

// The promotion track: one stop per role, newest at the top, threaded on the
// company's own line. The marker between two stops is drawn from the newer
// role's `transition` label, so a lateral move never reads as a promotion.
const RoleTrack = ({ roles, index }) => (
    <ol className='ml-1 flex list-none flex-col gap-5 border-l border-border/70 pl-5'>
        {roles.map((role, roleIndex) => (
            <li key={`${role.job_title}-${role.start}`} className='relative flex flex-col gap-2'>
                {/* Outlined rather than filled: the print stylesheet strips every
                    background, and a filled dot would vanish on paper. */}
                <span
                    aria-hidden='true'
                    className='absolute top-1 -left-[1.625rem] size-3 rounded-full border-2 border-neon bg-background'
                />
                <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5'>
                    <p className='font-heading text-sm leading-tight font-bold tracking-wide text-content-title uppercase sm:text-base'>
                        {role.job_title}
                    </p>
                    <p className='tabular font-mono text-[0.7rem] text-content-subtitle'>
                        {formatRange(role.start, role.end)}
                    </p>
                </div>
                <RoleBody role={role} index={`${index}-${roleIndex}`} />
                {role.transition && roleIndex < roles.length - 1 && (
                    <p className='mt-1 flex items-center gap-2 font-mono text-[0.6rem] font-semibold tracking-[0.16em] text-content-accent uppercase'>
                        <span aria-hidden='true' className='text-neon'>
                            &uarr;
                        </span>
                        {role.transition} · <span className='tabular'>{formatDate(role.start)}</span>
                    </p>
                )}
            </li>
        ))}
    </ol>
);

const ExperienceList = () => {
    const { data, loading, error } = useJsonData('career_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <Board columns={['Line', 'Destination — Role / Operator', 'Since / Status']}>
            {data.Experience.map((experience, index) => {
                // Roles run newest-first, so the first is the title the row
                // advertises and the last dates the arrival at this employer.
                const roles = toRoles(experience);
                const [latest] = roles;
                const earliest = roles[roles.length - 1];
                const ongoing = isOngoing(latest.end);
                return (
                    <li key={`${experience.company}-${earliest.start}`}>
                        <DepartureRow
                            index={index}
                            letter={experience.company.charAt(0)}
                            destination={latest.job_title}
                            operator={experience.company}
                            since={formatDate(earliest.start)}
                            status={ongoing ? 'on' : 'past'}
                            statusLabel={ongoing ? 'On Time' : 'Departed'}
                            tag={roles.length > 1 && <Chip>{roles.length} Roles</Chip>}
                            defaultOpen={index === 0}
                            name='experience'
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
                                                {formatRange(earliest.start, latest.end)}
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
                                {roles.length > 1 ? (
                                    <RoleTrack roles={roles} index={index} />
                                ) : (
                                    <RoleBody role={latest} index={index} />
                                )}
                            </div>
                        </DepartureRow>
                    </li>
                );
            })}
        </Board>
    );
};

export default ExperienceList;
