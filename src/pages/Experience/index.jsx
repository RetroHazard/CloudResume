import React from "react";

import {Icon} from "@iconify-icon/react";

function Experience() {
    return (
        <>
            <div className="content-block" id="experience">
                <h2 className="h2 font-extrabold text-content-header mb-0">EXPERIENCE</h2>
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 justify-between w-full">
                            <div className="flex gap-4">
                                <img className="hidden rounded-md sm:block h-[8rem] w-[8rem]" src="./images/placeholder.png" alt="" />
                                <div className="flex flex-col">
                                    <h3 className="h3 text-content-title font-extrabold mb-0">(JOB_TITLE)</h3>
                                    <p className="text-content-subtitle font-semibold leading-snug mb-0.5">(COMPANY)</p>
                                    <p className="font-medium text-sm text-content-date mb-0">(START) - (END)</p>
                                </div>
                            </div>
                            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
                                <a href="#" className="social-link" target="_blank" aria-label="Website">
                                    <Icon icon="fa6-solid:globe" height="1.25em" width="1.25em"/>
                                </a>
                            </div>
                        </div>
                        <div className="text-sm font-normal leading-relaxed sm:leading-relaxed sm:text-base mb-3">
                            <ul className="list-disc pl-5">
                                <li>In tristique vulputate augue vel egestas.</li>
                                <li>Quisque ac imperdiet tortor, at lacinia ex.</li>
                                <li>Duis vel ex hendrerit, commodo odio sed, aliquam enim.</li>
                                <li>Ut arcu nulla, tincidunt eget arcu eget, molestie vulputate nisi.</li>
                                <li>Nunc malesuada leo et est iaculis facilisis.</li>
                                <li>Fusce eu urna ut magna malesuada fringilla.</li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <span className="font-medium text-content-accent">Technologies:</span>
                            <div className="flex gap-3 flex-wrap">
                                <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                    <img className="w-4	h-4" src="./images/placeholder.png" alt="" /> Skill
                                </a>
                                <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                    <img className="w-4	h-4" src="./images/placeholder.png" alt="" /> Skill
                                </a>
                                <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                    <img className="w-4	h-4" src="./images/placeholder.png" alt="" /> Skill
                                </a>
                                <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                    <img className="w-4	h-4" src="./images/placeholder.png" alt="" /> Skill
                                </a>
                                <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                    <img className="w-4	h-4" src="./images/placeholder.png" alt="" /> Skill
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="bg-secondary-600 h-px w-full"></div>
                </div>
            </div>
        </>
    );
}

export default Experience;