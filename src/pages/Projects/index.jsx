import React from "react";

import ProjectList from "../../components/project_list";

function Projects() {
    return (
        <>
            <div className="content-block" id="projects">
                <h2 className="h2 font-extrabold text-content-header mb-0">PROJECTS</h2>
                <div className="flex flex-col gap-8">
                    <ProjectList/>
                </div>
            </div>
        </>
    );
}

export default Projects;