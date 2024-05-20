import React from 'react';

import { Icon } from '@iconify-icon/react';
import SkillButton from "./skill_button";

const ExperienceItem = ({ company, job_title, type, start, end, logo, website, details, technologies }) => {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2 justify-between w-full">
                <div className="flex gap-4">
                    <img className="hidden rounded-xl sm:block h-[6rem] w-[6rem]" src={logo} alt={`${company} logo`} />
                    <div className="flex flex-col">
                        <h3 className="h3 text-content-title font-extrabold mb-0">{job_title}</h3>
                        <p className="text-content-subtitle font-semibold leading-snug mb-0.5">{company}</p>
                        <p className="font-medium text-sm text-content-date mb-0">{type}</p>
                        <p className="font-medium text-sm text-content-date mb-0">{start} - {end}</p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                    <a href={website} className="social-link" target="_blank" aria-label="Website" rel="noopener noreferrer">
                        <Icon icon="fa6-solid:globe" height="1.25em" width="1.25em" />
                    </a>
                </div>
            </div>
            <div className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-3">
                <ul className="list-disc pl-5"> {/* TODO: Retrieve List Items from JSON */}
                    {details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="font-medium text-content-accent">Technologies:</span>
                <SkillButton skills={technologies}/>
            </div>
        </div>
    );
};

export default ExperienceItem;
