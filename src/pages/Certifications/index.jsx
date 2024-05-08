import React from "react";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faAward, faGlobe } from "@fortawesome/free-solid-svg-icons";

function Certifications() {
    return (
        <>
            <div className="content-block" id="certifications">
                <h2 className="h2 font-extrabold text-content-header mb-0">CERTIFICATIONS</h2>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2 justify-between w-full">
                        <div className="flex gap-4">
                            <img className="hidden rounded-md sm:block h-[4.5rem] w-[4.5rem]" src="./images/placeholder.png" alt="" />
                            <div className="flex flex-col">
                                <h3 className="h3 font-extrabold text-content-title mb-0">(CERTIFICATION)</h3>
                                <p className="text-content-subtitle font-semibold leading-snug mb-0.5">(ISSUER)</p>
                                <p className="font-medium text-sm text-content-date mb-0">(DATE)</p>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                            <a href="#" className="social-link" target="_blank" aria-label="Certificate">
                                <i><FontAwesomeIcon icon={faAward} size={"lg"}/></i>
                            </a>
                            <a href="#" className="social-link" target="_blank" aria-label="Website">
                                <i><FontAwesomeIcon icon={faGlobe} size={"lg"}/></i>
                            </a>
                        </div>
                    </div>
                    <p className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-0">
                        (DESCRIPTION)
                    </p>
                </div>
                <div className="bg-secondary-600 h-px w-full"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2 justify-between w-full">
                        <div className="flex gap-4">
                            <img className="hidden rounded-md sm:block h-[4.5rem] w-[4.5rem]" src="./images/placeholder.png" alt="" />
                            <div className="flex flex-col">
                                <h3 className="h3 font-extrabold text-content-title mb-0">(CERTIFICATION)</h3>
                                <p className="text-content-subtitle font-semibold leading-snug mb-0.5">(ISSUER)</p>
                                <p className="font-medium text-sm text-content-date mb-0">(DATE)</p>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                            <a href="#" className="social-link" target="_blank" aria-label="Certificate">
                                <i><FontAwesomeIcon icon={faAward} size={"lg"}/></i>
                            </a>
                            <a href="#" className="social-link" target="_blank" aria-label="Website">
                                <i><FontAwesomeIcon icon={faGlobe} size={"lg"}/></i>
                            </a>
                        </div>
                    </div>
                    <p className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-0">
                        (DESCRIPTION)
                    </p>
                </div>
                <div className="bg-secondary-600 h-px w-full"></div>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2 justify-between w-full">
                        <div className="flex gap-4">
                            <img className="hidden rounded-md sm:block h-[4.5rem] w-[4.5rem]" src="./images/placeholder.png" alt="" />
                            <div className="flex flex-col">
                                <h3 className="h3 font-extrabold text-content-title mb-0">(CERTIFICATION)</h3>
                                <p className="text-content-subtitle font-semibold leading-snug mb-0.5">(ISSUER)</p>
                                <p className="font-medium text-sm text-content-date mb-0">(DATE)</p>
                            </div>
                        </div>
                        <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                            <a href="#" className="social-link" target="_blank" aria-label="Certificate">
                                <i><FontAwesomeIcon icon={faAward} size={"lg"}/></i>
                            </a>
                            <a href="#" className="social-link" target="_blank" aria-label="Website">
                                <i><FontAwesomeIcon icon={faGlobe} size={"lg"}/></i>
                            </a>
                        </div>
                    </div>
                    <p className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-0">
                        (DESCRIPTION)
                    </p>
                </div>
            </div>
        </>
    );
}

export default Certifications;