import React from 'react';
import DataLoader from "../utils/dataLoader";
import { Icon } from "@iconify-icon/react";

const jsonTarget = "certification_data.json";

const CertificationList = () => {
    return (
        <DataLoader file={jsonTarget}>
            {(data) => {
                return (
                    <div>
                        {data.Certifications.map((item, index) => (
                            <div className="flex flex-col gap-3" key={index}>
                                <div className="flex gap-2 justify-between w-full">
                                    <div className="flex gap-4">
                                        <img className="hidden rounded-xl sm:block h-[6.5rem] w-[6.5rem]" src={item.logo}
                                             alt={`${item.certification} Logo`}/>
                                        <div className="flex flex-col">
                                            <h3 className="h3 font-extrabold text-content-title mb-0">{item.certification}</h3>
                                            <p className="text-content-subtitle font-semibold leading-snug mb-0.5">{item.issuer}</p>
                                            <p className="font-medium text-sm text-content-date mb-0"><strong>Credential ID:</strong> {item.credential_id}</p>
                                            <p className="font-medium text-sm text-content-date mb-0"><strong>Date Issued:</strong> {item.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 flex-wrap sm:flex-nowrap" id={`${item.certification} Links`}>
                                        {item.links.map((linkGroup, linkIndex) =>
                                            Object.entries(linkGroup).map(([key, link]) =>
                                                    link[0].display && link[0].website && (
                                                        <a key={`${key}-${linkIndex}`} href={link[0].website} className="social-link" target="_blank"
                                                           rel="noopener noreferrer">
                                                            <Icon icon={link[0].icon} height="1.25em" width="1.25em"/>
                                                        </a>
                                                    )
                                            )
                                        )}
                                    </div>
                                </div>
                                {index < data.Certifications.length - 1 && <div className="bg-secondary-600 h-px my-6 w-full"></div>}
                            </div>
                        ))}
                    </div>
                )
            }}
        </DataLoader>
    );
};

export default CertificationList;
