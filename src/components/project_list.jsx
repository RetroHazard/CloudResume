import React from 'react';

import ProjectItem from '../components/project_item';
import data from '../assets/json/project_data.json';

const ProjectList = () => {
    return (
        <div>
            {data.Projects.map((project, index) => (
                <React.Fragment key={index}>
                    <ProjectItem project={project} />
                    {index < data.Projects.length - 1 && <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default ProjectList;
