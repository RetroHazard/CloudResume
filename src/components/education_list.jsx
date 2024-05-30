import React from 'react';
import DataLoader from '../utils/dataLoader';
import { Icon } from '@iconify-icon/react';

const jsonTarget = 'education_data.json';

const EducationList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div>
                        {data.Education.map((item, index) => (
                            <div className='flex flex-col gap-3' key={index}>
                                <div className='flex w-full justify-between gap-2'>
                                    <div className='flex gap-4'>
                                        <img
                                            className='hidden h-[7rem] w-[7rem] rounded-xl sm:block'
                                            src={item.logo}
                                            alt={`${item.school} Logo`}
                                        />
                                        <div className='flex flex-col'>
                                            <h3 className='h3 mb-0 font-extrabold text-content-title max-sm:text-sm sm:text-xs md:text-base'>
                                                {item.school}
                                            </h3>
                                            <p className='mb-0.5 font-semibold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                                                {item.degree}
                                            </p>
                                            <p className='mb-0 font-medium leading-snug text-content-accent max-sm:text-xs sm:text-xs md:text-sm'>
                                                {item.category}
                                            </p>
                                            <p className='mb-0 font-medium leading-snug text-content-date max-sm:text-xs sm:text-xs md:text-sm'>
                                                {item.start} - {item.end}
                                            </p>
                                            <p className='mb-0 font-light leading-snug text-content-accent max-sm:text-xs sm:text-xs md:text-xs'>
                                                {item.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className='flex flex-wrap gap-3 max-sm:flex-col sm:flex-col'
                                        id={`${item.school} Links`}
                                    >
                                        {item.links &&
                                            item.links.map((linkGroup, linkIndex) =>
                                                Object.keys(linkGroup).map((linkType) =>
                                                    linkGroup[linkType].map((link, idx) => (
                                                        <a
                                                            key={`${linkIndex}-${linkType}-${idx}`}
                                                            href={link.website}
                                                            className='social-link'
                                                            target='_blank'
                                                            aria-label={linkType}
                                                            rel='noopener noreferrer'
                                                        >
                                                            <Icon icon={link.icon} height='1.25em' width='1.25em' />
                                                        </a>
                                                    )),
                                                ),
                                            )}
                                    </div>
                                </div>
                                <div className='mb-3 font-normal leading-relaxed max-sm:text-xs sm:text-xs sm:leading-relaxed md:text-sm'>
                                    <ul className='list-disc pl-10 pr-5'>
                                        {item.details.map((detail, detailIndex) => (
                                            <li key={`${index}-${detailIndex}`}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                                {index < data.Education.length - 1 && (
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

export default EducationList;
