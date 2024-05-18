import React from 'react';

import { Icon } from '@iconify-icon/react';

const ProjectItem = ({ project }) => {
    const { name, company, category, role, size, start, end, logo, links, technologies } = project;
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col w-full gap-4">
                    <div className="flex gap-4">
                        <img className="hidden rounded-xl sm:block h-[6rem] w-[6rem]" src={logo} alt={`${name} logo`} />
                        <div className="flex justify-between w-full">
                            <div className="flex flex-col w-full">
                                <div>
                                    <h3 className="h3 text-content-subtitle font-extrabold mb-0">{name}</h3>
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
                                {links[0]?.demo && links[0].demo.map((link, index) => (
                                    <a href={link.website} className="social-link" target="_blank" aria-label="Demo" rel="noopener noreferrer">
                                        <Icon icon={link.icon} height="1.25em" width="1.25em" />
                                    </a>
                                ))}
                                {links[0]?.spec && links[0].spec.map((link, index) => (
                                    <a href={link.website} className="social-link" target="_blank" aria-label="Spec" rel="noopener noreferrer">
                                        <Icon icon={link.icon} height="1.25em" width="1.25em" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm leading-relaxed sm:leading-relaxed sm:text-base">
                    <p>In tristique vulputate augue vel egestas. Quisque ac imperdiet tortor, at lacinia ex. Duis vel ex hendrerit, commodo odio sed, aliquam enim. Ut arcu nulla, tincidunt eget arcu eget, molestie vulputate nisi. Nunc malesuada leo et est iaculis facilisis.</p>
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="font-medium text-content-subtitle">Technologies:</span>
                <div className="flex gap-3 flex-wrap">
                    {Object.values(technologies[0]).map((tech, index) => (
                        <a key={index} href={tech.website} className="skill-block" target="_blank" rel="noopener noreferrer">
                            <Icon className="icon-box" icon={tech.logo} width="1.1rem" height="1.1rem" />
                            {tech.name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectItem;
