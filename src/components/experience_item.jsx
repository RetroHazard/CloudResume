import React from 'react';

import { Icon } from '@iconify-icon/react';

const ExperienceItem = ({ company, job_title, type, start, end, logo, website, technologies }) => {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2 justify-between w-full">
                <div className="flex gap-4">
                    <img className="hidden rounded-xl sm:block h-[8rem] w-[8rem]" src={logo} alt={`${company} logo`} />
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
                    <li>In tristique vulputate augue vel egestas.</li>
                    <li>Quisque ac imperdiet tortor, at lacinia ex.</li>
                    <li>Duis vel ex hendrerit, commodo odio sed, aliquam enim.</li>
                    <li>Ut arcu nulla, tincidunt eget arcu eget, molestie vulputate nisi.</li>
                    <li>Nunc malesuada leo et est iaculis facilisis.</li>
                    <li>Fusce eu urna ut magna malesuada fringilla.</li>
                </ul>
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="font-medium text-content-accent">Technologies:</span>
                <div className="flex gap-3 flex-wrap">
                    {technologies.map((tech, index) => (
                        Object.values(tech).map((skill, i) => (
                            <a className="skill-block" href={skill.website} target="_blank" rel="noopener noreferrer">
                                <Icon className="icon-box" icon={skill.logo} width="1.1rem" height="1.1rem" />
                                {skill.name}
                            </a>
                        ))
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExperienceItem;
