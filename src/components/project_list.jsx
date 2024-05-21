import React from 'react';

import ProjectItem from '../components/project_item';
import DataLoader from "../utils/dataLoader";
const jsonTarget = "project_data.json";

const ProjectList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div>
                        {data.Projects.map((project, index) => (
                            <React.Fragment key={index}>
                                <ProjectItem
                                    name={project.name}
                                    company={project.company}
                                    category={project.category}
                                    role={project.role}
                                    size={project.size}
                                    start={project.start}
                                    end={project.end}
                                    logo={project.logo}
                                    details={project.details}
                                    links={project.links}
                                    technologies={project.technologies}
                                />
                                {index < data.Projects.length - 1 && <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default ProjectList;
