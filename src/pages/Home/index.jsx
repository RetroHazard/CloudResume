import React from 'react';

import PersonalSummary from '../../components/personal_summary';
import SocialLinks from '../../components/social_links';
import DataLoader from '../../utils/dataLoader';

const jsonTarget = 'personal_data.json';

function Home() {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                const personalData = data;
                return (
                    <div className='content-block' id='profile'>
                        <div className='flex flex-col items-start gap-6 max-sm:flex-row sm:flex-row'>
                            <div className='flex flex-col items-center gap-4'>
                                <img
                                    className='max-w-none rounded-lg max-sm:size-40 sm:size-40 md:size-56'
                                    src={personalData.profilePicture}
                                    alt='Headshot'
                                />
                                <div className='flex flex-col'>
                                    <SocialLinks />
                                </div>
                            </div>
                            <div className='flex w-full flex-col gap-5'>
                                <div className='flex w-full flex-col justify-between gap-2 sm:flex-row'>
                                    <div className='w-full'>
                                        <h1 className='h1 mb-0 font-extrabold text-content-header max-sm:text-sm sm:text-sm md:text-lg'>
                                            {personalData.fullName}
                                        </h1>
                                        <h2 className='mb-0 text-base font-medium text-content-header max-sm:text-sm sm:text-sm md:text-base'>
                                            {personalData.jobTitle}
                                        </h2>
                                    </div>
                                </div>
                                <div className='flex flex-col gap-6'>
                                    <div className='inline-grid xl:grid-cols-[auto_auto]'>
                                        <div>
                                            <span className='font-medium text-content-subtitle max-sm:text-xs sm:text-sm md:text-base'>
                                                Location:{' '}
                                            </span>
                                            <span className='text-content-accent max-sm:text-xs sm:text-sm md:text-base'>
                                                {personalData.location}
                                            </span>
                                        </div>
                                        <div>
                                            <span className='font-medium text-content-subtitle max-sm:text-xs sm:text-sm md:text-base'></span>
                                        </div>
                                        <div>
                                            <span className='font-medium text-content-subtitle max-sm:text-xs sm:text-sm md:text-base'>
                                                Salary:{' '}
                                            </span>
                                            <span className='text-content-accent max-sm:text-xs sm:text-sm md:text-base'>
                                                <iconify-icon
                                                    inline=''
                                                    className='icon-box'
                                                    icon={personalData.currency_icon}
                                                />
                                                {personalData.salary} {personalData.currency}
                                            </span>
                                        </div>
                                    </div>
                                    <a href={personalData.resumeLink} className='font-bold'>
                                        <button className='inline-flex items-center rounded bg-primary-500 px-4 py-2 font-bold text-secondary-800 hover:bg-primary-400'>
                                            <div className='icon-box'>
                                                <i className='mr-2 h-5 w-5 text-content-icons'>
                                                    <iconify-icon
                                                        inline=''
                                                        className='icon-box mb-1'
                                                        icon='fa6-solid:cloud-arrow-down'
                                                    />
                                                </i>
                                            </div>
                                            <span className='text-sm text-content-header max-sm:text-xs max-sm:font-light'>
                                                Download CV
                                            </span>
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <PersonalSummary />
                            <div className='flex flex-wrap gap-3'>
                                <div className='open-for-block'>Open for work</div>
                                <div className='open-for-block'>Available for consulting</div>
                                <div className='open-for-block'>Looking to learn</div>
                                <div className='open-for-block'>Working on side project</div>
                            </div>
                        </div>
                    </div>
                );
            }}
        </DataLoader>
    );
}

export default Home;
