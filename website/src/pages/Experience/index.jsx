import ExperienceList from '../../components/experience_list';
import { SectionShell } from '../../components/ui/primitives';

function Experience() {
    return (
        <>
            <title>Experience | Cloud Resume</title>
            <SectionShell id='experience' kicker='// career' title='Experience'>
                <ExperienceList />
            </SectionShell>
        </>
    );
}

export default Experience;
