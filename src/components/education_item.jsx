import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';

const EducationItem = ({ school, degree, category, start, end, logo, website }) => (
    <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-between w-full">
            <div className="flex gap-4">
                <img className="hidden rounded-md sm:block h-[6.5rem] w-[6.5rem]" src={logo} alt={`${school} logo`} />
                <div className="flex flex-col">
                    <h3 className="h3 font-extrabold text-content-title mb-0">{school}</h3>
                    <p className="text-content-subtitle font-semibold leading-snug mb-0.5">{degree}</p>
                    <p className="text-content-accent font-light text-base leading-snug mb-0.5">{category}</p>
                    <p className="font-medium text-sm text-content-date mb-0">{start} - {end}</p>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                <a href={website} className="social-link" target="_blank" aria-label="Website">
                    <i><FontAwesomeIcon icon={faGlobe} size={"lg"} /></i>
                </a>
            </div>
        </div>
        <p className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-0">
            Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at <em>vestibulum</em>.
        </p>
    </div>
);

export default EducationItem;
