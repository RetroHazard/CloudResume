import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import { Icon } from '@iconify-icon/react';
import DataLoader from '../utils/dataLoader';
const jsonTarget = 'skill_data.json';

const SkillHighlight = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                const skillData = data.core_skills;
                return (
                    <div className='flex flex-wrap justify-evenly gap-x-8 gap-y-2'>
                        {skillData.map((skill, index) => (
                            <div key={index} className='flex flex-col gap-2'>
                                <div
                                    className='flex items-center justify-between max-sm:size-12 max-sm:justify-center max-sm:rounded-full max-sm:bg-secondary-600 max-sm:align-middle max-sm:hover:bg-secondary-500'
                                    data-tooltip-id='skill-tooltip'
                                    data-tooltip-content={skill.name}
                                >
                                    <a
                                        className='flex items-center gap-2.5 no-underline'
                                        href={skill.website}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        <Icon inline icon={skill.logo} width='1.6em' height='1.6em' />
                                        <div className='flex flex-col max-sm:hidden'>
                                            <span className='text-content-subtitle hover:text-secondary-100 sm:text-xs sm:font-light md:text-xs md:font-semibold'>
                                                {skill.name}
                                            </span>
                                            <span className='font-light text-content-accent sm:text-xs md:text-xs'>
                                                {skill.category}
                                            </span>
                                        </div>
                                    </a>
                                </div>
                                <div className='flex gap-1'>
                                    <div className='skill-progress-bar-outline'>
                                        <div
                                            className='skill-progress-bar'
                                            style={{ width: skill.level }}
                                            role='progressbar'
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <ReactTooltip className='hidden max-sm:block' id='skill-tooltip' />
                    </div>
                );
            }}
        </DataLoader>
    );
};

export default SkillHighlight;
