import React from 'react';

import {Icon} from "@iconify-icon/react";

function NoticeBanner() {
    return (
    <>
        <div className="inline-flex flex-row justify-center w-full">
            <div className="flex justify-center justify-items-center bg-secondary-600 h-20 mt-5 mb-5 w-3/5">
                <div className="icon-box mr-20">
                    <Icon icon="fa6-solid:screwdriver-wrench" height="2em"/>
                </div>
                <div className="icon-box mb-1 text-center">
                    <h1 className='text-4xl'>THIS PAGE IS UNDER CONSTRUCTION</h1>
                    <h3 className='text-2xl'>SOME FEATURES MAY BE UNAVAILABLE</h3>
                </div>
                <div className="icon-box ml-20">
                    <Icon icon="fa6-solid:screwdriver-wrench" height="2em"/>
                </div>

            </div>
        </div>
    </>
    )
}

export default NoticeBanner;