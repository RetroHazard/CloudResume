import React from 'react';

import CertificationItem from '../components/certification_item';
import data from '../assets/json/certification_data.json';

const CertificationList = () => {
    return (
        <div>
            {data.Certifications.map((item, index) => (
                <React.Fragment key={index}>
                    <CertificationItem
                        issuer={item.issuer}
                        certification={item.certification}
                        credential_id={item.credential_id}
                        date={item.date}
                        logo={item.logo}
                        links={item.links}
                    />
                    {index < data.Certifications.length - 1 && <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default CertificationList;
