import React from 'react';
import CertificationList from '../../components/certification_list';

function Certifications() {
    return (
        <>
            <div className='content-block' id='certifications'>
                <h2 className='h2 mb-0 font-extrabold text-content-header'>CERTIFICATIONS</h2>
                <div className='flex flex-col gap-8'>
                    <CertificationList />
                </div>
            </div>
        </>
    );
}

export default Certifications;
