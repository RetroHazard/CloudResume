import React from 'react';

import { Icon } from "@iconify-icon/react";

const CertificationItem = ({ issuer, certification, credential_id, date, logo, links }) => (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2 justify-between w-full">
                <div className="flex gap-4">
                    <img className="hidden rounded-xl sm:block h-[8rem] w-[8rem]" src={logo}
                         alt={`${certification} Logo`}/>
                    <div className="flex flex-col">
                        <h3 className="h3 font-extrabold text-content-title mb-0">{certification}</h3>
                        <p className="text-content-subtitle font-semibold leading-snug mb-0.5">{issuer}</p>
                        <p className="font-medium text-sm text-content-date mb-0">Credential ID: {credential_id}</p>
                        <p className="font-medium text-sm text-content-date mb-0">Date Issued: {date}</p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap sm:flex-nowrap" id={`${certification} Links`}>
                    {links.map((linkGroup, index) =>
                        Object.entries(linkGroup).map(([key, link]) =>
                                link[0].display && link[0].website && (
                                    <a key={`${key}-${index}`} href={link[0].website} className="social-link" target="_blank" rel="noopener noreferrer">
                                        <Icon icon={link[0].icon} height="1.25em" width="1.25em"/>
                                    </a>
                                )
                        )
                    )}
                </div>
            </div>
            <p className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-0"> {/* TODO: Retrieve Additional Text from JSON */}
                Lorem ipsum dolor sit amet, consectetur <strong>adipiscing elit</strong>. In sodales ac dui at <em>vestibulum</em>.
            </p>
        </div>
);

export default CertificationItem;