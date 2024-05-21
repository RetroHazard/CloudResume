import React from 'react';

import { Icon } from '@iconify-icon/react';
import DataLoader from "../utils/dataLoader";
const jsonTarget = "skill_data.json";

const SkillButton = ({ skills }) => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                const defaultSkills = data.target_skills;
                const skillsToUse = skills || defaultSkills;
                return (
                    <div className="flex gap-3 flex-wrap">
                        {skillsToUse.map((skill, index) => (
                            <a key={index} className="skill-block" href={skill.website} target="_blank" rel="noopener noreferrer">
                                <Icon className="icon-box" icon={skill.logo} width="1.1rem" height="1.1rem" />
                                {skill.name}
                            </a>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default SkillButton;
