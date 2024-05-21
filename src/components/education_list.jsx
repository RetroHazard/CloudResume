import React from 'react';

import EducationItem from '../components/education_item';
import DataLoader from "../utils/dataLoader";
const jsonTarget = "education_data.json";

const EducationList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
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
                                {index < data.Education.length - 1 &&
                                    <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default EducationList;
