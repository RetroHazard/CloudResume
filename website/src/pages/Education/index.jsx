import EducationList from '../../components/education_list';
import { SectionShell } from '../../components/ui/primitives';

function Education() {
    return (
        <>
            <title>Education | Cloud Resume</title>
            <SectionShell id='education' kicker='Platform 01 · Academic Line' title='Education' line={1}>
                <EducationList />
            </SectionShell>
        </>
    );
}

export default Education;
