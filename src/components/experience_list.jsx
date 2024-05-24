import React from 'react';
import DataLoader from "../utils/dataLoader";
import { Icon } from '@iconify-icon/react';
import SkillButton from "./skill_button";

const jsonTarget = "career_data.json";

const ExperienceList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div className="skill-list">
                        {data.Experience.map((experience, index) => (
                            <div className="flex flex-col gap-3" key={index}>
                                <div className="flex gap-2 justify-between w-full">
                                    <div className="flex gap-4">
                                        <img className="hidden rounded-xl sm:block h-[6.5rem] w-[6.5rem]"
                                             src={experience.logo} alt={`${experience.company} logo`}/>
                                        <div className="flex flex-col">
                                            <h3 className="h3 text-content-title font-extrabold mb-0">{experience.job_title}</h3>
                                            <p className="text-content-subtitle font-semibold leading-snug mb-0.5">{experience.company}</p>
                                            <p className="font-medium text-sm text-content-date mb-0">{experience.type}</p>
                                            <p className="font-medium text-sm text-content-date mb-0">{experience.start} - {experience.end}</p>
                                            <p className="font-light text-xs text-content-accent leading-snug mb-0.5">{experience.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                        <a href={experience.website} className="social-link" target="_blank"
                                           aria-label="Website" rel="noopener noreferrer">
                                            <Icon icon="fa6-solid:globe" height="1.25em" width="1.25em"/>
                                        </a>
                                    </div>
                                </div>
                                <div className="text-sm font-light leading-relaxed sm:leading-relaxed mb-3">
                                    <ul className="list-disc px-16">
                                        {experience.details.map((detail, detailIndex) => (
                                            <li key={`${index}-${detailIndex}`}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="font-medium text-content-accent">Technologies:</span>
                                    <SkillButton skills={experience.technologies}/>
                                </div>
                                {index < data.Experience.length - 1 &&
                                    <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                            </div>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default ExperienceList;
