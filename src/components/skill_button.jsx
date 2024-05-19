import React from 'react';

import { Icon } from '@iconify-icon/react';
import data from '../assets/json/skill_data.json';

const SkillButton = ({ skills = data.target_skills }) => {
    return (
        <div className="flex gap-3 flex-wrap">
            {skills.map((skill, index) => (
                <a key={index} className="skill-block" href={skill.website} target="_blank" rel="noopener noreferrer">
                    <Icon className="icon-box" icon={skill.logo} width="1.1rem" height="1.1rem" />
                    {skill.name}
                </a>
            ))}
        </div>
    );
};

export default SkillButton;
