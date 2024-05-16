import React, { useEffect, useState } from 'react';
import EducationItem from '../components/education_item';
import data from '../assets/json/education_data.json';

const EducationList = () => {
    const educationData = data.Education;

    return (
        <div>
            {educationData.map((item, index) => (
                <React.Fragment key={index}>
                    <EducationItem
                        school={item.school}
                        degree={item.degree}
                        category={item.category}
                        start={item.start}
                        end={item.end}
                        logo={item.logo}
                        website={item.website}
                    />
                    {index < educationData.length - 1 && <div className="bg-secondary-600 h-px my-5 w-full"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default EducationList;
