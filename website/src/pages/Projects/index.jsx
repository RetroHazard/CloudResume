import ProjectList from '../../components/project_list';
import { SectionShell, StatusPill } from '../../components/ui/primitives';

function Projects() {
    return (
        <>
            <title>Projects | Cloud Resume</title>
            <SectionShell
                id='projects'
                kicker='Special Services · Build Log'
                title='Projects'
                line={4}
                right={<StatusPill tone='on'>Live</StatusPill>}
            >
                <ProjectList />
            </SectionShell>
        </>
    );
}

export default Projects;
