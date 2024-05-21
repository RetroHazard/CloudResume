import React from 'react';

import ExperienceItem from "../components/experience_item";
import DataLoader from "../utils/dataLoader";
const jsonTarget = "career_data.json";

const ExperienceList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div className="skill-list">
                        {data.Experience.map((experience, index) => (
                            <React.Fragment key={index}>
                                <ExperienceItem
                                    company={experience.company}
                                    job_title={experience.job_title}
                                    location={experience.location}
                                    type={experience.type}
                                    start={experience.start}
                                    end={experience.end}
                                    logo={experience.logo}
                                    website={experience.website}
                                    details={experience.details}
                                    technologies={experience.technologies}
                                />
                                {index < data.Experience.length - 1 && <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default ExperienceList;
