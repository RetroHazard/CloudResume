import React from 'react';
import DataLoader from "../utils/dataLoader";
import { Icon } from '@iconify-icon/react';
import SkillButton from "./skill_button";

const jsonTarget = "project_data.json";

const ProjectList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div>
                        {data.Projects.map((project, index) => (
                            <div className="flex flex-col gap-6" key={index}>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col w-full gap-4">
                                        <div className="flex gap-4">
                                            <img className="hidden rounded-xl sm:block h-[6.5rem] w-[6.5rem]" src={project.logo} alt={`${project.name} logo`}/>
                                            <div className="flex justify-between w-full">
                                                <div className="flex flex-col w-full">
                                                    <div>
                                                        <h3 className="h3 font-extrabold text-content-title mb-0">{project.name}</h3>
                                                    </div>
                                                    <div className="flex gap-24">
                                                        <div className="flex flex-col">
                                                            <span className="text-content-accent"><strong>Company:</strong> {project.company}</span>
                                                            <span className="text-content-accent"><strong>Category:</strong> {project.category}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-content-accent"><strong>Project Role:</strong> {project.role}</span>
                                                            <span className="text-content-accent"><strong>Team Size:</strong> {project.size}</span>
                                                        </div>
                                                    </div>
                                                    <p className="font-medium text-sm text-content-date mb-0">{project.start} - {project.end}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {project.links && project.links.map((linkGroup, idx) =>
                                                        Object.keys(linkGroup).map((linkType) => (
                                                            linkGroup[linkType].map((link, linkIdx) => (
                                                                <a key={`${idx}-${linkType}-${linkIdx}`} href={link.website}
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

                                    <div className="text-sm font-light leading-relaxed sm:leading-relaxed mb-3">
                                        <ul className="list-disc px-16">
                                            {project.details.map((detail, detailIndex) => (
                                                <li key={`${index}-${detailIndex}`}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="font-medium text-content-subtitle">Technologies:</span>
                                    <SkillButton skills={project.technologies}/>
                                </div>
                                {index < data.Projects.length - 1 && <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                            </div>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default ProjectList;
