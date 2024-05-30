import React from 'react';
import EducationList from '../../components/education_list';

function Education() {
    return (
        <>
            <div className='content-block' id='education'>
                <h2 className='h2 mb-0 font-extrabold text-content-header'>EDUCATION</h2>
                <div className='flex flex-col gap-8'>
                    <EducationList />
                </div>
            </div>
        </>
    );
}

export default Education;
