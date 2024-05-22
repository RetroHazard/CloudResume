import React from 'react';

import {Icon} from "@iconify-icon/react";

function NoticeBanner() {
    if (process.env.REACT_APP_DATA_SET === 'development') {
        return (
        <div className="inline-flex flex-row justify-center w-full flex-nowrap">
            <div className="flex justify-center bg-secondary-600 rounded-b-xl h-20 w-fit">
                <div className="icon-box mr-14 ml-5">
                    <Icon icon="fa6-solid:screwdriver-wrench" height="2rem"/>
                </div>
                <div className="icon-box mb-1 mt-2 text-center">
                    <h1 className='sm:font-light md:font-semibold sm:text-base md:text-xl lg:text-2xl '>THIS PAGE IS UNDER CONSTRUCTION</h1>
                    <h3 className='sm:font-light md:font-semibold sm:text-sm md:text-base lg:text-lg '>SOME FEATURES MAY BE UNAVAILABLE</h3>
                </div>
                <div className="icon-box ml-14 mr-5">
                    <Icon icon="fa6-solid:screwdriver-wrench" height="2rem"/>
                </div>

            </div>
        </div>
        )
    }
}

export default NoticeBanner;