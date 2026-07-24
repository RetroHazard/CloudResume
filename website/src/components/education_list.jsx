import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';
import { Board, DepartureRow } from './ui/primitives';

const EducationList = () => {
    const { data, loading, error } = useJsonData('education_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <Board columns={['Line', 'Station — Institution / Programme', 'Years']}>
            {data.Education.map((item, index) => (
                <li key={`${item.school}-${item.start}`}>
                    <DepartureRow
                        index={index}
                        letter={item.school.charAt(0)}
                        destination={item.school}
                        operator={item.degree}
                        since={item.start}
                        status='past'
                        statusLabel='Completed'
                        defaultOpen={index === 0}
                    >
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-start justify-between gap-3'>
                                <div className='flex gap-3'>
                                    <img
                                        className='size-12 rounded ring-1 ring-border sm:size-14'
                                        src={item.logo}
                                        alt=''
                                    />
                                    <div className='flex flex-col'>
                                        <p className='card-accent'>{item.category}</p>
                                        <p className='card-accent tabular'>
                                            {item.start} — {item.end}
                                        </p>
                                        <p className='card-fine'>{item.location}</p>
                                    </div>
                                </div>
                                <div className='flex flex-wrap gap-2 max-sm:flex-col sm:flex-col'>
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
                                                        <Icon icon={link.icon} height='1.1em' width='1.1em' aria-hidden='true' />
                                                    </a>
                                                )),
                                            ),
                                        )}
                                </div>
                            </div>
                            {item.details.length > 0 && (
                                <ul className='ml-1 flex list-none flex-col gap-1.5 text-xs leading-relaxed text-content-body md:text-sm'>
                                    {item.details.map((detail, detailIndex) => (
                                        <li key={`${index}-${detailIndex}`} className='flex gap-2'>
                                            <span aria-hidden='true' className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon/70' />
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </DepartureRow>
                </li>
            ))}
        </Board>
    );
};

export default EducationList;
