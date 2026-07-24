import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { Timeline, TimelineItem } from './ui/primitives';

const EducationList = () => {
    const { data, loading, error } = useJsonData('education_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <Timeline>
            {data.Education.map((item, index) => (
                <TimelineItem key={`${item.school}-${item.start}`} delay={index * 0.05}>
                    <div className='flex flex-col gap-3'>
                        <div className='flex w-full justify-between gap-2'>
                            <div className='flex gap-4'>
                                <img
                                    className='size-10 rounded-xl ring-1 ring-border sm:size-20'
                                    src={item.logo}
                                    alt=''
                                />
                                <div className='flex flex-col'>
                                    <h3 className='card-title'>{item.school}</h3>
                                    <p className='card-subtitle'>{item.degree}</p>
                                    <p className='card-accent font-mono'>{item.category}</p>
                                    <p className='card-accent font-mono'>
                                        {item.start} — {item.end}
                                    </p>
                                    <p className='card-fine'>{item.location}</p>
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-3 max-sm:flex-col sm:flex-col'>
                                {item.links &&
                                    item.links.map((linkGroup, linkIndex) =>
                                        Object.keys(linkGroup).map((linkType) =>
                                            linkGroup[linkType].map((link, idx) => (
                                                <a
                                                    key={`${linkIndex}-${linkType}-${idx}`}
                                                    href={link.website}
                                                    className='social-link'
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    aria-label={`${item.school} ${linkType} (opens in new tab)`}
                                                >
                                                    <Icon icon={link.icon} height='1.25em' width='1.25em' aria-hidden='true' />
                                                </a>
                                            )),
                                        ),
                                    )}
                            </div>
                        </div>
                        {item.details.length > 0 && (
                            <div className='font-normal leading-relaxed text-xs sm:leading-relaxed md:text-sm'>
                                <ul className='ml-4 list-disc space-y-1 pr-2 marker:text-neon/60'>
                                    {item.details.map((detail, detailIndex) => (
                                        <li key={`${index}-${detailIndex}`}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </TimelineItem>
            ))}
        </Timeline>
    );
};

export default EducationList;
