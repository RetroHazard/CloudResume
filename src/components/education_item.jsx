import React from 'react';

import { Icon } from "@iconify-icon/react";

const EducationItem = ({ school, degree, location, category, start, end, logo, links, details }) => (
    <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-between w-full">
            <div className="flex gap-4">
                <img className="hidden rounded-xl sm:block h-[6.5rem] w-[6.5rem]" src={logo} alt={`${school} Logo`}/>
                <div className="flex flex-col">
                    <h3 className="h3 font-extrabold text-content-title mb-0">{school}</h3>
                    <p className="font-semibold text-base text-content-subtitle leading-snug mb-0.5">{degree}</p>
                    <p className="font-medium text-sm text-content-accent leading-snug mb-0.5">{category}</p>
                    <p className="font-medium text-sm text-content-date leading-snug mb-0">{start} - {end}</p>
                    <p className="font-light text-xs text-content-accent leading-snug mb-0.5">{location}</p>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap sm:flex-nowrap" id={`${school} Links`}>
                {links && links.map((linkGroup, index) =>
                    Object.keys(linkGroup).map((linkType) => (
                        linkGroup[linkType].map((link, idx) => (
                            <a key={`${index}-${linkType}-${idx}`} href={link.website}
                               className="social-link" target="_blank" aria-label={linkType}
                               rel="noopener noreferrer">
                                <Icon icon={link.icon} height="1.25em" width="1.25em"/>
                            </a>
                        ))
                    ))
                )}
            </div>
        </div>
        <div className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-3">
            <ul className="list-disc pl-5">
                {details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                ))}
            </ul>
        </div>
    </div>
);

export default EducationItem;
