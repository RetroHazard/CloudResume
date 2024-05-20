import React from 'react';

import EducationItem from '../components/education_item';
import data from '../assets/json/education_data.json';

const EducationList = () => {
    return (
        <div>
            {data.Education.map((item, index) => (
                <React.Fragment key={index}>
                    <EducationItem
                        school={item.school}
                        degree={item.degree}
                        category={item.category}
                        start={item.start}
                        end={item.end}
                        logo={item.logo}
                        details={item.details}
                        links={item.links}
                    />
                    {index < data.Education.length - 1 && <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default EducationList;
