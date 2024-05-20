import React from "react";

import { Icon } from '@iconify-icon/react';
import data from '../assets/json/skill_data.json';

const SkillHighlight =() => {
    const skillData = data.core_skills;

    return (
        <div className="flex flex-wrap gap-8">
            {skillData.map((skill, index) => (
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center h-5 justify-between">
                        <a key={index} className="flex gap-2.5 h-5 no-underline" href={skill.website} target="_blank"
                           rel="noopener noreferrer">
                            <Icon icon={skill.logo} width="1.6em" height="1.6em"/>
                            <span className="font-medium text-base text-content-subtitle">{skill.name}</span>
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
    );
}

export default SkillHighlight;
