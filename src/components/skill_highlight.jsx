import React from "react";

import { Icon } from '@iconify-icon/react';
import DataLoader from "../utils/dataLoader";
const jsonTarget = "skill_data.json";

const SkillHighlight =() => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                const skillData = data.core_skills;
                return (
                    <div className="flex flex-wrap gap-x-8 gap-y-2">
                        {skillData.map((skill, index) => (
                            <div key={index} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <a className="flex gap-2.5 items-center no-underline" href={skill.website} target="_blank" rel="noopener noreferrer">
                                        <Icon inline icon={skill.logo} width="1.6em" height="1.6em"/>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm text-content-subtitle hover:text-secondary-100">{skill.name}</span>
                                            <span className="font-light text-xs text-content-accent">{skill.category}</span>
                                        </div>
                                    </a>
                                </div>
                                <div className="flex gap-1">
                                    <div className="skill-progress-bar-outline">
                                        <div className="skill-progress-bar" style={{width: skill.level}}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );

}

export default SkillHighlight;
