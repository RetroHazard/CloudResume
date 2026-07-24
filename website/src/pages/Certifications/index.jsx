import CertificationList from '../../components/certification_list';
import { SectionShell } from '../../components/ui/primitives';

function Certifications() {
    return (
        <>
            <title>Certifications | Cloud Resume</title>
            <SectionShell id='certifications' kicker='// credentials' title='Certifications'>
                <CertificationList />
            </SectionShell>
        </>
    );
}

export default Certifications;
