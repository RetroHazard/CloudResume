import CertificationList from '../../components/certification_list';

function Certifications() {
    return (
        <>
            <title>Certifications | Cloud Resume</title>
            <div className='content-block' id='certifications'>
                <h1 className='h1 mb-0 font-heading font-bold text-content-header text-2xl sm:text-3xl'>Certifications</h1>
                <div className='flex flex-col gap-8'>
                    <CertificationList />
                </div>
            </div>
        </>
    );
}

export default Certifications;
