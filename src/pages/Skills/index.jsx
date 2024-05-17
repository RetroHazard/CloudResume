import React from "react";

import {Icon} from "@iconify-icon/react";

function Skills() {
    return (
        <>
            <div className="content-block" id="skills">
                <h2 className="h2 font-extrabold text-content-header mb-0">SKILLS</h2>
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-8">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center h-5 justify-between">
                                    <a href="#" className="flex gap-2.5 h-5" target="_blank" rel="noopener noreferrer">
                                        <img className="w-5	h-5" src="./images/placeholder.png" alt="" />
                                        <span className="font-medium text-sm text-content-subtitle">Skill Name</span>
                                    </a>
                                </div>
                                <div className="flex gap-1">
                                    <div className="skill-progress-bar-outline">
                                        <div className="skill-progress-bar" style={{width: '25%'}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center h-5 justify-between">
                                    <a href="#" className="flex gap-2.5 h-5" target="_blank" rel="noopener noreferrer">
                                        <img className="w-5	h-5" src="./images/placeholder.png" alt="" />
                                        <span className="font-medium text-sm text-content-subtitle">Skill Name</span>
                                    </a>
                                </div>
                                <div className="flex gap-1">
                                    <div className="skill-progress-bar-outline">
                                        <div className="skill-progress-bar" style={{width: '75%'}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center h-5 justify-between">
                                    <a href="#" className="flex gap-2.5 h-5" target="_blank" rel="noopener noreferrer">
                                        <img className="w-5	h-5" src="./images/placeholder.png" alt="" />
                                        <span className="font-medium text-sm text-content-subtitle">Skill Name</span>
                                    </a>
                                </div>
                                <div className="flex gap-1">
                                    <div className="skill-progress-bar-outline">
                                        <div className="skill-progress-bar" style={{width: '45%'}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center h-5 justify-between">
                                    <a href="#" className="flex gap-2.5 h-5" target="_blank" rel="noopener noreferrer">
                                        <img className="w-5	h-5" src="./images/placeholder.png" alt="" />
                                        <span className="font-medium text-sm text-content-subtitle">Skill Name</span>
                                    </a>
                                </div>
                                <div className="flex gap-1">
                                    <div className="skill-progress-bar-outline">
                                        <div className="skill-progress-bar" style={{width: '90%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="h3 text-content-subtitle font-extrabold mb-0">Interested in:</h3>
                        <div className="flex gap-3 flex-wrap">
                            <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                <img className="w-4	h-4" src="./images/placeholder.png" alt="" />Skill
                            </a>
                            <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                <img className="w-4	h-4" src="./images/placeholder.png" alt="" />Skill
                            </a>
                            <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                <img className="w-4	h-4" src="./images/placeholder.png" alt="" />Skill
                            </a>
                            <a href="#" className="skill-block" target="_blank" rel="noopener noreferrer">
                                <img className="w-4	h-4" src="./images/placeholder.png" alt="" />Skill
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="h3 text-content-subtitle font-extrabold mb-0">I speak</h3>
                        <div className="flex gap-3 flex-wrap">
                            <div className="skill-block">
                                <iconify-icon inline=""  icon="circle-flags:ca" width="1.25em" height="1.25em"/>
                                English - Native
                            </div>
                            <div className="skill-block">
                                <iconify-icon inline="" icon="circle-flags:jp" width="1.25em" height="1.25em"/>
                                Japanese - N5
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Skills;