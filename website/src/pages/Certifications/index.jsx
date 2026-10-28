import CertificationList from '../../components/certification_list';
import { SectionShell } from '../../components/ui/primitives';

function Certifications() {
    return (
        <>
            <title>Certifications | Alexander Bracken</title>
            <SectionShell id='certifications' kicker='Fare Gate · Valid Passes' title='Certifications' line={3}>
                <CertificationList />
            </SectionShell>
        </>
    );
}

export default Certifications;
