import React from 'react';

import { Icon } from "@iconify-icon/react";

const EducationItem = ({ school, degree, category, start, end, logo, website }) => (
    <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-between w-full">
            <div className="flex gap-4">
                <img className="hidden rounded-xl sm:block h-[8rem] w-[8rem]" src={logo} alt={`${school} Logo`} />
                <div className="flex flex-col">
                    <h3 className="h3 font-extrabold text-content-title mb-0">{school}</h3>
                    <p className="text-content-subtitle font-semibold leading-snug mb-0.5">{degree}</p>
                    <p className="text-content-accent font-light text-base leading-snug mb-0.5">{category}</p>
                    <p className="font-medium text-sm text-content-date mb-0">{start} - {end}</p>
                </div>
            </div>
            {/* TODO: Add Conditional, Edit Program Data Link */}
            <div className="flex gap-3 flex-wrap sm:flex-nowrap" id={`${school} Links`}>
                <a href={website} className="social-link" target="_blank" aria-label={`${school} Program Info`}>
                    <Icon icon="fa6-solid:circle-info" height="1.25em" width="1.25em"/>
                </a>
                <a href={website} className="social-link" target="_blank" aria-label={`${school} Website`}>
                    <Icon icon="fa6-solid:globe" height="1.25em" width="1.25em"/>
                </a>
            </div>
        </div>
        <p className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-0"> {/* TODO: Retrieve Additional Text from JSON */}
            Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at <em>vestibulum</em>.
        </p>
    </div>
);

export default EducationItem;
