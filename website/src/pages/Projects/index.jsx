import React from 'react';

import ProjectList from '../../components/project_list';

function Projects() {
    return (
        <>
            <div className='content-block' id='projects'>
                <h2 className='h2 mb-0 font-extrabold text-content-header'>PROJECTS</h2>
                <div className='flex flex-col gap-8'>
                    <ProjectList />
                </div>
            </div>
        </>
    );
}

export default Projects;
