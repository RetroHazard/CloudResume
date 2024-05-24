import React from 'react';
import DataLoader from "../utils/dataLoader";
import { Icon } from "@iconify-icon/react";

const jsonTarget = "education_data.json";

const EducationList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div>
                        {data.Education.map((item, index) => (
                            <div className="flex flex-col gap-3" key={index}>
                                <div className="flex gap-2 justify-between w-full">
                                    <div className="flex gap-4">
                                        <img className="hidden rounded-xl sm:block h-[6.5rem] w-[6.5rem]"
                                             src={item.logo} alt={`${item.school} Logo`}/>
                                        <div className="flex flex-col">
                                            <h3 className="h3 font-extrabold text-content-title mb-0">{item.school}</h3>
                                            <p className="font-semibold text-base text-content-subtitle leading-snug mb-0.5">{item.degree}</p>
                                            <p className="font-medium text-sm text-content-accent leading-snug mb-0.5">{item.category}</p>
                                            <p className="font-medium text-sm text-content-date leading-snug mb-0">{item.start} - {item.end}</p>
                                            <p className="font-light text-xs text-content-accent leading-snug mb-0.5">{item.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-wrap sm:flex-nowrap" id={`${item.school} Links`}>
                                        {item.links && item.links.map((linkGroup, linkIndex) =>
                                            Object.keys(linkGroup).map((linkType) => (
                                                linkGroup[linkType].map((link, idx) => (
                                                    <a key={`${linkIndex}-${linkType}-${idx}`} href={link.website}
                                                       className="social-link" target="_blank" aria-label={linkType}
                                                       rel="noopener noreferrer">
                                                        <Icon icon={link.icon} height="1.25em" width="1.25em"/>
                                                    </a>
                                                ))
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm font-light leading-relaxed sm:leading-relaxed mb-3">
                                    <ul className="list-disc px-16">
                                        {item.details.map((detail, detailIndex) => (
                                            <li key={`${index}-${detailIndex}`}>{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                                {index < data.Education.length - 1 &&
                                    <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                            </div>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default EducationList;
