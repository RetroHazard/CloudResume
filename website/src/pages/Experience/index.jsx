import React from 'react';

import ExperienceList from '../../components/experience_list';

function Experience() {
    return (
        <>
            <div className='content-block' id='experience'>
                <h2 className='h2 mb-0 font-extrabold text-content-header'>EXPERIENCE</h2>
                <div className='flex flex-col gap-8'>
                    <ExperienceList />
                </div>
            </div>
        </>
    );
}

export default Experience;
