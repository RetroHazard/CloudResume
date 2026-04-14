import { Icon } from '@iconify-icon/react';
import { useJsonData, LoadingSkeleton } from '../utils/useJsonData';

const EducationList = () => {
    const { data, loading, error } = useJsonData('education_data.json');
    if (loading) return <LoadingSkeleton />;
    if (error || !data) return null;
    return (
        <div>
            {data.Education.map((item, index) => (
                <div className='flex flex-col gap-3' key={`${item.school}-${item.start}`}>
                    <div className='flex w-full justify-between gap-2'>
                        <div className='flex gap-4'>
                            <img
                                className='size-10 rounded-xl sm:size-28'
                                src={item.logo}
                                alt=''
                            />
                            <div className='flex flex-col'>
                                <h3 className='card-title'>{item.school}</h3>
                                <p className='card-subtitle'>{item.degree}</p>
                                <p className='card-accent'>{item.category}</p>
                                <p className='card-accent'>{item.start} - {item.end}</p>
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
                    <div className='mb-3 font-normal leading-relaxed text-xs sm:leading-relaxed sm:text-xs md:text-sm'>
                        <ul className='list-disc pl-10 pr-5'>
                            {item.details.map((detail, detailIndex) => (
                                <li key={`${index}-${detailIndex}`}>{detail}</li>
                            ))}
                        </ul>
                    </div>
                    {index < data.Education.length - 1 && (
                        <div className='my-6 h-px w-full bg-secondary-600' />
                    )}
                </div>
            ))}
        </div>
    );
};

export default EducationList;
