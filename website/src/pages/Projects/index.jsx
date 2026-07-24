import ProjectList from '../../components/project_list';
import { SectionShell } from '../../components/ui/primitives';

function Projects() {
    return (
        <>
            <title>Projects | Cloud Resume</title>
            <SectionShell id='projects' kicker='// build log' title='Projects'>
                <ProjectList />
            </SectionShell>
        </>
    );
}

export default Projects;
