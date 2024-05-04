import React from 'react';
import { useState } from 'react';

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faHouse, faGraduationCap, faBriefcase, faChartSimple, faClipboardCheck, faLayerGroup, faMessage } from "@fortawesome/free-solid-svg-icons";

function Navigation() {
    return (
        <>
            <nav className="flex float-left bg-secondary-700 p-2 rounded-lg mr-5 mt-28 h-fit" id="navbar">
                <ul className="flex-col text-sm font-medium text-content-accent">
                    <li>
                        <a href="#" className="nav-block-active" aria-current="page">
                            <div className="icon-box">
                                <i className="nav-icon-active"><FontAwesomeIcon icon={faHouse}/></i>
                            </div>
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-block-inactive">
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faGraduationCap}/></i>
                            </div>
                            Education
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-block-inactive">
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faBriefcase}/></i>
                            </div>
                            Experience
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-block-inactive">
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faChartSimple}/></i>
                            </div>
                            Skills
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-block-inactive">
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faClipboardCheck}/></i>
                            </div>
                            Certifications
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-block-inactive">
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faLayerGroup}/></i>
                            </div>
                            Projects
                        </a>
                    </li>
                    <li>
                        <a href="#" className="nav-block-inactive">
                            <div className="icon-box">
                                <i className="nav-icon-inactive"><FontAwesomeIcon icon={faMessage}/></i>
                            </div>
                            Contact
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    )
}

export default Navigation;

;