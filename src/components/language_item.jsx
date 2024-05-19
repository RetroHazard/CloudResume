import React from 'react';

import { Icon } from '@iconify-icon/react';
import data from '../assets/json/skill_data.json';

const LanguageItem = () => {
    const languageData = data.language_skills;

    return (
        <div className="flex gap-3 flex-wrap">
            {languageData.map((skill, index) => (
                <div className="skill-block" key={index}>
                    <Icon inline icon={skill.flag} width="1.25em" height="1.25em" />
                    {`${skill.language} - ${skill.level}`}
                </div>
            ))}
        </div>
    );
};

export default LanguageItem;
