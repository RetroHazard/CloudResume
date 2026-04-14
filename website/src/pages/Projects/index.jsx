import { Helmet } from 'react-helmet-async';
import ProjectList from '../../components/project_list';

function Projects() {
    return (
        <>
            <Helmet><title>Projects | Cloud Resume</title></Helmet>
            <div className='content-block' id='projects'>
                <h1 className='h1 mb-0 font-heading font-bold text-content-header text-2xl sm:text-3xl'>Projects</h1>
                <div className='flex flex-col gap-8'>
                    <ProjectList />
                </div>
            </div>
        </>
    );
}

export default Projects;
