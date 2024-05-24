import React from "react";

import { Icon } from '@iconify-icon/react';
import DataLoader from "../utils/dataLoader";
const jsonTarget = "skill_data.json";

const SkillHighlight = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                const skillData = data.core_skills;
                return (
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                        {skillData.map((skill, index) => (
                            <div key={index} className="flex flex-col gap-2" data-testid={`skill-item-${index}`}>
                                <div className="flex items-center justify-between">
                                    <a className="flex gap-2.5 items-center no-underline" href={skill.website} target="_blank" rel="noopener noreferrer" data-testid={`skill-link-${index}`}>
                                        <Icon inline icon={skill.logo} width="1.6em" height="1.6em" data-testid={`skill-icon-${index}`}/>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-content-subtitle hover:text-secondary-100" data-testid={`skill-name-${index}`}>{skill.name}</span>
                                            <span className="font-light text-xs text-content-accent" data-testid={`skill-category-${index}`}>{skill.category}</span>
                                        </div>
                                    </a>
                                </div>
                                <div className="flex gap-1">
                                    <div className="skill-progress-bar-outline">
                                        <div className="skill-progress-bar" style={{ width: skill.level }} data-testid={`skill-progress-${index}`}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }}
        </DataLoader>
    );
};

export default SkillHighlight;