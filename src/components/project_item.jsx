import React from 'react';

import { Icon } from '@iconify-icon/react';
import SkillButton from "./skill_button";

const ProjectItem = ({ name, company, category, role, size, start, end, logo, details, links, technologies }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col w-full gap-4">
                    <div className="flex gap-4">
                        <img className="hidden rounded-xl sm:block h-[6.5rem] w-[6.5rem]" src={logo} alt={`${name} logo`}/>
                        <div className="flex justify-between w-full">
                            <div className="flex flex-col w-full">
                                <div>
                                    <h3 className="h3 font-extrabold text-content-title mb-0">{name}</h3>
                                </div>
                                <div className="flex gap-24">
                                    <div className="flex flex-col">
                                        <span className="text-content-accent"><strong>Company:</strong> {company}</span>
                                        <span className="text-content-accent"><strong>Category:</strong> {category}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-content-accent"><strong>Project Role:</strong> {role}</span>
                                        <span className="text-content-accent"><strong>Team Size:</strong> {size}</span>
                                    </div>
                                </div>
                                <p className="font-medium text-sm text-content-date mb-0">{start} - {end}</p>
                            </div>
                            <div className="flex gap-2">
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
            <div className="flex flex-col gap-1.5">
                <span className="font-medium text-content-subtitle">Technologies:</span>
                <SkillButton skills={technologies}/>
            </div>
        </div>
    );
};

export default ProjectItem;
