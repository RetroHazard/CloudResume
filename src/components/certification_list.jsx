import React from 'react';
import DataLoader from '../utils/dataLoader';
import { Icon } from '@iconify-icon/react';

const jsonTarget = 'certification_data.json';

const CertificationList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div>
                        {data.Certifications.map((item, index) => (
                            <div className='flex flex-col gap-3' key={index}>
                                <div className='flex w-full justify-between gap-2'>
                                    <div className='flex gap-4'>
                                        <img
                                            className='h-[5.7rem] w-[5.7rem] rounded-xl'
                                            src={item.logo}
                                            alt={`${item.certification} Logo`}
                                        />
                                        <div className='flex flex-col'>
                                            <h3 className='h3 mb-0 font-extrabold text-content-title max-sm:text-sm sm:text-xs md:text-base'>
                                                {item.certification}
                                            </h3>
                                            <p className='mb-0.5 font-semibold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                                                {item.issuer}
                                            </p>
                                            <p className='mb-0 font-medium leading-snug text-content-date max-sm:text-xs sm:text-xs md:text-sm'>
                                                <strong>Credential ID:</strong> {item.credential_id}
                                            </p>
                                            <p className='mb-0 font-medium leading-snug text-content-date max-sm:text-xs sm:text-xs md:text-sm'>
                                                <strong>Date Issued:</strong> {item.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className='flex flex-wrap gap-3 sm:flex-nowrap'
                                        id={`${item.certification} Links`}
                                    >
                                        {item.links.map((linkGroup, linkIndex) =>
                                            Object.entries(linkGroup).map(
                                                ([key, link]) =>
                                                    link[0].display &&
                                                    link[0].website && (
                                                        <a
                                                            key={`${key}-${linkIndex}`}
                                                            href={link[0].website}
                                                            className='social-link'
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                        >
                                                            <Icon icon={link[0].icon} height='1.25em' width='1.25em' />
                                                        </a>
                                                    ),
                                            ),
                                        )}
                                    </div>
                                </div>
                                {index < data.Certifications.length - 1 && (
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

export default CertificationList;
