import React from 'react';

import { Icon } from '@iconify-icon/react';

function NoticeBanner() {
    if (process.env.REACT_APP_DATA_SET === 'development') {
        return (
            <div className='inline-flex w-full flex-row flex-nowrap justify-center'>
                <div className='flex h-20 w-fit justify-center rounded-b-xl bg-secondary-600'>
                    <div className='icon-box ml-5 mr-14'>
                        <Icon icon='fa6-solid:screwdriver-wrench' height='2rem' />
                    </div>
                    <div className='icon-box mb-1 mt-2 text-center'>
                        <h1 className='sm:text-base sm:font-light md:text-xl md:font-semibold lg:text-2xl '>
                            THIS PAGE IS UNDER CONSTRUCTION
                        </h1>
                        <h3 className='sm:text-sm sm:font-light md:text-base md:font-semibold lg:text-lg '>
                            SOME FEATURES MAY BE UNAVAILABLE
                        </h3>
                    </div>
                    <div className='icon-box ml-14 mr-5'>
                        <Icon icon='fa6-solid:screwdriver-wrench' height='2rem' />
                    </div>
                </div>
            </div>
        );
    }
}

export default NoticeBanner;
