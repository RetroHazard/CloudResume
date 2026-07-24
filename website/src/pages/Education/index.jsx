import EducationList from '../../components/education_list';
import { SectionShell } from '../../components/ui/primitives';

function Education() {
    return (
        <>
            <title>Education | Cloud Resume</title>
            <SectionShell id='education' kicker='// academics' title='Education'>
                <EducationList />
            </SectionShell>
        </>
    );
}

export default Education;
