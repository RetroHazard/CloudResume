import React from 'react';

import { Icon } from '@iconify-icon/react';
import DataLoader from '../utils/dataLoader';
const jsonTarget = 'skill_data.json';

const LanguageItem = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                const languageData = data.language_skills;
                return (
                    <div className='flex flex-wrap gap-3'>
                        {languageData.map((skill, index) => (
                            <div className='skill-block' key={index}>
                                <Icon inline icon={skill.flag} width='1.25em' height='1.25em' />
                                {`${skill.language} - ${skill.level}`}
                            </div>
                        ))}
                    </div>
                );
            }}
        </DataLoader>
    );
};

export default LanguageItem;
