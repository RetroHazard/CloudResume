import ExperienceList from '../../components/experience_list';
import { SectionShell, StatusPill } from '../../components/ui/primitives';

function Experience() {
    return (
        <>
            <title>Experience | Cloud Resume</title>
            <SectionShell
                id='experience'
                kicker='Platform 02 · Career Line'
                title='Experience'
                line={2}
                right={<StatusPill tone='on'>Departures</StatusPill>}
            >
                <ExperienceList />
            </SectionShell>
        </>
    );
}

export default Experience;
