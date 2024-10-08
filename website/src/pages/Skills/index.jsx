import React from 'react';

import SkillHighlight from '../../components/skill_highlight';
import SkillButton from '../../components/skill_button';
import LanguageItem from '../../components/language_item';

function Skills() {
    return (
        <>
            <div className='content-block' id='skills'>
                <h2 className='h2 mb-0 font-extrabold text-content-header'>SKILLS</h2>
                <div className='flex flex-col gap-8'>
                    <div className='flex flex-col gap-3'>
                        <SkillHighlight />
                    </div>
                    <div className='flex flex-col gap-3'>
                        <h3 className='mb-0 font-extrabold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                            Interested in:
                        </h3>
                        <SkillButton />
                    </div>
                    <div className='flex flex-col gap-3'>
                        <h3 className='mb-0 font-extrabold leading-snug text-content-subtitle max-sm:text-sm sm:text-xs md:text-base'>
                            I speak
                        </h3>
                        <LanguageItem />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Skills;
